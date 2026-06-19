# Plan Readiness Review

This document performs the final readiness review for the `plan` stage before moving deeper into `retrieve`.

Use it with:

- [Plan Baseline](plan-baseline.md)
- [Plan to Retrieve Handoff](plan-retrieve-handoff.md)
- [Media Plan Concept Proofs](media-plan-concept-proofs.md)
- [Retrieval Planner Spec](../agents/retrieval-planner.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)

## Readiness Summary

The `plan` stage is ready to move forward when it can produce a schema-valid `RetrievalPlan` and `PlanToRetrieveHandoff` without fetching full evidence, synthesizing answers, or mutating durable state.

Current status:

```text
ready_for_retrieve_baseline: yes
implementation_ready: partial
```

The architecture is ready.

Runtime schemas and code are still future implementation work.

## Purpose Check

Plan owns:

- task understanding;
- evidence requirement definition;
- freshness scope selection;
- conflict-search decision;
- retrieval strategy selection;
- retrieval budget and bounded fetch rules;
- plan-to-retrieve handoff.

Plan does not own:

- source/document understanding;
- full source fetch;
- evidence ranking after retrieval;
- answer synthesis;
- verification;
- relationship proposal creation;
- durable memory write;
- curation.

## Required Outputs

Plan must emit:

- `RetrievalPlan`;
- task understanding metadata;
- required evidence types;
- retrieval steps;
- freshness scope;
- conflict-search requirement;
- retrieval budget or limits;
- missing prerequisite notes when relevant;
- quality report;
- `PlanToRetrieveHandoff`;
- trace events.

## Tool Readiness

### Required Ports

| Port | Why it is needed | Boundary |
| --- | --- | --- |
| `retrieval.plan` | Create the structured retrieval plan | Derives plan only |
| `record.search` | Inspect lightweight record metadata for strategy selection | Must not fetch full evidence |
| `index.search` | Inspect index metadata and candidate/source availability | Must not treat hits as evidence bundle |
| `schema.validate` | Validate `RetrievalPlan` and handoff | Read-only validation |
| `artifact.write` | Write plan, quality report, and handoff artifacts | Run-local artifact write |
| `audit.trace` | Record planning decisions and tool calls | Trace only |

### Optional Ports

| Port | Why it may be useful | Boundary |
| --- | --- | --- |
| `graph.query` | Check available relation paths or conflict topology | Metadata/context only |
| `taxonomy.read` | Resolve evidence type or domain vocabulary | Read-only |
| `model.complete` | Assist task classification or plan drafting | Output must be schema-validated |
| `artifact.read` | Read prior run or context artifacts | Must respect context envelope |
| `preview.lookup` | Resolve preview refs for media-aware planning | Preview refs only, not final evidence |

### Forbidden Ports

| Port | Why forbidden |
| --- | --- |
| `source.read` | Full source fetch belongs to `retrieve` |
| `retrieval.fetch_evidence` | Evidence gathering belongs to `retrieve` |
| `reason.synthesize` | Answer generation belongs to `reason` |
| `verification.check` | Grounding audit belongs to `verify` |
| `candidate.emit` | Candidate creation belongs to understand/connect/update |
| `memory.write` | Durable memory writes belong behind curation |
| `curation.decide` | Curation is a later stage |
| `source.tombstone` | Lifecycle mutation is out of scope |
| `delete.create_tombstone` | Deletion lifecycle is out of scope |

## Handoff Readiness

`PlanToRetrieveHandoff` is ready when it includes:

- `retrieval_plan_ref`;
- `required_evidence_types`;
- `freshness_scope`;
- `conflict_search_required`;
- `retrieval_budget` when broad or media-heavy;
- `preferred_indexes` or `blocked_indexes` when relevant;
- `validation_status`;
- `quality_report_refs`;
- `trace_refs`.

Retrieve must be able to start from the handoff without reinterpreting the raw user request.

## Media Readiness

Media planning is acceptable when:

- Markdown plans request section refs, decision records, claim candidates, or wiki/link context;
- image plans request OCR spans, region refs, and inspectable renditions;
- audio plans request transcript spans and time ranges, not full audio by default;
- video plans request subtitles, scene segments, keyframes, and bounded proxy refs;
- PDF plans request page, section, table, figure, citation, and current-version refs as needed.

Previews are navigation aids.

They are not source truth.

## Validation Checklist

Before handoff:

- task intent is explicit;
- expected answer shape is explicit;
- freshness scope is explicit;
- required evidence types are non-empty;
- at least one retrieval step exists;
- conflict-search requirement is explicit;
- retrieval modes are allowed by tool grants;
- broad or media-heavy tasks include budget or bounded-fetch constraints;
- missing prerequisites are surfaced;
- output schema validates;
- no forbidden tool is requested.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Planner quietly fetches evidence | Forbid `source.read` and `retrieval.fetch_evidence` |
| Planner produces an answer | Forbid `reason.synthesize`; output only `RetrievalPlan` |
| Similarity search dominates | Require evidence types and task intent before retrieval |
| Media fetch becomes too broad | Require retrieval budget and bounded refs |
| Preview is mistaken for evidence | Mark previews as navigation aids only |
| Model output becomes hidden state | Require schema validation and trace refs |

## Decision

The `plan` architecture is ready to hand off to the `retrieve` stage design.

Next work should define:

- retrieve stage purpose and boundary;
- `RetrieveToReasonHandoff`;
- evidence bundle schema;
- retrieval tool access and validation rules.
