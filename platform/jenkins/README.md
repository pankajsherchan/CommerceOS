# CommerceOS Jenkins

`platform/jenkins/Jenkinsfile` contains the local Jenkins pipeline for CI,
image publishing, optional remote-state bootstrap, and gated AWS dev deploys.

Jenkins remains local in Phase 0. The controller or agent needs outbound access
to AWS APIs, ECR, and the public dev ALB; AWS does not need inbound access to
Jenkins. GitHub webhook delivery is the only Phase 0 case that needs inbound
reachability to local Jenkins, and that should use a temporary development
tunnel rather than permanent public exposure.

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
- Git
- GitHub
- GitHub Branch Source, when using a Multibranch Pipeline job
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
| `PUBLISH_BRANCH` | `main` | Branch allowed to run the Phase 0 dev image-publishing job. |
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

## GitHub Trigger

Unit 08C makes GitHub `main` updates start the local Jenkins pipeline. The
pipeline still reads `platform/jenkins/Jenkinsfile`, publishes images by
default, and leaves `PLAN_DEV`, `DEPLOY_DEV`, `BOOTSTRAP_REMOTE_STATE`, and
`MIGRATE_LOCAL_STATE` disabled unless Jenkins parameters explicitly enable
them.

The Jenkinsfile detects the checked-out SCM branch from Multibranch Pipeline
variables, single Pipeline Git variables, or the checked-out repository. It
fails before image publishing when the detected branch does not match
`PUBLISH_BRANCH`, and it fails before any shared dev mutation when the branch
does not match `APPROVED_DEV_DEPLOY_BRANCH`. Change request builds are not part
of the Phase 0 deploy-capable job.

### Preferred Job: Multibranch Pipeline

Create a Multibranch Pipeline job named `commerce-os`:

- Branch source: `https://github.com/pankajsherchan/CommerceOS.git`, or
  `git@github.com:pankajsherchan/CommerceOS.git` if Jenkins uses SSH
  credentials.
- Credentials: only required if the repository is private or Jenkins needs a
  GitHub token for repository discovery.
- Behaviors: discover branches, filtered to `main` for Unit 08C.
- Pull request discovery: disabled for this unit unless needed only for branch
  indexing tests.
- Build configuration: by Jenkinsfile, with script path
  `platform/jenkins/Jenkinsfile`.
- Scan trigger: enable the GitHub hook trigger for SCM polling.

Set job parameters or defaults so the required ECR repository URLs are present
and the deploy gates remain off by default:

- `PUBLISH_BRANCH=main`
- `PLAN_DEV=false`
- `DEPLOY_DEV=false`
- `BOOTSTRAP_REMOTE_STATE=false`
- `MIGRATE_LOCAL_STATE=false`

### Fallback Job: Single Pipeline

If the local controller does not use Multibranch Pipeline yet, create a Pipeline
job named `commerce-os-main`:

- Definition: Pipeline script from SCM.
- SCM: Git.
- Repository URL: `https://github.com/pankajsherchan/CommerceOS.git`, or
  `git@github.com:pankajsherchan/CommerceOS.git` if Jenkins uses SSH
  credentials.
- Branch specifier: `*/main`.
- Script path: `platform/jenkins/Jenkinsfile`.
- Build trigger: enable `GitHub hook trigger for GITScm polling`.

Use the same parameters as the Multibranch job. Do not enable anonymous remote
build triggers.

### Webhook Through A Temporary Tunnel

GitHub cannot deliver webhooks to `http://localhost:9090` directly. When testing
webhooks, start a temporary HTTPS tunnel to the local controller, for example:

```sh
ngrok http 9090
```

or:

```sh
cloudflared tunnel --url http://localhost:9090
```

Then add a repository webhook in GitHub:

- Payload URL: `https://<tunnel-host>/github-webhook/`
- Content type: `application/json`
- Secret: generated outside the repository and configured in Jenkins or the
  GitHub plugin when signature validation is available
- SSL verification: enabled
- Events: only `push`

Expected behavior:

- Merging a pull request into `main` sends a `push` event for
  `refs/heads/main` and starts one Jenkins build.
- Direct pushes to `main` do the same.
- Pushes to other branches should not resolve to the Phase 0 deploy-capable job.

Stop the tunnel when testing is finished. Do not commit tunnel URLs, webhook
secrets, GitHub tokens, Jenkins home files, or generated job config.

### SCM Polling Fallback

When no tunnel is running, Jenkins can poll GitHub for `main` updates instead.
On the Multibranch or single Pipeline job, add a modest poll schedule such as:

```text
H/5 * * * *
```

Use polling as a fallback only. Disable it once webhook delivery through the
temporary tunnel is reliable so a single GitHub push does not create duplicate
builds.

## Pipeline Work

1. Check out the repository and record the short commit SHA.
2. Detect the SCM branch and reject non-`main` or change request runs before
   publishing dev images.
3. Run storefront verification in `apps/storefront`:
   - `pnpm install --frozen-lockfile`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
4. Run commerce API verification in `services/commerce-api`:
   - `uv sync --dev`
   - `uv run pytest`
   - `uv run python -c "from commerce_api.main import app; print(app.title)"`
5. Run Terraform static verification:
   - `terraform fmt -check -recursive` from `infra/terraform`
   - `terraform init -backend=false` and `terraform validate` from
     `infra/terraform/envs/dev`
6. Build the storefront and commerce API Docker images.
7. Authenticate Docker to ECR and push image tags.
8. When `PLAN_DEV` or `DEPLOY_DEV` is enabled, initialize dev remote state and
   produce:
   - a targeted migration-task plan for the candidate API image
   - a full rollout preview plan for storefront/API desired counts and images
9. When `DEPLOY_DEV` is enabled, require manual approval unless
   `AUTO_APPROVE_DEV_DEPLOY` is enabled on `APPROVED_DEV_DEPLOY_BRANCH`.
10. Apply the migration task definition, run `alembic upgrade head` as a
   one-off ECS Fargate task, then apply the ECS service rollout.
11. Wait for both ECS services to stabilize and run ALB smoke tests.

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

## GitHub Trigger Troubleshooting

- GitHub reports `404` or `403`: confirm the tunnel forwards to
  `http://localhost:9090`, Jenkins is running, the webhook URL ends in
  `/github-webhook/`, and Jenkins authentication/plugin settings allow the
  GitHub hook endpoint.
- No build starts: confirm the job uses the GitHub repository URL, script path
  `platform/jenkins/Jenkinsfile`, branch `main`, and the GitHub hook trigger for
  SCM polling.
- Duplicate builds start: disable SCM polling while webhook delivery is active,
  or remove duplicate webhooks from the GitHub repository.
- Build fails with a branch guard: confirm the job is checking out `main` and
  `PUBLISH_BRANCH` is still `main`.
- Deploy gates unexpectedly run: check the Jenkins parameters for the build.
  GitHub webhook payload values must not override `PLAN_DEV`, `DEPLOY_DEV`,
  `BOOTSTRAP_REMOTE_STATE`, `MIGRATE_LOCAL_STATE`, image repository URLs, AWS
  credentials, or Terraform backend inputs.
