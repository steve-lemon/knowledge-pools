# Knowledge Update Agent Spec

The Knowledge Update Agent converts useful run outcomes into update candidates.

## Tool Contract

Required ports:

- `artifact.read`;
- `candidate.emit`;
- `review.request`;
- `artifact.write`;
- `audit.trace`.

Optional ports:

- `curation.propose`;
- `record.search`;
- `model.complete`.

Forbidden ports:

- `memory.write`;
- `curation.decide`;
- `source.tombstone`;
- `delete.create_tombstone`.

## Outputs

- update candidates;
- review requests;
- curation proposals;
- trace events.

## Design Rule

The Knowledge Update Agent proposes memory changes.

It does not accept or write durable memory.
