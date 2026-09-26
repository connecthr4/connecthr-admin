---
name: ship
description: Push the current work the way this repo expects — move it off develop/main onto a feature or bugfix branch, find or create its ClickUp ticket, push, and open a pull request into develop. Use whenever the user asks to push, ship, raise an MR/PR, or "send this for review", and before any push while on develop or main.
argument-hint: '[short description of the change]'
---

# Ship

Takes local work to an open pull request, following this repo's flow:
`feature/*` or `bugfix/*` → PR into `develop` → (release) PR from `develop` into `main`.

Nothing is pushed to `develop` or `main` directly. Ask the user once, before anything goes outside this
machine: step 5 collects every decision in a single prompt.

`$ARGUMENTS`, if given, describes the change. Use it for the branch name, the ticket search and the PR title.

## Fixed facts about this repo

- GitHub repo: `connecthr4/connecthr-admin`. The `origin` remote uses the SSH alias `github-work`, which `gh`
  cannot map to github.com, so **always pass `--repo connecthr4/connecthr-admin`** to `gh`.
- PR base branch: `develop`.
- Branch names: `feature/<kebab-case>` for new behaviour, `bugfix/<kebab-case>` for fixes. Keep them short:
  3–5 words, no ticket ID. Match the existing branches (`git branch -a`).
- ClickUp: workspace `9014669434`, space **HRMS** (`90145488832`), default list **HRMS - UI** (`901416169986`).
  This is a UI repo, so tickets go there unless the user says otherwise.
- The `AI MR Description` workflow fills in the PR description between `<!-- AI:START -->` and
  `<!-- AI:END -->` and keeps the rest of the body. Don't write a long description; step 8 says what goes in.
- Husky runs lint-staged on commit. If a hook fails, fix the cause and commit again. Never pass `--no-verify`.

## Steps

### 1. Preflight

Run these and stop with clear instructions if any fails:

- `gh --version` and `gh auth status`. If `gh` is missing, tell the user to run `brew install gh`. If it isn't
  logged in, tell them to run `! gh auth login` and pick the GitHub account that has access to `connecthr4`.
  Then stop. Those are interactive and belong to the user.
- `git fetch origin develop --quiet`
- `git status --porcelain=v1 -b`, `git branch --show-current`, and
  `git log --oneline origin/develop..HEAD` (commits not on develop yet).

If there is nothing to ship (clean tree and no commits ahead of `origin/develop`), say so and stop.

### 2. Work out the situation

| Current branch | What happens |
|---|---|
| `develop` | New branch needed. The work may be uncommitted, committed locally, or both. |
| `main` | New branch needed. Warn that work should start from `develop`. If the local commits don't apply cleanly onto `origin/develop`, stop and ask. |
| Anything else | Use the current branch. Skip branch creation. If a PR for it already exists (`gh pr view <branch> --repo connecthr4/connecthr-admin --json url,state`), this becomes a normal push, and step 8 only reports the existing PR. |

Read the changes (`git diff origin/develop...HEAD --stat`, `git diff --stat`, and the diff itself if the stat
isn't enough) so you understand what is being shipped. The branch name, ticket and PR are all based on it.

### 3. Find the ticket

Look in this order and stop at the first hit:

1. A ClickUp task ID or URL in `$ARGUMENTS`, the branch name, or the commit messages
   (`CU-<id>`, `app.clickup.com/t/<id>`).
2. `clickup_search` with 2–4 keywords from the change (for example "holidays responsive cards"). Filter to
   `asset_types: ["task"]` and location list `901416169986`, and exclude `closed`/`archived`. Keep the best
   3 matches, judged by title.

If nothing credible turns up, plan a new ticket. Drafting it follows the user's `/ticket` command:
- **Title:** a short, clear imperative summary.
- **List:** HRMS - UI.
- **Assignee:** the user (resolve "me" with `clickup_resolve_assignees`).
- **Priority:** `normal`.
- **Description:** a short markdown summary of the change, written from the diff.

Load ClickUp tools with ToolSearch if they are deferred.

### 4. Draft the rest

- **Branch name** (only if a new branch is needed): `feature/…` or `bugfix/…`, based on what the diff does.
- **Commit message** (only if there are uncommitted changes): match the repo's short lower-case style
  (`git log --oneline -10`), and end with the attribution lines the session asks for.
- **PR title:** a sentence-case summary, under 70 characters.

### 5. Confirm once

Show the whole plan in a single `AskUserQuestion`: branch, ticket (existing match or the new draft), commit
message, PR title and base. When search found candidates, the options are the candidates plus "Create a new
ticket". Otherwise it is one "Go ahead" option; the user can edit through "Other". Do nothing outward-facing
before this answer.

### 6. Branch and commit

On `develop` or `main`:
1. `git switch -c <branch>`. This carries uncommitted changes and local commits along.
2. If the old branch had local commits that aren't on `origin`, reset it so it doesn't stay diverged:
   `git branch -f <old-branch> origin/<old-branch>`. This moves only the branch pointer, and the work is safe on the
   new branch. Mention it in the report.

Then, if the tree is dirty, stage the changes by path (`git add <paths>`, never `-A`), leaving out anything that
looks like a secret or a local artefact (`.env*`, logs, `*.tsbuildinfo`, `storybook-static/`), and commit.

### 7. Create the ticket (if new), then push

- `clickup_create_task` with the confirmed draft. Keep the `task_url`.
- `git push -u origin <branch>`. If the push is rejected, stop and report. Never force-push.

### 8. Open the PR

Skip this if step 2 found an existing PR.

```
gh pr create --repo connecthr4/connecthr-admin --base develop --head <branch> \
  --title "<title>" --body-file <tmp file>
```

Body (the CI adds its AI description below it):

```
**ClickUp:** [<ticket name>](<task_url>)

<2–4 bullet summary of what changed and why>

<attribution line the session asks for>
```

Write the body to a file in the scratchpad rather than inlining it, so quotes and backticks survive.

### 9. Link back and report

- Add a comment on the ClickUp task with the PR link (`clickup_create_task_comment`). If the task's status is
  still an unstarted one (e.g. "to do"), ask whether to move it to the in-review status rather than guessing
  the status name.
- Report in a few lines: branch, ticket link, PR link, and anything that was done to `develop` or `main`
  locally (step 6.2).
