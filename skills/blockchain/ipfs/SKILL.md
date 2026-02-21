---
name: ipfs
cluster: blockchain
description: "IPFS is a peer-to-peer protocol for decentralized storage and sharing of files in a distributed network."
tags: ["p2p","decentralized-storage","distributed-filesystem"]
dependencies: []
composes: []
similar_to: ["arch-distributed"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "ipfs p2p decentralized storage distributed files blockchain"
---

# Ipfs

## Purpose
IPFS is a peer-to-peer protocol for decentralized storage and sharing of files in a distributed network.

## When to Use
- For decentralized file storage and sharing in applications
- When building dApps requiring persistent data
- As an alternative to traditional CDNs for content distribution

## Key Capabilities
- Peer-to-peer file uploading and downloading
- Content-addressable storage for immutable data
- Integration with blockchain for verifiable file systems

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["arch-distributed"]
