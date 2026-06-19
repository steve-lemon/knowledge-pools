# Wiki and Taxonomy Hybrid Architecture

This document defines how wiki-style authoring and taxonomy-governed structure work together in Knowledge Pools.

## Core Principle

Use wiki style for human expression.

Use taxonomy for semantic control.

Use graph candidates to connect them.

Use the index as a retrieval map.

```text
wiki-style source
  -> source manifest and access units
  -> wiki structure extraction
  -> taxonomy classification
  -> graph candidates
  -> content-minimal index documents
```

## Why Both Are Needed

Wiki-style documents are good at:

- narrative context;
- exploratory writing;
- human-readable links;
- evolving ideas;
- cross-document references;
- local naming and aliases.

Taxonomy is good at:

- stable classification;
- controlled vocabulary;
- predictable filters;
- validation;
- graph node and edge type control;
- automation.

If the system uses only wiki style, it becomes flexible but inconsistent.

If the system uses only taxonomy, it becomes structured but rigid.

The architecture should let people write naturally while letting the system interpret consistently.

## Layer Model

```text
Narrative Layer
  - wiki documents
  - headings
  - links
  - backlinks
  - aliases
  - tags

Access Layer
  - source records
  - source manifests
  - access units
  - locators

Semantic Control Layer
  - taxonomy bundle
  - categories
  - attribute definitions
  - vocabularies
  - entity types
  - relation types

Connection Layer
  - entity instance candidates
  - relation instance candidates
  - graph records after validation

Retrieval Layer
  - content-minimal OpenSearch-compatible documents
  - source/access-unit refs
  - taxonomy metadata
  - link metadata
```

## How Wiki Inputs Become Structured Data

Wiki source features should be extracted as runtime signals first, not immediately promoted into taxonomy.

| Wiki Feature | Initial Treatment | Possible Taxonomy Impact |
| --- | --- | --- |
| document title | source metadata / label | alias proposal if repeated |
| heading | access unit locator | category proposal only if reusable |
| wiki link | shallow relation candidate | relation type proposal if unknown |
| backlink | shallow relation candidate | none by default |
| tag | category or attribute value candidate | category/vocabulary proposal if repeated |
| redirect | alias candidate | alias proposal |
| citation | shallow evidence/source relation candidate | relation type if new semantics |
| template/transclusion | shallow source relation candidate | deferred unless needed |

## Relation Handling

Taxonomy defines relation types.

Wiki parsing creates relation instance candidates.

Example:

```text
[[OpenSearch Index Policy]]
```

may produce:

```json
{
  "type": "references",
  "from_entity_id": "source_current_doc",
  "to_entity_id": "source_opensearch_index_policy",
  "evidence_refs": ["source_current_doc#section_002#link_001"]
}
```

If `references` is not an accepted relation type, the system should create a taxonomy proposal rather than silently accepting a new relation type.

## Tags and Categories

Wiki tags are not automatically taxonomy categories.

Default behavior:

1. Treat tags as attribute value candidates or category candidates.
2. Normalize against existing aliases and vocabulary terms.
3. If unknown, create a taxonomy proposal.
4. Promote to taxonomy only after human review.

This prevents tag sprawl from becoming taxonomy sprawl.

## Document Identity

Wiki systems often allow title changes, aliases, redirects, and duplicate pages.

Knowledge Pools should separate:

- stable `source_id`;
- mutable title;
- aliases;
- redirects;
- canonical source selection.

Do not use document title as the durable identity.

## Retrieval Behavior

The retrieval planner should combine both signals:

- wiki structure: title, headings, links, backlinks;
- taxonomy structure: categories, attribute values, entity types, relation types;
- source access: access unit refs and exact locators.

Retrieval should return source/access-unit references first, then fetch exact evidence from object storage.

## Taxonomy Evolution From Wiki Use

Wiki usage can suggest taxonomy evolution.

Examples:

- repeated tag -> vocabulary term or category proposal;
- repeated link pattern -> relation type proposal;
- repeated section pattern -> document template or category proposal;
- repeated alias/redirect -> alias proposal.

But proposal is not acceptance.

Humans decide whether wiki patterns become taxonomy.

## Design Rule

Write like a wiki.

Interpret through taxonomy.

Connect as graph candidates.

Retrieve through content-minimal index documents.

Answer from fetched source units.
