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
  - [ ] 08C Trigger Jenkins Pipeline From GitHub
- [ ] 09 Setup Logger

Current unit: 08A Jenkins CI and Image Publishing, narrowed to storefront image
publishing only.

Status: The active Jenkinsfile has been simplified to one AWS delivery path:
build the `apps/storefront` Docker image, resolve the storefront ECR repository
URL from AWS using a fixed dev repository name, and push storefront image tags
to ECR without requiring build parameters. Commerce API image publishing,
Terraform checks, remote-state bootstrap, ECS deploy, migration, stability
waits, smoke tests, and GitHub trigger/deploy branch gates are deferred until
the storefront image push is proven in a real Jenkins run.

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
- Revised the Unit 08B spec so the locally running Jenkins controller manages
  remote-state bootstrap, controlled Terraform deploys, AWS-side migration
  tasks, ECS stability checks, and dev ALB smoke tests.
- Added a dev remote-state bootstrap Terraform root for an encrypted,
  versioned S3 bucket with public access blocked.
- Moved the dev Terraform environment to partial S3 backend configuration with
  native S3 lock files enabled.
- Added dev Terraform support and outputs for an API Alembic migration ECS
  task, ECS service names, task networking, database secret ARN, and task
  definition ARNs.
- Fixed dev ALB API routing defaults to include `/api/*` and `/health`.
- Extended the Jenkins pipeline with optional remote-state bootstrap, remote
  init/state migration, Terraform plans, gated dev apply, AWS-side migration
  task execution, ECS stability waits, and ALB smoke tests.
- Documented local Jenkins deploy assumptions, backend bootstrap/state
  migration, deploy parameters, rollback notes, and optional Keycloak
  configuration.
- Detailed the Unit 08C GitHub trigger spec, including local Jenkins webhook
  constraints, temporary tunnel and SCM polling options, branch safety, deploy
  gates, verification expectations, and parent Unit 08 sequencing.
- Added Jenkins branch detection and fail-fast guards so the Phase 0
  image-publishing job only runs from the configured publish branch and shared
  dev mutations only run from the approved deploy branch.
- Added Jenkins ECR repository URL resolution through AWS
  `describe-repositories` for the fixed dev storefront repository.
- Simplified the active Jenkinsfile back to storefront-only Docker image build
  and ECR push while deferring API, Terraform, ECS deploy, and smoke-test stages.
- Removed active Jenkins build parameters for the storefront-only path; dev
  region, ECR repository name, tag prefix, and `dev-latest` behavior are fixed
  in source for now.
- Documented the Unit 08C GitHub trigger workflow, including Multibranch and
  single Pipeline setup, temporary tunnel webhook delivery, SCM polling
  fallback, plugin requirements, branch safety, and troubleshooting.
- Verified Terraform formatting and validation for the bootstrap and dev roots,
  plus smoke-test script shell syntax.

Open questions:

- What reachable Keycloak issuer should the AWS dev storefront use for
  sign-in/sign-out verification when auth smoke tests are enabled?
- The storefront-only Jenkins pipeline still needs a real run with AWS
  credentials to validate ECR repository URL resolution and image push.
- Jenkins may need one run or a job configuration refresh to drop stale
  parameter definitions from the previous Jenkinsfile.
- API image publishing, Terraform static checks, remote state, deploy,
  migration, ECS stability, ALB smoke tests, and Unit 08C GitHub trigger
  verification remain deferred.

Next unit: run the simplified storefront-only Jenkins pipeline against AWS dev,
then reintroduce API image publishing and verification in a small follow-up.

## Phase 1

- [ ] 01 Microservice Setup
- [ ] 02 Setup Payment Stripe
