# Architecture Index

This page groups architecture documents by use case.

Use [Ultimate Knowledge Loop](ultimate-loop.md) and [Terminology](terminology.md) as the canonical references for stage order and naming.

## Core

- [Ultimate Knowledge Loop](ultimate-loop.md)
- [Architecture Overview](overview.md)
- [System Architecture](system-architecture.md)
- [Terminology](terminology.md)
- [Knowledge Model](knowledge-model.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)

## Stage Baselines

- [Ingest: Taxonomy-Governed Graph Entry](ingest-taxonomy-graph.md)
- [Understand Baseline](understand-baseline.md)
- [Connect Baseline](connect-baseline.md)
- [Verify Baseline](verify-baseline.md)
- [Plan Baseline](plan-baseline.md)

Future baselines should be added here:

- `retrieve`
- `reason`
- `update`
- `curation`
- `evaluate`

## Stage Boundaries And Handoffs

- [Ingest and Understand Boundary](ingest-understand-boundary.md)
- [Ingest to Understand Handoff](ingest-understand-handoff.md)
- [Understand and Connect Boundary](understand-connect-boundary.md)
- [Understand to Connect Handoff](understand-connect-handoff.md)
- [Connect and Verify Boundary](connect-verify-boundary.md)
- [Connect to Verify Handoff](connect-verify-handoff.md)
- [Plan to Retrieve Handoff](plan-retrieve-handoff.md)
- [Understand vs Task Understanding](understand-vs-task-understanding.md)

## Readiness Reviews

- [Ingest Readiness Review](ingest-readiness-review.md)
- [Understand Readiness Review](understand-readiness-review.md)
- [Connect Readiness Review](connect-readiness-review.md)
- [Plan Readiness Review](plan-readiness-review.md)

Add a readiness review before moving each major stage forward.

## Agent Architecture

- [Agent Design](agents.md)
- [Single Agent Model](single-agent-model.md)
- [Agent Superclass Contract](agent-superclass-contract.md)
- [Agent Connection Model](agent-connection-model.md)
- [Context and Session Model](context-session-model.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)
- [Agent Tool Pool](agent-tool-pool.md)

Detailed role specs live in [Agent Specs](../agents/README.md).

## Storage, Indexing, And Lifecycle

- [Infrastructure Baseline](infrastructure-baseline.md)
- [Single Repository First](single-repository-first.md)
- [Index Content Policy](index-content-policy.md)
- [Index ID Policy](index-id-policy.md)
- [OpenSearch Index Schema](opensearch-index-schema.md)
- [Rollback and Quarantine Policy](rollback-and-quarantine.md)
- [Content Deletion Lifecycle](content-deletion-lifecycle.md)

## Taxonomy And Wiki

- [Taxonomy Schema](taxonomy-schema.md)
- [Taxonomy Evolution Workflow](taxonomy-evolution.md)
- [Taxonomy vs Versioning Responsibilities](taxonomy-vs-versioning.md)
- [Wiki and Taxonomy Hybrid Architecture](wiki-taxonomy-hybrid.md)

## Media Concept Proofs

- [Media Ingest Strategies](media-ingest-strategies.md)
- [Media Concept Proofs](media-concept-proofs.md)
- [Media Understand Concept Proofs](media-understand-concept-proofs.md)
- [Media Connect Concept Proofs](media-connect-concept-proofs.md)
- [Media Plan Concept Proofs](media-plan-concept-proofs.md)

## Feedback And Improvement

- [Feedback Update Relationships](feedback-update-relationships.md)
- [Architecture Risk Review](architecture-risk-review.md)

## Navigation Rule

When working on a stage, read only:

1. the stage baseline;
2. the previous boundary and handoff;
3. the relevant agent spec;
4. the tool pool;
5. the terminology file.

Expand to lifecycle, indexing, media, or decisions only when the task touches those areas.

## Adding New Architecture Docs

When adding a new architecture document:

1. Put it in `docs/architecture/`.
2. Link it from this index.
3. Add it to [Work Context Packs](../operations/work-context-packs.md) if future work should read it.
4. Add an ADR only if a meaningful decision was made, not for every note.
