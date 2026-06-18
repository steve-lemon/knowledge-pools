# Decision: Content Deletion Lifecycle

Date: 2026-06-19
Status: accepted

## Context

The architecture preserves source versions, derived artifacts, OpenSearch projections, and knowledge records.

The user asked how content deletion should work, and noted that actual physical deletion is not required.

## Decision

Use a soft-delete-first lifecycle based on tombstones.

Deletion should remove content from normal retrieval and reasoning without immediately erasing source history.

Support these states:

- `hidden`;
- `tombstoned`;
- `archived`;
- `legal_hold`;
- `purged`.

Physical purge remains optional and policy-driven.

## Rationale

The system needs reversible removal, dependency cleanup, auditability, and a way to keep derived knowledge from citing removed evidence as active truth.

Immediate hard deletion would break provenance and make impact analysis difficult.

## Alternatives

- Hard delete source objects immediately.
- Only delete OpenSearch projections.
- Treat deletion as rollback.
- Keep deleted content searchable with a flag.

## Consequences

The implementation needs:

- tombstone records;
- delete propagation;
- retrieval filters for hidden/tombstoned/archived content;
- restore events;
- optional purge workflows.

Verification must warn when durable records cite deleted or unavailable evidence.

## Follow-ups

- Define CLI commands for `hide`, `delete`, `archive`, `restore`, and `purge`.
- Define authorization and audit rules.
- Define retention and legal hold policies.
- Define backup and object-store version purge behavior.
