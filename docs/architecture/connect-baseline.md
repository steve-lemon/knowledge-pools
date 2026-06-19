# Connect Baseline

This document defines the v1 baseline for the `connect` stage.

`connect` turns isolated knowledge candidates into relationship proposals.

It does not create durable graph records.

## Primary Purpose

The primary purpose of `connect` is to make candidate knowledge relational without losing evidence grounding.

Understand tells the system what kind of knowledge may be present in a source.

Connect tells the system how that candidate may relate to existing knowledge.

The key shift is:

```text
evidence-grounded candidate -> evidence-grounded relationship proposal
```

## Stage Role

`connect` is the bridge between isolated candidate extraction and graph-aware knowledge work.

Without `connect`, the system may know that a source contains a claim, decision, concept, or procedure, but it does not know whether that candidate:

- repeats something already known;
- supports an existing claim;
- conflicts with an older decision;
- depends on another concept or procedure;
- supersedes stale knowledge;
- mentions a known entity, source, or project;
- applies only to a specific context.

The role of this stage is to create those possible links as inspectable proposals.

It prepares the system for verification, curation, retrieval, and graph traversal without pretending that the links are already true.

## Why This Stage Exists

`understand` creates candidate meaning units.

That is useful, but candidate units are still isolated.

If the system stops there, it can answer:

```text
What did this source appear to say?
```

It cannot reliably answer:

```text
Is this new?
Does it conflict with what we already know?
What does this decision depend on?
Which older record might this replace?
Which concept does this candidate mention?
```

`connect` exists to turn candidate memory into relational memory.

It is the first stage where the system starts to see knowledge as a graph, while still keeping every edge provisional.

## Expected Results

Connect should produce:

- duplicate proposals;
- support proposals;
- contradiction proposals;
- dependency proposals;
- supersession proposals;
- mention or applies-to proposals;
- unresolved relation notes;
- review requests for risky relationships;
- a `ConnectionArtifact` that groups relation proposal refs.

The expected output is not a verified graph.

The expected output is a structured set of relationship proposals that later stages can verify, curate, and index.

## Expected Effects

Connect improves the system in these ways:

| Effect | Why it matters |
| --- | --- |
| Duplicate control | New candidates can be compared against existing candidates or records before memory becomes noisy |
| Conflict visibility | Possible contradictions become explicit proposals instead of hidden surprises |
| Better retrieval paths | Retrieval can later use proposed or accepted edges, not only keyword or vector similarity |
| Temporal awareness | Supersession proposals help identify stale decisions and replaced assumptions |
| Safer graph growth | Edges are proposed before they become durable graph records |
| Better verification | Verifier receives concrete relationship claims to check against evidence |
| Better curation | Human or system curation can inspect why a relation was proposed |

The practical effect is that Knowledge Pools can move from a list of extracted candidates toward an inspectable knowledge graph.

It does this without letting the graph mutate itself automatically.

## Success Criteria

The `connect` stage is successful when:

- every emitted relationship proposal has resolvable endpoints;
- every proposal keeps source evidence or an explicit indirect-evidence rationale;
- relation types are valid under the active taxonomy version;
- uncertain relationships are marked for review;
- duplicate and conflict candidates are visible;
- no durable graph edge is written by this stage;
- downstream `verify` can audit each proposal.

## Non-Goals

The `connect` stage is not responsible for:

- deciding whether a relationship is true;
- resolving contradictions;
- accepting graph edges;
- deleting or superseding durable records;
- creating new source interpretations;
- answering user questions;
- writing durable memory.

## Stage Boundary

```text
understand = interpret, extract knowledge units, align evidence, and prepare meaning for connection
connect = relate candidates to existing records and graph context
verify = check whether proposed relationships and claims are supported
```

The detailed boundary is defined in [Understand and Connect Boundary](understand-connect-boundary.md).

The concrete handoff is defined in [Understand to Connect Handoff](understand-connect-handoff.md).

Media-specific concept proofs are defined in [Media Connect Concept Proofs](media-connect-concept-proofs.md).

## Core Rule

Connection output is always proposal output.

The stage may say:

- "this candidate may duplicate this existing record";
- "this candidate appears to support that claim";
- "this candidate may contradict that decision";
- "this candidate may supersede an older candidate";
- "this candidate needs review before graph insertion."

It must not say:

- "this relation is now accepted";
- "this candidate is now durable knowledge";
- "this older record is replaced";
- "this contradiction is resolved."

## Inputs

Required inputs:

- `understanding_artifact_ref`;
- `knowledge_candidate_refs`;
- `quality_report_ref`;
- `taxonomy_bundle_id`;
- `taxonomy_version`;
- `source_id`;
- `source_version_id`;
- candidate evidence refs;
- existing record or graph search access.

Optional inputs:

- ambiguity refs;
- review refs;
- relation hints;
- candidate index projection refs;
- existing graph neighborhood refs;
- project context envelope.

## Outputs

The primary output is a `ConnectionArtifact`.

Recommended shape:

```json
{
  "artifact_id": "ca_2026_06_19_001",
  "artifact_type": "connection_artifact",
  "schema_version": "0.1.0",
  "run_id": "run_001",
  "understanding_artifact_ref": "artifact://runs/run_001/understand/understanding-artifact.json",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "relationship_proposal_refs": [
    "artifact://runs/run_001/connect/relations/rp_supports_001.json"
  ],
  "duplicate_candidate_refs": [],
  "unresolved_relation_refs": [],
  "review_refs": [],
  "quality_report_ref": "artifact://runs/run_001/connect/quality-report.json",
  "created_at": "2026-06-19T00:00:00Z"
}
```

## Relationship Proposal

Recommended shape:

```json
{
  "proposal_id": "rp_supports_001",
  "proposal_kind": "relationship_proposal",
  "relation_type": "supports",
  "status": "candidate",
  "from_ref": "artifact://runs/run_001/understand/candidates/kc_claim_001.json",
  "to_ref": "record://claims/claim_042",
  "evidence_refs": [
    "src_path_a91c72#section_003"
  ],
  "source_id": "src_path_a91c72",
  "source_version_id": "srcv_md_sha256_ab12cd34ef90",
  "taxonomy_bundle_id": "knowledge-pools-core",
  "taxonomy_version": "0.1.0",
  "confidence": 0.72,
  "rationale_ref": "artifact://runs/run_001/connect/rationale/rp_supports_001.md",
  "ambiguity_refs": [],
  "requires_review": true
}
```

Relation proposal text and rationale should live behind refs when long.

OpenSearch may index relation proposal refs, relation type, endpoints, confidence, taxonomy metadata, and evidence refs. It should not store long generated rationale as unrestricted content.

## V1 Relation Types

V1 relation proposal types:

| Relation type | Meaning |
| --- | --- |
| `duplicates` | Candidate appears equivalent or near-equivalent to another candidate or record |
| `supports` | Candidate appears to support another candidate or record |
| `contradicts` | Candidate appears to conflict with another candidate or record |
| `depends_on` | Candidate appears to require another candidate, record, or concept |
| `supersedes` | Candidate appears to replace an older candidate or record |
| `mentions` | Candidate refers to a concept, entity, source, or record |
| `applies_to` | Candidate appears scoped to a concept, entity, project, or context |

The taxonomy bundle should define which relation types are allowed.

## V1 Workflow

The first implementation should be deterministic-first and local-file friendly.

Recommended workflow:

```text
load understand-to-connect handoff
  -> validate candidate refs
  -> load candidate records
  -> load taxonomy relation rules
  -> search existing records and graph neighborhoods
  -> propose local duplicate relations
  -> propose relationship proposals
  -> attach evidence refs and rationale refs
  -> emit ambiguity and review artifacts
  -> validate output schemas
  -> write connection artifact
  -> emit trace
```

V1 can start with local fixture search and deterministic matching.

Model-assisted relation proposal can improve recall later, but its output must pass schema and evidence validation.

## Matching Strategy

Initial matching should be conservative.

Recommended signals:

- normalized short label overlap;
- candidate kind compatibility;
- taxonomy category compatibility;
- shared source or access-unit refs;
- explicit wiki links or mentions;
- existing concept aliases;
- temporal/version metadata;
- relation hints from understand.

Avoid using semantic similarity alone as a reason to accept a relation.

Similarity can produce a proposal, not a durable edge.

## Validation Rules

A connection artifact is valid only if:

- every relation proposal has `from_ref` and `to_ref`;
- every endpoint ref resolves or is marked unresolved;
- every proposal has at least one evidence ref or rationale for why evidence is indirect;
- every relation type is allowed by the taxonomy version;
- every proposal status remains `candidate`;
- confidence is numeric;
- ambiguity or review is recorded when evidence is weak;
- no durable graph record is written.

Recommended failure classes:

- `invalid_handoff`;
- `missing_understanding_artifact`;
- `unresolved_candidate_ref`;
- `unresolved_endpoint_ref`;
- `taxonomy_relation_not_allowed`;
- `relationship_schema_invalid`;
- `missing_evidence_ref`;
- `model_output_invalid`;
- `permission_required`.

## Quality Bar

Connect quality should be measured before moving to verification.

Minimum checks:

- relation proposal count by type;
- duplicate proposal count;
- unresolved endpoint count;
- schema failure count;
- percent of proposals with evidence refs;
- percent requiring review;
- number of proposals created only from similarity.

V1 should prefer precision over recall.

It is better to emit fewer relation proposals than to make the graph noisy.

## Handoff to Verify

Verify receives:

- connection artifact ref;
- relationship proposal refs;
- conflict candidate refs;
- unresolved candidate refs;
- evidence refs;
- ambiguity and review refs;
- taxonomy refs;
- trace refs.

Verify is responsible for checking whether proposed relationships are supported by evidence.

## Minimal V1 Rule

For v1:

- consume `UnderstandToConnectHandoff`;
- support Markdown/text candidates first;
- propose local duplicates and simple mentions first;
- preserve evidence refs on every relation proposal;
- keep relation proposals as candidates;
- validate relation type against taxonomy;
- emit trace events;
- defer truth, contradiction resolution, graph writes, and memory writes to later stages.

## Design Rule

Connect does not decide truth.

Connect proposes edges that verification and curation can inspect.
