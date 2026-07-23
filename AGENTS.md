# Flavour Bites — Agent Instructions

## Branch Discipline (STRICT)

**Every piece of work gets its own branch. No exceptions.**

### Rules

1. **Before any commit** — ask: "Is this related to the current branch's purpose?"
   - Yes → commit to current branch
   - No → create a new branch first
2. **Never mix concerns** — lint fixes, test fixes, features, and docs all go on separate branches
3. **Branch naming convention:**
   - `feat/<short-description>` — new features
   - `fix/<short-description>` — bug fixes
   - `refactor/<short-description>` — code restructuring
   - `test/<short-description>` — test additions/fixes
   - `chore/<short-description>` — tooling, config, deps
   - `docs/<short-description>` — documentation only
4. **One branch = one PR** — each branch gets its own pull request
5. **After merging** — delete the branch and start fresh for the next piece of work
6. **Never commit to `main` or `dev` directly** — always go through a branch + PR

### Example Workflow

```
Working on OIDC feature     → feat/telegram-oidc
Lint breaks after merge     → fix/lint-errors-after-oidc  (new branch!)
Adding test scripts         → chore/vitest-test-scripts   (new branch!)
```

### What NOT to Do

- ❌ Dumping multiple unrelated fixes on one branch
- ❌ Committing lint/test fixes on a feature branch after PR is merged
- ❌ Pushing directly to `main` or `dev`

## Current Branches

- `fix/critical-security-issues` — Security fixes + CI/CD setup
- `fix/deployment-config` — (pre-existing) Deployment configuration fixes

## Engineering Principles

**All agents must follow these principles for every task.**

### General Principles

* Always prefer well-designed, long-term solutions over quick fixes.
* Never introduce hacks, band-aid fixes, or temporary workarounds just to make something pass.
* Do not solve problems by scattering random `if` statements, special cases, or duplicated logic throughout the codebase.
* Every solution should address the root cause, not merely the symptom.
* If the current design makes a clean solution difficult, refactor the design instead of forcing a poor implementation.

### Code Quality

* Write clean, readable, and self-explanatory code.
* Follow SOLID principles whenever appropriate.
* Keep functions small and focused on a single responsibility.
* Avoid deeply nested logic whenever possible.
* Eliminate duplication by extracting shared logic into reusable components or utilities.
* Use meaningful names for variables, functions, classes, and files.
* Prefer composition over unnecessary inheritance or tightly coupled designs.

### Architecture

* Maintain a clean, modular architecture.
* Every module should have a clear and well-defined responsibility.
* Avoid "God files" and "God classes." No single file should become responsible for multiple unrelated concerns.
* Keep business logic, UI, data access, configuration, utilities, and infrastructure concerns properly separated.
* New features should integrate naturally into the existing architecture instead of bypassing it.
* Preserve loose coupling and high cohesion between modules.

### Maintainability

* Write code that another engineer can easily understand six months from now.
* Optimize for maintainability over cleverness.
* Keep dependencies between modules minimal and intentional.
* Remove dead code, obsolete utilities, and unused abstractions whenever encountered.
* Refactor opportunistically when it improves clarity without introducing unnecessary complexity.

### Scalability

* Design implementations that can accommodate future requirements without requiring significant rewrites.
* Avoid hardcoded values, assumptions, and feature-specific logic where a general solution is more appropriate.
* Build reusable abstractions only when they solve real recurring problems, not hypothetical ones.

### Error Handling

* Handle failures gracefully.
* Provide meaningful error messages.
* Avoid swallowing exceptions silently.
* Validate inputs at appropriate boundaries.
* Prefer explicit handling over hidden behavior.

### Testing

* Ensure new code is testable.
* Avoid designs that make unit testing unnecessarily difficult.
* Update or add tests whenever behavior changes.
* Preserve existing functionality unless a change is explicitly intended.

### Performance

* Consider performance, but never sacrifice maintainability for premature optimization.
* Optimize only where there is measurable value or a clear bottleneck.

### Decision Making

Before implementing any solution:

1. Understand the root problem completely.
2. Consider multiple approaches.
3. Evaluate the trade-offs.
4. Choose the cleanest and most maintainable design.
5. Explain why that approach was selected if the decision is non-trivial.

Never choose an implementation simply because it is the fastest to write.

### Refactoring

If implementing a feature exposes architectural weaknesses:

* Refactor the surrounding code where appropriate.
* Improve the overall design rather than layering new logic onto a poor foundation.
* Leave the codebase in a better state than you found it.

### Expected Standard

Write code as if it will be maintained by a senior engineering team for years. Every implementation should be production-ready, modular, readable, extensible, and aligned with clean software engineering principles rather than short-term convenience.
