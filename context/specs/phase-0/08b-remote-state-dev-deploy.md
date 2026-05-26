# Unit 08B: Remote Terraform State and Dev Deploy

## Goal

Make the dev deployment repeatable by moving Terraform dev state to remote S3
state, then allowing Jenkins to deploy the ECR images created by Unit 08A to the
AWS dev ECS services.

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
- Allow Jenkins to run `terraform plan` for dev.
- Allow Jenkins to run `terraform apply` only behind an explicit deploy
  parameter or manual approval.
- Pass Unit 08A image URIs and ECS desired counts into Terraform.
- Fix ALB API path routing so `/api/*` and `/health` route to the API target
  group.
- Run Alembic migrations against dev RDS as an explicit deployment step.
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
- Jenkins controller provisioning.

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
- Treat Terraform apply as a deploy operation, not a CI check.
- Keep database migrations explicit:
  - deploy or update infrastructure first
  - run `alembic upgrade head` against dev RDS
  - update/wait for the long-running API ECS service only after migration
    succeeds
- Keep dev ECS desired counts at `1` when deploying real images.
- Keep Keycloak as external configuration:
  - if values are provided, configure storefront environment variables and run
    redirect smoke tests
  - if values are missing, skip auth smoke tests and record that auth was not
    verified in AWS dev

## Jenkins Credentials and Inputs

Document these required Jenkins credentials:

- AWS credentials or role access with permissions for:
  - S3 backend bucket access and lock file access
  - Terraform-managed AWS resources
  - ECR image reads
  - ECS service/task updates
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

## Pipeline Stages

1. **Remote State Bootstrap**
   - Run manually or through a tightly controlled Jenkins stage.
   - Create the S3 backend bucket if it does not exist.
   - Do not store bootstrap state in the same backend it creates.

2. **Terraform Init With Remote Backend**
   - Initialize `infra/terraform/envs/dev` with S3 backend configuration.
   - Migrate local dev state to remote state when needed.

3. **Terraform Plan**
   - Pass image URIs from Unit 08A.
   - Pass desired counts of `1` for storefront and API.
   - Include dev Keycloak variables only when configured.
   - Publish the plan output as a Jenkins artifact or console summary.

4. **Approval**
   - Require a deploy parameter or manual input before apply.

5. **Terraform Apply**
   - Apply the reviewed plan.
   - Output ALB DNS, ECS service names, RDS endpoint, and ECR URLs.

6. **Database Migration**
   - Run Alembic against dev RDS using the deployed API image or a controlled
     one-off ECS task.
   - Fail deployment if migration fails.

7. **ECS Stability**
   - Wait for the storefront service to stabilize.
   - Wait for the API service to stabilize.

8. **Smoke Test Dev**
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
- Fix `api_listener_paths` default to include `/api/*`.
- Add Jenkins deploy stages after the Unit 08A image-publish stages, or add a
  separate deploy Jenkinsfile if that keeps the pipeline simpler.
- Add a small smoke-test script under `platform/jenkins/scripts/` if it keeps
  the Jenkinsfile readable.
- Update `platform/jenkins/README.md` with:
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
- [ ] `terraform plan` includes the intended image URI and desired count
  changes.
- [ ] `terraform apply` succeeds through the controlled deploy path.
- [ ] Alembic migration succeeds against dev RDS.
- [ ] Storefront ECS service becomes stable.
- [ ] API ECS service becomes stable.
- [ ] Dev ALB smoke tests pass for health, catalog, storefront, and cart flows.
- [ ] Sign-in/sign-out redirects are verified when dev Keycloak configuration
  is available.

## Open Questions Before Implementation

- Should backend bootstrap run only manually, or should Jenkins expose it as a
  protected one-time action?
- What reachable Keycloak issuer should AWS dev use when auth smoke tests are
  enabled?
