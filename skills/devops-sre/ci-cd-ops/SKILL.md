---
name: ci-cd-ops
cluster: devops-sre
description: "Handles CI/CD pipelines for automated building, testing, and deployment using tools like Jenkins and GitHub Actions in D"
tags: ["ci-cd","devops","automation"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ci cd ops devops automation pipelines jenkins github"
---

# ci-cd-ops

## Purpose
This skill automates CI/CD pipelines for building, testing, and deploying code using Jenkins and GitHub Actions, focusing on DevOps workflows to streamline software delivery.

## When to Use
Use this skill when setting up automated pipelines for code changes, such as in microservices architectures or when integrating with version control systems like Git. Apply it for frequent deployments in agile teams or when scaling DevOps operations to reduce manual errors.

## Key Capabilities
- Automate build processes with Jenkins, including job scheduling and artifact management.
- Configure GitHub Actions for event-driven workflows, such as triggering on pull requests.
- Support pipeline orchestration with tools like YAML-based configurations for defining stages, jobs, and conditions.
- Integrate monitoring and logging to track pipeline status and failures.
- Handle environment-specific deployments, e.g., staging vs. production, using parameterized variables.

## Usage Patterns
To use this skill, invoke it via the OpenClaw agent with specific commands. For example, start a pipeline by passing a repository URL and configuration file. Always specify the tool (e.g., Jenkins or GitHub Actions) in the command. Use JSON or YAML for input parameters. Example pattern: Agent command -> Parse inputs -> Execute pipeline -> Monitor output.

## Common Commands/API
Use these CLI commands or API calls directly. Authentication requires setting `$JENKINS_API_KEY` or `$GITHUB_TOKEN` as environment variables.

- Jenkins CLI: Run `jenkins build -job MyJob -params '{"branch":"main"}' -key $JENKINS_API_KEY` to trigger a build job.
  ```bash
  curl -X POST http://jenkins.example.com/job/MyJob/build \
       -H "Authorization: Bearer $JENKINS_API_KEY" \
       --data 'parameter=[{"name":"branch","value":"main"}]'
  ```
- GitHub Actions API: Dispatch a workflow with `gh workflow run MyWorkflow.yml -f branch=main -token $GITHUB_TOKEN`.
  ```bash
  curl -X POST https://api.github.com/repos/user/repo/actions/workflows/MyWorkflow.yml/dispatches \
       -H "Authorization: token $GITHUB_TOKEN" \
       -d '{"ref":"main"}'
  ```
- Common flags: Use `-f` for file paths (e.g., workflow files), `-env` for environment variables (e.g., `-env KEY=VALUE`), and `-wait` to block until completion.
- Config formats: Pipelines are defined in YAML, e.g., a Jenkinsfile with `pipeline { agent any stages { stage('Build') { steps { sh 'mvn build' } } } }`.

## Integration Notes
Integrate this skill with existing tools by exporting necessary credentials as env vars (e.g., `$GITHUB_TOKEN`). For Jenkins, connect via HTTP endpoints; for GitHub Actions, use webhooks. Example: Hook into a CI tool by adding a post-build step that calls an OpenClaw agent command, like `agent invoke ci-cd-ops --action deploy --config path/to/config.yml`. Ensure compatibility by matching versions, e.g., Jenkins 2.3+ or GitHub Actions API v3. Avoid conflicts by isolating environments using Docker containers for pipeline runs.

## Error Handling
Always check command exit codes; for Jenkins, parse API responses for HTTP 4xx/5xx errors. Use try-catch in scripts, e.g., in a bash wrapper: `jenkins build ... || echo "Error: Build failed with code $?"`. For GitHub Actions, handle webhook failures by retrying up to 3 times with exponential backoff. Log errors with timestamps and include stack traces. Common issues: Invalid tokens—verify with `echo $GITHUB_TOKEN` before use; resolve with `export GITHUB_TOKEN=new_value`. Use verbose mode flags like `-v` for debugging.

## Concrete Usage Examples
1. **Automate a Java app deployment with Jenkins:** Set up a pipeline for a Git repo. Command: `agent invoke ci-cd-ops --tool jenkins --repo git@github.com:user/app.git --job BuildAndDeploy`. This triggers a build, runs tests, and deploys if successful. Config snippet:
   ```yaml
   pipeline {
     stages {
       stage('Test') { steps { sh 'mvn test' } }
     }
   }
   ```
2. **Trigger GitHub Actions for a Node.js CI:** Use for a pull request workflow. Command: `agent invoke ci-cd-ops --tool github --workflow ci.yml --event pull_request`. This runs linting and tests on PRs. API call example:
   ```bash
   curl -X POST https://api.github.com/.../dispatches -H "Authorization: token $GITHUB_TOKEN"
   ```

## Graph Relationships
- Related to cluster: devops-sre (e.g., shares nodes with monitoring-tools, deployment-automation).
- Connected via tags: ci-cd (links to build-systems), devops (links to infrastructure-as-code), automation (links to script-execution).
- Dependencies: Requires access to version-control (e.g., git-ops) and monitoring (e.g., log-analyzer) skills.
