# Slash command: /normalize-documentation

Usage:

```
/normalize-documentation "<short-change-summary>"
```

## Behavior

When invoked, the agent will:

1. **Parse Summary**: Read the change summary and determine which docs changed
2. **Update Audit Files**: For every change, update the four audit files:
   - `docs/AI_AUDIT_LOG.md` - Track AI usage in documentation work
   - `docs/CHANGELOG.md` - Log all documentation changes by phase
   - `docs/PROMPTS.md` - Document prompts and generation steps
   - `docs/REFLECTION.md` - Record team insights and lessons learned
3. **Propagate Updates**: Keep all related docs in sync:
   - `docs/DOCUMENTATION_PLAN.md` - Update phase status and artifact list
   - `docs/FRONTEND_SHARED_LIBRARY.md` - If adding components, composables, or CSS classes
   - `docs/BACKEND_SHARED_LIBRARY.md` - If adding base classes, services, or utilities
   - `docs/SETUP_AND_RUN.md` - If changing tech stack or environment setup
   - `docs/ARCHITECTURE_DDD.md` - If updating domain structure or services
   - `docs/FRONTEND_GUIDE.md` - If changing component structure or patterns
   - `docs/BACKEND_API_REFERENCE.md` - If modifying endpoints or API contracts

## Examples

```
/normalize-documentation "add Google OAuth flow endpoints to API reference"
/normalize-documentation "create shared services for MSSQL/MongoDB access patterns"
/normalize-documentation "update tech stack to .NET 8, Vue 3, MSSQL, MongoDB, Cloudinary"
/normalize-documentation "add firstName validation and custom CSS classes for form fields"
```

## Tech Stack Reference

When normalizing docs, verify consistency across these artifacts:

**Backend Stack**:
- Framework: .NET 8 ASP.NET Core Web API
- ORM: Entity Framework Core
- Database: MSSQL (primary) + MongoDB (flexible)
- Validation: FluentValidation
- Mapping: AutoMapper
- Logging: Serilog

**Frontend Stack**:
- Framework: Vue 3 (Composition API)
- Build: Vite
- State: Pinia
- Router: Vue Router 4
- HTTP: Axios
- Validation: VeeValidate + Yup
- Styling: Bootstrap 5 + TailwindCSS + SCSS
- Icons: Bootstrap Icons

**Shared Libraries**:
- Backend: `docs/BACKEND_SHARED_LIBRARY.md` - BaseEntity, BaseService, BaseRepository, Constants, Utilities, Exceptions
- Frontend: `docs/FRONTEND_SHARED_LIBRARY.md` - Shared components, CSS classes, Composables, Services

## Workflow

The agent will follow this process:

1. **Analyze Summary** - Identify affected documentation areas:
   - Architecture/DDD changes
   - API endpoint changes
   - Component or service additions
   - Tech stack updates
   - Setup/environment changes
   - Code pattern/principle changes

2. **Update Specific Docs** - Based on change type:
   - **Backend Service Added** → Update BACKEND_SHARED_LIBRARY.md with new service pattern
   - **Frontend Component Added** → Update FRONTEND_SHARED_LIBRARY.md with component usage
   - **Database Change** → Update ARCHITECTURE_DDD.md, BACKEND_SHARED_LIBRARY.md
   - **API Endpoint Added** → Update BACKEND_API_REFERENCE.md, verify FRONTEND_GUIDE.md for corresponding UI
   - **Tech Stack Change** → Update SETUP_AND_RUN.md, DOCUMENTATION_PLAN.md, relevant stackguides

3. **Use Templates** - Apply templates from `docs/templates/`:
   - Copy AI_AUDIT_LOG.md template structure
   - Copy CHANGELOG.md template with phase/date/description
   - Copy PROMPTS.md template for prompt/response pairs
   - Copy REFLECTION.md template for team notes

4. **Fill Required Fields**:
   - **Date**: YYYY-MM-DD (today's date)
   - **MSSV**: Ask user if not provided; validate it's one of group members
   - **Description**: Brief, factual description of what changed
   - **Proof**: Reference specific files, lines, or diffs as evidence

5. **Update Related Files**:
   - Edit DOCUMENTATION_PLAN.md status table if doc versions changed
   - Add line references to shared libraries if code patterns were documented
   - Update ARCHITECTURE_DDD.md if domain changes occurred
   - Mark features in FEATURE_REGISTRY.md as "Documented" if applicable

6. **Produce Summary**:
   - Show list of files modified
   - Provide diff summary
   - Suggest commit message: `[MSSV] docs: <change-summary>`
   - Offer to run with `--commit` if authorized

## Example Output

When `/normalize-documentation "add shared button component and card styling"` is called:

```
📝 Documentation Updates Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Detected Changes:
✅ FRONTEND_SHARED_LIBRARY.md - Added BaseButton component, CardShadow CSS
✅ CHANGELOG.md - New entry under Phase 01
✅ AI_AUDIT_LOG.md - Logged component design decisions
✅ PROMPTS.md - Recorded design prompts used

Files Modified:
- docs/FRONTEND_SHARED_LIBRARY.md (sections: 1.1 Button Components, 2. Custom CSS)
- docs/CHANGELOG.md (+3 lines)
- docs/AI_AUDIT_LOG.md (+5 lines)
- docs/PROMPTS.md (+4 lines)
- docs/DOCUMENTATION_PLAN.md (status: BaseButton ✅, CardShadow ✅)

Suggested Commit:
[DE180443] docs: add shared button and card styling to component library

Branch: feature/DE180443-shared-components-docs
```

## Core Principles

✅ **Avoid Duplication**
- If adding service/component/utility, update the shared library first
- Link to shared library docs in ARCHITECTURE_DDD.md and implementation guides

✅ **Keep Audit Trail Honest**
- Only document changes that actually exist in the repo
- Don't invent implementation details
- Reference specific files and line numbers

✅ **Consistency Across Docs**
- When tech stack updates, verify all refs are aligned
- When APIs change, update both BACKEND_API_REFERENCE and FRONTEND_GUIDE
- When shared code changes, reflect in both BACKEND_SHARED_LIBRARY and FRONTEND_SHARED_LIBRARY

✅ **Transparency**
- Log all changes in CHANGELOG.md with dates and authors
- Record AI usage in AI_AUDIT_LOG.md
- Document decision rationale in REFLECTION.md

## Notes

- Agent will **only update docs** unless explicitly allowed with `--commit` flag
- Never invent implementation details; only document actual changes
- Always verify changes against git diff before finalizing
- Use YYYY-MM-DD format for all dates (e.g., 2026-05-19)
- Reference file paths relative to repo root (e.g., `docs/FRONTEND_GUIDE.md`)
- Maintain Vietnamese technical terms in alignment with existing docs

## Authorization

To request automatic commit:

```
/normalize-documentation "<change-summary>" --commit
```

Ensure you have proper authorization before using `--commit` flag.
