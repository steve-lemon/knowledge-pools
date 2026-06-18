# Decision: Media Concept Proofs

Date: 2026-06-19
Status: accepted

## Context

The architecture needs to prove it can support multiple media types without changing its core contract. The user requested concept proofs for Markdown, image files, WAV audio including speech or songs, MP4 video, and long PDF documents.

## Decision

Use one shared ingest contract across media types:

- source object;
- source record;
- source manifest;
- access units;
- media-specific analysis;
- taxonomy classification;
- ingest artifact;
- content-minimal index documents;
- source-unit fetch for answer grounding.

Each media type may define its own access-unit locator shapes, derived objects, and analysis methods.

## Rationale

This preserves architectural simplicity while allowing media-specific parsing strategies. It also keeps OpenSearch as a retrieval map instead of a duplicate content store.

## Consequences

Implementation should define concrete schemas for `SourceRecord`, `SourceManifest`, `AccessUnit`, `IngestArtifact`, and content-minimal index documents before building media-specific processors.

## Follow-ups

- Add audio strategy to the media ingest strategy document.
- Define locator variants for Markdown, image, audio, video, and PDF.
- Add fixture examples for all five media proofs.
