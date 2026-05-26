# Unit 08B: Remote Terraform State and Dev Deploy

## Goal

Make the dev deployment repeatable by moving Terraform dev state to remote S3
state, then using the locally running Jenkins controller to deploy the ECR
images created by Unit 08A into the AWS dev ECS services.

Jenkins remains a local deployment orchestrator for this unit. AWS hosts the
CommerceOS dev runtime: ECR, ECS, ALB, RDS, Secrets Manager, CloudWatch, S3
remote state, and related IAM resources. The Jenkins controller itself is not
provisioned in AWS during Phase 0.

At the end of this unit, the deployed dev environment should support the same
non-auth Phase 0 flows that already work locally:

- browse catalog categories and products from dev RDS
- view product detail pages
- add, update, remove, and clear cart items

Sign-in and sign-out verification should run only when a reachable dev Keycloak
issuer is configured.

## Scope

### In Scope

- Add a minimal Terraform remote-state bootstrap for dev.
- Store dev Terraform state in an encrypted, versioned S3 bucket.
- Use Terraform S3 native state locking with `use_lockfile = true`.
- Migrate `infra/terraform/envs/dev` to the remote backend.
- Document and support a local Jenkins controller/agent that can reach AWS over
  outbound network access.
- Allow local Jenkins to run `terraform plan` for dev.
- Allow local Jenkins to run `terraform apply` only behind an explicit deploy
  parameter or manual approval.
- Allow local Jenkins to auto-deploy dev after successful image publishing when
  the deploy gate is explicitly enabled.
- Pass Unit 08A image URIs and ECS desired counts into Terraform.
- Fix ALB API path routing so `/api/*` and `/health` route to the API target
  group.
- Run Alembic migrations against dev RDS as an explicit deployment step through
  an AWS-side one-off ECS task.
- Wait for ECS service stability.
- Smoke test the dev ALB.
- Document optional Keycloak values for dev auth smoke tests.

### Out of Scope

- Provisioning Keycloak in AWS.
- Production remote state.
- Production deployment jobs.
- Blue/green deployment.
- Autoscaling.
- HTTPS, custom domains, or certificate management.
- Full browser end-to-end testing.
- Jenkins controller provisioning in AWS.
- Exposing the local Jenkins controller publicly for inbound webhooks.
- Hardening local Jenkins users, plugin policy, backups, or controller
  lifecycle beyond the minimum needed for the dev deployment path.

## Design

- Keep backend bootstrap separate from normal dev environment resources because
  Terraform backends must exist before the environment can use them.
- Add backend bootstrap under `infra/terraform/bootstrap/dev-state`.
- Backend bootstrap creates:
  - S3 bucket for Terraform state
  - bucket versioning
  - server-side encryption
  - public access block
  - least-privilege bucket policy only if needed
- Configure `infra/terraform/envs/dev` to use the S3 backend and
  `use_lockfile = true`.
- Keep backend names explicit and environment-specific.
- The local Jenkins controller is the single deployment entrypoint for normal
  dev deploys after this unit:
  - Jenkins runs from the developer machine or another trusted local host.
  - Jenkins uses local outbound access to AWS APIs, ECR, and the public dev ALB.
  - Jenkins credentials live in Jenkins credentials storage or an attached
    agent role, never in repository files.
  - AWS does not need inbound access to Jenkins for Phase 0.
- Automatic deployment means Jenkins continues from verified image publishing
  into the dev deploy stages when the deploy gate is enabled. It does not mean
  application startup runs migrations or Terraform.
- Treat Terraform apply as a deploy operation, not a CI check.
- Keep database migrations explicit:
  - deploy or update shared infrastructure and ECS task definitions first
  - run `alembic upgrade head` from an AWS-side one-off ECS task that uses the
    candidate API image and the same database secret as the API service
  - update/wait for the long-running API ECS service only after migration
    succeeds
- Do not require local Jenkins to connect directly to private RDS. RDS remains
  reachable only from the AWS network paths Terraform defines.
- Keep dev ECS desired counts at `1` when deploying real images.
- Keep Keycloak as external configuration:
  - if values are provided, configure storefront environment variables and run
    redirect smoke tests
  - if values are missing, skip auth smoke tests and record that auth was not
    verified in AWS dev

## Jenkins Credentials and Inputs

Document these required local Jenkins credentials:

- AWS credentials or role access with permissions for:
  - S3 backend bucket access and lock file access
  - Terraform-managed AWS resources
  - ECR image reads
  - ECS service/task updates
  - ECS one-off migration task execution
  - IAM pass-role for ECS task execution
  - Secrets Manager read/write for deployment secrets
- Dev Terraform variable values, especially `db_password`.

Document these optional dev auth credentials:

- `KEYCLOAK_ISSUER_URL`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET` if the dev client is confidential
- `STOREFRONT_AUTH_SESSION_SECRET`

Document these non-secret inputs:

- AWS region.
- Terraform backend bucket name.
- Terraform backend state key.
- Terraform dev directory.
- storefront image URI produced by Unit 08A.
- commerce API image URI produced by Unit 08A.
- ECS desired counts.
- deploy gate, such as `DEPLOY_DEV` or a Jenkins manual approval input.
- optional remote-state bootstrap gate, such as `BOOTSTRAP_REMOTE_STATE`.
- optional remote-state migration gate, such as `MIGRATE_LOCAL_STATE`.

## Pipeline Stages

1. **Remote State Bootstrap**
   - Run through a protected local Jenkins stage or manually from the local
     operator shell before normal deploys are enabled.
   - Create the S3 backend bucket if it does not exist.
   - Do not store bootstrap state in the same backend it creates.
   - Keep bootstrap state files out of source control.

2. **Terraform Init With Remote Backend**
   - Initialize `infra/terraform/envs/dev` with S3 backend configuration.
   - Migrate local dev state to remote state only when the migration gate is
     enabled.

3. **Terraform Plan**
   - Pass image URIs from Unit 08A.
   - Pass desired counts of `1` for storefront and API.
   - Include dev Keycloak variables only when configured.
   - Publish the plan output as a Jenkins artifact or console summary.
   - Use either separate prerequisite and rollout plans, or one plan only when
     the implementation still guarantees migration happens before the
     long-running API service rolls to the candidate image.

4. **Approval**
   - Require a deploy parameter or manual input before apply.
   - For automatic dev deployment, allow Jenkins to skip the manual input only
     when the build is on the approved branch and the deploy parameter is
     enabled.

5. **Terraform Apply Deploy Prerequisites**
   - Apply the reviewed prerequisite plan for shared infrastructure, ALB routing,
     task definitions, migration task wiring, secrets, and outputs needed by
     Jenkins.
   - Do not update the long-running API ECS service to the candidate image
     before the migration succeeds.
   - Output ALB DNS, ECS cluster name, ECS service names, migration task
     details, RDS endpoint, and ECR URLs.

6. **Database Migration**
   - Run Alembic against dev RDS using a controlled one-off ECS task in AWS.
   - Use the candidate API image, task execution role, database secret, subnet
     IDs, and security group IDs from Terraform outputs or managed resources.
   - Wait for the migration task to stop and inspect the task/container exit
     code.
   - Fail deployment if migration fails.

7. **Terraform Apply ECS Rollout**
   - Apply the reviewed rollout plan that updates service image URIs and desired
     counts to run the candidate storefront and API tasks.

8. **ECS Stability**
   - Wait for the storefront service to stabilize.
   - Wait for the API service to stabilize.

9. **Smoke Test Dev**
   - Check `GET /health`.
   - Check `GET /api/catalog/categories`.
   - Check `GET /api/catalog/products`.
   - Check the storefront home page returns a successful response.
   - Check cart add/update/remove/clear flows while placeholder auth remains in
     place.
   - Check sign-in/sign-out redirects only when dev Keycloak values are
     configured.

## Implementation

- Add `infra/terraform/bootstrap/dev-state`.
- Add or update backend configuration for `infra/terraform/envs/dev`.
- Update Terraform variables if needed for Jenkins-provided image URIs, desired
  counts, and optional Keycloak values.
- Add Terraform outputs needed by local Jenkins deploy stages, including ALB
  DNS name, ECS cluster/service names, subnet IDs, ECS task security group ID,
  API task definition or migration task definition, database secret ARN, and
  ECR repository URLs.
- Add Terraform support for a one-off API migration task if the existing API
  task definition cannot be reused safely before long-running service rollout.
- Add Terraform variables or Jenkins plan/apply inputs needed to separate deploy
  prerequisites from the final ECS service rollout when a single plan cannot
  preserve migration-before-service ordering.
- Fix `api_listener_paths` default to include `/api/*`.
- Add Jenkins deploy stages after the Unit 08A image-publish stages, or add a
  separate deploy Jenkinsfile if that keeps the pipeline simpler.
- Add a small smoke-test script under `platform/jenkins/scripts/` if it keeps
  the Jenkinsfile readable.
- Update `platform/jenkins/README.md` with:
  - local Jenkins controller assumptions
  - backend bootstrap instructions
  - state migration instructions
  - deployment parameters
  - rollback notes
  - Keycloak optional configuration
- Update `context/progress-tracker.md` after implementation.

## Verify When Done

- [ ] Backend bootstrap Terraform formats and validates.
- [ ] S3 backend bucket is encrypted, versioned, and blocks public access.
- [ ] Dev Terraform initializes against remote S3 state.
- [ ] Dev Terraform uses S3 native lock files.
- [ ] Existing dev state is migrated or recreated intentionally.
- [ ] Local Jenkins can run the plan stages with AWS credentials supplied from
  Jenkins or the agent environment.
- [ ] `terraform plan` includes the intended image URI and desired count
  changes.
- [ ] `terraform apply` succeeds through the controlled local Jenkins deploy
  path.
- [ ] Alembic migration succeeds against dev RDS through an AWS-side one-off ECS
  task.
- [ ] Storefront ECS service becomes stable.
- [ ] API ECS service becomes stable.
- [ ] Dev ALB smoke tests pass for health, catalog, storefront, and cart flows.
- [ ] Sign-in/sign-out redirects are verified when dev Keycloak configuration
  is available.

## Open Questions Before Implementation

- What reachable Keycloak issuer should AWS dev use when auth smoke tests are
  enabled?
- Should automatic dev deployment be limited to the main branch only, or should
  Jenkins allow any manually approved branch to deploy to the shared dev
  environment?
