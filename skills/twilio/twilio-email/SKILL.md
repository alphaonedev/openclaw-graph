---
name: twilio-email
cluster: twilio
description: "SendGrid: transactional email, templates Handlebars, event webhooks, suppression, SPF/DKIM/DMARC"
tags: ["email","sendgrid","twilio","transactional"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "sendgrid email transactional template webhook deliverability spf dkim dmarc"
---

# twilio-email

## Purpose
This skill handles transactional email operations using Twilio SendGrid, focusing on sending emails, managing templates with Handlebars, processing event webhooks, and ensuring deliverability via SPF/DKIM/DMARC configurations.

## When to Use
Use this skill for sending automated emails like user confirmations, password resets, or notifications in applications. Apply it when you need reliable delivery tracking, template-based personalization, or webhook integrations for events like bounces or clicks. Avoid for mass marketing emails, as it's optimized for transactional volumes.

## Key Capabilities
- Send transactional emails via SendGrid API endpoint: POST https://api.sendgrid.com/v3/mail/send, with JSON payload for recipients and content.
- Use Handlebars templates for dynamic emails: Reference templates by ID, e.g., "d-123456789" in the API request body.
- Process event webhooks: Set up webhooks at https://api.sendgrid.com/v3/user/webhooks/event/settings to receive events like "delivered" or "bounced".
- Manage suppression lists: Query and add to global suppressions via GET/POST https://api.sendgrid.com/v3/suppression/bounces.
- Ensure deliverability: Configure SPF, DKIM, and DMARC records as per SendGrid docs, e.g., add SPF record "include:_spf.sendgrid.net" in your DNS.

## Usage Patterns
To use this skill, first set the environment variable for authentication: export SENDGRID_API_KEY=your_api_key. Then, initialize the SendGrid client in your code and make API calls. For sending emails, structure requests with JSON bodies including "from", "personalizations", and "content". Use async patterns for webhook handling, e.g., set up an endpoint to parse incoming POST requests from SendGrid. Always validate inputs like email addresses before sending to avoid errors.

## Common Commands/API
- Send an email: Use the SendGrid API with curl, e.g.:
  ```
  curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"recipient@example.com"}]}],"from":{"email":"sender@example.com"},"subject":"Hello","content":[{"type":"text/plain","value":"Hello world!"}]}'
  ```
- Manage templates: Create or update via POST https://api.sendgrid.com/v3/templates, then reference in emails, e.g., add "template_id": "d-123456789" to the email JSON.
- Handle webhooks: Register a webhook with POST https://api.sendgrid.com/v3/user/webhooks/event/settings, specifying your endpoint URL.
- Check suppressions: Query with GET https://api.sendgrid.com/v3/suppression/bounces, using query params like ?start_time=unix_timestamp.
- CLI equivalent: If using SendGrid's CLI (install via npm), run `sg send --template-id d-123456789 --to recipient@example.com`, but authenticate first with `export SENDGRID_API_KEY=your_key`.

## Integration Notes
Integrate by including the SendGrid library in your project, e.g., for Node.js: npm install @sendgrid/mail. Set auth with sgMail.setApiKey(process.env.SENDGRID_API_KEY). For webhooks, expose an HTTPS endpoint in your app to receive POST requests from SendGrid, and parse the JSON payload for events. Use config files like .env for keys: SENDGRID_API_KEY=your_key. Ensure your domain has proper DNS setup for SPF (e.g., "v=spf1 include:_spf.sendgrid.net -all") and DKIM records as provided by SendGrid. Test integrations in a staging environment before production.

## Error Handling
Common errors include 401 Unauthorized (fix by verifying $SENDGRID_API_KEY), 429 Rate Limit (implement retry logic with exponential backoff), or 400 Bad Request (validate JSON payloads, e.g., ensure "to" field has valid emails). For webhook failures, check event types in the payload and log errors; use try-catch in code, e.g.:
```
try {
  const response = await sgMail.send(msg);
} catch (error) {
  console.error(error.response.body.errors);  // Logs specific error details
}
```
Handle deliverability issues by monitoring DMARC reports via SendGrid's dashboard and adjusting email content to avoid spam filters.

## Examples
1. Send a simple transactional email for user signup: First, set export SENDGRID_API_KEY=your_key, then use this code snippet:
   ```
   const sgMail = require('@sendgrid/mail');
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   const msg = { to: 'user@example.com', from: 'no-reply@example.com', subject: 'Welcome!', text: 'Thank you for signing up.' };
   sgMail.send(msg);
   ```
   This sends an email immediately upon execution.

2. Use a Handlebars template for a password reset: Assume template ID "d-123456789" with Handlebars variables. Code:
   ```
   const msg = { to: 'user@example.com', from: 'no-reply@example.com', templateId: 'd-123456789', dynamicTemplateData: { resetLink: 'https://example.com/reset' } };
   sgMail.send(msg);
   ```
   This personalizes the email with the reset link.

## Graph Relationships
- Related to: twilio-sms (for combined messaging workflows), twilio-voice (for multi-channel notifications).
- Clusters: twilio (as this skill is in the twilio cluster).
- Tags: email, sendgrid, transactional (links to other skills with overlapping tags like "email").
