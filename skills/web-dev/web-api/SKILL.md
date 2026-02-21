---
name: web-api
cluster: web-dev
description: "REST + GraphQL + tRPC API design: OpenAPI 3.1, auth JWT/OAuth2, rate limiting, pagination"
tags: ["api", "rest", "graphql", "trpc", "web"]
dependencies: ["coding-node", "coding-python"]
composes: ["arch-api"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "api rest graphql design openapi jwt oauth rate limit trpc"
---

# Web Api

## Purpose
REST + GraphQL + tRPC API design: OpenAPI 3.1, auth JWT/OAuth2, rate limiting, pagination

## When to Use
- When the task involves web api capabilities
- Match query: api rest graphql design openapi jwt oauth rate limit trpc

## Key Capabilities
- REST + GraphQL + tRPC API design: OpenAPI 3.1, auth JWT/OAuth2, rate limiting, pagination

## Graph Relationships
- DEPENDS_ON: ["coding-node", "coding-python"]
- COMPOSES: ["arch-api"]
- SIMILAR_TO: []
- CALLED_BY: []
