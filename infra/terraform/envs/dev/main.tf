locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Application = "CommerceOS"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  storefront_port = 3000
  api_port        = 8000

  storefront_image_uri = coalesce(
    var.storefront_image_uri,
    "${aws_ecr_repository.storefront.repository_url}:latest",
  )
  api_image_uri = coalesce(
    var.api_image_uri,
    "${aws_ecr_repository.api.repository_url}:latest",
  )
  api_migration_image_uri = coalesce(var.api_migration_image_uri, local.api_image_uri)

  api_environment_variables = merge(
    {
      COMMERCE_API_ALLOWED_ORIGINS = "http://${aws_lb.main.dns_name}"
    },
    var.api_environment_variables,
  )
  api_secrets = {
    COMMERCE_API_DATABASE_URL = aws_secretsmanager_secret.api_database_url.arn
  }
}

module "network" {
  source = "../../modules/network"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  tags         = local.common_tags
}

resource "aws_ecr_repository" "storefront" {
  name                 = "${local.name_prefix}-storefront"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "api" {
  name                 = "${local.name_prefix}-commerce-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "storefront" {
  name              = "/ecs/${local.name_prefix}/storefront"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${local.name_prefix}/commerce-api"
  retention_in_days = 14
}

resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb"
  description = "Public ALB access for ${local.name_prefix}."
  vpc_id      = module.network.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  description       = "Allow public HTTP."
}

resource "aws_vpc_security_group_egress_rule" "alb_all" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Allow ALB egress."
}

resource "aws_security_group" "ecs_tasks" {
  name        = "${local.name_prefix}-ecs-tasks"
  description = "ECS task access for ${local.name_prefix}."
  vpc_id      = module.network.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "ecs_storefront" {
  security_group_id            = aws_security_group.ecs_tasks.id
  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = local.storefront_port
  to_port                      = local.storefront_port
  description                  = "Allow ALB to storefront tasks."
}

resource "aws_vpc_security_group_ingress_rule" "ecs_api" {
  security_group_id            = aws_security_group.ecs_tasks.id
  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = local.api_port
  to_port                      = local.api_port
  description                  = "Allow ALB to API tasks."
}

resource "aws_vpc_security_group_egress_rule" "ecs_all" {
  security_group_id = aws_security_group.ecs_tasks.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Allow ECS task egress."
}

resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.network.public_subnet_ids
}

resource "aws_lb_target_group" "storefront" {
  name        = "${local.name_prefix}-storefront"
  port        = local.storefront_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.network.vpc_id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }
}

resource "aws_lb_target_group" "api" {
  name        = "${local.name_prefix}-api"
  port        = local.api_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.network.vpc_id

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.storefront.arn
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = var.api_listener_paths
    }
  }
}

resource "aws_ecs_cluster" "main" {
  name = local.name_prefix
}

data "aws_iam_policy_document" "ecs_tasks_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${local.name_prefix}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name               = "${local.name_prefix}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume_role.json
}

module "postgres" {
  source = "../../modules/postgres"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.network.vpc_id
  subnet_ids                 = module.network.private_subnet_ids
  allowed_security_group_ids = [aws_security_group.ecs_tasks.id]
  db_name                    = var.db_name
  db_username                = var.db_username
  db_password                = var.db_password
  instance_class             = var.db_instance_class
  allocated_storage          = var.db_allocated_storage
  tags                       = local.common_tags
}

resource "aws_secretsmanager_secret" "api_database_url" {
  name        = "${local.name_prefix}/commerce-api/database-url"
  description = "Commerce API PostgreSQL connection URL."
}

resource "aws_secretsmanager_secret_version" "api_database_url" {
  secret_id = aws_secretsmanager_secret.api_database_url.id
  secret_string = format(
    "postgresql+psycopg://%s:%s@%s:%s/%s",
    urlencode(module.postgres.username),
    urlencode(var.db_password),
    module.postgres.address,
    module.postgres.port,
    module.postgres.db_name,
  )
}

data "aws_iam_policy_document" "api_secrets" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.api_database_url.arn]
  }
}

resource "aws_iam_role_policy" "api_secrets" {
  name   = "${local.name_prefix}-api-secrets"
  role   = aws_iam_role.ecs_task_execution.id
  policy = data.aws_iam_policy_document.api_secrets.json
}

resource "aws_ecs_task_definition" "api_migration" {
  family                   = "${local.name_prefix}-commerce-api-migration"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "commerce-api-migration"
      image     = local.api_migration_image_uri
      essential = true
      command   = ["alembic", "upgrade", "head"]
      environment = [
        for name, value in local.api_environment_variables : {
          name  = name
          value = value
        }
      ]
      secrets = [
        for name, value_from in local.api_secrets : {
          name      = name
          valueFrom = value_from
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "commerce-api-migration"
        }
      }
    }
  ])

  tags = local.common_tags
}

module "storefront_service" {
  source = "../../modules/ecs-service"

  name               = "${local.name_prefix}-storefront"
  cluster_arn        = aws_ecs_cluster.main.arn
  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  task_role_arn      = aws_iam_role.ecs_task.arn
  subnet_ids         = module.network.public_subnet_ids
  security_group_ids = [aws_security_group.ecs_tasks.id]
  target_group_arn   = aws_lb_target_group.storefront.arn
  container_name     = "storefront"
  image_uri          = local.storefront_image_uri
  container_port     = local.storefront_port
  desired_count      = var.storefront_desired_count
  log_group_name     = aws_cloudwatch_log_group.storefront.name
  environment_variables = merge(
    {
      COMMERCE_API_BASE_URL = "http://${aws_lb.main.dns_name}"
    },
    var.storefront_environment_variables,
  )
  secrets = var.storefront_secrets
  tags    = local.common_tags

  depends_on = [aws_lb_listener.http]
}

module "api_service" {
  source = "../../modules/ecs-service"

  name                  = "${local.name_prefix}-commerce-api"
  cluster_arn           = aws_ecs_cluster.main.arn
  execution_role_arn    = aws_iam_role.ecs_task_execution.arn
  task_role_arn         = aws_iam_role.ecs_task.arn
  subnet_ids            = module.network.public_subnet_ids
  security_group_ids    = [aws_security_group.ecs_tasks.id]
  target_group_arn      = aws_lb_target_group.api.arn
  container_name        = "commerce-api"
  image_uri             = local.api_image_uri
  container_port        = local.api_port
  desired_count         = var.api_desired_count
  log_group_name        = aws_cloudwatch_log_group.api.name
  environment_variables = local.api_environment_variables
  secrets               = local.api_secrets
  tags                  = local.common_tags

  depends_on = [aws_lb_listener_rule.api]
}
