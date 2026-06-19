# Decision: Media Update Concept Proofs

Date: 2026-06-19
Status: accepted

## Context

The update stage must eventually support evidence from Markdown, images, audio, video, and PDF.

However, update is the bridge to durable memory governance, so media-derived candidates need stricter caution than text-only candidates.

## Decision

Define media-specific concept proofs for the `update` stage.

Markdown/text is the first supported path.

Images, audio, video, and most PDF paths are deferred unless they provide verified evidence refs that the update stage can preserve.

Uncertain media interpretations should produce review or open-question candidates, not fact-like candidates.

## Rationale

This keeps media expansion compatible with the Markdown-first MVP.

It also prevents low-confidence OCR, transcript, scene, or preview interpretations from becoming durable memory candidates too easily.

## Consequences

- Update candidates must preserve media evidence locators.
- Media previews are review aids unless verification approved the exact preview basis.
- The Knowledge Update Agent can stay conservative and LLM-independent.
- Curation receives clearer candidate records when media evidence is involved.

## Follow-ups

- Add media-specific update validation when each media parser and verifier becomes implementation-ready.
- Keep PDF updates text-like only when verified text access units exist.
