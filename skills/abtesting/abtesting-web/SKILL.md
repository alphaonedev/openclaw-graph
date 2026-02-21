---
name: abtesting-web
cluster: abtesting
description: "Web A/B: feature flags LaunchDarkly/Unleash, cookie segmentation, Cloudflare Workers A/B, header routing"
tags: ["web", "feature-flags", "launchdarkly", "cloudflare"]
dependencies: ["abtesting", "web"]
composes: ["cloudflare"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "web ab test feature flag launchdarkly cloudflare workers segment"
---

# Abtesting Web

## Purpose
Web A/B: feature flags LaunchDarkly/Unleash, cookie segmentation, Cloudflare Workers A/B, header routing

## When to Use
- When the task involves abtesting web capabilities
- Match query: web ab test feature flag launchdarkly cloudflare workers seg

## Key Capabilities
- Web A/B: feature flags LaunchDarkly/Unleash, cookie segmentation, Cloudflare Workers A/B, header routing

## Graph Relationships
- DEPENDS_ON: ["abtesting", "web"]
- COMPOSES: ["cloudflare"]
- SIMILAR_TO: []
- CALLED_BY: []
