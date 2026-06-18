# Decision: Media Understand Concept Proofs

Date: 2026-06-19
Status: accepted

## Context

The project already defined media-specific ingest concept proofs.

The user asked to examine `understand` more deeply by listing expected content types for each media type and proving how understand would work.

## Decision

Add media-specific understand concept proofs for:

- Markdown/text;
- image;
- WAV/audio;
- MP4/video;
- PDF.

The proofs map each media type to shared knowledge candidate kinds while preserving media-specific evidence locators.

## Rationale

This keeps the Understanding Agent media-aware without fragmenting the knowledge model.

Each medium can produce claims, decisions, concepts, procedures, questions, constraints, and summaries, but the evidence refs must preserve page, bbox, transcript span, time range, frame, region, or section locators.

## Consequences

The implementation should prioritize:

- Markdown/text structural understanding;
- PDF text-block understanding;
- audio/video transcript-span understanding;
- OCR-backed image understanding;
- visual-only extraction only after review workflows exist.

## Follow-ups

- Define media-specific extractor policies.
- Add fixture examples per media type.
- Add quality checks for OCR, transcript, table, and visual-only ambiguity.
