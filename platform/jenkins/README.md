# CommerceOS Jenkins

`platform/jenkins/Jenkinsfile` currently does one thing: build the storefront
Docker image from `apps/storefront` and push it to the dev ECR repository.

Jenkins remains local in Phase 0. The controller or agent only needs outbound
access to AWS ECR for this pipeline.

## Required Jenkins Tools

- Git
- Docker with BuildKit support
- AWS CLI v2
- A Jenkins agent that can reach AWS ECR

## Required Jenkins Plugins

- Pipeline
- Git

## Build Configuration

The Jenkinsfile does not define build parameters. These values are fixed in
source for the current narrow dev publishing path:

| Value | Setting |
| --- | --- |
| AWS region | `us-west-2` |
| Storefront ECR repository name | `commerce-os-dev-storefront` |
| Image tag prefix | `dev` |
| Moving latest tag | `dev-latest` is always pushed |

## AWS Access

The pipeline needs permission to describe the storefront ECR repository,
authenticate to ECR, and push image tags. The Jenkins agent should already have
AWS access through its environment or IAM role.

No AWS access keys or generated image metadata should be committed to the
repository.

If Jenkins still displays old build parameters after this Jenkinsfile change,
run the job once or re-save/reload the job configuration so Jenkins drops the
stale parameter definitions cached from the previous Jenkinsfile.

## Pipeline Work

1. Check out the repository and record the short commit SHA.
2. Resolve the storefront ECR repository URL from AWS using
   `commerce-os-dev-storefront`.
3. Build the storefront Docker image from `apps/storefront/Dockerfile`.
4. Authenticate Docker to ECR.
5. Push the storefront image tags.

## Published Tags

The pipeline publishes immutable tags:

- `<prefix>-<short-sha>`
- `<prefix>-build-<jenkins-build-number>`
- `<prefix>-<short-sha>-b<jenkins-build-number>`

It also publishes:

- `<prefix>-latest`

## Useful AWS Check

If repository URL resolution fails, confirm the ECR repository exists:

```sh
aws ecr describe-repositories \
  --region us-west-2 \
  --repository-names commerce-os-dev-storefront \
  --query 'repositories[0].repositoryUri' \
  --output text
```
