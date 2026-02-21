---
name: macos-security
cluster: macos
description: "XProtect, MRT, TCC privacy permissions, quarantine, code signing validation, security audit"
tags: ["security", "macos", "hardening", "privacy"]
dependencies: ["macos-admin"]
composes: []
similar_to: ["redteam-appsec"]
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "macos security hardening xprotect privacy tcc gatekeeper audit"
---

# Macos Security

## Purpose
XProtect, MRT, TCC privacy permissions, quarantine, code signing validation, security audit

## When to Use
- When the task involves macos security capabilities
- Match query: macos security hardening xprotect privacy tcc gatekeeper aud

## Key Capabilities
- XProtect, MRT, TCC privacy permissions, quarantine, code signing validation, security audit

## Graph Relationships
- DEPENDS_ON: ["macos-admin"]
- COMPOSES: []
- SIMILAR_TO: ["redteam-appsec"]
- CALLED_BY: []
