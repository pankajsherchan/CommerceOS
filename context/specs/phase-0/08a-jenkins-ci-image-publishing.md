# Unit 08A: Jenkins CI and Image Publishing

## Goal

Create the first Jenkins pipeline increment for CommerceOS.

Current narrowed implementation: prove the smallest useful AWS publishing path
first by building the storefront Docker image from `apps/storefront` and
pushing it to the dev storefront ECR repository created in Unit 07.

The broader 08A intent is still to verify the existing storefront, API, and
Terraform code, then build and push both storefront and commerce API images.
Those checks and the API image push are deferred until the storefront image push
is working in Jenkins.

This unit does not deploy ECS, run Terraform apply, run database migrations, or
verify Keycloak.

## Scope

### In Scope

- Add Docker build definitions for:
  - `apps/storefront`
- Add `.dockerignore` for the storefront Docker build context.
- Add `platform/jenkins/Jenkinsfile` focused on storefront image publishing.
- Keep Jenkins focused on one `dev` artifact publishing path.
- Resolve the storefront ECR repository URL from AWS by the fixed dev
  repository name.
- Push immutable storefront image tags to ECR using commit SHA and Jenkins build
  number.
- Push a moving `dev-latest` tag for convenience.
- Add minimal Jenkins docs for tools, agent AWS access, fixed build
  configuration, and expected outputs.

### Out of Scope

- Terraform remote state.
- Terraform apply.
- ECS service updates.
- RDS migrations.
- AWS dev smoke tests.
- Keycloak configuration or auth smoke tests.
- Commerce API image publishing until the storefront image push is proven.
- Storefront/API/Terraform verification stages until the simple ECR push path
  works in Jenkins.
- Jenkins controller provisioning.
- Jenkins Configuration as Code.

## Design

- Use a Declarative Pipeline in `platform/jenkins/Jenkinsfile`.
- Do not introduce a repo-wide JavaScript or Python workspace.
- Use Docker BuildKit for image builds.
- Use AWS CLI authentication from the Jenkins agent environment or IAM role.
- Do not commit AWS access keys or generated image metadata.
- Use the storefront ECR repository created by Unit 07.
- Keep Docker images production-oriented but minimal:
  - storefront runs `next start`

## Jenkins AWS Access and Inputs

Document the required Jenkins agent AWS access:

- AWS credentials or role access with permission to:
  - describe the storefront ECR repository
  - authenticate to ECR
  - push images to the storefront ECR repository

Document these non-secret inputs:

- None for the active narrowed path. AWS region, storefront ECR repository
  name, image tag prefix, and moving latest behavior are fixed in the
  Jenkinsfile until the simple publish path is proven.

## Pipeline Stages

1. **Checkout**
   - Check out the repository.
   - Record commit SHA and build metadata.

2. **Storefront Verification**
   - Deferred until the storefront image push path works in Jenkins.

3. **Resolve Storefront Repository**
   - Resolve the repository URL from AWS using the fixed storefront ECR
     repository name.

4. **Build Storefront Image**
   - Build storefront image from `apps/storefront`.
   - Tag the image with:
     - short commit SHA
     - Jenkins build number
     - `dev-latest`

5. **Push Storefront Image**
   - Authenticate Docker to ECR.
   - Push storefront image tags.

## Implementation

- Add `apps/storefront/Dockerfile`.
- Add `apps/storefront/.dockerignore`.
- Add `platform/jenkins/Jenkinsfile`.
- Update `platform/jenkins/README.md` with:
  - Unit 08A purpose
  - required Jenkins tools
  - required Jenkins agent AWS access
  - fixed build configuration
  - expected ECR outputs
  - explicit note that this unit does not deploy
- Update `context/progress-tracker.md` after implementation.

## Verify When Done

- [ ] Storefront Docker image builds locally.
- [ ] Jenkinsfile syntax is validated or exercised in Jenkins.
- [ ] Pipeline resolves the storefront ECR URL from AWS using the fixed dev
  repository name.
- [ ] Pipeline pushes the storefront image to dev ECR.
