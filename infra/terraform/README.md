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
- `bootstrap/dev-state` - one-time S3 backend bootstrap for dev Terraform
  state.
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
- a one-off Commerce API ECS task definition for Alembic migrations

Container images are intentionally not built in this unit. Keep desired counts
at zero until later container/CI work pushes usable images. Jenkins passes the
candidate image URIs and desired counts during Unit 08B dev deployments.

## Remote State Bootstrap

Create the dev S3 backend bucket once before initializing `envs/dev` against
remote state:

```bash
cd infra/terraform/bootstrap/dev-state
terraform init -backend=false
terraform apply \
  -var='aws_region=us-west-2' \
  -var='bucket_name=replace-with-globally-unique-commerce-os-dev-tfstate'
```

The bootstrap bucket has versioning, AES256 server-side encryption, public
access blocking, and a policy denying insecure transport. Bootstrap state stays
local and must not be committed.

## Dev Usage

Create a local tfvars file from the example:

```bash
cd infra/terraform/envs/dev
cp terraform.tfvars.example terraform.tfvars
```

Set `db_password` to a long random value, then initialize and validate:

```bash
terraform init \
  -backend-config='bucket=replace-with-globally-unique-commerce-os-dev-tfstate' \
  -backend-config='key=commerce-os/dev/terraform.tfstate' \
  -backend-config='region=us-west-2'
terraform validate
```

When moving an existing local dev state file into S3, add
`-migrate-state -force-copy` to `terraform init` intentionally after reviewing
the local state file.

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
