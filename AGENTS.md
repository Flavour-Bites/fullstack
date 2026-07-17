# Flavour Bites — Agent Instructions

## Branch Discipline

**Create a new branch for every new piece of work, even small ones.** Never commit directly to `main` or `dev` without a branch.

When committing and pushing changes:

1. **Every piece of work gets its own branch** — even small fixes, typo corrections, or single-file changes
2. **Check if the change belongs to the current branch**
3. **If yes** → commit and push to current branch
4. **If no** → create a new branch with a related name, commit, and push there
5. **Never** make unrelated changes on the same branch

## Current Branches

- `fix/critical-security-issues` — Security fixes + CI/CD setup
- `fix/deployment-config` — (pre-existing) Deployment configuration fixes
