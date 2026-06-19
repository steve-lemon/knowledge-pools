# Decision: Media Plan Concept Proofs

Date: 2026-06-19
Status: accepted

## Context

The `plan` stage needs to work across Markdown, image, audio, video, and PDF sources.

Earlier media proofs covered ingest, understand, and connect. The next risk is allowing planning to become either:

- blind keyword/vector search; or
- premature media consumption that fetches full source content before retrieval.

## Decision

Add media-specific concept proofs for the `plan` stage.

The planner should be media-aware, but not media-consuming.

It should decide:

- required evidence types;
- retrieval steps;
- freshness scope;
- conflict-search requirement;
- media-specific access-unit needs;
- retrieval budget and bounded fetch rules.

It should not fetch full media content or produce answers.

## Rationale

Different media types require different retrieval constraints:

- Markdown needs sections and wiki/link context;
- images need OCR spans, regions, and inspectable renditions;
- audio needs transcript spans and time ranges;
- video needs subtitle spans, keyframes, and scene segments;
- PDFs need pages, sections, tables, figures, and citations.

Making these needs explicit in `RetrievalPlan` keeps retrieval auditable and bounded.

## Consequences

Positive:

- media retrieval can remain source-grounded;
- heavy media fetches can be bounded;
- previews remain navigation aids, not source truth;
- retrieval can run without reinterpreting the user request.

Tradeoffs:

- the planner needs media-aware evidence type vocabulary;
- retrieval implementations must understand access-unit kinds and preview refs.

## Follow-ups

- Add retrieve-stage media concept proofs.
- Define runtime schemas for media-aware `RetrievalPlan`.
- Validate `preview.lookup` and bounded source fetch behavior in the tool pool.
