---
name: 1password
cluster: community
description: "Secrets/API key management via 1Password CLI (op). Vault items, service accounts, secret references"
tags: ["secrets", "1password", "api-keys", "vault"]
dependencies: []
composes: []
similar_to: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "1password secrets api keys vault op cli service account"
clawhub_install: "clawhub install 1password"
note: "NOT installed via ClaWHub CLI — registered in LadybugDB only. To activate: clawhub install 1password"
---

# 1Password

## Purpose
Secrets/API key management via 1Password CLI (op). Vault items, service accounts, secret references

## Install When Needed
```
clawhub install 1password
```

## Note
This skill is registered in LadybugDB for discovery purposes only.
It is **NOT installed** via the traditional ClaWHub methodology.
When a task matches this skill, the agent will inform you to install it if needed.

## When to Use
- When the task requires 1password capabilities
