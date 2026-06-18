# Architecture Overview

Knowledge Pools is organized around layered stores and specialized agents.

```text
raw sources
  -> ingestion
  -> understanding
  -> source store
  -> vector index
  -> keyword index
  -> knowledge graph
  -> memory layer
  -> retrieval planner
  -> reasoning agent
  -> verifier
  -> knowledge updater
```

## Storage Layers

### Source Store

Stores original documents and parsed representations.

Responsibilities:

- Preserve provenance.
- Preserve structure such as headings, tables, code blocks, and citations.
- Keep source versions when documents change.

### Vector Index

Supports semantic retrieval across chunks, claims, notes, and summaries.

The vector index is useful for recall, but it should not be the only retrieval path.

### Keyword Index

Supports exact phrase lookup, identifiers, code names, file paths, and terms that embeddings may blur.

### Knowledge Graph

Stores relationships between concepts, claims, sources, decisions, projects, tasks, and experiments.

Example relationships:

- `supports`
- `contradicts`
- `supersedes`
- `depends_on`
- `derived_from`
- `applies_to`

### Memory Layer

Stores durable project and user context.

This layer should contain reusable facts, preferences, active project state, and decisions. It should not become a raw chat transcript dump.

## Agent Loop

Every answer should follow a traceable path:

1. Plan retrieval.
2. Gather evidence.
3. Resolve conflicts and freshness.
4. Produce an answer.
5. Verify grounding.
6. Store reusable updates when appropriate.

