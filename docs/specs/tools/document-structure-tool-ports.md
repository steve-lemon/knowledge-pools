# Spec: Document Structure Tool Ports

This spec defines deterministic document parsing and chunking tool ports.

## Purpose

Define implementation-facing contracts for:

- `parse.document`;
- `chunk.create`.

## Scope

These ports operate on source versions and produce structural parse results,
source manifests, and access units for Markdown-first validation.

They use the common runtime boundary from
[Common Tool Port Contracts](common-tool-port-contracts.md) and the source view
types from [Source Tool Ports](source-tool-ports.md).

## Non-Goals

- No durable knowledge record creation.
- No relationship or graph proposal acceptance.
- No index projection write.
- No model summary or answer synthesis.
- No media-specific parser beyond Markdown/plain text.

## Dependencies

This spec depends on:

- [Common Tool Port Contracts](common-tool-port-contracts.md);
- [Source Tool Ports](source-tool-ports.md);
- [Markdown-First Implementation Strategy](../../operations/markdown-first-implementation.md).

## Core Rules

- `parse.document` extracts deterministic structure.
- `chunk.create` turns structure into access units and manifest refs.
- Neither port creates durable semantic knowledge.
- Parser-policy changes create new parse output, manifests, and access units,
  not new source versions.
- Chunk-policy changes create new manifest/access-unit IDs, not new source versions.
- Persisted parse and manifest outputs must not inline large source text.

## Side Effects

| Port | Side effects |
| --- | --- |
| `parse.document` | `read` when returning parsed structure, `writeImmutable` only when persisting parser-derived files |
| `chunk.create` | `read` when returning access units, `writeImmutable` when writing a manifest for a parser/chunk policy |

All calls also produce trace entries through the registry or `audit.trace`.

## `parse.document`

Purpose:

Parse Markdown or plain text source bytes into deterministic document structure.

This port extracts structure, not durable meaning. It may identify headings,
frontmatter, paragraphs, links, code blocks, tables, and obvious typed markers,
but it must not create durable knowledge records or graph relationships.

Typical callers:

- ingest commands after `source.write`;
- ingestion agents preparing a source manifest;
- validation harnesses comparing parser output fixtures;
- reprocessing jobs when parser policy changes.

### Input

```ts
export type DocumentParserKind = "markdown" | "plainText";

export interface ParseDocumentInput {
  sourceVersionRef: RefString;
  sourceReadRef?: RefString;
  parserKind: DocumentParserKind;
  parserPolicy: DocumentParserPolicy;
  inputText?: string;
  inputContentHash?: ContentHash;
  persistDerived?: boolean;
}

export interface DocumentParserPolicy {
  parserId: string;
  parserVersion: string;
  normalizeLineEndings: boolean;
  parseFrontmatter: boolean;
  parseWikiLinks: boolean;
  parseMarkdownLinks: boolean;
  parseCodeBlocks: boolean;
  parseTables: boolean;
  maxInputBytes?: number;
}
```

Rules:

- callers should prefer passing `sourceVersionRef`; the port may call `source.read`.
- `inputText` is allowed only when the caller already read and hash-checked the source.
- `inputContentHash`, when provided, must match the source-version hash or the validated read output.
- Markdown parser behavior must be deterministic for the same source bytes and parser policy.
- `persistDerived = true` requires an immutable derived-write grant.

### Output

```ts
export interface ParseDocumentOutput {
  repositoryId: RepositoryId;
  sourceRef: RefString;
  sourceVersionRef: RefString;
  parserPolicyHash: ContentHash;
  document: ParsedDocument;
  derivedRef?: RefString;
  derivedPath?: StoragePath;
}

export interface ParsedDocument {
  mediaType: MediaType;
  mediaHint: MediaHint;
  contentHash: ContentHash;
  byteSize: number;
  lineCount: number;
  frontmatter?: ParsedFrontmatter;
  blocks: ParsedDocumentBlock[];
  links: ParsedDocumentLink[];
  headings: ParsedHeading[];
  warnings: ValidationIssue[];
}

export interface ParsedFrontmatter {
  format: "yaml" | "toml" | "json" | "unknown";
  locator: SourceAccessLocator;
  rawHash: ContentHash;
  keys: string[];
}

export type ParsedDocumentBlockKind =
  | "heading"
  | "paragraph"
  | "list"
  | "blockquote"
  | "codeBlock"
  | "table"
  | "frontmatter"
  | "blank"
  | "thematicBreak";

export interface ParsedDocumentBlock {
  blockId: string;
  kind: ParsedDocumentBlockKind;
  locator: SourceAccessLocator;
  headingPath: string[];
  textHash?: ContentHash;
  languageHint?: string;
  markerKind?: "decision" | "question" | "todo" | "definition" | string;
}

export interface ParsedHeading {
  blockId: string;
  depth: number;
  text: string;
  headingPath: string[];
  locator: SourceAccessLocator;
}

export interface ParsedDocumentLink {
  linkId: string;
  kind: "markdown" | "wiki" | "url" | "reference";
  label: string;
  target: string;
  sourceBlockId: string;
  locator: SourceAccessLocator;
}
```

Rules:

- parsed blocks may contain short labels and hashes but should not duplicate the full source body in persisted artifacts.
- `locator` values must be sufficient for `source.read` or later evidence fetch to return exact source text.
- `headingPath` preserves hierarchy for heading-aware chunking.
- obvious typed markers are hints for ingest/understand, not accepted knowledge candidates.

### Validation Rules

- source-version ref must resolve through `source.locate`.
- source bytes must be read from source storage or supplied with a matching hash.
- parser kind must match supported media hints.
- block locators must be ordered, non-overlapping where the parser claims exclusivity, and inside source bounds.
- heading depth changes must produce a valid heading path.
- links must point to source locators, not generated summary text.

### Failure Modes

- unsupported media type or parser kind;
- source hash mismatch;
- invalid frontmatter syntax when policy requires strict frontmatter;
- parser output has invalid locators;
- derived write requested but denied;
- parser throws on malformed input and cannot recover with warnings.

## `chunk.create`

Purpose:

Create heading-aware access units and a source manifest view from parsed document
structure.

This port turns parser structure into retrievable source units. It owns chunk
boundaries and locators, not semantic interpretation.

Typical callers:

- ingest commands building `SourceManifest`;
- ingestion agents preparing handoff refs;
- fixture generators for expected access units;
- reprocessing jobs after parser-policy or chunk-policy changes.

### Input

```ts
export interface ChunkCreateInput {
  sourceVersionRef: RefString;
  parseResult: ParsedDocument;
  parserPolicyHash: ContentHash;
  chunkPolicy: ChunkPolicy;
  persistManifest: boolean;
}

export interface ChunkPolicy {
  chunkerId: string;
  chunkerVersion: string;
  strategy: "headingAware" | "paragraphOnly" | "wholeDocument";
  includeDocumentUnit: boolean;
  includeFrontmatterUnit: boolean;
  includeHeadingSectionUnits: boolean;
  includeParagraphUnits: boolean;
  includeTableUnits: boolean;
  includeCodeBlockUnits: boolean;
  maxUnitBytes?: number;
  splitOversizedSections: boolean;
}
```

Rules:

- Markdown-first default strategy is `headingAware`.
- structural chunks are preferred before token-sized chunks.
- heading hierarchy must be preserved.
- oversized sections may split by paragraph or semantic boundary.
- tables and code blocks should not split unless `maxUnitBytes` makes it unavoidable.
- `persistManifest = true` requires an immutable manifest-write grant.

### Output

```ts
export interface ChunkCreateOutput {
  repositoryId: RepositoryId;
  sourceRef: RefString;
  sourceVersionRef: RefString;
  manifest: SourceManifestView;
  manifestRef: RefString;
  accessUnits: SourceAccessUnitView[];
  chunkPolicyHash: ContentHash;
  writeDisposition: "returnedOnly" | "createdManifest" | "reusedExistingManifest";
}
```

Rules:

- access-unit IDs must be deterministic for source version, parser policy, chunk policy, and locator.
- every access unit must carry a locator back to source bytes.
- `document` access units may cover the whole source.
- `section` access units should use heading paths and block ranges.
- `paragraph`, `table`, `codeBlock`, and `frontmatter` access units should keep source-local block locators.
- persisted manifests must not inline large access-unit text.

### Validation Rules

- parse result hash must match the requested source version.
- every access-unit locator must be inside the parsed document bounds.
- access-unit refs must be unique within the manifest.
- access-unit IDs must be stable under identical input and policy.
- section units must not cross unrelated heading subtrees.
- persisted manifest refs must resolve through `source.locate`.

### Failure Modes

- parse result and source version do not match;
- chunk policy creates overlapping or unresolvable units;
- unit exceeds `maxUnitBytes` and cannot be split safely;
- manifest path already exists for a different payload;
- manifest write requested but denied;
- no access units can be produced from non-empty source.

## Open Questions

- Should strict frontmatter parsing fail the whole parse, or return a partial
  parse with a validation warning for Markdown-first fixtures?
- Should `chunk.create` write manifests directly, or should a separate manifest
  store port own persistence after chunk validation?

## Acceptance Criteria

This document-structure spec is ready when:

- `parse.document` can produce deterministic Markdown structure and locators;
- `chunk.create` can produce stable heading-aware access units and manifest refs;
- parser/chunker outputs preserve source storage as evidence truth;
- neither port creates durable semantic knowledge.
