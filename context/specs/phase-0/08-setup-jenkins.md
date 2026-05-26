# Unit 08: Setup Jenkins Pipeline

## Goal

Add the first Jenkins-based CI/CD path for the Phase 0 dev environment without
turning one unit into an all-at-once deployment project.

Unit 08 is split into smaller implementation specs:

1. `08a-jenkins-ci-image-publishing.md`
   - verify storefront, API, and Terraform checks
   - build Docker images
   - push storefront and API images to dev ECR
   - do not deploy ECS or mutate Terraform infrastructure
2. `08b-remote-state-dev-deploy.md`
   - add remote Terraform state for the dev environment
   - let the locally running Jenkins controller run controlled Terraform
     plan/apply against AWS dev
   - deploy the pushed images to ECS
   - run API database migrations against dev RDS through an AWS-side one-off
     ECS task
   - smoke test the dev ALB

Keycloak dev auth verification is optional in Unit 08B. The pipeline can use a
reachable dev Keycloak issuer when one is provided, but this split does not add
AWS Keycloak provisioning.

## Sequencing

### 08A First: Jenkins CI and Image Publishing

This step proves the repository can produce deployable artifacts:

- app tests and builds pass
- Docker images build locally and in Jenkins
- images are pushed to the existing Unit 07 ECR repositories

It avoids Terraform apply, RDS migration, ECS rollout, and Keycloak auth so the
first Jenkins increment is easy to verify.

### 08B Second: Remote State and Dev Deploy

This step makes deployment repeatable:

- Terraform dev state moves from local-only state to an S3 backend with native
  S3 lock files
- local Jenkins can safely run Terraform against shared state and manage the
  AWS dev deploy path
- ECS services move from `desired_count = 0` to real running dev tasks
- Alembic migrations run as an explicit deploy step
- smoke tests verify the deployed dev environment

## Out of Scope For All Unit 08 Work

- Production deployment jobs.
- Blue/green deployment.
- Autoscaling.
- HTTPS, custom domains, or certificate management.
- Provisioning the Jenkins controller itself in AWS.
- Exposing the local Jenkins controller publicly for inbound webhooks.
- Full Jenkins Configuration as Code for controller users, plugins, and
  hardening.
- Full browser end-to-end test automation.
- Provisioning Keycloak in AWS.

## Parent Verification

Unit 08 is complete only when both child specs are implemented and verified:

- [ ] `08a-jenkins-ci-image-publishing.md`
- [ ] `08b-remote-state-dev-deploy.md`
