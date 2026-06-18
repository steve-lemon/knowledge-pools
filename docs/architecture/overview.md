# Architecture Overview

Knowledge Pools is organized around layered stores and specialized agents.

The target operating loop is:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> evaluate
```

The loop is described in detail in [Ultimate Knowledge Loop](ultimate-loop.md).

The concrete component architecture is described in [System Architecture](system-architecture.md).

Canonical terms are defined in [Terminology](terminology.md).

Before implementing multi-agent behavior, the system should define a single agent contract, agent handoff model, and explicit context/session ownership:

- [Single Agent Model](single-agent-model.md)
- [Agent Connection Model](agent-connection-model.md)
- [Context and Session Model](context-session-model.md)

Earlier shorthand:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

This shorthand remains useful for explanation, but implementation should include explicit planning, curation, and evaluation.

The main component path is:

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
  -> retrieval services
  -> reasoning service
  -> verification service
  -> curation gate
  -> evaluation store
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

1. Understand the task.
2. Plan retrieval.
3. Gather evidence.
4. Resolve conflicts and freshness.
5. Produce an answer or action.
6. Verify grounding.
7. Curate reusable updates.
8. Store run traces and evaluation signals.
