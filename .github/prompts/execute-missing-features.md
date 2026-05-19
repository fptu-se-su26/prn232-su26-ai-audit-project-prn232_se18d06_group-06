---
description: "Execute one selected feature from the roadmap in a small, testable batch. Follow SOLID and clean-frontend principles for FE surfaces."
name: "Execute Missing Feature"
argument-hint: "Required: feature name or feature selection. Optional: module priority, excluded features, deadline, breaking-change policy, local-password mode, batch-size (default 1)."
agent: "agent"
---

Purpose
 - Normalize one selected Missing/Partial feature, then implement a tidy, small, and testable FE/BE slice for that feature.

Key principles
 - Single Responsibility: each file/component/service does one thing.
 - Composition over inheritance: compose pages from small components.
 - Interface segregation: API wrappers are small and focused.
 - Dependency inversion: high-level modules depend on abstractions, not concrete axios calls.
 - Keep FE small: page orchestrates, components present, services encapsulate domain logic.

Workflow (selected feature only)
1) Select
 - Read `docs/FEATURE_REGISTRY.md` and choose exactly one feature from the roadmap.
 - If the user provided a feature name, use that feature only.
 - If the user did not provide a feature, ask them to choose one feature from the registry before continuing.
 - Skip Deferred unless `local-password` mode is explicitly enabled.

2) Normalize
 - Canonicalize the selected feature name to snake_case, fix typos, and add aliases if needed.
 - Expand it into module, priority (P0..P3), actors, behaviors, acceptance criteria, dependencies, BE/FE scope.
 - Record the selected feature as the only in-scope item for this run.

3) Update registry
 - Update only the selected feature row in `docs/FEATURE_REGISTRY.md`.
 - Set status to In Progress, add owner, and add doc/code entry points.
 - Do not change unrelated rows.

4) Implement the selected feature
 - Read `docs/AGENT_CODING_GUIDE.md`.
 - If BE changes, read `docs/BACKEND_API_REFERENCE.md`, `docs/BACKEND_SHARED_LIBRARY.md`, and the relevant module docs.
 - If FE changes, read `docs/FRONTEND_GUIDE.md` and `docs/FRONTEND_SHARED_LIBRARY.md`.
 - Read the specified code entry points for the selected feature.
 - Produce a short plan (3-6 steps) before coding.
 - Implementation pattern:
   - Add or update a focused API wrapper using the shared client.
   - Add a service for business logic and DTO mapping.
   - Add small presentational components under the feature folder.
   - Compose a thin page that uses components and services.
   - Add scoped styles or a shared SCSS partial if styles are reused.
 - FE validation: run type-check and build for the frontend app before finalizing the batch.
 - BE validation: run the relevant test or build command for the backend slice when code is changed.

5) Finish the selected batch
 - Mark the selected feature as completed in-memory after validation passes.
 - Update `docs/CHANGELOG.md` and `docs/AI_AUDIT_LOG.md` if AI was used in planning.
 - Stop after the selected feature is done.

6) Final summary
 - Feature: canonical name
 - Selection: why this feature was chosen
 - Validations: type-check/build/test results
 - Impacted files grouped by backend/frontend/docs
 - Behavior & compatibility notes

Notes and constraints
 - Keep backwards compatibility with routes and contracts unless the user approves breaking changes.
 - Do not modify `Src/ExcelTool` or `Src/Database` unless asked.
 - If a required dependency is missing, stop and report the blocker.

SOLID & Clean-code checklist for FE
 - APIs: use the shared API client for all modules unless justified.
 - Services: encapsulate mapping, validation, and file handling.
 - Components: single-responsibility presentational components plus small container components.
 - Styles: prefer scoped component styles; add shared SCSS partials for variables and mixins.
 - Errors: use a notification service instead of alert() everywhere.

When in doubt, stop and ask a focused question about which feature to select, plus any priority or mode that changes the selection.

References
 - Frontend shared patterns: docs/FRONTEND_SHARED_LIBRARY.md
 - Backend shared patterns: docs/BACKEND_SHARED_LIBRARY.md
