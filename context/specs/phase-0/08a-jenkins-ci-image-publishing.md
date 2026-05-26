# Unit 08A: Jenkins CI and Image Publishing

## Goal

Create the first Jenkins pipeline increment for CommerceOS.

This unit verifies the existing storefront, API, and Terraform code, then builds
and pushes container images for the storefront and commerce API to the dev ECR
repositories created in Unit 07.

This unit does not deploy ECS, run Terraform apply, run database migrations, or
verify Keycloak.

## Scope

### In Scope

- Add Docker build definitions for:
  - `apps/storefront`
  - `services/commerce-api`
- Add `.dockerignore` files for both Docker build contexts.
- Add `platform/jenkins/Jenkinsfile` focused on CI and image publishing.
- Keep Jenkins focused on one `dev` artifact publishing path.
- Push immutable image tags to ECR using commit SHA and Jenkins build number.
- Optionally push a moving `dev-latest` tag for convenience.
- Add minimal Jenkins docs for tools, credentials, parameters, and expected
  outputs.

### Out of Scope

- Terraform remote state.
- Terraform apply.
- ECS service updates.
- RDS migrations.
- AWS dev smoke tests.
- Keycloak configuration or auth smoke tests.
- Jenkins controller provisioning.
- Jenkins Configuration as Code.

## Design

- Use a Declarative Pipeline in `platform/jenkins/Jenkinsfile`.
- Use app-local tooling:
  - storefront commands run inside `apps/storefront`
  - API commands run inside `services/commerce-api`
- Do not introduce a repo-wide JavaScript or Python workspace.
- Use Docker BuildKit for image builds.
- Use AWS CLI authentication through Jenkins credentials.
- Do not commit AWS access keys or generated image metadata.
- Use ECR repositories created by Unit 07:
  - storefront repository output
  - commerce API repository output
- Keep Docker images production-oriented but minimal:
  - storefront runs `next start`
  - API runs `uvicorn commerce_api.main:app`

## Jenkins Credentials and Inputs

Document these required Jenkins credentials:

- AWS credentials or role access with permission to:
  - authenticate to ECR
  - push images to the storefront ECR repository
  - push images to the commerce API ECR repository

Document these non-secret inputs:

- AWS region.
- storefront ECR repository URL.
- commerce API ECR repository URL.
- image tag prefix or environment name, defaulting to `dev`.

## Pipeline Stages

1. **Checkout**
   - Check out the repository.
   - Record commit SHA and build metadata.

2. **Storefront Verification**
   - Run inside `apps/storefront`:
     - `pnpm install --frozen-lockfile`
     - `pnpm lint`
     - `pnpm typecheck`
     - `pnpm test`
     - `pnpm build`

3. **Commerce API Verification**
   - Run inside `services/commerce-api`:
     - `uv sync --dev`
     - `uv run pytest`
     - `uv run python -c "from commerce_api.main import app; print(app.title)"`

4. **Terraform Static Verification**
   - Run from `infra/terraform`:
     - `terraform fmt -check -recursive`
   - Run from `infra/terraform/envs/dev`:
     - `terraform init -backend=false`
     - `terraform validate`

5. **Build Images**
   - Build storefront image from `apps/storefront`.
   - Build API image from `services/commerce-api`.
   - Tag each image with:
     - short commit SHA
     - Jenkins build number
     - optional `dev-latest`

6. **Push Images**
   - Authenticate Docker to ECR.
   - Push storefront image tags.
   - Push API image tags.

## Implementation

- Add `apps/storefront/Dockerfile`.
- Add `apps/storefront/.dockerignore`.
- Add `services/commerce-api/Dockerfile`.
- Add `services/commerce-api/.dockerignore`.
- Add `platform/jenkins/Jenkinsfile`.
- Update `platform/jenkins/README.md` with:
  - Unit 08A purpose
  - required Jenkins tools
  - required Jenkins credentials
  - required parameters
  - expected ECR outputs
  - explicit note that this unit does not deploy
- Update `context/progress-tracker.md` after implementation.

## Verify When Done

- [ ] Storefront lint passes.
- [ ] Storefront typecheck passes.
- [ ] Storefront tests pass.
- [ ] Storefront build passes.
- [ ] Commerce API tests pass.
- [ ] Commerce API import smoke passes.
- [ ] `terraform fmt -check -recursive` passes.
- [ ] `terraform init -backend=false` and `terraform validate` pass for
  `infra/terraform/envs/dev`.
- [ ] Storefront Docker image builds locally.
- [ ] Commerce API Docker image builds locally.
- [ ] Jenkinsfile syntax is validated or exercised in Jenkins.
- [ ] Pipeline pushes both images to dev ECR.
