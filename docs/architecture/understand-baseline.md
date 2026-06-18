# Understand Baseline

This document defines the v1 baseline for the `understand` stage.

`understand` turns source-grounded ingest artifacts into structured knowledge candidates.

It does not create durable knowledge records.

## Primary Purpose

The primary purpose of `understand` is to convert located source material into explicit meaning units without losing evidence grounding.

Ingest can tell the system where information is.

Understand tells the system what kind of knowledge may be present there.

The key shift is:

```text
retrievable source unit -> evidence-grounded knowledge candidate
```

This is the stage where raw sections, pages, transcript spans, image regions, or wiki blocks become candidate claims, decisions, concepts, procedures, questions, constraints, or bounded summaries.

## Expected Results

Understand should produce:

- knowledge candidates with stable kinds;
- evidence refs for every candidate;
- ambiguity notes when interpretation is uncertain;
- confidence notes that explain extraction quality;
- review requests for risky or unclear candidates;
- bounded summaries that help navigation but do not replace source evidence;
- model/generator metadata when extraction is model-assisted.

The expected output is not "the answer."

The expected output is a structured candidate set that later stages can connect, retrieve, reason over, verify, and curate.

## Expected Effects

Understand improves the system in these ways:

| Effect | Why it matters |
| --- | --- |
| Better retrieval units | The system can search for claims, decisions, concepts, procedures, and questions, not only chunks |
| Stronger grounding | Every extracted meaning unit keeps source and access-unit evidence refs |
| Less noisy memory | Interpretation remains candidate-level until validation and curation |
| Better conflict handling | Claims and decisions become explicit enough for later contradiction checks |
| Better time awareness | Candidates can carry source version and validity metadata |
| Better human review | Ambiguity and review requests make uncertain extraction visible |
| Model independence | Deterministic and model-assisted extraction can share the same schema |

The practical effect is that Knowledge Pools becomes more than a search index.

It becomes a system that can prepare source-grounded meaning for graph connection and later reasoning.

## Stage Boundary

```text
ingest = preserve, normalize, segment, locate, classify, and propose
understand = interpret, extract knowledge units, align evidence, and prepare meaning for connection
connect = relate candidates to existing knowledge records and graph context
```

Understand starts only after ingest has produced source records, manifests, access units, preview refs, taxonomy assignments, and validation results.

Understand ends before graph relationship decisions become durable.

## Core Rule

Understanding output is always candidate output.

The stage may say:

- "this passage appears to express a claim";
- "this section appears to define a concept";
- "this paragraph appears to imply a decision";
- "this procedure appears to have ordered steps";
- "this question appears unresolved";
- "this candidate needs review."

It must not say:

- "this is now durable truth";
- "this replaces an older record";
- "this relation is accepted";
- "this source can be ignored because the summary is enough."

## Inputs

Required inputs:

- `source_id`;
- `source_version_id`;
- `source_manifest_ref`;
- `access_unit_refs`;
- `preview_refs`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `ingest_artifact_ref`;
- `validation_status`;
- parser or processor version refs.

Optional inputs:

- shallow ingest candidates;
- wiki signals;
- media-derived signals;
- source-level summary preview refs;
- user-provided extraction instructions;
- project context envelope.

## Outputs

The primary output is an `UnderstandingArtifact`.

Recommended shape:

```json
{
  "artifact_id": "ua_2026_06_19_001",
  "artifact_type": "understanding_artifact",
  "schema_version": "0.1.0",
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "source_manifest_ref": "manifest_srcv_md_sha256_ab12cd34ef90",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "generator": {
    "kind": "deterministic_or_model_assisted",
    "name": "understand-v1",
    "version": "0.1.0",
    "config_hash": "sha256:..."
  },
  "candidate_refs": ["kc_claim_001", "kc_decision_001"],
  "ambiguity_refs": ["amb_001"],
  "review_refs": ["review_req_001"],
  "created_at": "2026-06-19T00:00:00Z"
}
```

The artifact points to candidates. It should not embed long source text.

## V1 Workflow

The first implementation should be deterministic-first and local-file friendly.

Recommended workflow:

```text
load ingest artifact
  -> validate handoff refs
  -> resolve access units
  -> read exact source units
  -> run structural extractors
  -> optionally run model-assisted extractors
  -> normalize candidates
  -> attach evidence refs
  -> emit ambiguity and review artifacts
  -> validate output schemas
  -> write understanding artifact
  -> emit trace
```

V1 should succeed without a model adapter.

Model-assisted extraction can improve recall later, but the minimum useful path is structural extraction from Markdown/text access units.

## V1 Artifact Layout

The local MVP can store understand outputs inside a run workspace.

Example:

```text
knowledge/
  runs/
    run_001/
      understand/
        understanding-artifact.json
        candidates/
          kc_claim_001.json
          kc_decision_001.json
        ambiguity/
          amb_001.json
        review/
          review_req_001.json
        traces/
          tool-calls.jsonl
```

This layout is an implementation detail, but every file should still follow the artifact schemas.

OpenSearch projections may point to these artifacts later, but the artifact files remain the source of truth for understand output.

## Knowledge Candidate Types

V1 candidate kinds:

| Candidate kind | Meaning |
| --- | --- |
| `claim_candidate` | A statement that may be true, false, scoped, or time-bound |
| `decision_candidate` | A possible decision with rationale or tradeoffs |
| `concept_candidate` | A named idea, entity, term, or domain object |
| `procedure_candidate` | A reusable workflow, method, or ordered set of steps |
| `question_candidate` | An unresolved or explicitly asked question |
| `constraint_candidate` | A rule, limitation, policy, or requirement |
| `summary_candidate` | A bounded interpretive summary of a source unit |

Candidates should use stable fields:

```json
{
  "candidate_id": "kc_claim_001",
  "candidate_kind": "claim_candidate",
  "status": "candidate",
  "statement_ref": "artifact://understanding/kc_claim_001/statement",
  "short_label": "OpenSearch is a retrieval projection, not source truth",
  "evidence_refs": ["src_path_a91c72#au_003"],
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "confidence": 0.74,
  "ambiguity_refs": [],
  "requires_review": true
}
```

Long statements, rationales, extracted steps, and summaries should live in artifact storage.

OpenSearch should index refs, labels, types, confidence, taxonomy metadata, and evidence refs.

## Evidence Alignment

Every candidate must link back to evidence.

Evidence refs should identify:

- source id;
- source version id;
- access unit id;
- locator details when available;
- source manifest ref;
- extraction method;
- confidence or quality note.

Examples:

```text
src_path_a91c72#heading:introduction
srcv_pdf_sha256_ab12cd34ef90#page_003_block_012
srcv_mp4_sha256_ab12cd34ef90#time_00045000_00062000
```

If a candidate is inferred from multiple spans, preserve all supporting refs.

If support is weak, mark it as ambiguity instead of pretending it is grounded.

## Extraction Levels

Use three levels to keep implementation incremental.

### Level 1: Structural Understanding

Model-free or deterministic where possible.

Examples:

- headings that define concepts;
- explicit `Decision:` blocks;
- question headings;
- ordered lists that look like procedures;
- glossary terms;
- wiki-style definitions.

V1 should start here.

Recommended Markdown/text rules:

| Source pattern | Candidate |
| --- | --- |
| Heading starts with `Decision`, `ADR`, or `We decided` | `decision_candidate` |
| Heading starts with `Question`, `Open Question`, or ends with `?` | `question_candidate` |
| Heading starts with `Concept`, `Definition`, or glossary-like term | `concept_candidate` |
| Ordered list under workflow/procedure-like heading | `procedure_candidate` |
| Sentence contains requirement words such as `must`, `should`, `cannot`, `required` | `constraint_candidate` |
| Short declarative paragraph under architecture/design heading | `claim_candidate` |

These rules should be conservative.

If a rule fires but evidence is weak, emit a candidate with low confidence and a review request instead of skipping the uncertainty.

### Level 2: Semantic Candidate Extraction

May use a model adapter, but output must follow schema.

Examples:

- implied claims;
- rationale behind a decision;
- constraints in prose;
- unresolved uncertainty;
- procedure preconditions and failure modes.

### Level 3: Cross-Source Interpretation

Mostly deferred to `connect`.

Understand may propose possible relation hints, but it should not finalize support, contradiction, dependency, or supersession across existing records.

## Model Independence

Understand should be LLM-optional.

The core architecture should depend on:

- typed inputs;
- explicit schemas;
- evidence refs;
- deterministic validators;
- model adapter metadata when a model is used.

It should not depend on:

- provider-specific chat history;
- hidden model memory;
- unstructured prose responses;
- model-specific confidence as the only quality signal.

If a model is used, record:

- adapter name;
- model family or runtime class;
- prompt or instruction version;
- config hash;
- input artifact refs;
- output artifact refs.

## Tool Access

Understand uses shared tool ports from [Agent Tool Pool](agent-tool-pool.md).

The default `understand` tool set should allow:

- reading ingest artifacts and source access units;
- validating taxonomy and schemas;
- emitting knowledge candidates, ambiguity notes, and review requests;
- writing understanding artifacts;
- optionally using a model adapter for structured extraction.

It should not allow:

- durable memory writes;
- curation decisions;
- source tombstones or restore operations;
- rollback events;
- lifecycle mutation of existing records.

Concrete V1 tool sequence:

| Step | Tool ports |
| --- | --- |
| Read handoff | `artifact.read`, `schema.validate` |
| Resolve evidence | `source.locate`, `source.read` |
| Validate taxonomy refs | `taxonomy.read`, `taxonomy.validate` |
| Emit candidates | `candidate.emit`, `artifact.write` |
| Emit uncertainty | `ambiguity.emit`, `review.request`, `artifact.write` |
| Validate output | `schema.validate` |
| Trace execution | `audit.trace` |

Optional model-assisted extraction uses `model.complete`, but its output must pass the same schema validation.

## Ambiguity and Review

Understand should preserve uncertainty.

Use ambiguity notes when:

- the source has multiple possible meanings;
- evidence is incomplete;
- a statement is time-sensitive;
- a claim may be scoped to a project or context;
- the candidate is inferred rather than explicit;
- the candidate depends on generated OCR, transcript, or summary quality.

Review requests should identify:

- candidate ref;
- evidence refs;
- reason for review;
- suggested reviewer role;
- blocking or non-blocking status.

Recommended ambiguity shape:

```json
{
  "ambiguity_id": "amb_001",
  "target_ref": "kc_claim_001",
  "ambiguity_kind": "weak_evidence",
  "description_ref": "artifact://understanding/amb_001/description",
  "evidence_refs": ["src_path_a91c72#au_003"],
  "severity": "medium",
  "blocks_connect": false
}
```

Recommended review request shape:

```json
{
  "review_request_id": "review_req_001",
  "target_ref": "kc_claim_001",
  "review_kind": "human_check",
  "reason": "Candidate was inferred from wording rather than explicit statement.",
  "evidence_refs": ["src_path_a91c72#au_003"],
  "suggested_reviewer_role": "domain_owner",
  "blocking": false
}
```

The full explanation text can live behind `description_ref` when it is long.

## Media-Specific Understanding

Understand reads different media through access units and previews.

| Media | Understand focus |
| --- | --- |
| Markdown/text | claims, decisions, concepts, procedures, questions, wiki definitions |
| Image | OCR text candidates, visual labels, depicted entities, uncertain regions |
| Audio/WAV | transcript claims, speaker or segment notes when available, unresolved audio quality |
| Video/MP4 | transcript spans, scene-level concepts, keyframe labels, temporal evidence refs |
| PDF | page/block claims, tables, figures, citations, section summaries |

Media-derived candidates must keep locator refs such as page, bbox, time range, transcript span, or frame refs.

## Validation Rules

An understanding artifact is valid only if:

- every candidate has at least one evidence ref;
- every evidence ref resolves to a known source version and access unit;
- every candidate has a candidate kind and status;
- every generated field has generator metadata;
- long generated text is stored outside OpenSearch;
- candidates remain candidates;
- taxonomy refs are present when taxonomy classification is used;
- uncertainty is recorded when evidence is weak.

Failure should be explicit.

Recommended failure classes:

- `missing_ingest_artifact`;
- `invalid_handoff`;
- `unresolved_source_ref`;
- `unresolved_access_unit_ref`;
- `taxonomy_validation_failed`;
- `candidate_schema_invalid`;
- `missing_evidence_ref`;
- `model_output_invalid`;
- `permission_required`.

The agent should write a failed understanding artifact or trace event rather than silently producing partial output.

## Quality Bar

Understand quality should be measured before moving to `connect`.

Minimum checks:

- candidate count by kind;
- percent of candidates with evidence refs;
- percent of candidates requiring review;
- number of unresolved evidence refs;
- number of schema validation failures;
- number of candidates created only from generated summaries;
- number of candidates with weak or inferred support.

V1 should prefer precision over recall.

It is better to emit fewer well-grounded candidates than many vague candidates that make connect and verification noisy.

## Handoff to Connect

Connect receives:

- understanding artifact refs;
- knowledge candidate refs;
- evidence refs;
- taxonomy refs;
- ambiguity notes;
- candidate confidence;
- relation hints when present.

Connect is responsible for:

- matching candidates to existing records;
- proposing support, contradiction, supersession, dependency, or duplicate relationships;
- deciding whether graph context changes interpretation;
- preparing candidates for verification and curation.

## Minimal V1 Rule

For v1:

- implement structural understanding first;
- support Markdown/text before other media;
- represent every output as a candidate;
- require evidence refs for every candidate;
- store long generated text outside OpenSearch;
- keep model use behind an adapter;
- validate tool permissions against the shared tool pool;
- emit trace events for every tool call;
- defer cross-source relationship decisions to `connect`.

## Design Rule

Understand does not remember.

Understand creates evidence-grounded candidates that later stages can connect, verify, and curate.
