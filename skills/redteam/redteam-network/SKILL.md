---
name: redteam-network
cluster: redteam
description: "Network pentest: recon, nmap/masscan, Metasploit, lateral movement, pivoting, C2 Cobalt Strike/Havoc"
tags: ["network-pentest", "nmap", "lateral-movement", "c2", "redteam"]
dependencies: ["redteam", "cs-networks"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: true
scope: authorized_testing_only
model_hint: claude-sonnet
embedding_hint: "network penetration nmap metasploit lateral movement c2 pivot cobalt"
---

# Redteam Network

## Purpose
Network pentest: recon, nmap/masscan, Metasploit, lateral movement, pivoting, C2 Cobalt Strike/Havoc

## When to Use
- When the task involves redteam network capabilities
- Match query: network penetration nmap metasploit lateral movement c2 pivo

## Key Capabilities
- Network pentest: recon, nmap/masscan, Metasploit, lateral movement, pivoting, C2 Cobalt Strike/Havoc

## Graph Relationships
- DEPENDS_ON: ["redteam", "cs-networks"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
