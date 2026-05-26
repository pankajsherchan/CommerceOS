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

Current unit: 08C Trigger Jenkins Pipeline From GitHub

Status: 08C is implemented in the Jenkinsfile and Jenkins operator docs. Live
GitHub webhook or SCM-polling verification is still pending because the local
Jenkins job, tunnel, and Jenkins credentials must be configured outside the
repository. 08B is implemented and locally verified where possible; real
Jenkins/AWS execution is still pending for image push, remote-state bootstrap,
Terraform apply, ECS migration, ECS rollout, and ALB smoke tests.

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
- Documented the Unit 08C GitHub trigger workflow, including Multibranch and
  single Pipeline setup, temporary tunnel webhook delivery, SCM polling
  fallback, plugin requirements, branch safety, and troubleshooting.
- Verified Terraform formatting and validation for the bootstrap and dev roots,
  plus smoke-test script shell syntax.

Open questions:

- What reachable Keycloak issuer should the AWS dev storefront use for
  sign-in/sign-out verification when auth smoke tests are enabled?
- The combined 08A/08B Jenkins pipeline still needs a real run with dev ECR
  URLs and AWS credentials to validate image pushes, remote state, deploy,
  migration, ECS stability, and ALB smoke tests.
- Unit 08C still needs a real GitHub `main` push or PR merge to verify webhook
  delivery through a temporary tunnel, or SCM polling detection, against the
  configured local Jenkins job.

Next unit: configure the local Jenkins job and GitHub webhook or SCM polling,
run the combined Jenkins pipeline against AWS dev, and address any runtime
deploy issues before moving to 09 Setup Logger.

## Phase 1

- [ ] 01 Microservice Setup
- [ ] 02 Setup Payment Stripe
