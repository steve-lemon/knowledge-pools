# Verifier Agent Spec

The Verifier Agent checks whether a draft answer or action is grounded, fresh, and conflict-aware.

## Tool Contract

Required ports:

- `artifact.read`;
- `verification.check`;
- `record.search`;
- `audit.trace`.

Optional ports:

- `graph.query`;
- `source.read`;
- `retrieval.fetch_evidence`.

Forbidden ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- verification report;
- unsupported claim list;
- stale evidence warning;
- contradiction warning;
- revision request when needed.

## Design Rule

The Verifier Agent audits reasoning.

It does not repair durable memory directly.
