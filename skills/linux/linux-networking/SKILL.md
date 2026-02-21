---
name: linux-networking
cluster: linux
description: "netplan/ip, ufw/nftables firewall, DNS, VPN Wireguard/Tailscale, inter-instance routing System76"
tags: ["networking", "linux", "firewall", "vpn", "tailscale"]
dependencies: ["linux-admin"]
composes: []
similar_to: ["macos-networking"]
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "linux network firewall ufw ip routing vpn tailscale dns"
---

# Linux Networking

## Purpose
netplan/ip, ufw/nftables firewall, DNS, VPN Wireguard/Tailscale, inter-instance routing System76

## When to Use
- When the task involves linux networking capabilities
- Match query: linux network firewall ufw ip routing vpn tailscale dns

## Key Capabilities
- netplan/ip, ufw/nftables firewall, DNS, VPN Wireguard/Tailscale, inter-instance routing System76

## Graph Relationships
- DEPENDS_ON: ["linux-admin"]
- COMPOSES: []
- SIMILAR_TO: ["macos-networking"]
- CALLED_BY: []
