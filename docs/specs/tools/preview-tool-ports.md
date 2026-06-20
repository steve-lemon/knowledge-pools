# Spec: Preview Tool Ports

This spec defines preview and derived navigation tool ports.

## Purpose

Define implementation-facing contracts for:

- `preview.create`;
- preview artifact views;
- derived-from and generator metadata rules.

## Scope

`preview.create` creates derived artifacts that help humans, agents, and
retrieval planners browse or triage source material.

Markdown-first previews include:

- heading outline;
- heading tree;
- short source summary;
- section summary refs for long files.

Future media previews may include thumbnails, page images, waveform previews,
spectrogram previews, poster frames, storyboards, and low-bitrate proxies.

## Non-Goals

- No original source storage.
- No access-unit creation.
- No durable knowledge record creation.
- No accepted semantic claim extraction.
- No index projection write.
- No final evidence fetch.
- No provider-specific model adapter contract.

## Dependencies

This spec depends on:

- [Common Tool Port Contracts](common-tool-port-contracts.md);
- [Source Tool Ports](source-tool-ports.md);
- [Document Structure Tool Ports](document-structure-tool-ports.md);
- [LLM Gateway Contract](llm-gateway-contract.md), only when a preview generator uses model summarization.

## Core Rules

Preview artifacts are navigation aids.

They must not replace source evidence.

Rules:

- every preview must have a `derivedFrom` chain back to a source version, manifest, access unit, or parser output;
- previews must stay under the same source-version boundary when possible;
- preview IDs must include source version, target scope, generator identity, and config hash;
- large preview content must be stored as an object or artifact, not copied into index projections;
- index projections may store preview refs and small preview metadata only;
- answers and verification must still fetch exact source access units unless a later verifier explicitly accepts a derived preview as evidence with its derivation chain.

## Side Effects

| Port | Side effects |
| --- | --- |
| `preview.create` | `read` for source/manifest/access-unit refs, `writeImmutable` when storing preview artifacts |

All calls also produce trace entries through the registry or `audit.trace`.

## `preview.create`

Purpose:

Create derived preview artifacts from source versions, manifests, access units,
or parsed document structure.

Typical callers:

- ingest commands creating optional navigation aids;
- ingestion agents preparing preview refs for understand;
- retrieval planning tools that need inspectable preview refs;
- regression fixture generators for Markdown outline and summary previews.

### Input

```ts
export type PreviewKind =
  | "headingOutline"
  | "headingTree"
  | "shortSourceSummary"
  | "sectionSummary"
  | "thumbnail"
  | "pageThumbnail"
  | "waveform"
  | "spectrogram"
  | "posterFrame"
  | "storyboard"
  | string;

export type PreviewGeneratorKind =
  | "deterministic"
  | "modelAssisted"
  | "mediaRenderer"
  | "externalProvider";

export interface PreviewCreateInput {
  sourceVersionRef: RefString;
  manifestRef?: RefString;
  accessUnitRefs?: RefString[];
  parseResultRef?: RefString;
  parsedDocument?: ParsedDocument;
  previewKinds: PreviewKind[];
  generator: PreviewGeneratorPolicy;
  persistPreview: boolean;
  maxPreviewBytes?: number;
  maxSummaryChars?: number;
}

export interface PreviewGeneratorPolicy {
  generatorId: string;
  generatorVersion: string;
  generatorKind: PreviewGeneratorKind;
  configHash?: ContentHash;
  modelPolicyRef?: RefString;
  deterministicOnly?: boolean;
}
```

Rules:

- Markdown heading outline and heading tree previews should be deterministic.
- Markdown short summaries may be deterministic or model-assisted.
- model-assisted previews must go through `LlmGateway`, not a provider SDK directly.
- `deterministicOnly = true` rejects model-assisted generation.
- `persistPreview = true` requires an immutable preview-write grant.
- `maxSummaryChars` applies to textual summaries.
- `maxPreviewBytes` applies to serialized preview payloads or binary previews.

### Output

```ts
export interface PreviewCreateOutput {
  repositoryId: RepositoryId;
  sourceRef: RefString;
  sourceVersionRef: RefString;
  manifestRef?: RefString;
  previewArtifacts: PreviewArtifactView[];
  previewRefs: RefString[];
  writeDisposition: "returnedOnly" | "createdPreview" | "reusedExistingPreview";
}

export interface PreviewArtifactView {
  schemaVersion: SchemaVersion;
  repositoryId: RepositoryId;
  previewArtifactId: PreviewArtifactId;
  previewRef: RefString;
  previewKind: PreviewKind;
  sourceVersionRef: RefString;
  derivedFrom: PreviewDerivedFrom[];
  objectPath?: StoragePath;
  artifactRef?: RefString;
  mediaType: MediaType;
  mediaHint: MediaHint;
  contentHash?: ContentHash;
  byteSize?: number;
  generator: PreviewGeneratorRecord;
  accessPolicy: PreviewAccessPolicy;
  createdAt: IsoDateTime;
}

export interface PreviewDerivedFrom {
  ref: RefString;
  role:
    | "sourceVersion"
    | "manifest"
    | "accessUnit"
    | "parsedDocument"
    | "modelInput"
    | "generatorConfig";
}

export interface PreviewGeneratorRecord {
  generatorId: string;
  generatorVersion: string;
  generatorKind: PreviewGeneratorKind;
  configHash: ContentHash;
  modelInfo?: {
    gatewayId: string;
    providerId: string;
    modelId: string;
    adapterVersion: string;
  };
}

export interface PreviewAccessPolicy {
  inspectionAidOnly: boolean;
  mayUseAsEvidence: boolean;
  contentMinimalIndexOnly: boolean;
  redactionApplied?: boolean;
}
```

Rules:

- `inspectionAidOnly` defaults to `true`.
- `mayUseAsEvidence` defaults to `false`.
- `contentMinimalIndexOnly` defaults to `true`.
- `objectPath` points to preview storage when the preview payload is persisted under the source-version `previews/` or `derived/` layout.
- `artifactRef` points to artifact storage when the preview is stored as a validated artifact.
- preview refs must be stable for identical source version, target scope, generator, and config.

### Markdown-First Preview Kinds

| Preview kind | Input | Output policy |
| --- | --- | --- |
| `headingOutline` | parsed headings | deterministic outline with heading labels and source locators |
| `headingTree` | parsed headings and blocks | deterministic hierarchy with heading/access-unit refs |
| `shortSourceSummary` | source or selected access units | bounded summary with source/access-unit refs |
| `sectionSummary` | selected section access units | bounded summary per section, stored as preview/artifact refs |

Markdown preview rules:

- heading previews must not require a model.
- summary previews must cite source or access-unit refs used as input.
- long summaries must be stored outside index projections.
- summaries remain navigation aids unless later verification accepts them as derived evidence.

### Validation Rules

- `sourceVersionRef` must resolve through `source.locate`.
- every manifest or access-unit ref must belong to the source version.
- every preview must include at least one `derivedFrom` source/version/access-unit ref.
- generator config hash must be present or computable.
- persisted previews must include content hash and byte size.
- preview payload must satisfy `maxPreviewBytes` when provided.
- summary text must satisfy `maxSummaryChars` when provided.
- model-assisted generation must include model info and input refs.

### Failure Modes

- unresolved source, manifest, or access-unit ref;
- requested preview kind is unsupported for the media type;
- generator policy requires deterministic output but requested kind needs a model;
- model-assisted preview fails through `LlmGateway`;
- preview payload is too large for policy;
- persisted preview path already exists for a different payload;
- preview write requested but denied.

## Persisted JSON Example

Markdown outline preview:

```json
{
  "schema_version": "0.1.0",
  "repository_id": "repo_main",
  "preview_artifact_id": "preview_heading_outline_srcv_md_sha256_ab12cd34_generator_ab12",
  "preview_ref": "preview:preview_heading_outline_srcv_md_sha256_ab12cd34_generator_ab12",
  "preview_kind": "headingOutline",
  "source_version_ref": "sourceVersion:srcv_md_sha256_ab12cd34ef90",
  "derived_from": [
    {
      "ref": "sourceVersion:srcv_md_sha256_ab12cd34ef90",
      "role": "sourceVersion"
    },
    {
      "ref": "manifest:manifest_srcv_md_sha256_ab12cd34ef90_parser_v1",
      "role": "manifest"
    }
  ],
  "object_path": "knowledge/sources/src_path_a91c72/versions/srcv_md_sha256_ab12cd34ef90/previews/outline.json",
  "media_type": "application/json",
  "media_hint": "json",
  "content_hash": "sha256:ab12cd34...",
  "byte_size": 456,
  "generator": {
    "generator_id": "markdown_outline",
    "generator_version": "0.1.0",
    "generator_kind": "deterministic",
    "config_hash": "sha256:cd34ef56..."
  },
  "access_policy": {
    "inspection_aid_only": true,
    "may_use_as_evidence": false,
    "content_minimal_index_only": true
  },
  "created_at": "2026-06-20T00:00:00Z"
}
```

## Open Questions

- Should short Markdown summaries be P2-only previews, or should the P0/P1 loop
  allow them when generated by the existing `SummaryAgent` prototype?
- Should `preview.lookup` be a separate read-only port, or should source/artifact
  lookup cover preview refs until retrieval specs need it?
- Should preview access policy reuse a shared access-control contract once that
  exists, or remain embedded in preview metadata for Markdown-first validation?

## Acceptance Criteria

This preview spec is ready when:

- `preview.create` can create deterministic Markdown outline and heading-tree previews;
- optional summary previews remain bounded and source-ref grounded;
- every preview records `derivedFrom`, generator metadata, hash, and access policy;
- preview artifacts are stored outside index projections;
- previews are clearly marked as navigation aids, not source evidence.
