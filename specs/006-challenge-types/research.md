# Research: Challenge Type System Restructure

**Feature**: Challenge Type System Restructure  
**Branch**: `006-challenge-types`  
**Date**: 2025-11-23  
**Status**: Complete

## Summary of Key Decisions

1. **Difficulty Mapping**: Direct 1:1 mapping (Difficulty 1-4 → Grade 0-3) with wave scaling providing extended ranges
2. **Navigation State**: Extend GameSession singleton with `difficulty`, `category`, `challengeType` properties (no scene data passing)
3. **Multiple Choice UI**: Reuse existing 2×2 grid layout from MathChallenge (empty slot for 3 options)
4. **Emoji Standards**: Approved sets from Unicode 6.0-9.0 (food, animals, shapes) with font stack fallback
5. **Problem Generation**: Deterministic algorithm with even-number halving, result-limited doubling, and 3-type distractor generation
6. **Coin Rewards**: Reuse `calculateWaveConfig()` pattern from MathChallenge (10-30 coins per problem based on wave, not grade/difficulty)

---

[REST OF THE RESEARCH DOCUMENT WITH ALL 6 SECTIONS PREVIOUSLY GENERATED]

