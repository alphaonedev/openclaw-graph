---
name: redteam-osint
cluster: redteam
description: "OSINT: footprinting, Google dorks, Shodan/Censys/Fofa, amass/subfinder, dark web monitoring"
tags: ["osint", "recon", "footprint", "shodan", "redteam"]
dependencies: ["redteam"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: true
scope: authorized_testing_only
model_hint: claude-sonnet
embedding_hint: "osint recon footprint google dork shodan censys amass subfinder"
---

# Redteam Osint

## Purpose
OSINT: footprinting, Google dorks, Shodan/Censys/Fofa, amass/subfinder, dark web monitoring

## When to Use
- When the task involves redteam osint capabilities
- Match query: osint recon footprint google dork shodan censys amass subfin

## Key Capabilities
- OSINT: footprinting, Google dorks, Shodan/Censys/Fofa, amass/subfinder, dark web monitoring

## Graph Relationships
- DEPENDS_ON: ["redteam"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
