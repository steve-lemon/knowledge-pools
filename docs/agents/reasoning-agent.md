# Reasoning Agent Spec

The Reasoning Agent synthesizes an answer, plan, or action from an evidence bundle.

## Tool Contract

Required ports:

- `artifact.read`;
- `source.read`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `model.complete`;
- `reason.synthesize`;
- `record.search`.

Forbidden ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- draft answer or proposed action;
- assumptions;
- unresolved questions;
- cited evidence refs;
- confidence notes.

## Design Rule

The Reasoning Agent explains from evidence.

It does not verify itself or write durable knowledge.
