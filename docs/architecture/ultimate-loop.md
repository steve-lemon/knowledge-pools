# Ultimate Knowledge Loop

This document defines the target operating loop for Knowledge Pools.

The earlier shorthand loop was:

```text
ingest -> understand -> connect -> retrieve -> reason -> verify -> update
```

The target loop adds explicit planning, evaluation, and curation:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> evaluate
```

This is not a simple linear pipeline. It is a controlled feedback system.

```text
                    +-----------------------------+
                    |                             |
                    v                             |
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify
   ^                                                        |       |
   |                                                        v       v
   +------------- evaluate <- update <- curation gate <- durable output
```

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
| Useful learning disappears | `update` stores reusable knowledge |
| Memory becomes noisy | `curation gate` decides what becomes durable |
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

### 3. Connect

Attach knowledge candidates to the existing knowledge fabric.

Outputs:

- source links
- concept links
- support relationships
- contradiction relationships
- supersession relationships
- dependency relationships

### 4. Plan

Decide how to retrieve and reason before searching.

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
- required evidence types
- freshness requirements
- conflict search requirement
- expected answer shape

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

Audit the reasoning result before treating it as reliable.

Checks:

- Is each key claim supported?
- Is the answer using stale knowledge as current?
- Were known contradictions ignored?
- Are assumptions clearly labeled?
- Does the answer exceed the evidence?

Outputs:

- verification result
- unsupported claim list
- stale evidence warning
- contradiction warning
- revision request if needed

### 8. Update

Convert useful outcomes into knowledge candidates.

Candidates:

- accepted decisions
- corrected facts
- project constraints
- reusable procedures
- failed approaches
- open questions
- new relationships

Feedback-derived knowledge should enter as update candidates, not durable records.

See [Feedback Update Relationships](feedback-update-relationships.md).

### 9. Curation Gate

Decide what becomes durable memory.

Rules:

- Store reusable knowledge, not raw conversation by default.
- Preserve source references.
- Mark uncertainty.
- Prefer concise records.
- Avoid overwriting older knowledge without supersession metadata.

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
