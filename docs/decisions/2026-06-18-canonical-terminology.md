# Decision: Canonical Terminology

Date: 2026-06-18
Status: accepted

## Context

The ingest design introduces taxonomy, schema, bundles, graph candidates, records, artifacts, entities, categories, attributes, and relations. These terms are easy to blur, but the project depends on precise boundaries between human-governed definitions and runtime values.

## Decision

Create and use a canonical terminology document for Knowledge Pools.

Key distinctions:

- Taxonomy schema is the structural contract.
- Taxonomy bundle is the versioned taxonomy data.
- Category classifies taxonomy placement.
- Entity type defines graph node role.
- Entity instance is a runtime or stored graph node.
- Attribute definition lives in the taxonomy.
- Attribute value lives on runtime records or entity instances.
- Relation type defines edge semantics.
- Relation instance is an actual edge.
- Record is durable domain data.
- Artifact is run-scoped workflow output.

## Rationale

Precise terms reduce schema drift, implementation ambiguity, and graph noise. They also make human review easier because proposals can name exactly what kind of change is being requested.

## Alternatives

- Let terms evolve informally.
- Use OmniMeta terms directly without adapting them.
- Rely on code types to define terminology later.

## Consequences

All architecture and implementation documents should align with `docs/architecture/terminology.md`. Future code should use matching suffixes such as `*Schema`, `*Bundle`, `*Record`, `*Artifact`, `*Type`, `*Instance`, and `*Proposal`.

## Follow-ups

- Align initial TypeScript type names with the terminology.
- Review older documents for ambiguous use of `entity`, `record`, `artifact`, and `schema`.

