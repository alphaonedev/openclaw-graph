---
name: aws-rds
cluster: cloud-aws
description: "Managed service for setting up, operating, and scaling relational databases in the AWS cloud."
tags: ["aws","rds","database","cloud","relational"]
dependencies: []
composes: []
similar_to: ["arch-database"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "aws rds database managed service relational sql"
---

# Aws Rds

## Purpose
Managed service for setting up, operating, and scaling relational databases in the AWS cloud.

## When to Use
- Deploy managed relational databases on AWS
- Scale databases dynamically
- Use for high-availability applications

## Key Capabilities
- Automated backups and patching
- Multi-AZ deployments
- Integration with other AWS services

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["arch-database"]
