---
description: Write manual test cases for a module by reading its code, then publish them to Qase
---

Act as the QA engineer who owns this product. For the module the user names, read the
actual implementation, work out every flow a tester would have to exercise by hand, write
the manual test cases, and publish them into the Qase project. Do not write automated
tests and do not touch application code — this command only produces test documentation.

## 0. Load tooling

If the Qase MCP tools are deferred, load them in a single call:

`ToolSearch` with query
`select:mcp__qase__qase_project_context,mcp__qase__qase_case_upsert,mcp__qase__qase_get,mcp__qase__qql_search,mcp__qase__qase_api,mcp__qase__qase_discover_tools`

The Qase project for this repo is **`CHW` (ConnectHR Web)**. Only use another project if
the user explicitly names one.

## 1. Pick the module

`$ARGUMENTS` is the module name when the user supplied one (e.g. `/testcases holidays`,
`/testcases employee wizard`). Match it loosely against the module map below.

If no argument was given, or the argument is ambiguous, ask **once** with
`AskUserQuestion`, offering the modules that actually exist in the codebase. Never guess
between two plausible modules — ask.

If the user names a sub-area ("holiday export", "step 2 of the wizard"), scope the run to
that sub-area rather than the whole module.

### Module map (verify against the tree — it changes)

| Module | Where the flow lives |
|---|---|
| Authentication / Login | `src/app/login/`, `src/components/LoginPanel/`, `src/lib/actions/auth.ts`, `src/lib/api/auth.ts`, `src/lib/auth/` |
| Password reset | `src/app/reset-password/`, `src/lib/actions/auth.ts` |
| Session / idle timeout | `src/lib/auth/idle.ts`, `idleGate.ts`, `session.ts`, `cookies.ts`, `revoke.ts`, `src/components/AuthHydrator/` |
| Dashboard | `src/app/dashboard/`, `src/components/Dashboard/`, `StatsSummaryCard/`, `BasePieChart/`, `ChartContainer/`, `UpcomingHolidaysCard/`, `src/lib/api/dashboard.ts` |
| Employees (directory) | `src/app/employees/`, `src/components/EmployeesDashboard/`, `DataTable/`, `TableToolbar/`, `Pagination/`, `SearchInput/`, `FilterPopover/`, `src/lib/api/employees*.ts` |
| Employee creation / edit | `src/app/employees/new/`, `src/app/employees/[employeeId]/edit/`, `src/components/EmployeeWizard/`, `Stepper/`, `PersonalInformationForm/`, `ProfessionalInformationForm/`, `PayrollInformationForm/`, `DocumentUpload/`, `src/lib/actions/employees.ts`, `src/store/employeeStore/` |
| Employee details | `src/app/employees/[employeeId]/`, `src/components/EmployeeDetails/` |
| Holidays | `src/app/holidays/`, `src/components/HolidaysDashboard/`, `AddHolidayModal/`, `HolidayMonthCard/`, `src/lib/api/holidays*.ts`, `src/app/api/holidays/` |
| Users / roles | `src/app/users/`, `src/components/UsersDashboard/`, `src/lib/api/users*.ts`, `src/lib/auth/roles.ts`, `src/app/api/users/` |
| Create user | `src/app/create-user/`, `src/components/CreateUserDashboard/` |
| Departments | `src/app/departments/`, `src/components/DepartmentsDashboard/`, `DepartmentEmployeeCard/` |
| Export | `src/components/ExportScopeOptions/`, `ExportConfirmationModal/`, `src/lib/api/fileDownload.ts`, `fileResponse.ts`, `src/app/api/*/export/` |
| Navigation / shell | `src/components/LeftNavBar/`, `AppHeader/`, `BaseLayout/`, `Breadcrumbs/`, `UserMenu/`, `src/constants/navigation.ts` |

## 2. Read the code before writing anything

Explore in parallel; read whole files, not fragments. For the chosen module gather:

- **Routes and entry points** — `page.tsx`, `layout.tsx`, `loading.tsx`, any route guard or
  redirect, and how the module is reached from `NAV_ITEMS`.
- **Every interactive control** — buttons, inputs, dropdowns, modals, tables, pagination,
  search, filters, sort, export, file upload. Note disabled/loading states.
- **Validation rules** — required fields, formats, min/max, cross-field rules, trimming,
  and the exact error copy. Pull literal strings from `src/constants/strings.ts` and the
  components themselves.
- **Server actions and API calls** — `src/lib/actions/`, `src/lib/api/`, `src/app/api/`.
  Note the success path, each error branch, and what the user sees for each.
- **Role gating** — `src/lib/auth/roles.ts`, `requiresUserManagement` in
  `src/constants/navigation.ts`, and any server-side guard. Both the hidden-nav courtesy
  and the real route guard are testable.
- **State** — `src/store/`, wizard step persistence, what survives a reload or a back
  navigation.
- **Existing unit tests** (`*.test.ts`) — they document intended edge cases; mine them.

Ground every expected result in what the code actually does. Never invent a label, a
toast message, a route, or a validation string — quote the real one. If behaviour is
genuinely unclear from the code, say so in the case description rather than guessing.

## 3. Build the flow inventory

Before drafting cases, list the flows you found: happy paths, alternate paths, validation
branches, permission branches, and state transitions. Sanity-check the list for the usual
gaps a tester would catch:

- Happy path, end to end, with the result verified after a page reload.
- Every validation rule, including whitespace-only input and boundary values.
- Duplicate / conflicting data (same email, same holiday date, same name).
- Permission: allowed role, forbidden role, and direct URL entry bypassing hidden nav.
- Session: expired session mid-flow, idle timeout, browser back after logout.
- Empty state, single item, and a large list (pagination boundaries, page size edges).
- Search / filter / sort — including no-results and filter+search combined, and whether
  filters survive pagination.
- Network and server errors: 4xx, 5xx, timeout — what the user is shown, and recovery.
- Cancel / dismiss paths — modal overlay click, Esc, browser back mid-wizard.
- Double submission and the in-flight disabled state.
- File upload limits (type, size) where the module has uploads.
- Export: scope options, confirmation modal, the downloaded file's contents.

## 4. Write the cases in the project's house style

Match the cases already in `CHW` — read two or three from the target module's neighbouring
suite first (`qase_get` on a case id from `qql_search`) if you need to re-calibrate.

Style rules:

- **Title**: a sentence stating the behaviour under test, not a label.
  Good: `First-time sign-in is diverted to the password reset screen`.
  Bad: `Login - TC03`.
- **Description**: 1–2 sentences on why the case exists and what it protects.
- **Preconditions**: a `-` bulleted list of the exact data and state the tester needs
  (account role, existing records, cleared session).
- **Postconditions**: only when the case leaves state behind that must be cleaned up.
- **Steps**: `action` / `expected_result` / `data`. One user intent per step. Every step
  must have a verifiable expected result — no bare "click the button". Put concrete
  sample values in `data` (placeholder emails, `<known valid password>` style tokens).
- **Fields** (pass labels — the server normalises them):
  - `priority`: `high` for auth, data-loss and primary flows; `medium` for validation and
    secondary paths; `low` for cosmetic.
  - `severity`: `blocker` / `critical` / `major` / `normal` / `minor`.
  - `type`: `smoke` for the primary happy path, `functional` for most, `security` for
    permission and information-disclosure cases, `usability` for empty/loading states.
  - `layer`: `e2e`. `behavior`: `positive` / `negative` / `destructive`.
  - `is_manual`: true. `status`: `actual`.
- **Tags**: a module tag (`auth`, `holidays`, `employees`, `users`, `export`), a priority
  tag (`p0` / `p1` / `p2`), and a kind tag (`smoke`, `validation`, `negative`,
  `permissions`, `onboarding`, `regression`).

Aim for the coverage the module deserves rather than a fixed count — typically 3–6 cases
per sub-suite. Prefer one thorough case over three that repeat the same setup.

## 5. Place them in the suite tree

Suites live under the root suite `ConnectHR Web` (id `1`). The shape is
`Module → sub-suite per feature area` (e.g. `Holidays → Add Holiday`).

1. Call `qase_project_context` with `code: "CHW"` to get the current tree.
2. Reuse an existing suite when one matches. Create missing suites with
   `qase_api` `POST /v1/suite/CHW` (`{title, description, parent_id}`), module suites
   under id `1` and sub-suites under the module suite.
3. Check for duplicates before writing: `qql_search` with
   `entity = "case" and project = "CHW" and suite = "<suite title>"`, or list the suite's
   cases via `qase_api` `GET /v1/case/CHW?suite_id=<id>`. If a case with the same
   behaviour already exists, **update it** by passing its `id` to `qase_case_upsert`
   instead of creating a near-duplicate.

## 6. Confirm, then publish

Publishing writes to a shared external system, so show the plan first: a compact numbered
table of `title | suite | priority | type`, plus which are new and which update an
existing case. Ask for a go-ahead in one line.

On approval, create each case with `qase_case_upsert` (`code: "CHW"`, `suite_id`, and the
fields above). Batch the calls. If one fails, report which and carry on with the rest.

## 7. Report

Finish with:

- A table of the created/updated cases: `CHW-<id> | title | suite`, each id linked as
  `https://app.qase.io/case/CHW-<id>`.
- The suites created, if any.
- **Gaps**: anything you could not turn into a reliable manual case — behaviour the code
  left ambiguous, flows needing backend data you cannot describe, or areas that need a
  spec decision. Be explicit rather than silently dropping them.
