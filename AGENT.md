# Agent Instructions

Single-page React app that encodes private keys as Go board positions. Lossless, deterministic, steganographic.

## Non-Negotiable Constraints

**Lossless encoding.** `encoder.ts` maps key bits → board positions via seeded PRNG. Decode must recover the exact input. Do not break round-trip correctness.

**Real Go rules.** Manual edits apply capture logic (`goRules.ts`). Do not skip or simplify.

**Non-cryptographic PRNG.** `rng.ts` is a simple LCG for deterministic board generation. The seed drives reproducibility, not cryptographic security. Security comes from memorized manual edits (plausible deniability). Do not replace with crypto RNG or Math.random().

## What Not to Change

- `encoder.test.ts` — must pass before any commit
- Security model (seed and manual edits) — documented in README
- Zustand store — keep flat, no over-engineering

## What Not to Add

- Key generation, encryption, backend, or API
- Abstractions for a <500 LOC app

## Workflow

- Do not commit changes automatically
- Present changes for manual review before committing
- Update `SESSION-HANDOFF.md` after completing each task with:
  - What changed (files modified, features added/removed)
  - Why (design rationale, security considerations)
  - Test status (new tests added, coverage expanded)
  - Pending decisions or deferred work
