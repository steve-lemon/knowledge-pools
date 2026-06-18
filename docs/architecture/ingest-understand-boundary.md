# Ingest and Understand Boundary

This document defines the boundary between `ingest` and `understand`.

The goal is to keep ingest powerful enough to preserve structure and provenance, but not so powerful that it silently becomes semantic reasoning.

## Short Answer

The current ingest design is close to a final v1 architecture.

It becomes the final ingest baseline if this boundary is enforced:

```text
ingest = preserve, normalize, segment, locate, classify, and propose
understand = interpret, extract knowledge units, align evidence, and prepare meaning for connection
```

Ingest may create candidates.

Understand decides whether those candidates are meaningful knowledge units.

Connect decides how those units relate to existing knowledge.

## Why the Boundary Matters

The ingest stage now includes:

- taxonomy classification;
- wiki signal extraction;
- access-unit creation;
- preview artifact creation;
- content-minimal index projection;
- graph candidate emission.

That is useful, but it creates a risk:

> ingest may appear to understand the source when it has only parsed and classified it.

This system should avoid treating parser output, generated summaries, or raw candidates as durable knowledge.

## Responsibility Split

| Concern | Ingest | Understand | Connect |
| --- | --- | --- | --- |
| Store original bytes | Yes | No | No |
| Compute source hash | Yes | No | No |
| Detect media type | Yes | No | No |
| Create source record | Yes | No | No |
| Create source manifest | Yes | No | No |
| Create access units | Yes | No | No |
| Create preview artifacts | Yes | No | No |
| Extract headings, links, tags, OCR, transcript refs | Yes | Reads | Reads |
| Apply taxonomy categories to source/access units | Yes | May refine candidates | No |
| Emit entity/relation candidates | Yes, shallow | Yes, semantic | No |
| Extract claims, decisions, procedures, questions | No, except obvious typed markers | Yes | No |
| Resolve ambiguity | No | Yes | May use graph context |
| Decide contradiction, support, supersession | No | Propose | Yes |
| Link to existing knowledge records | No | Propose refs | Yes |
| Create durable knowledge records | No | No | After validation/curation |

## Ingest Outputs

Ingest should output:

- `SourceRecord`;
- `SourceVersion`;
- `SourceManifest`;
- `AccessUnit[]`;
- `PreviewArtifact[]`;
- wiki signals;
- media-derived signals;
- taxonomy category assignments;
- shallow graph candidates;
- content-minimal index documents;
- validation report;
- taxonomy proposals when source structure exposes missing controlled terms.

Ingest should not output durable knowledge records.

## Understand Inputs

Understand reads:

- source records;
- source manifests;
- access units;
- preview artifacts;
- wiki signals;
- shallow ingest candidates;
- taxonomy bundle;
- content-minimal index refs.

Understand may fetch exact source units as needed.

## Understand Outputs

Understand should output an `UnderstandingArtifact`.

Recommended fields:

```json
{
  "artifact_id": "understanding_artifact_01",
  "type": "understanding_result",
  "schema_version": "0.1.0",
  "source_ref": "src_md_001",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "knowledge_candidates": [
    {
      "id": "kc_decision_001",
      "kind": "decision",
      "statement": "Index documents should store refs and metadata, not full source content.",
      "evidence_refs": ["src_md_001#section_001"],
      "confidence": 0.82,
      "status": "candidate"
    }
  ],
  "ambiguities": [],
  "requires_human_review": []
}
```

Long generated text should remain outside OpenSearch. The index should store refs, labels, and metadata only.

## Shallow vs Semantic Candidates

Ingest may emit shallow candidates when they are directly visible from structure.

Examples:

- `[[Target Page]]` becomes a `references` candidate;
- Markdown `# Decision:` heading becomes a possible decision marker;
- PDF citation becomes a citation link candidate;
- image OCR region becomes an OCR access unit;
- audio transcript span becomes a transcript access unit.

Understand emits semantic candidates when interpretation is required.

Examples:

- a paragraph implies a design decision;
- two sections contain conflicting claims;
- a procedure has ordered steps;
- a source expresses uncertainty;
- a statement supersedes an older decision.

## Boundary Rules

1. Ingest preserves and locates source evidence.
2. Ingest may classify with taxonomy but should avoid final semantic commitments.
3. Ingest may emit candidates, but candidates must stay marked as candidates.
4. Understand extracts knowledge units from evidence and records uncertainty.
5. Understand does not create durable memory directly.
6. Connect links understood candidates to existing graph records.
7. Curation decides what becomes durable.

## Handoff Contract

The handoff from ingest to understand should include:

- source id;
- source version id;
- source manifest ref;
- access unit refs;
- preview refs;
- media type and media hint;
- taxonomy bundle id and version;
- parser version;
- source content hash;
- ingest artifact ref;
- validation status.

Understand should be able to reproduce every evidence fetch from these refs.

The concrete handoff artifact is defined in [Ingest to Understand Handoff](ingest-understand-handoff.md).

## Open Questions for Implementation

- Should obvious typed Markdown blocks create initial knowledge candidates during ingest or only markers for understand?
- Should generated summaries be created in ingest as preview artifacts or in understand as interpretation artifacts?
- How much confidence scoring belongs in understand before connect has graph context?
- Should source-level summary previews be regenerated when taxonomy changes?

## V1 Decision

For v1:

- keep summary previews in ingest only as navigation aids;
- keep semantic summaries and knowledge extraction in understand;
- let ingest emit shallow graph candidates only;
- let understand emit knowledge candidates;
- let connect create graph relationship proposals against existing records.
