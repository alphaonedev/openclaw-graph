---
name: macos-xcode
cluster: macos
description: "Xcode: CLI tools, simulators, signing, provisioning profiles, xcrun, xcodebuild, Instruments"
tags: ["xcode", "ios", "macos", "build", "signing"]
dependencies: ["macos-admin"]
composes: ["ios-deploy"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "xcode ios build simulator signing certificate provisioning xcrun"
---

# Macos Xcode

## Purpose
Xcode: CLI tools, simulators, signing, provisioning profiles, xcrun, xcodebuild, Instruments

## When to Use
- When the task involves macos xcode capabilities
- Match query: xcode ios build simulator signing certificate provisioning x

## Key Capabilities
- Xcode: CLI tools, simulators, signing, provisioning profiles, xcrun, xcodebuild, Instruments

## Graph Relationships
- DEPENDS_ON: ["macos-admin"]
- COMPOSES: ["ios-deploy"]
- SIMILAR_TO: []
- CALLED_BY: []
