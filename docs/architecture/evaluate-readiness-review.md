# Evaluate Readiness Review

This document performs the final readiness review for the `evaluate` stage.

Use it with:

- [Evaluate Baseline](evaluate-baseline.md)
- [Curation to Evaluate Handoff](curation-evaluate-handoff.md)
- [Curation Readiness Review](curation-readiness-review.md)
- [Evaluation Agent Spec](../agents/evaluation-agent.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)
- [Markdown-First Implementation Strategy](../operations/markdown-first-implementation.md)

## Readiness Summary

The `evaluate` stage is ready when it can consume a schema-valid `CurationToEvaluateHandoff`, read trace and artifact refs, record quality signals, write an `EvaluationReport`, and recommend future improvements without mutating durable knowledge.

Current status:

```text
canonical_loop_review_complete: yes
implementation_ready: partial
```

The architecture is ready.

Runtime schemas, local evaluation stores, regression fixture formats, and report generation are still future implementation work.

## Purpose Check

Evaluate owns:

- loading and validating `CurationToEvaluateHandoff`;
- reading run traces and referenced artifacts;
- recording evaluation signals;
- summarizing retrieval, reasoning, verification, update, and curation quality signals;
- detecting missing trace or missing artifact warnings;
- marking clean runs when no quality issue is found;
- recommending regression fixtures or follow-up work;
- producing `EvaluationReport`.

Evaluate does not own:

- writing durable memory;
- deciding curation;
- emitting update candidates;
- re-running verification;
- fetching new evidence;
- mutating source or index lifecycle;
- applying automatic prompt, taxonomy, or retrieval policy changes.

## Required Outputs

Evaluate must emit:

- one `EvaluationReport`;
- zero or more `EvaluationSignal` records;
- run and stage-scope metrics;
- trace completeness status;
- missing artifact warnings when present;
- regression candidate recommendations when useful;
- follow-up recommendations when useful;
- trace events for evaluation work.

A clean run is a valid result.

The report should explain why no quality issue was found.

## Tool Readiness

### Required Ports

| Port | Why it is needed | Boundary |
| --- | --- | --- |
| `audit.read_trace` | Read run traces and tool-call traces | Read-only, bounded to evaluated run/session refs |
| `audit.trace` | Record evaluation tool calls and report generation | Trace only |
| `artifact.read` | Read handoff, curation decisions, quality reports, verification reports, update candidates, and related artifacts | Must read only refs declared by handoff or bounded context |
| `schema.validate` | Validate handoff, evaluation signal, evaluation report, and metric schemas | Read-only validation |
| `evaluation.record` | Store evaluation signals and run outcome records | Evaluation-store side effect only |
| `artifact.write` | Write `EvaluationReport` and supporting report artifacts | Derived artifact write |

### Optional Ports

| Port | Why it may be useful | Boundary |
| --- | --- | --- |
| `evaluation.report` | Produce aggregate reports from stored signals | Evaluation-only derived reporting |
| `record.search` | Inspect existing records for curation outcome context or regression matching | Read-only, bounded to evaluation context |
| `taxonomy.read` | Load controlled signal types or metric definitions | Read-only |
| `review.request` | Request human review for suspicious evaluation findings | Review/proposal only |

### Forbidden Ports

| Port | Why forbidden |
| --- | --- |
| `memory.write` | Durable knowledge writes belong to curation |
| `memory.update_status` | Durable lifecycle mutation belongs to curation/lifecycle governance |
| `curation.decide` | Evaluation observes curation decisions; it does not make them |
| `candidate.emit` | Update candidate creation belongs to update |
| `curation.propose` | Evaluation should record signals, not pre-fill curation actions in v1 |
| `verification.check` | Verification checks belong to verify |
| `retrieval.fetch_evidence` | Evidence fetching belongs to retrieve |
| `index.search` | Broad search belongs to plan/retrieve |
| `index.write_projection` | Projection writes belong to indexing/projection workflows |
| `index.deactivate_projection` | Projection lifecycle mutation is out of scope |
| `source.read` | Evaluation should not reinterpret raw source content |
| `source.write` | Source creation belongs to ingest |
| `source.version` | Source version creation belongs to ingest |
| `source.tombstone` | Source lifecycle mutation is out of scope |
| `delete.create_tombstone` | Deletion lifecycle is out of scope |

## Tool Sequence

Recommended Markdown-first evaluation sequence:

```text
artifact.read CurationToEvaluateHandoff
  -> schema.validate handoff
  -> audit.read_trace run/session trace refs
  -> artifact.read curation decisions
  -> artifact.read curation quality report
  -> artifact.read optional verification/update/retrieval artifacts by ref
  -> schema.validate signal/report shapes
  -> evaluation.record EvaluationSignal[]
  -> artifact.write EvaluationReport
  -> audit.trace
```

Evaluation should not use tools to fix the problem it observes.

If evaluation finds a quality problem, it records a signal and recommendation.

Any correction must re-enter the loop through feedback, update, and curation.

## Handoff Readiness

`CurationToEvaluateHandoff` is ready when it includes:

- curation decision refs;
- accepted record refs;
- rejected candidate refs;
- deferred candidate refs when present;
- lifecycle event refs when present;
- quality report ref;
- validation status;
- trace refs.

## Markdown-First Readiness

Markdown-first evaluation is acceptable when:

- evaluated runs use Markdown/text evidence paths;
- curation decisions resolve;
- trace refs are available or marked missing;
- retrieval miss, unsupported claim, schema failure, update candidate, and curation outcome counts can be computed;
- regression candidate recommendations can be emitted without mutating durable memory.

Future media evaluation should wait until media verification, update, and curation paths are stable.

## Validation Checklist

Before closing the loop:

- incoming handoff validates;
- curation decision refs resolve or are marked missing;
- accepted/rejected/deferred/lifecycle refs resolve or are marked missing;
- curation quality report resolves;
- run traces are read or missing trace warnings are emitted;
- every signal has a signal type, severity, summary, and related refs;
- metrics use known metric names;
- clean runs explicitly state why no signal was emitted;
- regression candidate recommendations remain recommendations;
- evaluation report validates;
- no durable memory, curation, update candidate, verification, retrieval, source lifecycle, deletion, or projection mutation occurs.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Evaluation becomes self-modification | Forbid memory, curation, candidate, verification, retrieval, and projection mutation ports |
| Clean runs hide missing audit data | Require trace completeness and missing artifact warnings |
| Metrics become ungrounded | Require related refs on every signal |
| Evaluation bypasses update/curation | Recommendations must re-enter feedback/update/curation workflows |
| Media quality is scored too early | Limit v1 to Markdown/text completed runs |
| Reports become vague summaries | Require typed signals, metrics, severity, and related refs |

## Decision

The `evaluate` architecture is ready as the final canonical loop baseline.

Next work should define implementation schemas and a Markdown-first vertical slice rather than adding more architectural stages.
