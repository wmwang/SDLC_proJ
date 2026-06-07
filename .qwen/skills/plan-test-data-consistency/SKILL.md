---
name: plan-test-data-consistency
description: Ensure test data structures match actual implementation before writing tests in plan.md
source: auto-skill
extracted_at: '2026-06-07T11:08:48.963Z'
---

# Plan Test Data Consistency

When writing plan.md test steps, always verify test data structures against the actual implementation *before* committing the plan. Mismatches between plan test data and implementation return types are a common source of integration failures.

## Why This Matters

In `add-global-weather` Task 5, the plan's WeatherCard test expected `{ loading: bool, data: {...}, error: str }` but the existing `useWeatherData` hook returns `{ temp, weatherCode, humidity, windSpeed, error }` (flat, no `data` wrapper). This mismatch forced an ad-hoc compatibility layer in WeatherCard.

## How to Apply

When writing test steps in plan.md, follow this sequence:

1. **Read the actual implementation first** — Before writing test data structures for a hook or component, read the existing implementation file to confirm return types and prop shapes.
2. **Cross-reference with existing tests** — Check `__tests__/` files that already test the same hook/component for the correct data shape.
3. **Write plan tests that match** — Use the confirmed shape in plan.md test code blocks.
4. **If you must assume a shape** — Document the assumption as a TODO in the plan (e.g., `// TODO: Verify weather data shape matches useWeatherData return type`) so it's caught during implementation.

## Key Lesson

> Never define test data structures in a plan based on documentation or memory — always read the source file first. The plan is the contract; if the contract's test data is wrong, the implementation pays the cost.

## Related Pattern: Environment-Specific Test Setup

When integration tests need environment globals (localStorage, fetch, etc.) that aren't available in the test runtime, pre-write the mock setup in the plan test step. Reference existing patterns in the codebase (e.g., `App.test.jsx` for localStorage mock) to keep it consistent.