# Decision: Markdown-First Implementation

Date: 2026-06-19
Status: accepted

## Context

The architecture now defines a broad multi-stage and multi-media target system.

It includes Markdown/text, image, audio, video, and PDF concept proofs across ingest, understand, connect, plan, retrieve, and reason.

Implementing all media types at once would make the first MVP too large and hard to validate.

## Decision

Implement the first working MVP as a Markdown/text-only vertical slice.

The first slice should prove the full loop:

```text
ingest -> understand -> connect -> plan -> retrieve -> reason -> verify -> update candidate -> trace/evaluate
```

Image, PDF, audio, and video support remain documented extension tracks and should be implemented only after the Markdown/text flow works end to end.

## Rationale

Markdown/text can prove the core contracts with deterministic local tools.

It exercises the most important objects:

- source records;
- source versions;
- manifests;
- access units;
- candidates;
- relationship proposals;
- retrieval plans;
- evidence bundles;
- draft answers;
- verification reports;
- update candidates;
- traces.

This avoids confusing media parsing failures with orchestration, schema, retrieval, reasoning, or verification failures.

## Alternatives

- Implement every media type from the beginning.
- Start with PDF because it is common in knowledge work.
- Start with image/audio/video to prove multimodal architecture first.

These options add parsing, OCR, transcription, scene detection, and confidence handling before the core loop has been proven.

## Consequences

The first implementation will be smaller and more testable.

The architecture remains multi-media, but media-specific features are deferred behind a stable Markdown/text regression path.

## Follow-ups

- Add Markdown/text regression fixtures.
- Keep all media concept proofs as expansion guides.
- Add media support one type at a time after the Markdown/text flow is stable.
