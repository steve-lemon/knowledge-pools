# Plan Baseline

This document defines the v1 baseline for the `plan` stage.

`plan` turns a user request or workflow request into explicit evidence requirements and a retrieval strategy.

It owns task understanding.

It decides what kind of evidence is needed, where to look first, whether freshness matters, and whether conflicts must be searched.

It does not retrieve evidence.

It does not produce answers.

It does not write memory.

## Role

The role of `plan` is to translate a task into an executable retrieval plan.

It sits between the user's request and retrieval execution:

```text
request -> task understanding -> evidence requirements -> retrieval plan -> retrieve
```

The stage should make these decisions explicit before search begins:

- what the user is trying to accomplish;
- what answer or output shape is expected;
- which evidence types are required;
- whether current, historical, stable, or any-time evidence is acceptable;
- whether contradiction or stale-knowledge checks are needed;
- which retrieval paths should run and in what order;
- which retrieval paths are out of scope or forbidden.

## Primary Purpose

The primary purpose of `plan` is to prevent retrieval from becoming blind similarity search.

It ensures the system knows what it is looking for before it starts looking.

The key shift is:

```text
user request -> task understanding -> evidence requirements -> retrieval plan
```

This is different from source `understand`.

Source `understand` extracts knowledge candidates from stored sources.

Task understanding interprets the user's current intent, constraints, time scope, and expected output shape.

## Non-Goals

Plan must not:

- fetch full source content;
- rank final evidence;
- synthesize an answer;
- verify claim support;
- create relationship proposals;
- update memory;
- decide curation.

## Expected Results

Plan should produce:

- `RetrievalPlan`;
- task understanding metadata;
- required evidence types;
- retrieval strategy steps;
- freshness scope;
- conflict search requirement;
- expected answer shape;
- retrieval budget or limits;
- allowed and blocked retrieval modes;
- missing prerequisite notes;
- quality report;
- `PlanToRetrieveHandoff`.

The most important result is not the plan file itself.

The important result is that `retrieve` can run without guessing the task intent.

## Expected Effects

| Effect | Why it matters |
| --- | --- |
| Better retrieval precision | Retrieval starts from explicit evidence needs |
| Better freshness handling | Current, historical, and stable questions are separated |
| Better conflict handling | Contradiction search can be requested before reasoning |
| Better task fit | The answer shape is known before evidence gathering |
| Better cost control | Retrieval budget and allowed modes are explicit |
| Better failure behavior | Missing prerequisites can be reported before retrieval |
| Better LLM independence | Planning output is schema-validatable and not hidden prompt state |

## Stage Boundary

```text
plan = understand the task and choose retrieval strategy
retrieve = execute retrieval paths and gather evidence
reason = synthesize from evidence
```

`plan` may inspect metadata, indexes, records, and graph context to choose a retrieval strategy.

It must not fetch long evidence content as its primary output.

It may read lightweight metadata or search summaries only when needed to choose a strategy.

## Inputs

Required inputs:

- user request or workflow request;
- session id when interactive;
- run id;
- task constraints;
- available retrieval modes;
- schema refs;
- taxonomy refs when relevant.

Optional inputs:

- session summary refs;
- active goal refs;
- project memory refs;
- recent run refs;
- index metadata;
- graph metadata;
- record search results;
- source availability metadata.

## Outputs

The primary output is a `RetrievalPlan`.

Recommended shape:

```json
{
  "retrieval_plan_id": "rp_2026_06_19_001",
  "plan_type": "hybrid_evidence_lookup",
  "task_understanding": {
    "intent": "answer_question",
    "question": "Why does Knowledge Pools need verification?",
    "answer_shape": "concise_explanation",
    "freshness_scope": "stable",
    "requires_conflict_search": true
  },
  "required_evidence_types": [
    "architecture_doc",
    "decision_record"
  ],
  "retrieval_steps": [
    {
      "step_id": "s1",
      "mode": "keyword_search",
      "query": "verification grounding freshness conflict",
      "target_indexes": ["source", "knowledge_candidate", "decision"]
    },
    {
      "step_id": "s2",
      "mode": "record_search",
      "record_kinds": ["decision", "claim"],
      "filters": {
        "project": "knowledge-pools"
      }
    }
  ],
  "constraints": {
    "max_evidence_refs": 8,
    "prefer_current": true
  },
  "created_at": "2026-06-19T00:00:00Z"
}
```

Long reasoning about why a plan was chosen should live behind artifact refs when needed.

## Quality Bar

The planner is ready to hand off only when:

- task intent is explicit;
- expected answer shape is explicit;
- freshness scope is explicit;
- required evidence types are listed;
- at least one retrieval step is present;
- conflict-search requirement is explicit;
- retrieval budget or limits are present for broad tasks;
- unsupported retrieval modes are rejected or marked blocked;
- missing prerequisites are surfaced instead of hidden;
- the output schema validates.

## Plan Types

Recommended v1 plan types:

| Plan type | Use when |
| --- | --- |
| `source_lookup` | The request names a source, path, title, or exact document |
| `keyword_search` | The request needs text or metadata lookup |
| `decision_recall` | The request asks why something was decided |
| `concept_search` | The request asks about a concept or topic |
| `conflict_check` | The request asks whether something is contradicted or stale |
| `latest_state_summary` | The request asks for current state |
| `source_audit` | The request asks what evidence exists or is missing |
| `hybrid_evidence_lookup` | Multiple retrieval modes are required |

Media-specific planning examples are defined in [Media Plan Concept Proofs](media-plan-concept-proofs.md).

Media-heavy plans should prefer bounded refs such as page refs, region refs, timestamp ranges, keyframes, previews, or transcript spans over full source fetches.

## V1 Workflow

Recommended workflow:

```text
load user or workflow request
  -> load bounded context envelope
  -> classify task intent
  -> identify answer shape
  -> identify freshness scope
  -> identify required evidence types
  -> decide whether conflict search is required
  -> choose retrieval steps
  -> validate retrieval plan schema
  -> write retrieval plan artifact
  -> create PlanToRetrieveHandoff
  -> emit trace
```

V1 should be deterministic-first.

Model-assisted task understanding may be added later, but its output must be schema-validated before handoff.

## Tool Access

Required ports:

- `retrieval.plan`;
- `record.search`;
- `index.search`;
- `schema.validate`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `graph.query`;
- `taxonomy.read`;
- `model.complete`;
- `artifact.read`;

Forbidden ports:

- `source.read`;
- `retrieval.fetch_evidence`;
- `reason.synthesize`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Validation Rules

A retrieval plan is valid only if:

- task intent is present;
- expected answer shape is present;
- freshness scope is explicit;
- retrieval steps are non-empty;
- every retrieval mode is allowed by the current tool grants;
- required evidence types are explicit;
- conflict search requirement is explicit;
- output schema validates;
- no durable memory write is requested.

## Minimal V1 Rule

For v1:

- support `source_lookup`, `keyword_search`, `decision_recall`, and `hybrid_evidence_lookup`;
- emit `RetrievalPlan`;
- emit `PlanToRetrieveHandoff`;
- keep task understanding separate from source understanding;
- do not fetch full source content;
- do not produce answers.

## Design Rule

Plan decides how to search.

Retrieve performs the search.

Reason answers from evidence.
