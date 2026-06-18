# Retrieval Agent Spec

The Retrieval Agent executes a retrieval plan and returns evidence bundles.

## Tool Contract

Required ports:

- `index.search`;
- `record.search`;
- `source.locate`;
- `source.read`;
- `retrieval.fetch_evidence`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `graph.query`.

Forbidden ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- `evidence-bundle.json`;
- missing evidence notes;
- conflict candidates when available;
- trace events.

## Design Rule

The Retrieval Agent gathers evidence.

It does not synthesize final answers or update memory.
