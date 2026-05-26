# Unit 07: Setup TF

## Goal

Add the first Terraform-managed AWS development environment for the existing
storefront and commerce API surfaces.

This unit is intentionally minimal:

- one `dev` environment only
- ECS Fargate wiring for storefront and commerce API
- PostgreSQL on AWS RDS
- ECR repositories for future container images
- no production environment, domain name, HTTPS, autoscaling, CI/CD deploy
  automation, or Dockerfile/container build work yet

## Design

- Keep Terraform under `infra/terraform`.
- Use reusable modules for infrastructure slices and a single environment
  composition at `infra/terraform/envs/dev`.
- Create a simple VPC with public subnets for the ALB/ECS tasks and private
  subnets for RDS.
- Run ECS tasks with public IPs in the dev public subnets so this phase avoids
  NAT gateway cost and complexity.
- Put RDS in private subnets with security-group ingress only from ECS tasks.
- Create one public Application Load Balancer:
  - storefront is the default target
  - current API paths route to the commerce API target group
- Create ECS services for both applications with `desired_count = 0` by
  default because app container images are not part of this unit.
- Create ECR repositories so later CI/CD work has a stable image destination.
- Store the API database URL in AWS Secrets Manager and inject it into the API
  task definition as an ECS secret.
- Use local Terraform state for Phase 0. Remote state/bootstrap hardening can
  be added with the deployment/production work.

## Implementation

- Add Terraform module scaffolding for:
  - network
  - PostgreSQL RDS
  - ECS Fargate service
- Add `infra/terraform/envs/dev` with AWS provider configuration, IAM roles,
  ECR repositories, CloudWatch log groups, ALB target groups/listeners, ECS
  cluster, RDS, and two ECS services.
- Add a dev tfvars example showing required values and optional image/service
  settings.
- Update Terraform docs with init, validate, plan, and apply instructions.
- Update the progress tracker when the unit is complete.

## Verify when done

- [x] `terraform fmt -check -recursive` passes for `infra/terraform`.
- [x] `terraform init` succeeds in `infra/terraform/envs/dev`.
- [x] `terraform validate` succeeds in `infra/terraform/envs/dev`.
