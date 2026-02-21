---
name: twilio-sms
cluster: twilio
description: "SMS/MMS: send/receive, TwiML, webhooks, delivery receipts, opt-out, A2P 10DLC, short codes"
tags: ["sms", "mms", "twilio", "messaging"]
dependencies: ["twilio"]
composes: []
similar_to: []
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "twilio sms mms send receive webhook 10dlc opt-out delivery"
---

# Twilio Sms

## Purpose
SMS/MMS: send/receive, TwiML, webhooks, delivery receipts, opt-out, A2P 10DLC, short codes

## When to Use
- When the task involves twilio sms capabilities
- Match query: twilio sms mms send receive webhook 10dlc opt-out delivery

## Key Capabilities
- SMS/MMS: send/receive, TwiML, webhooks, delivery receipts, opt-out, A2P 10DLC, short codes

## Graph Relationships
- DEPENDS_ON: ["twilio"]
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
