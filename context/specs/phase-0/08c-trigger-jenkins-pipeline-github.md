# Unit 08C: Trigger Jenkins Pipeline From GitHub

## Goal

Trigger the CommerceOS Jenkins pipeline automatically when changes land on the
GitHub `main` branch, whether the change arrives through a pull request merge
or a direct push.

Current status: deferred while the active Jenkinsfile is narrowed to
storefront-only Docker image publishing. GitHub trigger branch guards and deploy
gates should be revisited after the simple ECR push path is proven in Jenkins.

The Jenkins controller still runs locally at `http://localhost:9090` in Phase 0.
Because GitHub cannot send webhooks directly to `localhost`, this unit must use
one of the supported local-controller trigger paths:

1. a temporary public tunnel to the local Jenkins controller for GitHub webhook
   delivery, or
2. Jenkins SCM polling as a fallback when no tunnel is running.

The pipeline should build and publish images on every `main` update. Dev deploys
must remain gated by the existing `PLAN_DEV`, `DEPLOY_DEV`, and approval
parameters from Unit 08B.

## Scope

### In Scope

- Configure a Jenkins job that tracks the GitHub repository and uses
  `platform/jenkins/Jenkinsfile`.
- Trigger Jenkins automatically for updates to `main`.
- Support both PR merge commits and direct pushes to `main`.
- Keep automatic GitHub-triggered runs on `main` focused on CI and image
  publishing by default.
- Preserve the existing gated deploy controls:
  - `PLAN_DEV=false` by default
  - `DEPLOY_DEV=false` by default
  - `AUTO_APPROVE_DEV_DEPLOY=false` by default unless explicitly set for the
    approved branch
- Document how to expose local Jenkins to GitHub through a temporary tunnel for
  development-only webhook delivery.
- Document Jenkins SCM polling as a no-inbound-network fallback.
- Add any Jenkinsfile branch or build-cause guards needed to keep automatic
  webhook runs from accidentally deploying shared dev.
- Document required GitHub webhook settings, Jenkins plugins, credentials, and
  troubleshooting steps.

### Out of Scope

- Provisioning Jenkins in AWS.
- Permanent public exposure of the local Jenkins controller.
- HTTPS termination, reverse proxy hardening, or custom domains for Jenkins.
- GitHub Actions replacement for Jenkins.
- Production deployment triggers.
- Pull request validation jobs for every branch.
- Automatic deploy to dev on every `main` merge unless explicitly enabled by
  Jenkins parameters and branch gates.
- Full Jenkins Configuration as Code for job creation, users, plugins, or
  controller hardening.

## Design

- Keep Jenkins as the CI/CD system of record for Phase 0.
- Prefer a Multibranch Pipeline job when the needed plugins are available:
  - source: GitHub repository
  - script path: `platform/jenkins/Jenkinsfile`
  - branch discovery: include `main`
  - PR discovery: disabled or left for a later unit unless needed for webhook
    indexing behavior
- A single Pipeline job that checks out `main` is acceptable if the local
  Jenkins setup does not use Multibranch Pipeline yet.
- GitHub webhook delivery requires a public URL. For local development, use a
  temporary tunnel such as ngrok or Cloudflare Tunnel that forwards public HTTPS
  traffic to `http://localhost:9090`.
- The tunnel URL is disposable. Do not commit it and do not treat it as
  infrastructure.
- Use a GitHub webhook secret and configure the same value in Jenkins when the
  installed GitHub plugin supports signature validation.
- Configure webhook events narrowly:
  - `push` event is required
  - `pull_request` events are optional and should not trigger deploys in this
    unit
- Jenkins must ignore non-`main` push events for this unit.
- Jenkins should not auto-deploy from a webhook run unless all existing deploy
  gates are explicitly enabled and the detected branch is `main`.
- SCM polling fallback should check `main` on a modest interval, such as every
  5 minutes, and should be disabled when reliable webhook delivery is active.
- Avoid adding repository secrets for GitHub unless the selected Jenkins plugin
  requires a GitHub token for repository discovery or webhook registration.
- If Jenkins cannot auto-register the webhook, create it manually in GitHub
  repository settings.

## Jenkins Plugins

Document and install these plugins if they are not already available:

- Pipeline
- Git
- GitHub
- GitHub Branch Source, when using a Multibranch Pipeline job
- Credentials Binding
- AWS Credentials, still needed for the existing image publishing and optional
  deploy path when Jenkins-managed AWS credentials are used

## Jenkins Job Configuration

### Preferred: Multibranch Pipeline

- Create a Multibranch Pipeline job named `commerce-os`.
- Add the GitHub repository as the branch source.
- Set the Jenkinsfile path to `platform/jenkins/Jenkinsfile`.
- Discover only the `main` branch for this unit.
- Configure build strategies so branch indexing does not run deployments.
- Enable the GitHub hook trigger for SCM polling.
- Keep job properties or default parameters aligned with the Jenkinsfile:
  - ECR repository URLs are configured in Jenkins parameters or resolved from
    AWS ECR by repository name
  - `PLAN_DEV=false`
  - `DEPLOY_DEV=false`
  - `BOOTSTRAP_REMOTE_STATE=false`
  - `MIGRATE_LOCAL_STATE=false`

### Acceptable Fallback: Single Pipeline Job

- Create a Pipeline job named `commerce-os-main`.
- Configure Pipeline script from SCM.
- SCM URL points to the GitHub repository.
- Branch specifier is `*/main`.
- Script path is `platform/jenkins/Jenkinsfile`.
- Enable `GitHub hook trigger for GITScm polling`.
- Add an SCM polling schedule only if webhook delivery is unavailable.

## GitHub Webhook Configuration

When using a tunnel, configure the GitHub repository webhook with:

- Payload URL:
  - `https://<tunnel-host>/github-webhook/` for the GitHub plugin hook
- Content type:
  - `application/json`
- Secret:
  - a generated webhook secret stored in Jenkins credentials or plugin
    configuration
- SSL verification:
  - enabled for trusted tunnel HTTPS endpoints
- Events:
  - `push`

Expected trigger behavior:

- Merging a PR into `main` sends a `push` event for `refs/heads/main` and starts
  the Jenkins `main` job.
- A direct push to `main` sends a `push` event for `refs/heads/main` and starts
  the Jenkins `main` job.
- Pushes to non-`main` branches do not start the Phase 0 deploy-capable job.

## Security and Safety

- Do not expose local Jenkins permanently to the internet.
- Use a tunnel only while actively testing or running the local controller.
- Require Jenkins authentication; do not enable anonymous build or admin
  access.
- Keep the GitHub webhook secret out of source control.
- Keep AWS credentials in Jenkins credentials storage or on the Jenkins agent
  role, never in repository files.
- Keep destructive or shared-environment actions behind existing Jenkins
  parameters and branch checks.
- Do not let webhook payload values override deploy parameters, image
  repository URLs, AWS credentials, backend bucket names, or Terraform
  variables.
- If a webhook-triggered build is started before Jenkins parameters are fully
  configured, the build should fail during input validation rather than
  deploying with defaults.

## Pipeline Behavior

1. **GitHub Event**
   - A PR merge or direct push updates `refs/heads/main`.
   - GitHub sends a `push` webhook to the Jenkins webhook URL, or Jenkins
     polling detects the new commit.

2. **Job Resolution**
   - Jenkins maps the event to the `main` branch job.
   - Jenkins checks out the repository revision from GitHub.
   - Jenkins uses `platform/jenkins/Jenkinsfile`.

3. **Input Validation**
   - Required image publishing inputs are present.
   - Branch detection confirms the build is for `main` when auto-approval or
     deploy behavior is requested.
   - Deploy parameters remain false unless explicitly configured.

4. **CI and Image Publishing**
   - Run the existing storefront, API, and Terraform checks.
   - Build both Docker images.
   - Push immutable ECR image tags.

5. **Optional Dev Plan or Deploy**
   - Run only when Jenkins parameters explicitly enable the Unit 08B gates.
   - Do not infer deploy intent from a GitHub webhook alone.

## Implementation

- Update `platform/jenkins/README.md` with:
  - local webhook limitation for `localhost:9090`
  - recommended tunnel setup
  - GitHub webhook settings
  - Multibranch Pipeline job setup
  - single Pipeline fallback setup
  - SCM polling fallback
  - branch/deploy safety notes
  - troubleshooting checklist
- Update `platform/jenkins/Jenkinsfile` only if needed for:
  - reliable branch detection for Multibranch and single Pipeline jobs
  - rejecting deploy auto-approval outside `main`
  - documenting or exposing build cause information in logs
- Do not add GitHub tokens, webhook secrets, tunnel URLs, generated job config,
  or Jenkins home files to the repository.
- Update `context/progress-tracker.md` after implementation.

## Verify When Done

- [ ] Jenkins job is configured to read `platform/jenkins/Jenkinsfile` from the
  GitHub repository.
- [ ] GitHub webhook delivery succeeds through the temporary tunnel, or SCM
  polling detects a `main` update.
- [ ] PR merge into `main` starts exactly one expected Jenkins build.
- [ ] Direct push to `main` starts exactly one expected Jenkins build.
- [ ] Push to a non-`main` branch does not run the Phase 0 deploy-capable job.
- [ ] Webhook-triggered build runs storefront verification.
- [ ] Webhook-triggered build runs commerce API verification.
- [ ] Webhook-triggered build runs Terraform static verification.
- [ ] Webhook-triggered build builds and pushes storefront and API images to
  dev ECR using immutable tags.
- [ ] Webhook-triggered build leaves `PLAN_DEV` and `DEPLOY_DEV` disabled unless
  those parameters were explicitly enabled.
- [ ] A webhook-triggered deploy attempt outside the approved branch fails
  before Terraform apply or ECS mutation.
- [ ] GitHub webhook secret is configured outside the repository.
- [ ] Tunnel URL, Jenkins home files, and generated secrets are not committed.

## Open Questions Before Implementation

- Which public GitHub repository URL should the Jenkins job track?
- Should the local workflow use a temporary tunnel as the default, or should
  Jenkins SCM polling be the first implementation to avoid inbound exposure?
- Should `main` webhook runs only publish images, or should they also run
  `PLAN_DEV=true` by default after Unit 08B has been proven against AWS?
