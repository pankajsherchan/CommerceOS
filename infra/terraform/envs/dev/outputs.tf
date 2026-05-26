output "alb_dns_name" {
  description = "Public DNS name of the dev ALB."
  value       = aws_lb.main.dns_name
}

output "storefront_ecr_repository_url" {
  description = "Storefront ECR repository URL."
  value       = aws_ecr_repository.storefront.repository_url
}

output "api_ecr_repository_url" {
  description = "Commerce API ECR repository URL."
  value       = aws_ecr_repository.api.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "storefront_service_name" {
  description = "Storefront ECS service name."
  value       = module.storefront_service.service_name
}

output "api_service_name" {
  description = "Commerce API ECS service name."
  value       = module.api_service.service_name
}

output "api_migration_task_definition_arn" {
  description = "Commerce API one-off migration task definition ARN."
  value       = aws_ecs_task_definition.api_migration.arn
}

output "api_migration_container_name" {
  description = "Container name used by the Commerce API migration task."
  value       = "commerce-api-migration"
}

output "public_subnet_ids" {
  description = "Public subnet IDs used by dev ECS tasks."
  value       = module.network.public_subnet_ids
}

output "ecs_task_security_group_id" {
  description = "Security group ID attached to dev ECS tasks."
  value       = aws_security_group.ecs_tasks.id
}

output "api_database_secret_arn" {
  description = "Secrets Manager ARN for the Commerce API database URL."
  value       = aws_secretsmanager_secret.api_database_url.arn
}

output "storefront_task_definition_arn" {
  description = "Storefront ECS service task definition ARN."
  value       = module.storefront_service.task_definition_arn
}

output "api_task_definition_arn" {
  description = "Commerce API ECS service task definition ARN."
  value       = module.api_service.task_definition_arn
}

output "postgres_address" {
  description = "RDS PostgreSQL endpoint address."
  value       = module.postgres.address
}
