# Decision: OpenSearch Schema Discipline

Date: 2026-06-19
Status: accepted

## Context

OpenSearch mappings are type-sensitive. If the same field name is indexed with different data types, indexing can fail or queries can become unreliable.

Knowledge Pools also uses taxonomy-defined runtime attributes, which could easily become dynamic fields if not constrained.

## Decision

Use explicit OpenSearch mappings and typed runtime attribute storage.

The same attribute key must always have the same taxonomy-declared data type.

Do not index arbitrary dynamic fields like:

```json
{
  "attribute_values": {
    "confidence": "high"
  }
}
```

Instead, use typed attribute entries:

```json
{
  "attributes": [
    {
      "key": "confidence",
      "value_type": "number",
      "number_value": 0.82
    }
  ]
}
```

The detailed schema is defined in [OpenSearch Index Schema](../architecture/opensearch-index-schema.md).

## Rationale

This avoids mapping conflicts, keeps taxonomy and index projections aligned, and makes search behavior predictable.

It also reinforces that OpenSearch is a typed retrieval projection, not a schema-free content store.

## Consequences

Implementation must:

- validate attributes against the taxonomy bundle before indexing;
- reject or quarantine unknown attributes;
- use disabled raw objects for non-queryable debug data;
- avoid uncontrolled dynamic mappings;
- include mapping fixtures in the OpenSearch baseline.

