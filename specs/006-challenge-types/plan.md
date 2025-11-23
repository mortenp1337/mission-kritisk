# Implementation Plan: Challenge Type System Restructure

**Branch**: `006-challenge-types` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-challenge-types/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Restructure the game's challenge selection system from grade-based (Klasse 0-3) to difficulty-based (Niveau 1-4) with categorized challenge types. Introduce two category groups: "Regnearter" (Arithmetic Operations) containing existing math operations, and "Logik Opgaver" (Logic Puzzles) featuring a new halves/doubles challenge with emoji-based visual representations, multiple choice format, and deterministic problem generation. The system will use submenu navigation and reuse existing scoring/coin reward logic for consistency.

## Technical Context

**Language/Version**: TypeScript 5.7+  
**Primary Dependencies**: Phaser 3.90+ (game framework), Vite 6+ (build tool)  
**Storage**: Browser localStorage via GameSession singleton (session state only)  
**Testing**: Playwright 1.56+ (E2E), matrix testing on Node.js 18 & 20, Chrome/Firefox/Safari  
**Target Platform**: Web browsers (Chrome, Firefox, Safari) - WebGL with Canvas fallback  
**Project Type**: Web game application (Phaser-based single-page game)  
**Performance Goals**: 60 FPS gameplay, <300ms UI response time, <15s navigation to active challenge  
**Constraints**: 1024x768 fixed resolution, emoji rendering support required, touch-friendly UI  
**Scale/Scope**: 4 difficulty levels, 2 category groups, 5+ challenge types (4 arithmetic + 1 logic initially), ~8 new scenes/components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED - All constitution principles satisfied

### I. Scene-Based Architecture ✅
- **Compliance**: All new navigation components (DifficultySelection, CategorySelection) will be implemented as Phaser scenes
- **Implementation**: Follows existing pattern (GradeSelection → MathChallenge flow)
- **Scene transitions**: Uses `this.scene.start('SceneName')` exclusively
- **Lifecycle**: Scenes implement `constructor()` and `create()` methods following Phaser 3 standards

### II. Bilingual Implementation (NON-NEGOTIABLE) ✅
- **Code**: All TypeScript code (class names, variables, functions, comments) in English
- **User Text**: All UI labels, menu items, difficulty descriptions in Danish
  - "Niveau 1 - Begynder", "Regnearter", "Logik Opgaver", "Halvdele og Dobbelte"
  - Emoji-based problem text with Danish questions
- **Example compliance**:
  ```typescript
  // English code structure
  export class DifficultySelection extends Scene {
      private difficultyButtons: GameObjects.Container[];
      
      // Danish user-facing text
      this.title = this.add.text(512, 150, 'Vælg Sværhedsgrad', {...});
  }
  ```

### III. Test-Driven Development (NON-NEGOTIABLE) ✅
- **Test strategy**: E2E tests for new navigation flow using Playwright
- **Coverage required**:
  - Difficulty selection interaction and persistence
  - Category menu navigation (back/forward)
  - Logic puzzle problem generation and validation
  - Multiple choice answer selection
  - Emoji rendering and grouping notation
  - Coin reward consistency across challenge types
- **Test files**: `tests/challenge-types/difficulty-selection.spec.ts`, `tests/challenge-types/logic-puzzles.spec.ts`
- **Browsers**: Chrome, Firefox, Safari across development and production builds

### IV. CI/CD Pipeline ✅
- **CI validation**: All new tests must pass in GitHub Actions on Node.js 18 & 20
- **PR preview**: Feature changes visible at `/preview/` for stakeholder review
- **Main deployment**: Automatic deployment to GitHub Pages root after merge
- **Quality gates**: TypeScript compilation, Playwright suite, build verification

### V. Type Safety & Build Optimization ✅
- **TypeScript strict mode**: All new entities and scenes with explicit type declarations
- **New types required**:
  - `DifficultyLevel` (1-4), `ChallengeCategory`, `ChallengeType`
  - `LogicProblem`, `MultipleChoiceOption`, `EmojiRepresentation`
- **Build compatibility**: Works with existing `vite/config.dev.mjs` and `vite/config.prod.mjs`
- **No new build dependencies**: Reuses Phaser, existing asset loading patterns

**Re-evaluation After Phase 1**: ✅ Design maintains constitution compliance - no violations introduced

## Project Structure

### Documentation (this feature)

```text
specs/006-challenge-types/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── difficulty-system.md        # Difficulty level mapping and validation
│   ├── category-navigation.md      # Category/submenu structure and state
│   ├── logic-problem-engine.md     # Halves/doubles generation and verification
│   └── scoring-integration.md      # Coin reward and scoring reuse contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/game/
├── main.ts                          # MODIFIED: Register new scenes
├── scenes/
│   ├── GradeSelection.ts            # DEPRECATED: To be replaced by DifficultySelection
│   ├── DifficultySelection.ts       # NEW: Difficulty level selection (1-4)
│   ├── CategorySelection.ts         # NEW: Challenge category group menu
│   ├── ChallengeTypeMenu.ts         # NEW: Submenu for challenge type selection
│   ├── MathChallenge.ts             # MODIFIED: Support difficulty mapping (1-4 → grade 0-3)
│   ├── LogicChallenge.ts            # NEW: Logic puzzle challenge scene with multiple choice UI
│   ├── TowerPlacement.ts            # NO CHANGE: Receives coins from any challenge type
│   └── DefenseWave.ts               # NO CHANGE: Gameplay remains unchanged
├── systems/
│   ├── GameSession.ts               # MODIFIED: Replace grade with difficulty, add challengeType
│   ├── MathProblemGenerator.ts      # MODIFIED: Accept difficulty parameter (1-4)
│   ├── LogicProblemGenerator.ts     # NEW: Halves/doubles problem generation engine
│   └── ChallengeRegistry.ts         # NEW: Maps categories to challenge types and scenes
├── entities/
│   ├── MathProblem.ts               # NO CHANGE: Existing math problem entity
│   ├── LogicProblem.ts              # NEW: Logic problem entity with emoji representation
│   └── MultipleChoiceOption.ts      # NEW: Answer option for logic puzzles
├── data/
│   ├── danishText.ts                # MODIFIED: Add difficulty labels, category names, logic puzzle text
│   ├── mathProblems.ts              # MODIFIED: getGradeTemplates accepts difficulty 1-4
│   ├── difficultyConfig.ts          # NEW: Difficulty level definitions and mappings
│   ├── challengeCategories.ts       # NEW: Category group and type definitions
│   └── emojiSets.ts                 # NEW: Emoji pools for logic puzzles (🍎🍐🐵⬜ etc.)
└── types/
    ├── GameTypes.ts                 # MODIFIED: Replace grade with difficulty, add challengeType
    ├── ChallengeTypes.ts            # NEW: DifficultyLevel, ChallengeCategory, ChallengeType
    └── LogicTypes.ts                # NEW: LogicProblem, ProblemType, EmojiSet interfaces

tests/
├── challenge-types/                 # NEW: Feature-specific tests
│   ├── difficulty-selection.spec.ts # Test difficulty selection and persistence
│   ├── category-navigation.spec.ts  # Test category menu and back navigation
│   ├── logic-puzzles.spec.ts        # Test halves/doubles generation and validation
│   ├── multiple-choice-ui.spec.ts   # Test answer selection and feedback
│   └── scoring-consistency.spec.ts  # Verify coin rewards match across challenge types
└── game.spec.ts                     # MODIFIED: Update flow tests for difficulty selection
```

**Structure Decision**: Single web game project structure maintained. New navigation scenes follow existing Phaser scene-based architecture. Logic puzzle system implemented as parallel challenge type alongside arithmetic operations. Core game loop (challenge → tower placement → defense) preserved with expanded challenge options.

## Complexity Tracking

**Status**: No constitutional violations - complexity tracking not required

All implementation decisions align with existing architecture patterns:
- Scene-based architecture maintained (Phaser 3 standard)
- No new external dependencies introduced
- Existing GameSession singleton pattern extended
- Test-driven development with Playwright E2E tests
- Bilingual implementation (English code, Danish UI)

No justification needed for architectural choices.

---

## Phase 0: Research & Investigation

**Purpose**: Resolve all unknowns before design phase

### Research Tasks

#### R1: Difficulty-to-Grade Mapping Strategy
**Question**: How should difficulty levels (1-4) map to existing grade templates (0-3) for arithmetic operations?

**Investigation**:
- Review `src/game/data/mathProblems.ts` GRADE_TEMPLATES structure
- Analyze problem complexity progression (number ranges, operations)
- Determine if 1:1 mapping (difficulty N → grade N-1) is appropriate
- Consider if difficulty 4 needs extended ranges beyond grade 3

**Expected Output**: Mapping table in research.md with rationale

---

#### R2: Scene Navigation State Management
**Question**: How should category selection state be preserved when navigating back from challenge scenes?

**Investigation**:
- Review GameSession singleton pattern in `src/game/systems/GameSession.ts`
- Examine scene transition patterns in existing code (GradeSelection → MathChallenge)
- Determine if category/type selection should persist in GameSession or use scene data
- Evaluate back navigation flow: Challenge → CategorySelection → DifficultySelection

**Expected Output**: State management strategy with code examples in research.md

---

#### R3: Multiple Choice UI Layout Pattern
**Question**: What UI layout works best for 3-4 multiple choice options with emoji/text content at 1024x768 resolution?

**Investigation**:
- Review existing answer button layout in `src/game/scenes/MathChallenge.ts` (2x2 grid for 4 options)
- Consider vertical stacking vs grid layout for variable option counts
- Analyze space requirements for emoji grouping notation (e.g., "🍎×8")
- Evaluate touch target sizes for tablet/mobile (minimum 44x44 pixels)

**Expected Output**: UI mockup description with button dimensions and positioning in research.md

---

#### R4: Emoji Rendering Consistency
**Question**: Which emoji sets render consistently across Chrome, Firefox, Safari without custom fonts?

**Investigation**:
- Test common emoji categories: food (🍎🍐🍌), animals (🐵🐶🐱), shapes (⬜🔷🔴)
- Verify rendering on Mac Safari, Chrome, Firefox (primary test environments)
- Identify any emoji that render as boxes or inconsistently
- Document fallback strategy for unsupported emoji

**Expected Output**: Approved emoji list and fallback guidelines in research.md

---

#### R5: Halves/Doubles Problem Generation Rules
**Question**: What are the complete generation rules for valid, non-repetitive halves and doubles problems?

**Investigation**:
- Define constraints for halving (starting with even numbers, whole number results)
- Define constraints for doubling (result limits per difficulty level)
- Design distractor generation algorithm (off-by-one, reversed operation, etc.)
- Create uniqueness tracking strategy (hash problem structure, not just answer)
- Establish real-world scenario templates (prices, quantities, recipes)

**Expected Output**: Algorithmic specification for problem generation in research.md

---

#### R6: Coin Reward Calculation Consistency
**Question**: Where is the existing coin reward calculation implemented and how should it be reused?

**Investigation**:
- Locate coin reward logic in MathChallenge scene (check `handleAnswer` method)
- Identify any grade-based scaling in coin amounts
- Determine if logic puzzle rewards should match exactly or scale differently
- Review GameSession.addCoins() usage pattern

**Expected Output**: Code location reference and reuse strategy in research.md

---

### Research Deliverable

Output file: `specs/006-challenge-types/research.md`

**Required sections**:
1. **Difficulty Mapping** - Table showing difficulty 1-4 → grade 0-3 mapping with number ranges
2. **Navigation State** - Flow diagram and code examples for category/type persistence
3. **Multiple Choice UI** - Layout specifications with dimensions and positioning
4. **Emoji Standards** - Approved emoji list organized by category with browser compatibility notes
5. **Problem Generation Algorithm** - Pseudocode for halves/doubles generator with distractor rules
6. **Scoring Integration** - Code pointers and reuse pattern for coin rewards

---

## Phase 1: Design & Contracts

**Purpose**: Define data models, APIs, and component contracts

**Prerequisites**: Phase 0 research complete, all NEEDS CLARIFICATION resolved

### Design Artifacts

#### D1: Data Model (`data-model.md`)

**Required entities** (extracted from spec):

1. **DifficultyLevel**
   - Type: Number enum (1-4)
   - Properties: level value, display label (Danish), subtitle (Danish), grade mapping (0-3)
   - Validation: Must be 1-4 inclusive
   - Relationships: Maps to grade templates, determines problem complexity

2. **ChallengeCategory**
   - Type: Enum ('arithmetic', 'logic')
   - Properties: id, display name (Danish), icon/visual identifier, challenge types array
   - Relationships: Contains multiple ChallengeType entries

3. **ChallengeType**
   - Type: Object
   - Properties: id, name (Danish), category, scene name, difficulty constraints, enabled status
   - Relationships: Belongs to ChallengeCategory, determines which scene to launch

4. **LogicProblem**
   - Type: Object
   - Properties: id, question text (Danish), emoji set, problem type ('halves'|'doubles'), correct answer, options array, difficulty level, context scenario (optional), attempts remaining
   - Validation: Exactly one correct answer, 2-3 distractors, halving produces whole numbers
   - Relationships: Generated by LogicProblemGenerator, validated by deterministic rules

5. **MultipleChoiceOption**
   - Type: Object
   - Properties: display text/emoji representation, value, is correct (boolean), explanation text (Danish)
   - Validation: Value must be numeric or structured data
   - Relationships: 3-4 options per LogicProblem

6. **EmojiSet**
   - Type: Object
   - Properties: category, emoji character, display name (Danish), grouping notation format
   - Validation: Browser compatibility verified
   - Relationships: Used by LogicProblem for visual representation

**State transitions**:
```
GameSession.difficulty: null → 1-4 → persists until session reset
GameSession.challengeType: null → 'addition'|'halves-doubles'|etc → cleared after challenge completion
Challenge flow: DifficultySelection → CategorySelection → ChallengeTypeMenu → [Challenge Scene] → TowerPlacement
```

#### D2: API Contracts (`contracts/`)

**Contract 1: Difficulty System** (`difficulty-system.md`)
- DifficultySelection scene interface
- GameSession.setDifficulty(level: number) method signature
- Difficulty-to-grade mapping function specification
- Validation rules for difficulty values

**Contract 2: Category Navigation** (`category-navigation.md`)
- CategorySelection scene interface
- ChallengeTypeMenu scene interface
- Navigation state management contract (scene data vs GameSession)
- Back navigation behavior specification

**Contract 3: Logic Problem Engine** (`logic-problem-engine.md`)
- LogicProblemGenerator class interface
- generate() method signature with difficulty parameter
- validate() method for problem correctness
- Distractor generation algorithm specification
- Emoji grouping notation rules (7+ items threshold)

**Contract 4: Scoring Integration** (`scoring-integration.md`)
- Coin reward calculation interface (reuse from MathChallenge)
- LogicChallenge.handleAnswer() method signature
- GameSession.addCoins() usage pattern
- Attempt tracking and reward eligibility rules (correct on first or second attempt)

#### D3: Quickstart Guide (`quickstart.md`)

**Developer onboarding document**:
1. **Overview**: Feature purpose and user flow
2. **Key Components**: List of new scenes, systems, entities with one-line descriptions
3. **Getting Started**: How to test difficulty selection locally (`npm run dev`)
4. **Testing**: How to run challenge-types tests (`npm run test -- tests/challenge-types/`)
5. **Adding New Challenge Types**: Step-by-step guide to extend ChallengeRegistry
6. **Emoji Guidelines**: How to add/test new emoji in emojiSets.ts
7. **Common Issues**: Troubleshooting scene transitions, emoji rendering, state persistence

#### D4: Agent Context Update

**Action**: Run `.specify/scripts/bash/update-agent-context.sh copilot`

**Purpose**: Update `.github/copilot-instructions.md` with:
- New scene architecture (DifficultySelection, CategorySelection, ChallengeTypeMenu, LogicChallenge)
- Difficulty level system (replaces grade references)
- Challenge type categorization pattern
- Logic puzzle implementation examples
- Multiple choice UI pattern
- Emoji usage conventions

**Marker preservation**: Maintain manual additions between `<!-- MANUAL ADDITIONS START -->` and `<!-- MANUAL ADDITIONS END -->`

---

### Phase 1 Deliverables

1. ✅ `data-model.md` - Complete entity definitions with state transitions
2. ✅ `contracts/difficulty-system.md` - Difficulty selection and mapping contracts
3. ✅ `contracts/category-navigation.md` - Navigation and state management contracts
4. ✅ `contracts/logic-problem-engine.md` - Problem generation and validation contracts
5. ✅ `contracts/scoring-integration.md` - Coin reward reuse contracts
6. ✅ `quickstart.md` - Developer onboarding guide
7. ✅ Updated `.github/copilot-instructions.md` - Agent context with new patterns

---

## Phase 2: Task Breakdown

**Status**: NOT STARTED - Use `/speckit.tasks` command after Phase 1 completion

**Purpose**: Generate detailed implementation tasks from design artifacts

**Expected output**: `specs/006-challenge-types/tasks.md` with:
- Foundational tasks (blocking prerequisites)
- User story tasks (grouped by priority)
- Test implementation tasks
- Task dependencies and sequencing

**Note**: Task generation occurs after design phase to ensure all contracts and data models inform task structure.

---

## Implementation Notes

### Critical Dependencies

**Reuse existing code**:
- `GameSession` singleton pattern - extend with difficulty and challengeType properties
- `MathChallenge` scene structure - template for LogicChallenge multiple choice UI
- `MathProblemGenerator` pattern - model for LogicProblemGenerator architecture
- `danishText.ts` centralized strings - extend with new UI labels
- `getGradeTemplates()` scaling - adapt for difficulty parameter

**Deprecation path**:
- `GradeSelection` scene → replaced by `DifficultySelection` scene
- `GameSession.grade` property → migrated to `GameSession.difficulty` (with backward compatibility shim if needed for existing saves)

### Performance Considerations

**Problem generation**:
- Cache generated problems in LogicProblemGenerator to avoid repeated calculations
- Limit uniqueness tracking to current session (clear on reset)
- Lazy load emoji sets only when logic challenge selected

**UI rendering**:
- Reuse answer button containers from MathChallenge pattern
- Pre-calculate emoji grouping notation before rendering (don't compute per frame)
- Use Phaser's built-in text layout for emoji display

### Testing Strategy

**E2E test priorities**:
1. Difficulty selection flow and persistence across scenes
2. Category navigation with back button functionality
3. Logic puzzle generation produces valid, non-duplicate problems
4. Multiple choice selection with correct/incorrect feedback
5. Coin rewards match arithmetic challenge amounts
6. Emoji rendering displays correctly across browsers

**Test data**:
- Fixture problems for logic puzzles (avoid random generation in tests)
- Mock emoji sets for consistent rendering tests
- Predefined difficulty levels for mapping validation

---

## Success Criteria Validation

**From spec.md SC-001**: Navigation under 15 seconds
- **Verification**: Playwright test measures time from main menu click to active challenge

**From spec.md SC-002**: 100% of problems have exactly one correct answer
- **Verification**: Unit tests validate LogicProblemGenerator output structure

**From spec.md SC-003**: No duplicate problems in 10 consecutive challenges
- **Verification**: E2E test plays through 10 problems, checks uniqueness

**From spec.md SC-004**: 60% correct answer rate target
- **Verification**: Manual user testing (6-10 age group) - not automated

**From spec.md SC-005**: Extensible challenge type system
- **Verification**: Code review validates ChallengeRegistry allows new types without modification

**From spec.md SC-006**: Feedback within 300ms
- **Verification**: Playwright test measures time from click to feedback display

**From spec.md SC-007**: 90% successful back navigation
- **Verification**: User testing observation (qualitative) - not automated

---

## Next Steps

1. ✅ Review this implementation plan for completeness
2. ⏳ Execute Phase 0: Research (run research agents to generate `research.md`)
3. ⏳ Execute Phase 1: Design (generate `data-model.md`, contracts, quickstart)
4. ⏳ Update agent context (run update script)
5. ⏳ Generate tasks with `/speckit.tasks` command
6. ⏳ Begin implementation following task sequence

**Current Phase**: Phase 0 (Research) - Ready to begin
