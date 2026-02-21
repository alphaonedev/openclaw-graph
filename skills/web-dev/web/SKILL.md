---
name: web
cluster: web-dev
description: "Root web development: project structure, tooling selection, deployment decisions"
tags: ["web","development"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "web development project frontend backend structure"
---

# web

## Purpose
This skill manages core web development tasks, including setting up project structures, selecting appropriate tooling (e.g., React for frontend, Express for backend), and making deployment decisions (e.g., choosing AWS vs. Heroku). It ensures projects follow best practices for scalability and maintainability.

## When to Use
Use this skill when starting a new web project, refactoring existing ones, or deciding on tech stacks. For example, apply it for full-stack apps needing frontend-backend integration, or when deploying to cloud services. Avoid it for specialized areas like mobile apps or data science.

## Key Capabilities
- Generate project structures: Creates directories like /src for code, /public for assets, and config files (e.g., package.json for Node.js).
- Tooling selection: Recommends based on requirements, e.g., suggest Webpack for bundling or Babel for transpilation.
- Deployment decisions: Evaluates options like Docker containers or serverless (AWS Lambda), considering factors like cost and scalability.
- Integration with version control: Automatically sets up .gitignore for web projects.

## Usage Patterns
Invoke this skill via OpenClaw's API by sending a POST request to /skills/web with a JSON payload, e.g., {"action": "setup", "params": {"type": "full-stack"}}. In code, use it within a script: import the skill module and call methods like skill.web.setupProject(options). Always pass required env vars, such as $WEB_API_KEY for authenticated operations. For CLI, run `openclaw web --action setup --params '{"framework": "react"}'` to initialize a project.

## Common Commands/API
- API Endpoint: POST /skills/web/setup – Requires JSON body like {"projectName": "myapp", "structure": {"frontend": "react", "backend": "express"}}. Include auth header: Authorization: Bearer $WEB_API_KEY.
- CLI Command: `openclaw web generate --type full-stack --tools webpack,babel` – Flags: --type (e.g., "spa" for single-page app), --tools (comma-separated list).
- Code Snippet: 
  ```python
  import openclaw
  response = openclaw.invoke('web', {'action': 'selectTool', 'criteria': 'fast-rendering'})
  print(response['recommendation'])  # Outputs e.g., "React"
  ```
- Config Format: Use YAML for project configs, e.g.:
  ```
  project:
    frontend: react
    backend: node
    deployment: docker
  ```

## Integration Notes
Integrate with other OpenClaw skills by chaining calls, e.g., after web setup, invoke a "deploy" skill. Set env vars like $WEB_API_KEY for API access. For external tools, pipe outputs: run `npm install` post-setup via subprocess calls. Ensure compatibility by checking versions, e.g., use Node.js 14+ for modern web projects. If using with CI/CD, export configs as JSON for tools like GitHub Actions.

## Error Handling
Check response status codes: If API returns 400, log the error message (e.g., "Invalid project type") and retry with corrected params. For CLI, handle failures with try-catch: e.g., in Python, use `try: subprocess.run(['openclaw', 'web', 'setup']) except subprocess.CalledProcessError as e: print(e.output)`. Common errors include missing $WEB_API_KEY (resolve by setting it in .env files) or invalid flags (e.g., --tools with unsupported values). Always validate inputs before calling, e.g., ensure "framework" is in ["react", "vue"].

## Concrete Usage Examples
1. **Setting up a basic web project:** Use this to create a React-Node.js app. Command: `openclaw web setup --name myapp --frontend react --backend express`. This generates a structure with /src/client for React code and /src/server for Express routes. Follow up with `npm install` in the project directory.
2. **Making deployment decisions:** For a production app, invoke via API: POST /skills/web/deploy with body {"app": "myapp", "provider": "aws", "type": "ec2"}. It recommends a Docker-based setup, outputting a config like Dockerfile: FROM node:14; COPY . /app;. Use this to automate deployment scripts.

## Graph Relationships
- Related to cluster: web-dev (e.g., shares nodes with skills like "frontend" and "backend").
- Connected via tags: "web" (links to skills in development cluster), "development" (edges to tools like "git" or "docker").
- Dependencies: Requires "auth" for API calls, integrates with "deployment" skills for post-setup actions.
