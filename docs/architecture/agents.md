# Agent Design

This document defines the initial agent roles for Knowledge Pools.

Detailed specs are organized under [Agent Specs](../agents/README.md).

For the lower-level contract of a single agent, see [Single Agent Model](single-agent-model.md).

For the shared runtime superclass, TypeScript reference types, and typed handoff envelope, see [Agent Superclass Contract](agent-superclass-contract.md).

For agent handoffs and workflow connections, see [Agent Connection Model](agent-connection-model.md).

For context and session persistence, see [Context and Session Model](context-session-model.md).

For shared tool ports and stage-scoped tool permissions, see [Agent Tool Pool](agent-tool-pool.md).

## Design Principle

Agents communicate through typed artifacts and context envelopes.

They should not depend on hidden LLM chat state, provider-hosted threads, or raw conversation history as the source of truth.

Every agent design must declare its required, optional, and forbidden tool ports using [Agent Tool Pool](agent-tool-pool.md).

## Ingestion Agent

Converts raw inputs into normalized, source-grounded ingest artifacts.

Detailed v1 contract: [Ingestion Agent Spec](../agents/ingestion-agent.md).

Inputs:

- Markdown
- PDF
- text notes
- code repositories
- web pages
- conversations selected for preservation

Outputs:

- source metadata
- parsed document structure
- access units
- preview artifact refs
- source fingerprints
- taxonomy category assignments
- shallow candidates from visible structure

Tool contract:

- required: `source.read`, `source.write`, `source.version`, `hash.compute`, `mime.detect`, `parse.document`, `chunk.create`, `taxonomy.read`, `taxonomy.validate`, `artifact.write`, `audit.trace`;
- optional: `parse.media`, `preview.create`, `taxonomy.classify`, `taxonomy.propose`, `index.write_projection`;
- forbidden: `memory.write`, `curation.decide`, `rollback.create_event`, `delete.create_tombstone`.

## Understanding Agent

Transforms parsed sources into reusable knowledge units.

Detailed v1 contract: [Understanding Agent Spec](../agents/understanding-agent.md).

It reads ingest artifacts and exact source access units. It should separate parser-visible structure from semantic interpretation.

Outputs:

- claims
- decisions
- concepts
- procedures
- open questions
- summaries
- evidence links

The Understanding Agent should separate source-grounded statements from model-generated interpretation.

Tool contract:

- required: `artifact.read`, `source.locate`, `source.read`, `taxonomy.read`, `taxonomy.validate`, `schema.validate`, `candidate.emit`, `ambiguity.emit`, `review.request`, `artifact.write`, `audit.trace`;
- optional: `taxonomy.classify`, `model.complete`, `parse.document`, `retrieval.fetch_evidence`;
- forbidden: `memory.write`, `curation.decide`, `source.tombstone`, `rollback.create_event`, `delete.create_tombstone`.

## Connection Agent

Relates knowledge candidates to existing records, concepts, sources, and other candidates.

Detailed v1 contract: [Connection Agent Spec](../agents/connection-agent.md).

Responsibilities:

- Find likely duplicate or related records.
- Propose `supports`, `contradicts`, `depends_on`, and `supersedes` relationships.
- Preserve evidence refs and uncertainty.
- Hand off relation proposals to verification.

Tool contract:

- required: `artifact.read`, `record.search`, `graph.query`, `taxonomy.read`, `taxonomy.validate`, `schema.validate`, `candidate.emit`, `artifact.write`, `audit.trace`;
- optional: `model.complete`, `ambiguity.emit`, `review.request`, `index.search`;
- forbidden: `memory.write`, `curation.decide`, `source.tombstone`, `delete.create_tombstone`.

## Retrieval Planner

Turns a user question or agent task into explicit evidence requirements and a retrieval strategy.

Detailed v1 contract: [Retrieval Planner Spec](../agents/retrieval-planner.md).

This agent owns task understanding for user questions.

Do not confuse this with the Understanding Agent, which processes source documents into knowledge candidates.

Responsibilities:

- Identify user intent and expected answer shape.
- Identify required evidence types.
- Choose vector, keyword, graph, temporal, record, or source retrieval.
- Set freshness scope when the user asks about current or historical state.
- Require conflict search when the answer may be contested.
- Emit a retrieval plan that retrieval can execute without reinterpreting the raw request.

Outputs:

- retrieval plan
- task understanding metadata
- required evidence types
- freshness constraints
- conflict search requirements
- expected answer shape
- retrieval budget or limits

Tool contract:

- required: `retrieval.plan`, `record.search`, `index.search`, `schema.validate`, `artifact.write`, `audit.trace`;
- optional: `graph.query`, `taxonomy.read`, `model.complete`, `artifact.read`, `preview.lookup`;
- forbidden: `source.read`, `retrieval.fetch_evidence`, `reason.synthesize`, `verification.check`, `candidate.emit`, `memory.write`, `curation.decide`, `source.tombstone`, `delete.create_tombstone`.

## Retrieval Agent

Executes the retrieval plan across available retrieval services.

Detailed v1 contract: [Retrieval Agent Spec](../agents/retrieval-agent.md).

Responsibilities:

- Run source lookup, keyword search, vector search, graph traversal, and temporal filtering as needed.
- Return evidence bundles rather than raw search results only.
- Mark missing evidence and possible conflicts.

Tool contract:

- required: `index.search`, `record.search`, `source.locate`, `source.read`, `retrieval.fetch_evidence`, `artifact.write`, `audit.trace`;
- optional: `graph.query`;
- forbidden: `memory.write`, `curation.decide`, `source.tombstone`, `delete.create_tombstone`.

## Reasoning Agent

Synthesizes an answer or action plan from retrieved evidence.

Detailed v1 contract: [Reasoning Agent Spec](../agents/reasoning-agent.md).

Responsibilities:

- Distinguish facts, assumptions, and unknowns.
- Cite supporting knowledge records.
- Avoid hiding conflicts.
- Keep answers aligned with the user's current task.

Tool contract:

- required: `artifact.read`, `source.read`, `artifact.write`, `audit.trace`;
- optional: `model.complete`, `reason.synthesize`, `record.search`;
- forbidden: `memory.write`, `curation.decide`, `source.tombstone`, `delete.create_tombstone`.

## Verifier Agent

Checks whether a relationship proposal, draft answer, or proposed action is grounded, fresh, and conflict-aware.

Detailed v1 contract: [Verifier Agent Spec](../agents/verifier-agent.md).

Checks:

- Is each key claim supported?
- Is each relationship proposal supported?
- Do relationship endpoints resolve?
- Are stale sources presented as current?
- Were known contradictions ignored?
- Is uncertainty represented honestly?

Tool contract:

- required: `artifact.read`, `schema.validate`, `taxonomy.read`, `taxonomy.validate`, `verification.check`, `artifact.write`, `audit.trace`;
- optional: `record.search`, `graph.query`, `source.locate`, `source.read`, `retrieval.fetch_evidence`, `review.request`, `model.complete`;
- forbidden: `memory.write`, `curation.decide`, `source.tombstone`, `delete.create_tombstone`.

## Knowledge Update Agent

Turns useful verified outcomes into update candidates.

Detailed v1 contract: [Knowledge Update Agent Spec](../agents/knowledge-update-agent.md).

Candidates for storage:

- decisions
- corrected facts
- reusable preferences
- project constraints
- failed approaches
- open questions

The update agent should prefer concise structured candidates over full transcripts.

It does not write durable memory. Curation decides whether an update candidate becomes a durable record.

Tool contract:

- required: `artifact.read`, `candidate.emit`, `review.request`, `artifact.write`, `audit.trace`;
- optional: `curation.propose`, `record.search`, `model.complete`;
- forbidden: `memory.write`, `curation.decide`, `source.tombstone`, `delete.create_tombstone`.

## Curation Agent

Decides whether proposed updates should become durable memory.

Detailed v1 contract: [Curation Agent Spec](../agents/curation-agent.md).

Responsibilities:

- Accept, edit, defer, or reject candidate updates.
- Ensure each durable update has provenance.
- Avoid storing noisy conversation fragments.
- Preserve supersession instead of overwriting older knowledge silently.

Tool contract:

- required: `artifact.read`, `curation.decide`, `memory.write`, `memory.update_status`, `audit.trace`;
- optional: `rollback.create_event`, `delete.create_tombstone`, `record.search`;
- forbidden: direct provider-specific memory writes.

## Evaluation Agent

Records quality signals from completed runs.

Detailed v1 contract: [Evaluation Agent Spec](../agents/evaluation-agent.md).

Responsibilities:

- Track retrieval misses.
- Track verifier failures.
- Track stale or conflicting evidence usage.
- Record user corrections.
- Identify patterns that should improve future retrieval and verification.

Tool contract:

- required: `audit.read_trace`, `evaluation.record`, `artifact.read`;
- optional: `evaluation.report`, `record.search`;
- forbidden: `memory.write`, `curation.decide`, `source.tombstone`, `delete.create_tombstone`.
