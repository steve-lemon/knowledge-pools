# Taxonomy vs Versioning Responsibilities

This document analyzes which concerns belong in taxonomy and which belong in versioning, source manifests, or indexing policy.

## Core Rule

Taxonomy should define meaning.

Versioning should define change over time.

Source manifests should define access.

Indexing policy should define search projection.

## Responsibility Matrix

| Concern | Taxonomy | Versioning | Source Manifest | OpenSearch Mapping |
| --- | --- | --- | --- | --- |
| Category names and hierarchy | Yes | Version taxonomy changes | No | Filter fields |
| Attribute definitions | Yes | Version taxonomy changes | No | Typed fields |
| Vocabulary terms and aliases | Yes | Version taxonomy changes | No | Keyword fields |
| Entity types and relation types | Yes | Version taxonomy changes | No | Nested fields / edge docs |
| Chunking method | No | Parser/index policy version | Yes | Access unit docs |
| Chunk size | No | Parser/index policy version | Yes | Access unit docs |
| PDF page or bbox locator | No | Manifest version | Yes | Stored locator fields |
| Image resolution/renditions | No | Rendition policy version | Yes | Rendition metadata |
| Document summaries | No, except summary kind may be categorized | Summary generator version | Links to source units | Summary fields |
| Detailed indexing fields | No, except attribute definitions | Mapping version | Links to access units | Yes |
| Wiki links and backlinks | Relation types only | Source/index version | Link locators | Relation docs |
| Source update history | No | Yes | Yes | Version fields |
| Original source bytes | No | Object version | Object URI | Reference only |
| Evidence references | No | Stable across versions when possible | Yes | Stored refs |

## Chunking

Chunking is not taxonomy.

Taxonomy may define a category such as `source` or `knowledge_record`, but it should not decide whether a PDF is split by page, paragraph, token count, or bounding box.

Chunking belongs to:

- media ingest strategy;
- parser configuration;
- source manifest;
- access unit records;
- index policy.

Why:

- chunking can change as parsers improve;
- chunking is operational, not conceptual;
- old chunks must remain traceable after reprocessing.

## Image Resolution

Image resolution support is not taxonomy.

Taxonomy may define image-related meaning such as `source_type = image` or entity types such as `person`, `place`, or `product`.

Resolution handling belongs to:

- object storage;
- rendition policy;
- source manifest;
- access unit locators.

The manifest should record:

- original object URI;
- derived rendition URIs;
- dimensions;
- checksum;
- generation policy/version.

## Document Summaries and Detail Indexing

Summaries are not taxonomy definitions.

Taxonomy can classify a summary as a kind of indexed view if needed, but summary content is generated runtime data.

Manage summaries through:

- summary generator version;
- source refs;
- access unit refs;
- OpenSearch document type;
- verification metadata.

Detailed indexing belongs to OpenSearch mapping and access unit design.

## Wiki-Style Connectivity

The existence of a relation type belongs in taxonomy.

Examples:

- `references`
- `mentions`
- `same_as`
- `redirects_to`
- `derived_from`

The actual link between document A and document B is a relation instance.

The relation instance belongs to runtime graph/index data and must preserve:

- source refs;
- link locator;
- parser version;
- taxonomy version.

## Source Updates and Versioning

Document updates are not taxonomy changes unless the update introduces a new conceptual type, attribute definition, vocabulary term, entity type, or relation type.

For source updates, track:

- `source_id`
- `source_version`
- `object_version`
- `content_hash`
- `manifest_version`
- `parser_version`
- `index_version`
- `taxonomy_bundle_id`
- `taxonomy_version`

Recommended behavior:

- Same bytes: no new source version.
- Changed bytes: create new source version.
- Changed parser only: create new manifest/index version.
- Changed taxonomy only: reclassify or reindex with new taxonomy version.
- Changed meaning requiring new taxonomy term: create taxonomy proposal.

## When Taxonomy Should Change

Change taxonomy when the system needs a new shared meaning:

- a reusable category;
- a new attribute definition;
- a new vocabulary term or alias;
- a new entity type;
- a new relation type.

Do not change taxonomy for:

- chunk size;
- thumbnail size;
- parser bug fix;
- OCR engine version;
- source content update;
- OpenSearch analyzer setting;
- summary prompt version.

## Design Rule

Taxonomy is the shared semantic contract.

Versioning, manifests, and indexing policies are operational contracts.

Keep them linked, but do not collapse them into one system.

