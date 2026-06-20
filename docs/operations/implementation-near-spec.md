# Implementation-Near Specification Preparation

This document defines the next work mode after the architecture loop has been documented.

The project is not moving into broad implementation yet.

It is moving into implementation-near specification: detailed enough for implementation, but still maintained as documentation.

Use [Implementation Specification Architecture](../architecture/implementation-spec-architecture.md) to organize module, infrastructure, agent, tool, interface, and validation specs.

## Purpose

Turn the architecture into a precise Markdown-first implementation specification.

The specification should answer:

- what modules will exist;
- what each module owns;
- what each CLI command should do;
- which records and artifacts are written;
- which TypeScript types are required;
- which tool ports are used;
- which validation gates block the next stage;
- which behavior is intentionally deferred.

It should not create runtime code, external infrastructure, or broad media support yet.

## Scope

The first detailed specification covers only Markdown/text files.

The target loop remains:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update -> curation -> evaluate
```

The implementation-near spec should describe a local, inspectable runtime:

- local filesystem-compatible source storage;
- local JSON artifacts;
- local run traces;
- OpenSearch-compatible index document shapes;
- deterministic Markdown parsing;
- optional model calls only behind explicit tool ports;
- no hidden provider session state;
- no durable memory writes before `curation`.

## Non-Goals

Do not specify production-grade implementation details yet for:

- real OpenSearch deployment;
- graph database deployment;
- vector database integration;
- image, audio, video, or PDF parsing;
- distributed queues;
- multi-repository clustering;
- full ACL and permission systems;
- production UI;
- provider-specific LLM session management.

These can remain extension tracks after the Markdown-first contract is stable.

## Specification Outputs

The next documentation pass should produce or refine these implementation-facing specs.

| Spec | Purpose |
| --- | --- |
| Implementation specification architecture | Defines the overall module, infrastructure, agent, tool, contract, and validation map. |
| Module layout spec | Defines the future TypeScript package boundaries and ownership. |
| CLI command spec | Defines command names, arguments, outputs, and failure behavior. |
| Runtime store spec | Defines local directories, JSON record formats, and lifecycle rules. |
| Type contract spec | Collects TypeScript interfaces that implementation must satisfy. |
| Stage artifact specs | Defines one payload schema per stage artifact. |
| Handoff specs | Defines exact transition payloads between stages. |
| Tool port specs | Defines provider-independent tool interfaces. |
| Validation spec | Defines schema, ref, provenance, and evidence checks. |
| Fixture spec | Defines Markdown fixture documents and expected outputs. |
| Evaluation spec | Defines how traces and regression results are judged. |

## Future Module Layout Target

Use [Implementation Specification Architecture](../architecture/implementation-spec-architecture.md) as the canonical future runtime folder model.

This document defines the work mode.

The architecture document defines the module grouping and folder ownership.

## Local Data Layout Target

This is also a specification target.

```text
knowledge/
  sources/
    original/
    versions/
    manifests/
  artifacts/
    ingest/
    understand/
    connect/
    plan/
    retrieve/
    reason/
    verify/
    update/
    curation/
    evaluate/
  runs/
  sessions/
  traces/
  index-documents/
  taxonomy/
fixtures/
  markdown/
  expected/
```

## CLI Specification Target

Initial commands should be defined as contracts before implementation.

```text
kp ingest <path>
kp understand <run-id>
kp connect <run-id>
kp plan "<question>"
kp retrieve <plan-id>
kp ask "<question>"
kp verify <run-id>
kp update <run-id>
kp curate <candidate-id>
kp evaluate <run-id>
```

`kp ask` may orchestrate `plan -> retrieve -> reason -> verify` in the Markdown-first MVP.

It should still emit separate artifacts for each stage.

## Command Contract Shape

Every command spec should define:

- intent;
- input arguments;
- required stores;
- required tool ports;
- created records;
- created artifacts;
- created handoffs;
- trace events;
- success output;
- warning output;
- failure output;
- retry behavior;
- examples.

## Markdown-First Runtime Sequence

The detailed spec should make this sequence executable by a future implementation.

```text
kp ingest docs/
  -> SourceRecord
  -> SourceVersion
  -> SourceManifest
  -> AccessUnit[]
  -> IngestArtifact
  -> IngestToUnderstandHandoff

kp understand <run-id>
  -> KnowledgeCandidate[]
  -> UnderstandingArtifact
  -> UnderstandToConnectHandoff

kp connect <run-id>
  -> RelationshipProposal[]
  -> ConnectionArtifact

kp ask "..."
  -> RetrievalPlan
  -> EvidenceBundle
  -> DraftAnswer
  -> VerificationReport
  -> optional UpdateCandidate
  -> EvaluationReport
```

## Type Contract Priorities

Do not invent stage-local shapes where the shared contract already applies.

The implementation-near spec should first reuse:

- `StageName`;
- `AgentName`;
- `ArtifactType`;
- `AgentTask`;
- `ContextEnvelope`;
- `Artifact`;
- `HandoffEnvelope`;
- `TraceEvent`;
- `ValidationSummary`;
- `Provenance`.

Then it should define the Markdown-first payload types:

- `MarkdownSourceRecord`;
- `MarkdownSourceVersion`;
- `MarkdownSourceManifest`;
- `MarkdownAccessUnit`;
- `MarkdownPreviewArtifact`;
- `MarkdownIndexDocument`;
- `MarkdownKnowledgeCandidate`;
- `MarkdownRelationshipProposal`;
- `MarkdownRetrievalPlan`;
- `MarkdownEvidenceBundle`;
- `MarkdownDraftAnswer`;
- `MarkdownVerificationReport`;
- `MarkdownUpdateCandidate`;
- `MarkdownCurationDecision`;
- `MarkdownEvaluationReport`.

## Artifact Boundary Rule

Each stage artifact should be useful on its own.

Handoffs should reference artifacts and required next-stage inputs.

They should not duplicate large payloads.

```text
Artifact = what the stage produced
Handoff = what the next stage may consume
TraceEvent = how it happened
ContextEnvelope = what the agent was allowed to see
```

## Index Boundary Rule

Index documents are retrieval maps, not content stores.

The spec should preserve this rule:

- store source IDs, version IDs, access-unit IDs, and locators;
- store short labels, classifications, hashes, timestamps, and safe previews;
- avoid full raw Markdown body text in index documents;
- fetch exact source text through `source.read` during retrieval.

## Tool Port Priority

Markdown-first specs should prioritize deterministic tools.

| Tool port | Markdown-first role |
| --- | --- |
| `source.locate` | Resolve source, version, and access-unit refs. |
| `source.read` | Read bounded Markdown sections or blocks. |
| `parse.document` | Parse Markdown frontmatter, headings, links, and blocks. |
| `chunk.create` | Create heading-aware access units. |
| `preview.create` | Create outline or short summary preview refs. |
| `index.write` | Write OpenSearch-compatible fixture docs. |
| `index.search` | Search fixture index by source, keyword, taxonomy, and relation. |
| `retrieval.fetch_evidence` | Build bounded evidence bundles from refs. |
| `verification.check` | Check citation and evidence support. |
| `model.complete` | Optional, replaceable, and never the system of record. |

## Validation Gates

A future implementation should not move a run forward when:

- required refs cannot be resolved;
- source hash or version does not match;
- access-unit locator is invalid;
- artifact schema validation fails;
- handoff schema validation fails;
- evidence refs are missing for evidence-required stages;
- cited evidence does not support a generated claim;
- update candidate has no provenance;
- curation decision attempts durable write without accepted status;
- evaluation report cannot locate the run trace.

## Fixture-Driven Acceptance

The next spec should define fixtures before code.

Minimum fixture set:

- one Markdown file with headings and paragraphs;
- one Markdown file with frontmatter;
- one Markdown file with wiki-style links;
- one Markdown file with a decision record;
- one stale or superseded note;
- one unsupported claim scenario;
- one duplicate or overlapping concept scenario.

For each fixture, define expected:

- source record;
- access units;
- candidate records;
- relationship proposals;
- retrieval evidence;
- verification outcome;
- update candidate behavior;
- evaluation signal.

## Readiness Gate For Actual Implementation

Actual implementation should begin only after the spec defines:

- exact local data layout;
- exact CLI command contracts;
- shared TypeScript type bundle;
- Markdown stage payload schemas;
- required tool ports;
- fixture inputs and expected outputs;
- validation and failure behavior;
- first regression checklist.

Until then, this project remains in implementation-near specification mode.
