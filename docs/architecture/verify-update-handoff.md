# Verify To Update Handoff

This document defines the handoff from `verify` to `update`.

The handoff carries audit results that may become reusable memory changes.

It does not carry durable memory writes.

## Boundary

`verify` owns:

- grounding checks;
- freshness checks;
- conflict checks;
- unsupported and uncertain result classification;
- verification report creation.

`update` owns:

- selecting update-worthy signals;
- creating `UpdateCandidate` artifacts;
- requesting review when needed;
- handing candidates to `curation`.

## Handoff Artifact

Canonical handoff type:

```text
VerifyToUpdateHandoff
```

Required payload:

```json
{
  "verification_report_ref": "artifact_verify_001",
  "verified_claim_refs": ["claim_run_001"],
  "rejected_claim_refs": [],
  "unsupported_refs": ["claim_run_004"],
  "uncertain_refs": [],
  "review_refs": ["review_001"],
  "update_signal_refs": ["signal_001"]
}
```

## Required Semantics

The handoff must distinguish:

- `verified_claim_refs`: supported claims or proposals that may become reusable knowledge;
- `rejected_claim_refs`: checked items that should not become memory;
- `unsupported_refs`: outputs that exceeded evidence and may create open questions or correction requests;
- `uncertain_refs`: outputs that need more evidence before curation;
- `review_refs`: human or policy review requests;
- `update_signal_refs`: explicit signals that the update stage should inspect.

## Validation Rules

The update stage must validate:

- the handoff schema;
- the verification report ref resolves;
- every verification result ref resolves or is marked missing;
- unsupported refs are not treated as verified facts;
- review refs are preserved;
- update signal refs are traceable to verification, feedback, or run artifacts.

## Minimal V1 Policy

For Markdown-first v1:

- only verified Markdown/text evidence paths may produce fact-like update candidates;
- unsupported Markdown/text claims may produce `open_question` or `needs_more_evidence` candidates;
- user corrections may produce `corrected_claim` candidates with `requires_review: true`;
- relationship proposal results may produce `relationship_update` candidates;
- media-derived results are ignored unless they have verified text access-unit refs.

## Output Expectation

A successful update run should produce:

- one update artifact containing emitted candidate refs;
- zero or more `UpdateCandidate` artifacts;
- zero or more review requests;
- an `UpdateToCurationHandoff`;
- trace events for each selected or rejected signal.

## Anti-Pattern

Do not use this handoff to pass the full draft answer, full source content, or full conversation transcript.

Pass refs.

The update stage can resolve bounded artifacts through approved tools when needed.
