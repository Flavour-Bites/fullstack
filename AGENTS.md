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
