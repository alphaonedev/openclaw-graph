---
name: macos-networking
cluster: macos
description: "WiFi/Ethernet, DNS, proxy, VPN Tailscale, airport CLI, pfctl firewall"
tags: ["networking", "macos", "vpn", "firewall", "dns"]
dependencies: ["macos-admin"]
composes: []
similar_to: ["linux-networking"]
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "macos network wifi dns vpn firewall tailscale pfctl"
---

# Macos Networking

## Purpose
WiFi/Ethernet, DNS, proxy, VPN Tailscale, airport CLI, pfctl firewall

## When to Use
- When the task involves macos networking capabilities
- Match query: macos network wifi dns vpn firewall tailscale pfctl

## Key Capabilities
- WiFi/Ethernet, DNS, proxy, VPN Tailscale, airport CLI, pfctl firewall

## Graph Relationships
- DEPENDS_ON: ["macos-admin"]
- COMPOSES: []
- SIMILAR_TO: ["linux-networking"]
- CALLED_BY: []
