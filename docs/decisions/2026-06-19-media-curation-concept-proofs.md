# Decision: Media Curation Concept Proofs

Date: 2026-06-19
Status: accepted

## Context

Curation is the first stage that may create durable knowledge.

Media-derived candidates carry different evidence risks than Markdown/text candidates, especially when they depend on OCR, transcripts, visual interpretation, scene detection, or scanned PDF extraction.

## Decision

Define media-specific concept proofs for the `curation` stage.

Markdown/text candidates are the first durable curation path.

Image, audio, video, and most PDF-derived candidates should be deferred, rejected, or require review unless their verified evidence basis is stable.

## Rationale

Update may safely propose review-worthy candidates.

Curation has a higher bar because it can create durable records or lifecycle state.

Media-derived durable memory should therefore require verified locators, confidence, and review policy before acceptance.

## Consequences

- Markdown/text curation remains the first implementation target.
- Media-derived candidates preserve locator provenance even when deferred.
- Human approval or high-confidence derived evidence is required for risky media acceptance.
- Durable memory avoids silently absorbing low-confidence media interpretations.

## Follow-ups

- Add curation readiness review and tool permission check.
- Define media-specific curation validation when each media parser and verifier is implemented.
