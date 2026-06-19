# Knowledge Pools

Knowledge Pools is an agent-oriented knowledge repository designed to go beyond basic LLM RAG.

The goal is not just to retrieve document chunks. The goal is to maintain a living knowledge system that can ingest sources, extract claims, connect evidence, reason across time, detect conflicts, and preserve reusable decisions.

## Core Direction

- Treat knowledge as structured claims, decisions, concepts, procedures, and evidence.
- Preserve original sources and make every important answer traceable.
- Combine vector search, keyword search, graph traversal, and temporal reasoning.
- Use agents for ingestion, retrieval planning, reasoning, verification, and knowledge updates.
- Record architecture decisions as the system evolves.

## Documentation Map

- [Vision](docs/vision.md)
- [Architecture Overview](docs/architecture/overview.md)
- [Terminology](docs/architecture/terminology.md)
- [Ultimate Knowledge Loop](docs/architecture/ultimate-loop.md)
- [System Architecture](docs/architecture/system-architecture.md)
- [Infrastructure Baseline](docs/architecture/infrastructure-baseline.md)
- [Single Repository First](docs/architecture/single-repository-first.md)
- [Index Content Policy](docs/architecture/index-content-policy.md)
- [Index ID Policy](docs/architecture/index-id-policy.md)
- [OpenSearch Index Schema](docs/architecture/opensearch-index-schema.md)
- [Rollback and Quarantine Policy](docs/architecture/rollback-and-quarantine.md)
- [Content Deletion Lifecycle](docs/architecture/content-deletion-lifecycle.md)
- [Wiki and Taxonomy Hybrid Architecture](docs/architecture/wiki-taxonomy-hybrid.md)
- [Single Agent Model](docs/architecture/single-agent-model.md)
- [Agent Superclass Contract](docs/architecture/agent-superclass-contract.md)
- [Agent Connection Model](docs/architecture/agent-connection-model.md)
- [Context and Session Model](docs/architecture/context-session-model.md)
- [Agent Tool Pool](docs/architecture/agent-tool-pool.md)
- [Agent Specs](docs/agents/README.md)
- [Feedback Update Relationships](docs/architecture/feedback-update-relationships.md)
- [Ingest: Taxonomy-Governed Graph Entry](docs/architecture/ingest-taxonomy-graph.md)
- [Ingestion Agent Spec](docs/agents/ingestion-agent.md)
- [Ingest and Understand Boundary](docs/architecture/ingest-understand-boundary.md)
- [Ingest to Understand Handoff](docs/architecture/ingest-understand-handoff.md)
- [Understand Baseline](docs/architecture/understand-baseline.md)
- [Understand Readiness Review](docs/architecture/understand-readiness-review.md)
- [Understand and Connect Boundary](docs/architecture/understand-connect-boundary.md)
- [Understand to Connect Handoff](docs/architecture/understand-connect-handoff.md)
- [Connect Baseline](docs/architecture/connect-baseline.md)
- [Understand vs Task Understanding](docs/architecture/understand-vs-task-understanding.md)
- [Understanding Agent Spec](docs/agents/understanding-agent.md)
- [Connection Agent Spec](docs/agents/connection-agent.md)
- [Ingest Readiness Review](docs/architecture/ingest-readiness-review.md)
- [Media Ingest Strategies](docs/architecture/media-ingest-strategies.md)
- [Media Concept Proofs](docs/architecture/media-concept-proofs.md)
- [Media Understand Concept Proofs](docs/architecture/media-understand-concept-proofs.md)
- [Taxonomy vs Versioning Responsibilities](docs/architecture/taxonomy-vs-versioning.md)
- [Architecture Risk Review](docs/architecture/architecture-risk-review.md)
- [Taxonomy Schema](docs/architecture/taxonomy-schema.md)
- [Taxonomy Evolution Workflow](docs/architecture/taxonomy-evolution.md)
- [Agent Design](docs/architecture/agents.md)
- [Knowledge Model](docs/architecture/knowledge-model.md)
- [RAG Limitations](docs/research/rag-limitations.md)
- [Roadmap](docs/operations/roadmap.md)
- [Implementation Plan](docs/operations/implementation-plan.md)
- [Stage Transition Guidelines](docs/operations/stage-transition-guidelines.md)
- [Decision Log](docs/decisions/README.md)

## Working Principle

This repository should grow as both a system and a notebook. Every major implementation step should leave behind:

1. What was decided.
2. Why it was decided.
3. What evidence or constraint shaped it.
4. What remains uncertain.

Before moving from one major stage to the next, update the stage boundary using [Stage Transition Guidelines](docs/operations/stage-transition-guidelines.md).
