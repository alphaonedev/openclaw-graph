# Contributing to openclaw-graph

Thanks for your interest in contributing! This project is a community contribution to the OpenClaw ecosystem.

## Ways to contribute

### Add skills

Skills live in `skills/<cluster>/SKILL.md`. To add a new skill:

1. Choose an existing cluster or propose a new one
2. Create `skills/<cluster>/<skill-name>/SKILL.md`
3. Use the template below
4. Run `node ladybugdb/scripts/loader.js` to verify it loads cleanly
5. Open a PR

**Skill template:**

```yaml
---
name: my-skill
cluster: my-cluster
description: "One-line description of what this skill does"
tags: ["tag1", "tag2", "tag3"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "space separated keywords for text search"
---

# My Skill

## Purpose
What this skill enables the agent to do.

## When to Use
- When the task involves X
- Match query: keyword1 keyword2

## Key Capabilities
- Capability 1
- Capability 2
- Capability 3

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: []
- CALLED_BY: []
```

### Improve the query script

`ladybugdb/scripts/query.js` handles text search, cluster queries, and workspace output formatting. Improvements welcome — especially:
- Better text search ranking
- Vector/semantic search support
- Additional output formatters

### Extend the schema

New node tables or relationship types can be added in `ladybugdb/schema/`. Document any schema changes in your PR.

### Fix bugs or improve docs

Always welcome. Keep PRs focused and include a clear description.

## Rules

- **No PII, no API keys, no private data** — ever, in any file
- Skills must be genuinely useful for OpenClaw agent tasks
- `authorization_required: true` is reserved for skills with real security implications
- Cluster names should be lowercase, hyphen-separated

## Questions?

Open an issue on GitHub.
