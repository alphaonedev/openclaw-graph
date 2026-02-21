---
name: testing-ci
cluster: testing
description: "CI/CD: GitHub Actions workflows, parallel sharding, flaky quarantine, junit XML/Allure, coverage gates"
tags: ["ci-cd", "github-actions", "parallel", "flaky", "testing"]
dependencies: ["testing", "github"]
composes: ["github"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ci test github actions parallel flaky coverage gate report junit allure"
---

# Testing Ci

## Purpose
CI/CD: GitHub Actions workflows, parallel sharding, flaky quarantine, junit XML/Allure, coverage gates

## When to Use
- When the task involves testing ci capabilities
- Match query: ci test github actions parallel flaky coverage gate report j

## Key Capabilities
- CI/CD: GitHub Actions workflows, parallel sharding, flaky quarantine, junit XML/Allure, coverage gates

## Graph Relationships
- DEPENDS_ON: ["testing", "github"]
- COMPOSES: ["github"]
- SIMILAR_TO: []
- CALLED_BY: []
