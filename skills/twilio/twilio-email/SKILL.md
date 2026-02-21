---
name: twilio-email
cluster: twilio
description: "SendGrid: transactional email, templates Handlebars, event webhooks, suppression, SPF/DKIM/DMARC"
tags: ["email", "sendgrid", "twilio", "transactional"]
dependencies: ["twilio"]
composes: []
similar_to: ["himalaya"]
called_by: []
manages: []
monitors: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "sendgrid email transactional template webhook deliverability spf dkim dmarc"
---

# Twilio Email

## Purpose
SendGrid: transactional email, templates Handlebars, event webhooks, suppression, SPF/DKIM/DMARC

## When to Use
- When the task involves twilio email capabilities
- Match query: sendgrid email transactional template webhook deliverability

## Key Capabilities
- SendGrid: transactional email, templates Handlebars, event webhooks, suppression, SPF/DKIM/DMARC

## Graph Relationships
- DEPENDS_ON: ["twilio"]
- COMPOSES: []
- SIMILAR_TO: ["himalaya"]
- CALLED_BY: []
