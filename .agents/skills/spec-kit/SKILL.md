---
name: spec-kit
description: "Spec-Driven Development (SDD) toolkit from GitHub. Guide features through constitution, specification (what & why), technical plan (how & schema), task checklist, and verifiable implementation. Use when planning or developing features to minimize guesswork and technical debt."
---

# GitHub Spec-Kit: Spec-Driven Development

Spec-Kit enforces a structured, testable engineering workflow for AI agents and developers.

## The Spec-Driven Workflow

1. **Constitution (`.specify/memory/constitution.md`)**:
   - Check ground rules, technical standards, latency budgets, and architecture patterns before proposing or writing code.

2. **Specify (`/speckit-specify` -> `specs/<feature-id>/spec.md`)**:
   - Capture user requirements, user stories, edge cases, and expected acceptance criteria.
   - Focus on *what* to build and *why*, not implementation details.

3. **Plan (`/speckit-plan` -> `specs/<feature-id>/plan.md`)**:
   - Translate specifications into architecture blueprints, entity models, and API contracts.

4. **Tasks (`/speckit-tasks` -> `specs/<feature-id>/tasks.md`)**:
   - Break down the plan into small, logically ordered, checkable tasks.

5. **Implement (`/speckit-implement`)**:
   - Execute tasks sequentially, verifying against automated test cases and benchmarks.

