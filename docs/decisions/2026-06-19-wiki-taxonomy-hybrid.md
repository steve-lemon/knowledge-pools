# Decision: Wiki and Taxonomy Hybrid Architecture

Date: 2026-06-19
Status: accepted

## Context

The user raised a concern that wiki-style organization and taxonomy-centered organization have different strengths and failure modes. Wiki style is expressive and natural for humans, while taxonomy is controlled and useful for automation.

## Decision

Adopt a hybrid architecture:

- wiki-style sources are the narrative layer;
- source manifests and access units are the access layer;
- taxonomy bundles are the semantic control layer;
- entity and relation candidates are the connection layer;
- content-minimal OpenSearch-compatible documents are the retrieval layer.

Wiki links, tags, headings, aliases, and redirects should be extracted as runtime signals. They should not automatically become taxonomy definitions.

## Rationale

This keeps authoring natural while preventing uncontrolled tag or link sprawl from corrupting the taxonomy. It also lets the system use wiki connectivity for retrieval and graph construction without turning every wiki convention into permanent schema.

## Consequences

Ingest must extract wiki structure separately from taxonomy classification.

The system should create taxonomy proposals when repeated wiki patterns suggest new categories, vocabulary terms, aliases, entity types, or relation types.

## Follow-ups

- Define wiki structure extraction for Markdown links, headings, tags, and backlinks.
- Add relation types such as `references`, `same_as`, and `redirects_to` if accepted.
- Define title/alias/redirect handling without using titles as stable IDs.

