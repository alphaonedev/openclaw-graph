---
name: ci-cd-ops
cluster: devops-sre
description: "Handles CI/CD pipelines for automated building, testing, and deployment using tools like Jenkins and GitHub Actions in D"
tags: ["ci-cd","devops","automation"]
dependencies: ["github"]
composes: []
similar_to: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ci cd ops devops automation pipelines jenkins github"
---

# Ci Cd Ops

## Purpose
Handles CI/CD pipelines for automated building, testing, and deployment using tools like Jenkins and GitHub Actions in D

## When to Use
- Automating code builds and tests in software projects
- Deploying applications to production environments
- Integrating with version control systems like Git

## Key Capabilities
- Configuring CI/CD pipelines with Jenkins or GitHub Actions
- Managing automated testing and deployment scripts
- Monitoring and debugging pipeline failures

## Graph Relationships
- DEPENDS_ON: ["github"]
- COMPOSES: []
- SIMILAR_TO: []
