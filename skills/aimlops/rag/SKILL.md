---
name: rag
cluster: aimlops
description: "Implements Retrieval-Augmented Generation for AI models to fetch and use external knowledge."
tags: ["rag","aiml","nlp"]
dependencies: []
composes: []
similar_to: ["cs-ml"]
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "retrieval augmented generation ai ml nlp"
---

# Rag

## Purpose
Implements Retrieval-Augmented Generation for AI models to fetch and use external knowledge.

## When to Use
- Enhance LLMs with external data sources
- Build accurate Q&A systems from databases
- Improve AI responses in knowledge-intensive tasks

## Key Capabilities
- Retrieve documents from vector databases
- Augment generation with retrieved context
- Integrate RAG into AI pipelines

## Graph Relationships
- DEPENDS_ON: []
- COMPOSES: []
- SIMILAR_TO: ["cs-ml"]
