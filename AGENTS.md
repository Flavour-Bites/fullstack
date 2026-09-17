# Flavour Bites — Agent Instructions

## Engineering Standard

Build **production-grade software**, not patches.

Priorities:

1. Correctness
2. Security
3. Architecture
4. Maintainability
5. Simplicity
6. Performance

Use established patterns and mature libraries when they reduce unnecessary custom infrastructure. **Do not optimize for fewer dependencies, files, or lines at the expense of good architecture.**

---

## Think Before You Code

Before any non-trivial change:

* Understand the existing architecture and data flow.
* Identify which layer **owns the responsibility**.
* Check for existing abstractions that already solve it.
* Distinguish intentional architecture from legacy/historical code.
* Look for duplication, leakage of responsibilities, and accumulated workarounds.
* Prefer fixing the root design over adding another patch.

**Existing code is evidence, not architectural authority.**

If the current structure is wrong, refactor it.

Do not ask the user to decide obvious architectural questions that can be resolved from established engineering practice and the codebase. Analyze, choose the conventional production-grade solution, and implement it.

---

## Architecture & Separation of Concerns

Place code according to **responsibility**, not convenience or historical location.

```text
src/features/<domain>/  → domain UI, hooks, feature API, behavior
src/shared/api/         → HTTP/API transport infrastructure
src/shared/lib/         → reusable infrastructure/library abstractions
src/shared/utils/       → small pure/stateless utilities
```

Backend:

```text
routes/controllers → HTTP boundary
services           → business logic
repositories/data  → persistence
```

Keep modules cohesive and loosely coupled.

Do not put network clients, interceptors, authentication infrastructure, stateful services, or transport logic in generic `utils/`.

**A file's location must reflect what it does.**

Avoid God files, duplicated abstractions, circular dependencies, and mixed responsibilities.

---

## Use Libraries Intentionally

Do not reinvent infrastructure unnecessarily.

Use mature libraries for concerns they are designed to solve, while keeping application-specific behavior explicit.

Examples:

* HTTP → Axios or a well-designed fetch abstraction
* Validation → Zod
* Database → Prisma
* Redis → established Redis client
* Authentication/crypto → established mechanisms

Understand the underlying technology, but do not hand-build infrastructure merely to avoid a dependency.

When adopting a library, migrate to **one coherent abstraction**. Remove obsolete competing implementations.

---

## No Duct Tape

Do not accumulate:

* arbitrary `if` statements
* unexplained fallbacks
* hardcoded environment assumptions
* duplicate configuration
* compatibility layers without real consumers
* speculative abstractions
* security checks without a concrete threat
* patches compensating for another design mistake

When exceptions start accumulating, **stop and reconsider the architecture**.

Prefer one clean abstraction over many defensive exceptions.

---

## Security

Security must match the actual architecture.

Before changing authentication, authorization, CORS, CSRF, cookies, tokens, or sessions:

1. Trace the complete request/auth flow.
2. Identify the actual threat.
3. Determine exactly which mechanism protects which request.
4. Preserve the security property while simplifying implementation where possible.
5. Never weaken production security for development convenience.

Do not add security mechanisms by cargo cult.

Do not remove them without understanding their purpose.

---

## Configuration

Keep development, test, and production behavior explicit.

Production configuration comes from environment/configuration sources.

Do not make production permissive to solve local-development inconvenience.

Avoid multiple configuration variables representing the same concept unless their responsibilities are genuinely different.

---

## Refactoring

If the correct architecture requires moving, renaming, splitting, or consolidating code:

**Do it completely.**

Update imports, tests, exports, documentation, configuration, and references. Remove obsolete code.

Do not preserve bad structure merely because it already exists.

---

## Verification

After meaningful changes:

* Run relevant tests.
* Run type checking.
* Run linting.
* Verify affected flows.
* Inspect the final diff.

For security, authentication, persistence, or data-flow changes, verify both success and important failure paths.

Do not declare work complete merely because it compiles.

---

## Branch Discipline

Every piece of work gets its own branch.

```text
feat/<description>
fix/<description>
refactor/<description>
test/<description>
chore/<description>
docs/<description>
```

Never mix unrelated concerns.

Never commit directly to `main` or `dev`.

One branch = one coherent change.

---

## Context Discipline

At the start of work:

1. Read `AGENTS.md`.
2. Read relevant sections of `LEARNINGS.md`.
3. Check the todo list.

Record durable discoveries in `LEARNINGS.md`, architectural decisions in `AGENTS.md`, and task progress in the todo list.

Do not repeatedly reread files or search results that have already been understood. Re-read source when the current evidence is insufficient.

---

## Final Decision Rule

Before adding complexity, ask:

> **What is the simplest production-grade design that correctly owns this responsibility?**

Then implement that design.

Do not invent project rules, philosophies, or constraints.

If a constraint cannot be traced to `AGENTS.md`, an explicit user requirement, documented architecture, or a real technical limitation, **treat it as an assumption—not a requirement.**

**Improve the architecture. Do not merely preserve what you found.**
