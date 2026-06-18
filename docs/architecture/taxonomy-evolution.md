# Taxonomy Evolution Workflow

Knowledge Pools should treat taxonomy as a living standard.

Use the canonical terms from [Terminology](terminology.md).

Agents may propose taxonomy changes, but humans approve them.

## Why Human-Governed Evolution

LLMs are useful for noticing patterns, but they are not reliable authorities for schema governance.

If the system lets agents freely invent categories, attribute definitions, entity types, or relation types, the graph will drift into noisy and overlapping concepts.

Human review keeps the taxonomy:

- understandable;
- stable enough for retrieval;
- flexible enough to evolve;
- safe for migration;
- aligned with real project needs.

## Proposal Workflow

```text
unknown input
  -> taxonomy proposal candidate
  -> validation
  -> human review
  -> accepted / edited / rejected / deferred
  -> versioned taxonomy update
  -> migration or compatibility note
```

## Proposal Record

```json
{
  "proposal_id": "tax_prop_01",
  "type": "add_vocabulary_term",
  "status": "proposed",
  "observed_input": "ADR",
  "normalized_candidate": "architecture_decision_record",
  "target": {
    "vocabulary_id": "vocab_source_type"
  },
  "source_refs": ["source_01#span_02"],
  "affected_record_refs": ["ingest_artifact_01"],
  "rationale": "The source uses ADR as an abbreviation for architecture decision record.",
  "risk": "low",
  "review": {
    "reviewer": null,
    "decision": null,
    "decided_at": null
  }
}
```

## Proposal Types

- `add_category`
- `rename_category`
- `deprecate_category`
- `supersede_category`
- `add_attribute`
- `change_attribute_type`
- `add_vocabulary`
- `add_vocabulary_term`
- `add_alias`
- `deprecate_term`
- `add_entity_type`
- `add_relation_type`
- `deprecate_relation_type`
- `migration_required`

## Review Decisions

- `accepted`
- `edited`
- `rejected`
- `deferred`

Rejected proposals should still be retained as evaluation data so the system does not repeatedly suggest the same poor change.

## Versioning

Every taxonomy bundle must have a `schema_version`.

Every runtime ingest artifact must record:

- taxonomy name;
- taxonomy version;
- validation status;
- proposal references if unresolved taxonomy gaps were found.

## Breaking Changes

Treat these as breaking changes:

- attribute type changes;
- canonical vocabulary term removal;
- category ID repurpose;
- relation type semantic change;
- entity type merge or split;
- change in multi-category merge strategy.

Breaking changes require:

- migration plan;
- compatibility note;
- old-to-new mapping when possible;
- validation against existing records.

## Human Review Questions

For every proposed taxonomy change, ask:

1. Is this concept reusable?
2. Is it a category, attribute definition, vocabulary term, entity type, or relation type?
3. Does it overlap with an existing concept?
4. Will it improve retrieval, reasoning, verification, or maintenance?
5. Does it require migration?
6. Should it be accepted now or deferred until repeated evidence appears?

## Design Rule

The taxonomy should grow from observed use, but only through reviewed and versioned changes.
