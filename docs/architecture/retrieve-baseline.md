# Retrieve Baseline

This document defines the v1 baseline for the `retrieve` stage.

`retrieve` executes a validated `RetrievalPlan` and gathers source-grounded evidence.

It does not reinterpret the user request.

It does not synthesize answers.

It does not verify claims.

It does not write durable memory.

## Role

The role of `retrieve` is to turn a validated retrieval strategy into a bounded evidence bundle.

It is the evidence acquisition stage of the runtime loop.

It answers this question:

```text
Given this retrieval plan, which source-grounded evidence units should the system use next?
```

It sits between planning and reasoning:

```text
PlanToRetrieveHandoff
  -> retrieve
  -> EvidenceBundle
  -> RetrieveToReasonHandoff
```

Retrieve should:

- load the retrieval plan;
- execute allowed retrieval steps;
- resolve source, record, graph, index, preview, and access-unit refs;
- fetch exact evidence units when required;
- preserve freshness and conflict-search constraints;
- report missing evidence;
- return bounded evidence, not unbounded source dumps;
- make the next stage able to reason without rerunning search.

## Primary Purpose

The primary purpose of `retrieve` is to gather the evidence needed for reasoning without losing provenance.

The stage exists because search hits are not enough for trustworthy reasoning.

Search can say something might be relevant.

Retrieve must say which bounded evidence unit is usable, where it came from, which version it belongs to, and what was missing.

The key shift is:

```text
retrieval plan -> evidence refs + bounded evidence bundle
```

Retrieve is not just search.

Search returns candidates or hits.

Retrieve turns selected hits into traceable evidence refs and bounded source-grounded evidence.

In practical terms, `retrieve` should reduce ambiguity for `reason`.

It should make these things explicit:

- which evidence was selected;
- which retrieval step selected it;
- which source version or record version it belongs to;
- whether it is current, historical, stale, missing, or conflicting;
- whether the evidence is a source unit, record, graph result, preview, or bounded content artifact.

## Non-Goals

Retrieve must not:

- reinterpret raw user intent;
- change retrieval goals silently;
- synthesize final answers;
- verify claim support;
- create knowledge candidates;
- create relationship proposals;
- write durable memory;
- decide curation.

## Expected Results

Retrieve should produce:

- `EvidenceBundle`;
- ranked evidence refs;
- source/access-unit refs;
- record refs when durable records are evidence;
- preview refs when useful for inspection;
- missing evidence notes;
- conflict candidate refs when requested;
- freshness and version metadata;
- quality report;
- `RetrieveToReasonHandoff`;
- trace events.

The most important result is that `reason` can use evidence without rerunning search or guessing provenance.

The expected result is not a natural-language answer.

The expected result is a compact, auditable evidence package that can support or limit a future answer.

## Expected Quality Bar

A good retrieve result should be:

- bounded: it returns pages, sections, regions, transcript spans, frames, records, or graph results instead of whole sources by default;
- source-grounded: every item resolves back to a source, access unit, durable record, or generated artifact with provenance;
- version-aware: current, historical, superseded, stale, or tombstoned material is not mixed silently;
- plan-compliant: every retrieval action maps back to a retrieval step and allowed tool grant;
- explicit about gaps: missing, blocked, or low-confidence evidence is reported instead of hidden;
- media-aware: evidence units preserve the correct locator shape for text, image, audio, video, PDF, graph, or record data;
- reasoning-ready: the handoff contains enough refs and metadata for `reason` to synthesize without broad search.

Media-specific retrieval behavior is validated in [Media Retrieve Concept Proofs](media-retrieve-concept-proofs.md).

## Expected Effects

| Effect | Why it matters |
| --- | --- |
| Better grounding | Reasoning receives evidence refs, not loose search snippets |
| Better provenance | Every evidence item points back to source, record, or access unit |
| Better media handling | Large media retrieval can stay bounded by pages, regions, timestamps, or segments |
| Better conflict handling | Planned contradiction search can surface opposing evidence before reasoning |
| Better failure behavior | Missing evidence is explicit instead of silently ignored |
| Better verification | Later verification can check the same evidence refs |

## Success Criteria

The `retrieve` stage is successful when:

- `PlanToRetrieveHandoff` and `RetrievalPlan` validate;
- the agent executes only approved retrieval modes;
- selected evidence refs resolve;
- bounded content artifacts are created only when needed;
- missing evidence is represented as first-class output;
- conflicts requested by the plan are included or explicitly marked missing;
- the `EvidenceBundle` validates;
- `RetrieveToReasonHandoff` can be consumed by the Reasoning Agent;
- no answer text, durable memory update, or curation decision is produced.

## Stage Boundary

```text
plan = decide what evidence is needed
retrieve = gather and package evidence
reason = synthesize from evidence
```

Retrieve may fetch exact source units.

It must not convert evidence into final answer claims.

## Inputs

Required inputs:

- `PlanToRetrieveHandoff`;
- retrieval plan ref;
- required evidence types;
- freshness scope;
- conflict-search requirement;
- allowed retrieval modes;
- retrieval budget or limits;
- schema refs.

Optional inputs:

- preferred indexes;
- blocked indexes;
- required source refs;
- candidate record refs;
- taxonomy refs;
- graph context refs;
- preview refs.

## Outputs

The primary output is an `EvidenceBundle`.

Recommended shape:

```json
{
  "evidence_bundle_id": "eb_2026_06_19_001",
  "bundle_type": "evidence_bundle",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "retrieval_plan_ref": "artifact://runs/run_001/plan/retrieval-plan.json",
  "freshness_scope": "stable",
  "evidence_refs": [
    "src_md_001#section_001",
    "record://decisions/index-content-policy"
  ],
  "items": [
    {
      "evidence_ref": "src_md_001#section_001",
      "evidence_type": "markdown_section",
      "source_ref": "src_md_001",
      "source_version_id": "srcv_md_sha256_ab12cd34ef90",
      "access_unit_ref": "src_md_001#section_001",
      "rank": 1,
      "retrieval_step_id": "s1",
      "content_ref": "artifact://runs/run_001/retrieve/evidence/src_md_001_section_001.txt",
      "preview_refs": [],
      "is_current": true
    }
  ],
  "missing_evidence": [],
  "conflict_refs": [],
  "quality_report_ref": "artifact://runs/run_001/retrieve/quality-report.json",
  "created_at": "2026-06-19T00:00:00Z"
}
```

Content excerpts should be bounded and stored as artifacts when needed.

Large source content should remain behind refs.

## Retrieval Modes

Recommended v1 modes:

| Mode | Use when |
| --- | --- |
| `source_lookup` | Plan names a source, path, title, or exact access unit |
| `keyword_search` | Plan asks for text or metadata search |
| `record_search` | Plan asks for durable or candidate records |
| `graph_query` | Plan asks for relationships, conflicts, dependencies, or supersession |
| `preview_lookup` | Plan asks for thumbnails, storyboards, waveform previews, summaries, or inspection aids |
| `evidence_fetch` | Search hits need exact source/access-unit content |

Vector search can be added later after source, keyword, and structured retrieval are reliable.

## V1 Workflow

Recommended workflow:

```text
load PlanToRetrieveHandoff
  -> validate handoff schema
  -> load RetrievalPlan
  -> validate retrieval steps against tool grants
  -> execute search and lookup steps
  -> resolve source, record, graph, preview, and access-unit refs
  -> fetch bounded evidence units when required
  -> preserve freshness, version, and conflict metadata
  -> emit missing evidence notes
  -> write EvidenceBundle
  -> create RetrieveToReasonHandoff
  -> emit trace
```

## Tool Access

Required ports:

- `artifact.read`;
- `schema.validate`;
- `index.search`;
- `record.search`;
- `source.locate`;
- `source.read`;
- `retrieval.fetch_evidence`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `graph.query`;
- `preview.lookup`;
- `taxonomy.read`;
- `model.embed`.

Forbidden ports:

- `retrieval.plan`;
- `reason.synthesize`;
- `verification.check`;
- `candidate.emit`;
- `memory.write`;
- `curation.decide`;
- `source.write`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Validation Rules

An evidence bundle is valid only if:

- retrieval plan ref resolves;
- every retrieval step was allowed by tool grants;
- every evidence item has an evidence ref;
- every source evidence item has source id and source version id;
- every access-unit evidence item resolves through a manifest or locator;
- missing evidence is listed explicitly;
- conflict search results are listed when requested;
- freshness status is preserved;
- bounded media fetch constraints are respected;
- output schema validates;
- no answer text is synthesized as the primary output.

## Minimal V1 Rule

For v1:

- consume `PlanToRetrieveHandoff`;
- support `source_lookup`, `keyword_search`, `record_search`, and bounded `evidence_fetch`;
- support `preview_lookup` as inspection metadata, not final evidence;
- emit `EvidenceBundle`;
- emit `RetrieveToReasonHandoff`;
- report missing evidence explicitly;
- do not synthesize answers.

## Design Rule

Retrieve gathers evidence.

Reason uses evidence.

Verify audits evidence usage.
