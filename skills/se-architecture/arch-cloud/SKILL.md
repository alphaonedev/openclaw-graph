---
name: arch-cloud
cluster: se-architecture
description: "Cloud: serverless Lambda/CF Workers, edge, CDN, multi-region, HA patterns, IaC Terraform"
tags: ["cloud", "serverless", "edge", "terraform", "architecture"]
dependencies: ["arch"]
composes: ["cloudflare"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "cloud serverless edge cdn multi-region terraform cost iac lambda"
---

# Arch Cloud

## Purpose
Cloud: serverless Lambda/CF Workers, edge, CDN, multi-region, HA patterns, IaC Terraform

## When to Use
- When the task involves arch cloud capabilities
- Match query: cloud serverless edge cdn multi-region terraform cost iac la

## Key Capabilities
- Cloud: serverless Lambda/CF Workers, edge, CDN, multi-region, HA patterns, IaC Terraform

## Graph Relationships
- DEPENDS_ON: ["arch"]
- COMPOSES: ["cloudflare"]
- SIMILAR_TO: []
- CALLED_BY: []
