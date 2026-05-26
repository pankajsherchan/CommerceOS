# CommerceOS Jenkins

`platform/jenkins/Jenkinsfile` contains the Unit 08A pipeline for CI and image
publishing.

This increment verifies the storefront, commerce API, and Terraform dev
configuration, then builds and pushes Docker images to the dev ECR
repositories. It does not run Terraform apply, deploy ECS services, run
database migrations, or verify Keycloak.

## Required Jenkins Tools

- Git
- Docker with BuildKit support
- AWS CLI v2
- Terraform
- pnpm
- uv
- A Jenkins agent that can reach AWS ECR

## Required Jenkins Plugins

- Pipeline
- Credentials Binding
- AWS Credentials, if using a Jenkins-managed AWS credential instead of an
  agent IAM role

## Parameters

| Parameter | Default | Purpose |
| --- | --- | --- |
| `AWS_REGION` | `us-west-2` | AWS region containing the dev ECR repositories. |
| `STOREFRONT_ECR_REPOSITORY_URL` | empty | Full storefront ECR repository URL from the Unit 07 Terraform output. |
| `COMMERCE_API_ECR_REPOSITORY_URL` | empty | Full commerce API ECR repository URL from the Unit 07 Terraform output. |
| `IMAGE_TAG_PREFIX` | `dev` | Environment or channel prefix for image tags. |
| `AWS_CREDENTIALS_ID` | empty | Optional Jenkins AWS credential ID. Leave empty when the agent has an IAM role. |
| `PUSH_DEV_LATEST` | `true` | Also publish a moving `<prefix>-latest` tag. |

## AWS Access

The pipeline needs permission to authenticate to ECR and push to both dev image
repositories. Use either:

- an IAM role attached to the Jenkins agent, or
- a Jenkins AWS credential referenced by `AWS_CREDENTIALS_ID`.

No AWS access keys or generated image metadata should be committed to the
repository.

## Pipeline Work

1. Check out the repository and record the short commit SHA.
2. Run storefront verification in `apps/storefront`:
   - `pnpm install --frozen-lockfile`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
3. Run commerce API verification in `services/commerce-api`:
   - `uv sync --dev`
   - `uv run pytest`
   - `uv run python -c "from commerce_api.main import app; print(app.title)"`
4. Run Terraform static verification:
   - `terraform fmt -check -recursive` from `infra/terraform`
   - `terraform init -backend=false` and `terraform validate` from
     `infra/terraform/envs/dev`
5. Build the storefront and commerce API Docker images.
6. Authenticate Docker to ECR and push image tags.

## Published Tags

For each image, the pipeline publishes immutable tags:

- `<prefix>-<short-sha>`
- `<prefix>-build-<jenkins-build-number>`
- `<prefix>-<short-sha>-b<jenkins-build-number>`

When `PUSH_DEV_LATEST` is enabled, it also publishes:

- `<prefix>-latest`
