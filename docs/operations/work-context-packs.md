# Work Context Packs

This document defines the smallest useful reading set for common tasks.

Use it to avoid loading the whole documentation tree for every change.

## Universal Pack

Read these for any architectural change:

- [Vision](../vision.md)
- [Ultimate Knowledge Loop](../architecture/ultimate-loop.md)
- [Terminology](../architecture/terminology.md)
- [Architecture Overview](../architecture/overview.md)
- [Stage Data Flow Contract](../architecture/stage-data-flow-contract.md)
- [Implementation Plan](implementation-plan.md)
- [Markdown-First Implementation Strategy](markdown-first-implementation.md)

## Markdown-First Implementation Pack

Use for actual MVP implementation work before expanding media support:

- [Implementation Plan](implementation-plan.md)
- [Markdown-First Implementation Strategy](markdown-first-implementation.md)
- [Terminology](../architecture/terminology.md)
- [Stage Data Flow Contract](../architecture/stage-data-flow-contract.md)
- [Agent Tool Pool](../architecture/agent-tool-pool.md)
- [Agent Superclass Contract](../architecture/agent-superclass-contract.md)
- stage baseline for the feature being implemented
- current agent spec for the feature being implemented
- relevant handoff document for the feature being implemented

## Stage Transition Pack

Use before moving from one major stage to the next:

- [Stage Transition Guidelines](stage-transition-guidelines.md)
- [Ultimate Knowledge Loop](../architecture/ultimate-loop.md)
- [Terminology](../architecture/terminology.md)
- [Stage Data Flow Contract](../architecture/stage-data-flow-contract.md)
- current stage baseline
- previous-to-current boundary
- current-to-next boundary, if it exists
- current agent spec

## Ingest Pack

- [Ingest: Taxonomy-Governed Graph Entry](../architecture/ingest-taxonomy-graph.md)
- [Ingest and Understand Boundary](../architecture/ingest-understand-boundary.md)
- [Ingest to Understand Handoff](../architecture/ingest-understand-handoff.md)
- [Ingestion Agent Spec](../agents/ingestion-agent.md)
- [Media Ingest Strategies](../architecture/media-ingest-strategies.md)
- [Index Content Policy](../architecture/index-content-policy.md)
- [Index ID Policy](../architecture/index-id-policy.md)
- [OpenSearch Index Schema](../architecture/opensearch-index-schema.md)

## Understand Pack

- [Understand Baseline](../architecture/understand-baseline.md)
- [Ingest and Understand Boundary](../architecture/ingest-understand-boundary.md)
- [Ingest to Understand Handoff](../architecture/ingest-understand-handoff.md)
- [Understanding Agent Spec](../agents/understanding-agent.md)
- [Understand vs Task Understanding](../architecture/understand-vs-task-understanding.md)
- [Media Understand Concept Proofs](../architecture/media-understand-concept-proofs.md)

## Connect Pack

- [Connect Baseline](../architecture/connect-baseline.md)
- [Understand and Connect Boundary](../architecture/understand-connect-boundary.md)
- [Understand to Connect Handoff](../architecture/understand-connect-handoff.md)
- [Connection Agent Spec](../agents/connection-agent.md)
- [Media Connect Concept Proofs](../architecture/media-connect-concept-proofs.md)
- [Connect Readiness Review](../architecture/connect-readiness-review.md)

## Verify Pack

- [Verify Baseline](../architecture/verify-baseline.md)
- [Connect and Verify Boundary](../architecture/connect-verify-boundary.md)
- [Connect to Verify Handoff](../architecture/connect-verify-handoff.md)
- [Reason to Verify Handoff](../architecture/reason-verify-handoff.md)
- [Media Verify Concept Proofs](../architecture/media-verify-concept-proofs.md)
- [Verify Readiness Review](../architecture/verify-readiness-review.md)
- [Verifier Agent Spec](../agents/verifier-agent.md)
- [Agent Tool Pool](../architecture/agent-tool-pool.md)

## Runtime QA Pack

Use for `plan`, `retrieve`, `reason`, and answer verification work:

- [Ultimate Knowledge Loop](../architecture/ultimate-loop.md)
- [Understand vs Task Understanding](../architecture/understand-vs-task-understanding.md)
- [Plan Baseline](../architecture/plan-baseline.md)
- [Plan to Retrieve Handoff](../architecture/plan-retrieve-handoff.md)
- [Media Plan Concept Proofs](../architecture/media-plan-concept-proofs.md)
- [Plan Readiness Review](../architecture/plan-readiness-review.md)
- [Retrieve Baseline](../architecture/retrieve-baseline.md)
- [Retrieve to Reason Handoff](../architecture/retrieve-reason-handoff.md)
- [Media Retrieve Concept Proofs](../architecture/media-retrieve-concept-proofs.md)
- [Retrieve Readiness Review](../architecture/retrieve-readiness-review.md)
- [Reason Baseline](../architecture/reason-baseline.md)
- [Reason to Verify Handoff](../architecture/reason-verify-handoff.md)
- [Media Reason Concept Proofs](../architecture/media-reason-concept-proofs.md)
- [Reason Readiness Review](../architecture/reason-readiness-review.md)
- [Retrieval Planner Spec](../agents/retrieval-planner.md)
- [Retrieval Agent Spec](../agents/retrieval-agent.md)
- [Reasoning Agent Spec](../agents/reasoning-agent.md)
- [Verifier Agent Spec](../agents/verifier-agent.md)
- [Agent Superclass Contract](../architecture/agent-superclass-contract.md)
- [Agent Tool Pool](../architecture/agent-tool-pool.md)

## Index And Storage Pack

- [Infrastructure Baseline](../architecture/infrastructure-baseline.md)
- [Single Repository First](../architecture/single-repository-first.md)
- [Index Content Policy](../architecture/index-content-policy.md)
- [Index ID Policy](../architecture/index-id-policy.md)
- [OpenSearch Index Schema](../architecture/opensearch-index-schema.md)
- [Rollback and Quarantine Policy](../architecture/rollback-and-quarantine.md)
- [Content Deletion Lifecycle](../architecture/content-deletion-lifecycle.md)

## Agent Contract Pack

- [Agent Design](../architecture/agents.md)
- [Agent Specs](../agents/README.md)
- [Single Agent Model](../architecture/single-agent-model.md)
- [Agent Superclass Contract](../architecture/agent-superclass-contract.md)
- [Agent Connection Model](../architecture/agent-connection-model.md)
- [Context and Session Model](../architecture/context-session-model.md)
- [Stage Data Flow Contract](../architecture/stage-data-flow-contract.md)
- [Agent Tool Pool](../architecture/agent-tool-pool.md)

## Update, Curation, And Evaluation Pack

- [Update Baseline](../architecture/update-baseline.md)
- [Verify to Update Handoff](../architecture/verify-update-handoff.md)
- [Media Update Concept Proofs](../architecture/media-update-concept-proofs.md)
- [Update Readiness Review](../architecture/update-readiness-review.md)
- [Curation Baseline](../architecture/curation-baseline.md)
- [Update to Curation Handoff](../architecture/update-curation-handoff.md)
- [Media Curation Concept Proofs](../architecture/media-curation-concept-proofs.md)
- [Curation Readiness Review](../architecture/curation-readiness-review.md)
- [Feedback Update Relationships](../architecture/feedback-update-relationships.md)
- [Knowledge Update Agent Spec](../agents/knowledge-update-agent.md)
- [Curation Agent Spec](../agents/curation-agent.md)
- [Evaluation Agent Spec](../agents/evaluation-agent.md)
- [Rollback and Quarantine Policy](../architecture/rollback-and-quarantine.md)
- [Content Deletion Lifecycle](../architecture/content-deletion-lifecycle.md)

## Taxonomy Pack

- [Terminology](../architecture/terminology.md)
- [Taxonomy Schema](../architecture/taxonomy-schema.md)
- [Taxonomy Evolution Workflow](../architecture/taxonomy-evolution.md)
- [Taxonomy vs Versioning Responsibilities](../architecture/taxonomy-vs-versioning.md)
- [Wiki and Taxonomy Hybrid Architecture](../architecture/wiki-taxonomy-hybrid.md)

## Social Pack

Use only when social content is explicitly requested:

- [Social README](../social/README.md)
- [Social Strategy](../social/strategy.md)
- [Social Stage Plan](../social/stage-plan.md)
- [Post Template](../social/post-template.md)
- existing stage draft for the relevant stage

## Decision Pack

Use decisions for historical context, not as the implementation source of truth.

- [Decision Log](../decisions/README.md)
- relevant ADRs linked from current architecture docs

## Rule For Future Work

When starting a task, name the context pack being used.

If the task crosses packs, name both packs and explain why.
