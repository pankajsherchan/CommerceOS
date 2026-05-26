# Progress Tracker

## Phase 0

- [x] 01 Foundation Decisions
- [x] 02 Repo Bootstrap
- [x] 03 Setup Storefront Pages
- [x] 04 Setup Auth
- [x] 05 Setup API Endpoints
- [x] 06 Setup DB
- [x] 07 Setup TF
- [ ] 08 Setup Jenkins
  - [ ] 08A Jenkins CI and Image Publishing
  - [ ] 08B Remote Terraform State and Dev Deploy
- [ ] 09 Setup Logger

Current unit: 08A Jenkins CI and Image Publishing

Status: 08A implemented and locally verified; Jenkins/ECR execution pending.
08B not started.

Completed scope:

- Detailed the Unit 07 Terraform spec.
- Added Terraform modules for network, RDS PostgreSQL, and reusable ECS
  Fargate service wiring.
- Added a dev environment composition for ECR, ECS, ALB, RDS, CloudWatch logs,
  IAM roles, and the API database secret.
- Updated Terraform docs and ignore rules for local state/tfvars handling.
- Added a beginner-friendly HTML walkthrough for the Unit 07 Terraform changes.
- Detailed the Unit 08 Jenkins pipeline spec, including Docker image build,
  ECR push, Terraform deploy, migration, ECS update, and smoke-test scope.
- Split Unit 08 into 08A for Jenkins CI/image publishing and 08B for remote
  Terraform state plus dev deploy.
- Added production Docker build definitions and `.dockerignore` files for the
  storefront and commerce API.
- Added the Unit 08A Jenkins pipeline for storefront/API/Terraform checks,
  Docker image builds, and dev ECR image publishing.
- Updated Jenkins docs with required tools, AWS access, parameters, and
  published image tags.
- Added beginner-friendly HTML walkthroughs for the Unit 08A Dockerfiles and
  Jenkins pipeline.
- Verified storefront lint, typecheck, tests, and build; commerce API tests and
  import smoke; Terraform fmt/init/validate; and local storefront/API Docker
  image builds.

Open questions:

- For 08B, should backend bootstrap run only manually, or should Jenkins expose
  it as a protected one-time action?
- What reachable Keycloak issuer should the AWS dev storefront use for
  sign-in/sign-out verification when auth smoke tests are enabled?
- 08A still needs a real Jenkins run with Unit 07 ECR repository URLs to
  validate Jenkinsfile execution and image pushes.

Next unit: run the 08A Jenkins job against dev ECR, then implement 08B Remote
Terraform State and Dev Deploy.

## Phase 1

- [ ] 01 Microservice Setup
- [ ] 02 Setup Payment Stripe
