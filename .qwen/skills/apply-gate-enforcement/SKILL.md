---
name: apply-gate-enforcement
description: Enforces human approval gate checks before OpenSpec apply implementation. Must be followed whenever executing openspec-apply-change or /opsx:apply.
source: auto-skill
extracted_at: '2026-06-07T00:24:19.986Z'
---

# Apply Gate Enforcement

This skill enforces the **human approval gate** that must be checked before any implementation work begins in an OpenSpec apply phase.

## Why This Exists

The `openspec-apply-change` skill reads context files and begins implementation, but it relies on the schema's `instruction` field (natural language) to enforce gates. AI agents can skip or rationalize past natural language instructions. This skill provides a **structural checklist** that must be completed before any code is written.

## Procedure

### Step 0: Gate Check (BEFORE reading context files or writing code)

After running `openspec instructions apply --change "<name>" --json` and BEFORE Step 4 (Read context files) of `openspec-apply-change`:

1. **Check `state` field from CLI output:**
   - If `state: "blocked"` → STOP. Show blocked message, suggest `/opsx:continue`. Do NOT proceed.
   - If `state: "all_done"` → STOP. Congratulate, suggest `/opsx:archive`. Do NOT proceed.
   - If `state: "ready"` → continue to gate check below.

2. **Check if `verify` is in `contextFiles`:**
   - If `verify` key exists in `contextFiles` → read verify.md immediately
   - If `verify` key does NOT exist → this schema has no verify gate; skip to Step 1 of implementation

3. **Parse the Human Approval Gate section:**
   - Look for the section between `HUMAN_APPROVAL_GATE:START` and `HUMAN_APPROVAL_GATE:END` HTML comments
   - If those comments don't exist, look for a section titled "人類最終決策" or "Human Approval Gate"
   - Parse all `- [ ]` / `- [x]` checkboxes in that section

4. **Evaluate checkbox states:**
   - If `- [x] ✅` (Approved) is checked → gate passed, proceed to implementation
   - If `- [x] ⚠️` (Conditional) is checked → read user notes for conditions, satisfy them first
   - If `- [x] ❌` (Rejected) is checked → STOP, inform user, suggest revision
   - If ALL checkboxes are `- [ ]` (unchecked) → **STOP IMMEDIATELY**. Output this exact message:

   > ## ⛔ Apply Blocked — Human Approval Required
   >
   > **Change:** `<change-name>`
   >
   > verify.md exists but the human approval gate has not been checked. No implementation can proceed.
   >
   > Please open `verify.md` and check one of the boxes in the "Human Approval Gate" section:
   > - `✅ Approved — proceed to apply`
   > - `⚠️ Conditional approval`
   > - `❌ Rejected — revision required`
   >
   > Then re-run `/opsx:apply <change-name>`.

5. **Do NOT proceed past this point until the gate is passed.**
   - Do NOT read code files
   - Do NOT write implementation code
   - Do NOT modify plan.md checkboxes
   - Do NOT create test files

### Step 0.5: Instruction Acknowledgment

After gate check passes, read the full `instruction` field from the CLI output. The instruction may contain additional schema-specific requirements (skill preflight, worktree setup, etc.). Follow those before proceeding to Step 1 of `openspec-apply-change`.

## Integration with openspec-apply-change

This skill inserts between Steps 3 and 4 of `openspec-apply-change`:

```
openspec-apply-change Step 1: Select change
openspec-apply-change Step 2: Check status
openspec-apply-change Step 3: Get apply instructions
>>> apply-gate-enforcement Step 0: Gate check <<<
>>> apply-gate-enforcement Step 0.5: Instruction acknowledgment <<<
openspec-apply-change Step 4: Read context files
openspec-apply-change Step 5: Show progress
openspec-apply-change Step 6: Implement tasks
openspec-apply-change Step 7: Show status
```

## Defense in Depth

Three layers protect the gate:

| Layer | Mechanism | What it catches |
|-------|-----------|----------------|
| L1: CLI | `apply.requires: [plan, verify]` in schema.yaml | verify.md file doesn't exist → `state: "blocked"` |
| L2: Template | `HUMAN_APPROVAL_GATE:START/END` structured comments | Consistent format for future CLI parsing |
| L3: This skill | Structural checklist before any code | verify.md exists but checkboxes unchecked |

L1 is enforced by the openspec CLI. L2 is structural. L3 is enforced by this skill's procedure.
