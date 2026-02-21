---
name: twilio-verify
cluster: twilio
description: "Verify: 2FA SMS/voice/email, TOTP, phone verification, Verify Guard fraud prevention, SNA"
tags: ["2fa", "otp", "verify", "twilio"]
dependencies: ["twilio"]
composes: ["redteam-appsec"]
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio verify 2fa otp totp phone verification fraud sna"
---

# Twilio Verify

## Purpose
Verify: 2FA SMS/voice/email, TOTP, phone verification, Verify Guard fraud prevention, SNA

## When to Use
- When the task involves twilio verify capabilities
- Match query: twilio verify 2fa otp totp phone verification fraud sna

## Key Capabilities
- Verify: 2FA SMS/voice/email, TOTP, phone verification, Verify Guard fraud prevention, SNA

## Graph Relationships
- DEPENDS_ON: ["twilio"]
- COMPOSES: ["redteam-appsec"]
- SIMILAR_TO: []
- CALLED_BY: []
