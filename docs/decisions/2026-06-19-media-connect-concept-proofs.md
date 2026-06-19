# Decision: Media Connect Concept Proofs

Date: 2026-06-19

Status: Accepted

## Context

The project defined media-specific ingest and understand concept proofs.

The `connect` stage also needs media validation because evidence locators differ across Markdown, images, audio, video, and PDF.

## Decision

Define media connect concept proofs for:

- Markdown/text;
- image;
- WAV/audio;
- MP4/video;
- PDF.

All media types share one relationship proposal contract, but preserve media-specific evidence locators.

## Consequences

Positive:

- `connect` can be validated without pretending every medium is plain text;
- relationship proposals can preserve page, region, transcript, scene, and section refs;
- risky visual-only or audio-only relations can require review;
- v1 can prioritize deterministic text and transcript-backed relations.

Tradeoffs:

- some media relation proposals will require review before graph insertion;
- visual-only relation extraction remains deferred;
- proposal confidence must account for OCR, transcript, layout, and scene quality.
