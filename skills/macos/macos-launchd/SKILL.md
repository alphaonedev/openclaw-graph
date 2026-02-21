---
name: macos-launchd
cluster: macos
description: "LaunchDaemons/LaunchAgents, plist, launchctl, login items, OpenClaw gateway service"
tags: ["launchd", "plist", "services", "macos"]
dependencies: ["macos-admin"]
composes: ["openclaw-admin"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "launchd plist launchctl service daemon agent macos openclaw"
---

# Macos Launchd

## Purpose
LaunchDaemons/LaunchAgents, plist, launchctl, login items, OpenClaw gateway service

## When to Use
- When the task involves macos launchd capabilities
- Match query: launchd plist launchctl service daemon agent macos openclaw

## Key Capabilities
- LaunchDaemons/LaunchAgents, plist, launchctl, login items, OpenClaw gateway service

## Graph Relationships
- DEPENDS_ON: ["macos-admin"]
- COMPOSES: ["openclaw-admin"]
- SIMILAR_TO: []
- CALLED_BY: []
