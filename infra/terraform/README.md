# CommerceOS Terraform

`infra/terraform` holds Terraform modules and environment entrypoints for
CommerceOS infrastructure.

## Layout

- `modules/network` - VPC, public subnets, private subnets, and internet
  routing for dev ECS tasks.
- `modules/postgres` - PostgreSQL RDS instance, subnet group, and database
  security group.
- `modules/ecs-service` - reusable ECS Fargate task definition and service
  wiring.
- `envs/dev` - the single Phase 0 AWS dev environment.

## Dev Environment

The dev environment creates:

- ECR repositories for storefront and commerce API images
- an ECS cluster
- two ECS Fargate services, defaulting to `desired_count = 0`
- a public HTTP ALB with storefront as the default target and current API paths
  routed to the API target group
- an encrypted private RDS PostgreSQL instance
- a Secrets Manager secret for the API database URL

Container images are intentionally not built in this unit. Keep desired counts
at zero until later container/CI work pushes usable images.

## Usage

Create a local tfvars file from the example:

```bash
cd infra/terraform/envs/dev
cp terraform.tfvars.example terraform.tfvars
```

Set `db_password` to a long random value, then initialize and validate:

```bash
terraform init
terraform validate
```

Review the plan before applying:

```bash
terraform plan
terraform apply
```

Format checks for the full Terraform tree:

```bash
cd infra/terraform
terraform fmt -check -recursive
```
