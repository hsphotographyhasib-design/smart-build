---
name: design-system-procore-construction-management-software
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Procore Construction Management Software

## Mission
Deliver implementation-ready design-system guidance for Procore Construction Management Software that can be applied consistently across dashboard web app interfaces.

## Brand
- Product/brand: Procore Construction Management Software
- URL: https://www.procore.com/en-sg
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Inter Tight`, `font.family.stack=Inter Tight, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=12px`, `font.size.md=14px`, `font.size.lg=16px`, `font.size.xl=18px`, `font.size.2xl=20px`, `font.size.3xl=24px`, `font.size.4xl=28px`
- Color palette: `color.surface.base=#000000`, `color.text.secondary=#1a202c`, `color.text.tertiary=#595552`, `color.text.inverse=#ff5201`, `color.surface.muted=#ffffff`, `color.surface.raised=#f5f1ed`, `color.surface.strong=#cbbaab`, `color.border.default=#e2e8f0`
- Spacing scale: `space.1=6px`, `space.2=8px`, `space.3=10px`, `space.4=12px`, `space.5=18px`, `space.6=24px`, `space.7=25px`, `space.8=25.01px`
- Radius/shadow/motion tokens: `radius.xs=2.26px`, `radius.sm=4px`, `radius.md=5.2px`, `radius.lg=50px`, `radius.xl=22369600px` | `motion.duration.instant=150ms`, `motion.duration.fast=200ms`, `motion.duration.normal=250ms`, `motion.duration.slow=300ms`, `motion.duration.slower=420ms`, `motion.duration.step6=500ms`, `motion.duration.step7=700ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
