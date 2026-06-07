---
name: openspec-propose-fopd
description: Propose change using fopd-sdlc schema - creates proposal, specs, design, plan artifacts in Traditional Chinese
source: auto-skill
extracted_at: '2026-06-06T02:23:01.218Z'
---

Propose a new change using the `fopd-sdlc` schema.

**Artifacts**: proposal.md → specs/<capability>/spec.md → design.md → plan.md

---

**IMPORTANT: Read schema first**

Before starting, ALWAYS read `openspec/config.yaml` to determine the project schema.
The default schema for this project is `fopd-sdlc`, which uses:
- `plan.md` (NOT tasks.md)
- Artifact order: proposal → specs → design → plan

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → `add-user-auth`).

   **IMPORTANT**: Do NOT proceed without understanding what you want to build.

2. **Check if change already exists**
   ```bash
   ls openspec/changes/<name>/ 2>/dev/null
   ```
   If exists, ask user if they want to continue or use a different name.

3. **Create the change directory structure**
   ```bash
   mkdir -p openspec/changes/<name>/specs
   ```
   Create `.openspec.yaml` with the schema from config.yaml.

4. **Create artifacts in order**

   Use the **TodoWrite tool** to track progress.

   **Order**: proposal → specs → design → plan

   a. **proposal.md**
      - Read `openspec/config.yaml` for project context
      - Read `openspec/specs/` to understand existing capabilities
      - Create proposal.md following the schema instruction
      - Include: Why, What Changes, Capabilities (New/Modified), Impact

   b. **specs/<capability>/spec.md**
      - Read proposal.md
      - For each capability in "New Capabilities":
        - Create `specs/<name>/spec.md`
        - Use delta format: ## ADDED/MODIFIED/REMOVED Requirements
        - Each requirement needs scenarios with `####` headers

   c. **design.md**
      - Read proposal + specs
      - Include: Context, Goals/Non-Goals, Decisions (with rationale), Risks, Migration
      - Only create if truly needed (cross-cutting, new dependencies, complexity)

   d. **plan.md**
      - Read all artifacts
      - Include three sections:
        - A. Task list (checkboxes `- [ ]`)
        - B. Test cases (reference specs scenarios)
        - C. TDD micro-steps (Red-Green-Refactor per task)

5. **Show final summary**

   ```
   ## Change Created: <name>

   **Location:** openspec/changes/<name>/
   **Schema:** fopd-sdlc

   ### Artifacts Created
   - proposal.md - Why we're doing this
   - specs/<capability>/spec.md - Requirements and scenarios
   - design.md - Technical approach
   - plan.md - Implementation checklist with TDD steps

   All artifacts created! Ready for implementation.
   Run `/opsx-apply` to start implementing the tasks.
   ```

**Guardrails**
- Create ALL artifacts needed for implementation (as defined by schema's `apply.requires`)
- Always read dependency artifacts before creating a new one
- If context is critically unclear, ask the user - but prefer making reasonable decisions to keep momentum
- If a change with that name already exists, ask if user wants to continue it or create a new one
- Verify each artifact file exists after writing before proceeding to next
- **Language**: All artifact content MUST be written in Traditional Chinese (繁體中文)
