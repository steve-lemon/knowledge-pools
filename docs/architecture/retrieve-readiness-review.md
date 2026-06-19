# Retrieve Readiness Review

This document performs the final readiness review for the `retrieve` stage before moving into `reason`.

Use it with:

- [Retrieve Baseline](retrieve-baseline.md)
- [Plan to Retrieve Handoff](plan-retrieve-handoff.md)
- [Retrieve to Reason Handoff](retrieve-reason-handoff.md)
- [Media Retrieve Concept Proofs](media-retrieve-concept-proofs.md)
- [Retrieval Agent Spec](../agents/retrieval-agent.md)
- [Agent Tool Pool](agent-tool-pool.md)
- [Stage Data Flow Contract](stage-data-flow-contract.md)

## Readiness Summary

The `retrieve` stage is ready to move forward when it can consume a schema-valid `PlanToRetrieveHandoff`, execute only approved retrieval steps, and produce an auditable `EvidenceBundle` plus `RetrieveToReasonHandoff`.

Current status:

```text
ready_for_reason_baseline: yes
implementation_ready: partial
```

The architecture is ready.

Runtime schemas, local fixtures, and tool implementations are still future implementation work.

## Purpose Check

Retrieve owns:

- loading and validating `PlanToRetrieveHandoff`;
- loading the referenced `RetrievalPlan`;
- executing allowed retrieval modes;
- resolving source, record, graph, preview, index, and access-unit refs;
- fetching bounded evidence units;
- packaging selected evidence into `EvidenceBundle`;
- reporting missing evidence;
- preserving freshness, version, lifecycle, and conflict metadata;
- handing evidence to `reason`.

Retrieve does not own:

- user task understanding;
- retrieval plan creation;
- source/document understanding;
- relationship proposal creation;
- answer synthesis;
- verification;
- durable memory update;
- lifecycle mutation;
- curation.

## Required Outputs

Retrieve must emit:

- `EvidenceBundle`;
- selected `EvidenceRef[]`;
- `EvidenceItem[]`;
- missing evidence notes;
- conflict refs when requested by the plan;
- quality report;
- `RetrieveToReasonHandoff`;
- trace events.

The primary output is not an answer.

It is a bounded evidence package for reasoning.

## Tool Readiness

### Required Ports

| Port | Why it is needed | Boundary |
| --- | --- | --- |
| `artifact.read` | Read handoff and retrieval plan artifacts | Must not infer missing plan intent from raw user text |
| `schema.validate` | Validate handoff, plan, evidence bundle, and output artifacts | Read-only validation |
| `index.search` | Search content-minimal projections | Hits are candidates until resolved |
| `record.search` | Search durable records or candidate records | Must preserve record refs and version status |
| `source.locate` | Resolve source, version, manifest, preview, and access-unit locations | Read-only location resolution |
| `source.read` | Read exact source units when needed | Must respect bounded access units |
| `retrieval.fetch_evidence` | Fetch selected bounded evidence units | No broad source dumps by default |
| `artifact.write` | Write evidence bundle, bounded evidence artifacts, reports, and handoff | Run-local artifact write |
| `audit.trace` | Record retrieval decisions and tool calls | Trace only |

### Optional Ports

| Port | Why it may be useful | Boundary |
| --- | --- | --- |
| `graph.query` | Resolve relationship paths, conflicts, dependencies, or supersession | Read-only graph context |
| `preview.lookup` | Resolve thumbnails, storyboards, waveform previews, summaries, or proxy refs | Inspection aid, not source truth |
| `taxonomy.read` | Resolve allowed evidence types or vocabulary labels | Read-only |
| `model.embed` | Support later vector search or reranking | Optional and schema-bounded |

### Forbidden Ports

| Port | Why forbidden |
| --- | --- |
| `retrieval.plan` | Planning belongs to `plan` |
| `reason.synthesize` | Answer generation belongs to `reason` |
| `verification.check` | Claim audit belongs to `verify` |
| `candidate.emit` | Candidate creation belongs to understand, connect, or update |
| `memory.write` | Durable memory writes belong behind curation |
| `curation.decide` | Curation is a later stage |
| `source.write` | Source creation belongs to ingest |
| `source.tombstone` | Lifecycle mutation is out of scope |
| `delete.create_tombstone` | Deletion lifecycle is out of scope |

## Tool Sequence

Recommended v1 sequence:

```text
artifact.read PlanToRetrieveHandoff
  -> schema.validate handoff
  -> artifact.read RetrievalPlan
  -> schema.validate plan
  -> index.search / record.search / graph.query / preview.lookup
  -> source.locate selected refs
  -> retrieval.fetch_evidence bounded units
  -> source.read exact source units when required
  -> artifact.write bounded evidence artifacts
  -> artifact.write EvidenceBundle
  -> schema.validate EvidenceBundle
  -> artifact.write RetrieveToReasonHandoff
  -> audit.trace
```

`source.read` should normally be reached through `retrieval.fetch_evidence`.

Direct broad source reads should fail unless the plan explicitly allows a bounded whole-source access unit.

## Handoff Readiness

`RetrieveToReasonHandoff` is ready when it includes:

- `evidence_bundle_ref`;
- `evidence_refs`;
- `missing_evidence`;
- `conflict_refs`;
- `quality_report_refs`;
- `validation_status`;
- `trace_refs`.

Reason must be able to start from the handoff without rerunning retrieval or guessing provenance.

## Media Readiness

Media retrieval is acceptable when:

- Markdown retrieves sections, blocks, wiki-link refs, or record refs;
- image retrieval uses image regions, image-level units, OCR spans, or detected labels with provenance;
- audio retrieval uses transcript spans, time ranges, or bounded clip refs;
- video retrieval uses subtitle spans, scene segments, frame ranges, keyframes, or bounded proxy refs;
- PDF retrieval uses pages, sections, blocks, spans, tables, or figure refs;
- previews remain inspection aids unless explicitly selected as derived evidence with `derived_from`.

## Validation Checklist

Before handoff to `reason`:

- `PlanToRetrieveHandoff` validates;
- `RetrievalPlan` resolves and validates;
- every executed retrieval step is allowed by tool grants;
- every selected evidence item has an evidence ref;
- source-grounded evidence includes source id and source version id;
- access-unit evidence resolves through a manifest or locator;
- selected content is bounded;
- missing evidence is explicit;
- conflict refs are included or marked missing when requested;
- freshness, version, lifecycle, and projection filters are preserved;
- preview refs are not treated as source truth;
- evidence bundle schema validates;
- retrieve emits no answer text;
- retrieve writes no durable memory or lifecycle mutation.

## Risk Review

| Risk | Mitigation |
| --- | --- |
| Search hits are mistaken for evidence | Require selected `EvidenceItem` records with resolvable refs |
| Retriever becomes a hidden answer generator | Forbid `reason.synthesize` and final answer artifacts |
| Whole media files are fetched too early | Require bounded access units and retrieval budgets |
| Preview artifacts become source truth | Mark previews as inspection aids and preserve `derived_from` |
| Historical and current versions are mixed | Preserve source version id, `is_current`, and lifecycle status |
| Missing evidence is hidden | Require first-class missing evidence notes |
| Conflict search is skipped silently | Require conflict refs or explicit missing conflict notes |
| Tool permissions drift | Validate every retrieval step against allowed ports |

## Decision

The `retrieve` architecture is ready to hand off to the `reason` stage design.

Next work should define:

- reason stage purpose and boundary;
- `DraftAnswer` or `ProposedAction` schema;
- evidence citation rules;
- reason-to-verify handoff;
- reasoning tool access and validation rules.
