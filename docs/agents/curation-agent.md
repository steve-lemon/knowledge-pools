# Curation Agent Spec

The Curation Agent decides which candidates become durable records.

## Tool Contract

Required ports:

- `artifact.read`;
- `curation.decide`;
- `memory.write`;
- `memory.update_status`;
- `audit.trace`.

Optional ports:

- `rollback.create_event`;
- `delete.create_tombstone`;
- `record.search`.

Forbidden ports:

- direct provider-specific memory writes.

## Outputs

- curation decisions;
- durable records;
- status updates;
- rollback or tombstone events when approved.

## Design Rule

The Curation Agent is the durable memory gate.

It should preserve provenance and avoid silent overwrites.
