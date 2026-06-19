# Ultimate Knowledge Loop

This document defines the target operating loop for Knowledge Pools.

The earlier shorthand loop was:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

The target implementation loop adds explicit planning, update candidates, curation, durable updates, and evaluation:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

This is not a simple linear pipeline. It is a controlled feedback system.

```text
                          +--------------------------------+
                          |                                |
                          v                                |
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify
   ^                                                        |       |
   |                                                        v       v
   +--------- evaluate <- durable update <- curation <- update candidate
```

The shortest public shorthand may still be:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

But implementation documents should use the canonical stage flow above.

## Canonical Flow Rule

Use this document as the source of truth for stage order and ownership.

The canonical implementation flow is:

| Order | Stage | Primary role | Primary artifact | Durable write? |
| --- | --- | --- | --- | --- |
| 1 | `ingest` | Preserve, normalize, segment, locate, classify | `IngestArtifact` | No |
| 2 | `understand` | Extract source-grounded knowledge candidates | `UnderstandingArtifact` | No |
| 3 | `connect` | Propose relationships between candidates and known context | `ConnectionArtifact` | No |
| 4 | `plan` | Understand the task and choose retrieval strategy | `RetrievalPlan` | No |
| 5 | `retrieve` | Gather evidence through approved retrieval paths | `EvidenceBundle` | No |
| 6 | `reason` | Produce a draft answer or proposed action from evidence | `DraftAnswer` or `ProposedAction` | No |
| 7 | `verify` | Audit grounding, freshness, and conflicts | `VerificationReport` | No |
| 8 | `update` | Convert useful outcomes into update candidates | `UpdateCandidate` | No |
| 9 | `curation` | Accept, edit, defer, reject, retract, or supersede candidates | `CurationDecision` | Yes, when accepted |
| 10 | `evaluate` | Record traces, failures, corrections, and quality signals | `EvaluationReport` | Evaluation store only |

The `update` stage proposes reusable memory changes.

It does not directly write durable memory.

Durable knowledge, graph, and memory writes happen only after `curation`.

## Why This Shape

The loop is designed around the main failure modes of basic RAG.

| Failure Mode | Loop Response |
| --- | --- |
| Source provenance disappears | `ingest` preserves raw and parsed sources |
| Chunks lose meaning | `understand` extracts claims, decisions, concepts, procedures, and questions |
| Knowledge becomes isolated | `connect` links evidence, dependencies, contradiction, and supersession |
| Retrieval is too naive | `plan` chooses retrieval strategy before searching |
| Similarity is mistaken for relevance | `retrieve` uses vector, keyword, graph, source, and temporal search |
| Answers become unsupported synthesis | `reason` separates facts, assumptions, and unknowns |
| Hallucinations slip through | `verify` checks grounding, freshness, and conflict handling |
| Useful learning disappears | `update` proposes reusable knowledge changes |
| Memory becomes noisy | `curation` decides what becomes durable |
| The system cannot improve | `evaluate` stores traces, errors, and quality signals |

## Stage Definitions

### 1. Ingest

Bring external material into the repository without losing provenance and convert it into taxonomy-aware, source-grounded artifacts.

Ingest preserves, normalizes, segments, locates, classifies, and proposes. It should not silently turn parsed material into durable knowledge.

Outputs:

- source record
- raw content pointer
- parsed structure
- content hash
- import metadata
- taxonomy version
- category assignments
- shallow candidate entities and relations
- validation report
- taxonomy change proposals when needed

See [Ingest: Taxonomy-Governed Graph Entry](ingest-taxonomy-graph.md).

The boundary between ingest and understand is defined in [Ingest and Understand Boundary](ingest-understand-boundary.md).

### 2. Understand

Convert parsed material into knowledge candidates.

Understand interprets source-grounded ingest artifacts, extracts candidate knowledge units, aligns them to evidence, and records ambiguity.

It does not create durable records.

This is source/document understanding, not user-question understanding.

User-question understanding belongs to `plan`, where the system interprets task intent, constraints, freshness needs, and expected answer shape.

Outputs:

- claims
- decisions
- concepts
- procedures
- questions
- summaries
- evidence spans
- ambiguity notes
- confidence notes

See [Understand Baseline](understand-baseline.md).

See also [Understand vs Task Understanding](understand-vs-task-understanding.md).

### 3. Connect

Propose how knowledge candidates relate to the existing knowledge fabric.

Canonical agent: `Connection Agent`.

Outputs:

- source link proposals
- concept link proposals
- support relationship proposals
- contradiction relationship proposals
- supersession relationship proposals
- dependency relationship proposals

Connect does not create durable graph edges.

See [Connect Baseline](connect-baseline.md).

### 4. Plan

Translate the task into evidence requirements and a retrieval strategy before searching.

Canonical agent: `Retrieval Planner`.

Plan includes task understanding: interpreting the user's question or instruction into intent, constraints, required evidence, freshness scope, and answer shape.

The stage prevents retrieval from becoming blind similarity search.

The planner should choose based on the task type:

- factual lookup
- design review
- decision recall
- contradiction check
- latest-state summary
- implementation planning
- source audit

Outputs:

- retrieval plan
- task understanding metadata
- required evidence types
- freshness requirements
- conflict search requirement
- expected answer shape
- retrieval budget or limits

Plan does not retrieve evidence or produce answers.

### 5. Retrieve

Gather evidence through multiple retrieval paths.

Retrieval modes:

- source lookup
- keyword search
- vector search
- graph traversal
- temporal search
- decision lookup
- memory lookup

Outputs:

- evidence bundle
- ranked records
- missing evidence notes
- conflict candidates

### 6. Reason

Produce an answer, plan, or action from evidence.

Outputs:

- answer or proposed action
- assumptions
- unresolved questions
- cited evidence references
- confidence notes

### 7. Verify

Audit relationship proposals, draft answers, or proposed actions before treating them as reliable.

Checks:

- Is each key claim supported?
- Is each relationship proposal supported?
- Do proposed relationship endpoints resolve?
- Is the answer using stale knowledge as current?
- Were known contradictions ignored?
- Are assumptions clearly labeled?
- Does the answer exceed the evidence?

Outputs:

- verification report
- verification result artifacts
- unsupported claim list
- stale evidence warning
- contradiction warning
- revision request if needed

V1 starts with relationship proposal verification after `connect`.

Answer verification is added after `plan`, `retrieve`, and `reason` are implemented.

See [Verify Baseline](verify-baseline.md).

### 8. Update

Convert useful outcomes into update candidates.

Candidates:

- decision candidates
- corrected facts
- project constraints
- reusable procedures
- failed approaches
- open questions
- new relationships

Feedback-derived knowledge should enter as update candidates, not durable records.

See [Feedback Update Relationships](feedback-update-relationships.md).

### 9. Curation

Decide what becomes durable memory.

Rules:

- Store reusable knowledge, not raw conversation by default.
- Preserve source references.
- Mark uncertainty.
- Prefer concise records.
- Avoid overwriting older knowledge without supersession metadata.

Accepted curation decisions may create or modify durable graph records, memory records, lifecycle states, or index projections.

### 10. Evaluate

Record traces and quality signals so the system can improve.

Signals:

- retrieval misses
- verifier failures
- stale source usage
- unresolved conflicts
- user corrections
- successful answer patterns

## Target Principle

Knowledge Pools should not merely answer from stored information.

It should maintain a source-grounded, conflict-aware, time-aware knowledge structure that improves through verified use.
