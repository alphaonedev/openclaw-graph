---
name: web-deploy
cluster: web-dev
description: "Deployment: Cloudflare Pages/Workers, Vercel, Netlify, Docker, GitHub Actions CI/CD"
tags: ["deployment", "ci-cd", "cloudflare", "web"]
dependencies: ["cloudflare"]
composes: ["cloudflare"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "deploy cloudflare pages vercel netlify ci cd pipeline github actions"
---

# Web Deploy

## Purpose
Deployment: Cloudflare Pages/Workers, Vercel, Netlify, Docker, GitHub Actions CI/CD

## When to Use
- When the task involves web deploy capabilities
- Match query: deploy cloudflare pages vercel netlify ci cd pipeline github

## Key Capabilities
- Deployment: Cloudflare Pages/Workers, Vercel, Netlify, Docker, GitHub Actions CI/CD

## Graph Relationships
- DEPENDS_ON: ["cloudflare"]
- COMPOSES: ["cloudflare"]
- SIMILAR_TO: []
- CALLED_BY: []
