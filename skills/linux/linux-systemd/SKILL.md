---
name: linux-systemd
cluster: linux
description: "systemd: unit files, systemctl, journalctl, cgroup integration, socket activation, OpenClaw service"
tags: ["systemd", "services", "linux", "units"]
dependencies: ["linux-admin"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "systemd service unit file start stop restart journalctl cgroup"
---

# Linux Systemd

## Purpose
systemd: unit files, systemctl, journalctl, cgroup integration, socket activation, OpenClaw service

## When to Use
- When the task involves linux systemd capabilities
- Match query: systemd service unit file start stop restart journalctl cgro

## Key Capabilities
- systemd: unit files, systemctl, journalctl, cgroup integration, socket activation, OpenClaw service

## Graph Relationships
- DEPENDS_ON: ["linux-admin"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
