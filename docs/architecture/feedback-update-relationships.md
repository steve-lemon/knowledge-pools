# Feedback Update Relationships

This document defines how new knowledge from the feedback loop enters the knowledge system and relates to existing records.

## Core Rule

Feedback does not directly become durable knowledge.

Feedback first becomes an update candidate.

```text
feedback
  -> update candidate
  -> evidence and context attachment
  -> relationship proposals
  -> verification
  -> curation gate
  -> durable knowledge record
  -> indexed projection
```

The system should never silently overwrite older knowledge.

## Feedback Sources

Feedback may come from:

- user correction;
- verifier failure;
- retrieval miss;
- stale evidence warning;
- contradiction discovered during reasoning;
- accepted answer;
- implementation result;
- human curation decision;
- evaluation signal.

Feedback is not always true. It is a signal that something may need to be added, corrected, connected, deprecated, or superseded.

## Update Candidate

An update candidate is a proposed durable change.

Recommended shape:

```json
{
  "candidate_id": "upd_001",
  "candidate_type": "corrected_claim",
  "status": "proposed",
  "proposed_record_kind": "claim",
  "statement": "OpenSearch stores typed retrieval projections, not source truth.",
  "source_refs": ["run_2026_06_19#turn_04"],
  "evidence_refs": ["src_md_001#section_002"],
  "related_record_refs": ["claim_012"],
  "relationship_proposals": [
    {
      "type": "supersedes",
      "from_ref": "upd_001",
      "to_ref": "claim_012",
      "reason": "User corrected the earlier wording."
    }
  ],
  "confidence": 0.86,
  "requires_review": true
}
```

Update candidates are artifacts until curated.

They are not durable memory yet.

## Relationship Formation

Every update candidate should be compared with existing knowledge before it becomes durable.

The relationship planner should ask:

1. Is this new knowledge derived from a source or interaction?
2. Does it support an existing claim?
3. Does it contradict an existing claim?
4. Does it supersede an older decision, claim, procedure, or constraint?
5. Does it refine a concept definition?
6. Does it answer an open question?
7. Does it depend on a project, source, tool, or assumption?
8. Is it a duplicate or near-duplicate of existing knowledge?
9. Is it temporary session context or reusable durable knowledge?

## Common Relationship Types

| Feedback case | Candidate relation |
| --- | --- |
| User corrects an answer | `contradicts` old claim, then may `supersedes` after review |
| User confirms an answer is useful | `supports` the cited claims or decision |
| User makes a decision | `derived_from` conversation/source, may `supersedes` older decision |
| Verifier finds unsupported statement | `contradicts` or flags candidate as rejected |
| Retrieval misses expected source | `mentions` missing concept, may create open question |
| New implementation result arrives | `supports` or `contradicts` earlier assumption |
| Procedure is improved | new procedure `supersedes` older procedure |
| Open question gets answered | answer record `answered_by` question |
| New fact only applies to a project | `applies_to` project context |

## Candidate Status Lifecycle

Recommended statuses:

```text
proposed -> verified -> accepted -> indexed
         -> rejected
         -> deferred
         -> needs_more_evidence
```

Meaning:

- `proposed`: emitted from feedback, not trusted yet;
- `verified`: evidence exists and conflicts were checked;
- `accepted`: curation approved durable storage;
- `indexed`: searchable projection exists;
- `rejected`: not stored as durable knowledge;
- `deferred`: useful but not ready;
- `needs_more_evidence`: cannot be accepted yet.

## Durable Record Creation

After curation, the candidate may become:

- `Claim`;
- `Decision`;
- `Concept`;
- `Procedure`;
- `Question`;
- `ProjectContext`;
- relation record.

The durable record must include:

- source refs or run refs;
- evidence refs;
- creation reason;
- curation decision ref;
- taxonomy bundle id and version;
- relation proposals that were accepted;
- supersession metadata when replacing older knowledge.

## Do Not Overwrite

If feedback changes older knowledge, preserve the older record and add relationships.

Preferred:

```text
new_claim --supersedes--> old_claim
new_claim --derived_from--> feedback_source
old_claim --status--> superseded
```

Avoid:

```text
old_claim.statement = new text
```

Knowledge should evolve through traceable updates, not silent mutation.

## Current vs Historical Knowledge

Feedback may create current knowledge while older knowledge remains historically true.

Example:

```text
decision_2026_06_18 --superseded_by--> decision_2026_06_19
```

Retrieval should:

- prefer current records by default;
- include superseded records for historical questions;
- warn when superseded knowledge is used as current evidence.

## Relationship To Source Versions

Feedback-derived knowledge is not the same as a source version update.

- If the original document changes, create or reuse a `source_version_id`.
- If a user correction changes system knowledge, create an update candidate.
- If the correction references a source, link it with `evidence_refs`.
- If the correction is itself the source, preserve the interaction or review artifact as a source-like evidence record.

## Minimal V1 Rule

For v1:

- treat feedback as `UpdateCandidate`;
- require at least one source ref, run ref, or evidence ref;
- require candidate status;
- propose relationships before durable storage;
- require curation before creating durable records;
- index update candidates separately from accepted knowledge records.

## Design Rule

Feedback is not memory.

Feedback is a proposal to change memory.

The relationship layer decides how that proposal connects to existing knowledge, and the curation gate decides whether it becomes durable.
