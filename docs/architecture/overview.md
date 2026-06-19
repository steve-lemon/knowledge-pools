# Architecture Overview

Knowledge Pools is organized around layered stores and specialized agents.

The target operating loop is:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> evaluate
```

The loop is described in detail in [Ultimate Knowledge Loop](ultimate-loop.md).

The concrete component architecture is described in [System Architecture](system-architecture.md).

Canonical terms are defined in [Terminology](terminology.md).

Wiki-style authoring and taxonomy-governed structure are combined through [Wiki and Taxonomy Hybrid Architecture](wiki-taxonomy-hybrid.md).

The boundary between ingestion and understanding is defined in [Ingest and Understand Boundary](ingest-understand-boundary.md).

The understanding stage baseline is defined in [Understand Baseline](understand-baseline.md).

The boundary between understanding and connection is defined in [Understand and Connect Boundary](understand-connect-boundary.md).

The connection stage baseline is defined in [Connect Baseline](connect-baseline.md).

The connection implementation checklist is defined in [Connect Readiness Review](connect-readiness-review.md).

Media-specific connection proofs are defined in [Media Connect Concept Proofs](media-connect-concept-proofs.md).

The boundary between connection and verification is defined in [Connect and Verify Boundary](connect-verify-boundary.md).

The verification stage baseline is defined in [Verify Baseline](verify-baseline.md).

The difference between source understanding and user-question understanding is defined in [Understand vs Task Understanding](understand-vs-task-understanding.md).

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
  -> wiki structure extraction
  -> taxonomy classification
  -> ingest artifact
  -> understanding
  -> knowledge candidates
  -> connection proposals
  -> content-minimal index documents
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
- Provide exact source units for understanding and grounding.

### Narrative Layer

Stores human-authored source material in wiki-like form when useful.

Responsibilities:

- Preserve headings, links, backlinks, aliases, tags, and redirects.
- Keep document titles mutable and source IDs stable.
- Feed wiki structure extraction during ingest.

### Semantic Control Layer

Uses taxonomy bundles to classify and constrain meaning.

Responsibilities:

- Define accepted categories, attribute definitions, vocabularies, entity types, and relation types.
- Keep uncontrolled wiki tags and links from becoming permanent schema without review.
- Produce taxonomy proposals when repeated wiki patterns suggest new shared meaning.

### Retrieval Index

Uses content-minimal OpenSearch-compatible documents as retrieval maps.

Responsibilities:

- Store source/access-unit refs, taxonomy metadata, and link metadata.
- Avoid storing full source content as retrievable index content.
- Point retrieval back to exact source units.

### Knowledge Graph

Stores or projects validated relationships between concepts, claims, sources, decisions, projects, tasks, and experiments.

Example relationships:

- `supports`
- `contradicts`
- `supersedes`
- `depends_on`
- `derived_from`
- `applies_to`
- `references`
- `same_as`
- `redirects_to`

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
