# CommerceOS Jenkins

`platform/jenkins/Jenkinsfile` contains the local Jenkins pipeline for CI,
image publishing, optional remote-state bootstrap, and gated AWS dev deploys.

Jenkins remains local in Phase 0. The controller or agent needs outbound access
to AWS APIs, ECR, and the public dev ALB; AWS does not need inbound access to
Jenkins.

## Required Jenkins Tools

- Git
- Docker with BuildKit support
- AWS CLI v2
- Terraform
- jq
- curl
- pnpm
- uv
- A Jenkins agent that can reach AWS ECR, ECS, S3, Secrets Manager, and the dev
  ALB

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
| `PLAN_DEV` | `false` | Run remote-state Terraform dev deployment plans after image publishing. |
| `DEPLOY_DEV` | `false` | Apply the dev deploy path after image publishing. |
| `AUTO_APPROVE_DEV_DEPLOY` | `false` | Skip the manual approval input on the approved branch. |
| `BOOTSTRAP_REMOTE_STATE` | `false` | Create or update the dev S3 Terraform backend bucket. |
| `MIGRATE_LOCAL_STATE` | `false` | Run `terraform init -migrate-state -force-copy` for dev. |
| `TF_BACKEND_BUCKET` | empty | S3 bucket name for dev Terraform state. |
| `TF_BACKEND_KEY` | `commerce-os/dev/terraform.tfstate` | S3 object key for dev Terraform state. |
| `DEV_DB_PASSWORD_CREDENTIALS_ID` | empty | Optional Secret Text credential bound to `TF_VAR_db_password`. |
| `STOREFRONT_DESIRED_COUNT` | `1` | Storefront ECS desired count for dev rollout. |
| `API_DESIRED_COUNT` | `1` | Commerce API ECS desired count for dev rollout. |
| `APPROVED_DEV_DEPLOY_BRANCH` | `main` | Branch allowed to skip manual dev-deploy approval. |

## AWS Access

The pipeline needs permission to authenticate to ECR, push to both dev image
repositories, read and write the S3 backend and lock file, manage the
Terraform-owned dev resources, run ECS tasks, wait for ECS services, pass ECS
task roles, and read/write deployment secrets. Use either:

- an IAM role attached to the Jenkins agent, or
- a Jenkins AWS credential referenced by `AWS_CREDENTIALS_ID`.

No AWS access keys or generated image metadata should be committed to the
repository.

Store `db_password` as a Jenkins Secret Text credential and pass its ID through
`DEV_DB_PASSWORD_CREDENTIALS_ID`, or provide `TF_VAR_db_password` through the
agent environment. Do not commit `terraform.tfvars`.

## Remote State

To bootstrap the dev backend from Jenkins, set:

- `BOOTSTRAP_REMOTE_STATE=true`
- `TF_BACKEND_BUCKET` to a globally unique bucket name
- `AWS_REGION` to the target region

The bootstrap uses `infra/terraform/bootstrap/dev-state` and creates a
versioned, encrypted S3 bucket with public access blocked. The normal dev env
then initializes `infra/terraform/envs/dev` with the S3 backend and Terraform
native S3 lock files. Set `MIGRATE_LOCAL_STATE=true` only when intentionally
copying an existing local state file into the remote backend.

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
7. When `PLAN_DEV` or `DEPLOY_DEV` is enabled, initialize dev remote state and
   produce:
   - a targeted migration-task plan for the candidate API image
   - a full rollout preview plan for storefront/API desired counts and images
8. When `DEPLOY_DEV` is enabled, require manual approval unless
   `AUTO_APPROVE_DEV_DEPLOY` is enabled on `APPROVED_DEV_DEPLOY_BRANCH`.
9. Apply the migration task definition, run `alembic upgrade head` as a
   one-off ECS Fargate task, then apply the ECS service rollout.
10. Wait for both ECS services to stabilize and run ALB smoke tests.

## Published Tags

For each image, the pipeline publishes immutable tags:

- `<prefix>-<short-sha>`
- `<prefix>-build-<jenkins-build-number>`
- `<prefix>-<short-sha>-b<jenkins-build-number>`

When `PUSH_DEV_LATEST` is enabled, it also publishes:

- `<prefix>-latest`

## Dev Smoke Tests

`platform/jenkins/scripts/smoke-dev-alb.sh` checks:

- `GET /health`
- `GET /api/catalog/categories`
- `GET /api/catalog/products`
- storefront home page response
- direct API cart clear, add, update, remove, and clear flows using the
  placeholder bearer token

Auth redirect smoke tests run only when `KEYCLOAK_ISSUER_URL` and
`KEYCLOAK_CLIENT_ID` are present in the Jenkins smoke-test environment. Dev
Keycloak is still external in Phase 0. Configure non-secret storefront values
through `storefront_environment_variables`; reference secret values such as
`KEYCLOAK_CLIENT_SECRET` and `STOREFRONT_AUTH_SESSION_SECRET` through
`storefront_secrets` using Secrets Manager ARNs.

## Rollback Notes

For dev, redeploy a previously published immutable tag by rerunning Jenkins
from the older commit or by running a reviewed Terraform deploy with
`storefront_image_uri` and `api_image_uri` set to the known-good tags. Schema
rollback is not automatic; apply a reviewed corrective migration or restore the
dev database intentionally.
