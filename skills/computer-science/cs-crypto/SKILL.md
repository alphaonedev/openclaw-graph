---
name: cs-crypto
cluster: computer-science
description: "Cryptography: AES, RSA/ECC, SHA-256/Blake3, PKI/X.509, TLS, digital signatures, ZKP, quantum resistance"
tags: ["cryptography", "encryption", "hashing", "pki", "cs"]
dependencies: ["cs-math"]
composes: ["redteam-appsec", "macos-keychain"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "cryptography encryption hash signature pki tls quantum zkp aes rsa"
---

# Cs Crypto

## Purpose
Cryptography: AES, RSA/ECC, SHA-256/Blake3, PKI/X.509, TLS, digital signatures, ZKP, quantum resistance

## When to Use
- When the task involves cs crypto capabilities
- Match query: cryptography encryption hash signature pki tls quantum zkp a

## Key Capabilities
- Cryptography: AES, RSA/ECC, SHA-256/Blake3, PKI/X.509, TLS, digital signatures, ZKP, quantum resistance

## Graph Relationships
- DEPENDS_ON: ["cs-math"]
- COMPOSES: ["redteam-appsec", "macos-keychain"]
- SIMILAR_TO: []
- CALLED_BY: []
