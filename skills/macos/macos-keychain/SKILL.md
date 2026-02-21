---
name: macos-keychain
cluster: macos
description: "Keychain: security CLI, API key storage, certificates, codesigning, Secure Enclave"
tags: ["keychain", "secrets", "security", "macos"]
dependencies: ["macos-admin"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "keychain secrets api keys password certificate macos security"
---

# Macos Keychain

## Purpose
Keychain: security CLI, API key storage, certificates, codesigning, Secure Enclave

## When to Use
- When the task involves macos keychain capabilities
- Match query: keychain secrets api keys password certificate macos securit

## Key Capabilities
- Keychain: security CLI, API key storage, certificates, codesigning, Secure Enclave

## Graph Relationships
- DEPENDS_ON: ["macos-admin"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
