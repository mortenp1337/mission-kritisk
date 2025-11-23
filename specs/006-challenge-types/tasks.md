# Tasks: Challenge Type System Restructure

**Branch**: `006-challenge-types`  
**Input**: Design documents from `/specs/006-challenge-types/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md

**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4)
- All paths are absolute from repository root

---

## Phase 1: Setup

**Purpose**: Project initialization and documentation

- [ ] T001 Review research findings in specs/006-challenge-types/research.md for implementation guidance
- [ ] T002 Create specs/006-challenge-types/data-model.md documenting all entities (DifficultyLevel, ChallengeCategory, ChallengeType, LogicProblem, MultipleChoiceOption)
- [ ] T003 [P] Create specs/006-challenge-types/contracts/difficulty-system.md (difficulty-to-grade mapping contract)
- [ ] T004 [P] Create specs/006-challenge-types/contracts/category-navigation.md (navigation state management contract)
- [ ] T005 [P] Create specs/006-challenge-types/contracts/logic-problem-engine.md (halves/doubles generation contract)
- [ ] T006 [P] Create specs/006-challenge-types/contracts/scoring-integration.md (coin reward reuse contract)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure - MUST complete before user stories

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

### Type Definitions

- [ ] T007 [P] Create src/game/types/ChallengeTypes.ts (DifficultyLevel 1-4, ChallengeCategory enum, ChallengeType interface)
- [ ] T008 [P] Create src/game/types/LogicTypes.ts (LogicProblem, ProblemType, MultipleChoiceOption, EmojiSet interfaces)
- [ ] T009 Modify src/game/types/GameTypes.ts GameSession interface (add difficulty: number, category: string, challengeType: string, note gameSpeed property from Feature #004)

### GameSession Extensions

- [ ] T010 Modify src/game/systems/GameSession.ts (add difficulty, category, challengeType properties with default values in reset())
- [ ] T011 Add GameSession.setDifficulty(difficulty: number) method with validation (1-4 inclusive, throw error if invalid)
- [ ] T012 [P] Add GameSession.setCategory(category: string) method with validation ('math' | 'logic')
- [ ] T013 [P] Add GameSession.setChallengeType(type: string) method

### Data Configuration Files

- [ ] T014 [P] Create src/game/data/difficultyConfig.ts (difficulty level definitions with Danish labels: "Niveau 1 - Begynder", "Niveau 2 - Let Øvet", "Niveau 3 - Øvet", "Niveau 4 - Ekspert")
- [ ] T015 [P] Create src/game/data/challengeCategories.ts (category groups: Regnearter, Logik Opgaver with available challenge types per category)
- [ ] T016 [P] Create src/game/data/emojiSets.ts (emoji pools organized by category: food 🍎🍐🍌, animals 🐶🐱🐸, shapes ⭐❤️🔵)

### Challenge Registry System

- [ ] T017 Create src/game/systems/ChallengeRegistry.ts (maps category → challenge types, challenge type → scene name, handles difficulty constraints per challenge type)

### Danish Text Additions

- [ ] T018 Modify src/game/data/danishText.ts (add difficultyLabels array, categoryNames object, challengeTypeNames object, logicPuzzleText for halves/doubles)

**Checkpoint**: Foundation complete - user stories can now proceed independently

---

## Phase 3: User Story 1 - Select Difficulty Level (Priority: P1) 🎯 MVP

**Goal**: Replace grade selection with difficulty selection (Niveau 1-4)

**Independent Test**: Launch game → click "Start Spil" → see 4 difficulty options → select difficulty 2 → verify difficulty stored in GameSession → verify transition to category selection

### Scene Implementation

- [ ] T019 [US1] Create src/game/scenes/DifficultySelection.ts (constructor with scene key 'DifficultySelection')
- [ ] T020 [US1] Implement DifficultySelection.create() method (reset GameSession, add background, title "Vælg Sværhedsgrad")
- [ ] T021 [US1] Create difficulty button grid in DifficultySelection (4 buttons in 2x2 grid, 200x120px, 40px spacing, labels from difficultyConfig with subtitles)
- [ ] T022 [US1] Add hover effects to difficulty buttons (scale 1.1, color change to #6666ff)
- [ ] T023 [US1] Implement DifficultySelection.selectDifficulty(level) method (call GameSession.setDifficulty, transition to CategorySelection scene)
- [ ] T024 [US1] Add pointer down listeners to difficulty buttons (call selectDifficulty with appropriate level 1-4)

### Scene Registration

- [ ] T025 [US1] Register DifficultySelection scene in src/game/main.ts scene array (insert after MainMenu, before GradeSelection)
- [ ] T026 [US1] Modify src/game/scenes/MainMenu.ts to transition to DifficultySelection instead of GradeSelection on "Start Spil" click

### Difficulty Mapping for Arithmetic

- [ ] T027 [US1] Modify src/game/data/mathProblems.ts (add getDifficultyTemplates function that maps difficulty 1-4 to grade 0-3 using formula: grade = difficulty - 1)
- [ ] T028 [US1] Modify src/game/systems/MathProblemGenerator.ts generate() method (accept difficulty parameter instead of grade, call getDifficultyTemplates)

**Checkpoint**: Difficulty selection fully functional - difficulty persists in GameSession throughout session

---

## Phase 4: User Story 2 - Navigate Challenge Categories (Priority: P1)

**Goal**: Add category selection (Regnearter / Logik Opgaver) and challenge type submenus

**Independent Test**: Select difficulty → see 2 category groups → click Regnearter → see submenu with arithmetic types → select Addition → verify MathChallenge starts with correct difficulty

### Category Selection Scene

- [ ] T029 [P] [US2] Create src/game/scenes/CategorySelection.ts (constructor with scene key 'CategorySelection')
- [ ] T030 [US2] Implement CategorySelection.create() method (background, title "Vælg Opgavetype", back button to DifficultySelection)
- [ ] T031 [US2] Create category group buttons (2 buttons: "Regnearter", "Logik Opgaver", 250x120px, center-aligned vertically)
- [ ] T032 [US2] Add hover effects to category buttons (scale 1.1, color change)
- [ ] T033 [US2] Implement CategorySelection.selectCategory(category) method (call GameSession.setCategory, transition to ChallengeTypeMenu with category data)
- [ ] T034 [US2] Add pointer listeners to category buttons (call selectCategory with 'math' or 'logic')
- [ ] T035 [US2] Implement back button in CategorySelection (transition to DifficultySelection, preserve GameSession state)

### Challenge Type Menu Scene

- [ ] T036 [P] [US2] Create src/game/scenes/ChallengeTypeMenu.ts (constructor with scene key 'ChallengeTypeMenu')
- [ ] T037 [US2] Implement ChallengeTypeMenu.create() method (read GameSession.category to determine which submenu to show)
- [ ] T038 [US2] Create arithmetic challenge type buttons (4 buttons max: Addition, Subtraktion, Multiplikation, Division based on difficulty level)
- [ ] T039 [US2] Implement difficulty-based filtering for arithmetic types (difficulty 1 shows only Addition, difficulty 2 adds Subtraktion, difficulty 3 adds Multiplikation, difficulty 4 adds all)
- [ ] T039.1 [US2] Disable or hide unavailable arithmetic operations in ChallengeTypeMenu based on difficulty (buttons not shown or grayed out if operation not available per FR-009 mapping)
- [ ] T040 [US2] Create logic challenge type buttons (1 button initially: "Halvdele og Dobbelte")
- [ ] T041 [US2] Implement ChallengeTypeMenu.selectChallengeType(type) method (call GameSession.setChallengeType, use ChallengeRegistry to determine target scene, transition to appropriate challenge scene)
- [ ] T042 [US2] Add pointer listeners to challenge type buttons (call selectChallengeType with type identifier)
- [ ] T043 [US2] Implement back button in ChallengeTypeMenu (transition to CategorySelection, preserve GameSession state)

### MathChallenge Modifications

- [ ] T044 [US2] Modify src/game/scenes/MathChallenge.ts create() method (read GameSession.difficulty instead of grade, pass difficulty to MathProblemGenerator)
- [ ] T045 [US2] Filter MathChallenge problems by GameSession.challengeType (if challengeType is 'addition', only generate addition problems, etc.)

### Scene Registration

- [ ] T046 [US2] Register CategorySelection scene in src/game/main.ts scene array
- [ ] T047 [US2] Register ChallengeTypeMenu scene in src/game/main.ts scene array

**Checkpoint**: Full navigation flow working - DifficultySelection → CategorySelection → ChallengeTypeMenu → [Challenge Scene]

---

## Phase 5: User Story 3 - Complete Halves and Doubles Logic Challenge (Priority: P2)

**Goal**: Implement halves/doubles logic puzzles with emoji representations and multiple choice UI

**Independent Test**: Select difficulty → Logik Opgaver → Halvdele og Dobbelte → complete 3 problems with emoji display, multiple choice answers, 2-attempt validation → verify coins awarded → transition to TowerPlacement

### Logic Problem Entity

- [ ] T048 [P] [US3] Create src/game/entities/LogicProblem.ts (class with properties: id, questionText, operation 'halves'|'doubles', startValue, correctAnswer, options: MultipleChoiceOption[], emojiSet, context, attemptsRemaining default 2)
- [ ] T049 [P] [US3] Add LogicProblem.isCorrect(answer: number) method (return boolean if answer matches correctAnswer)
- [ ] T050 [P] [US3] Add LogicProblem.getFormattedQuestion() method (return questionText with emoji representation, use grouping notation for 7+ items)

### Multiple Choice Option Entity

- [ ] T051 [P] [US3] Create src/game/entities/MultipleChoiceOption.ts (class with properties: displayText, emojiRepresentation, value: number, isCorrect: boolean)

### Logic Problem Generator

- [ ] T052 [US3] Create src/game/systems/LogicProblemGenerator.ts (class with usedProblems Set for tracking, emojiPool from emojiSets)
- [ ] T053 [US3] Implement LogicProblemGenerator.generate(difficulty, problemType) method (returns LogicProblem with 3-4 options)
- [ ] T054 [US3] Implement halving rules (starting value must be even for whole number results, result limits based on difficulty: 1=result under 10, 2=result under 20, 3=result under 35, 4=result under 50)
- [ ] T055 [US3] Implement doubling rules (starting value limits from FR-027, but result limits can exceed: 1=result under 20, 2=result under 40, 3=result under 70, 4=result under 100)
- [ ] T056 [US3] Implement distractor generation algorithm (3 types: off-by-1 (±1 from correct), reversed operation (double instead of halve or vice versa), adjacent value (nearby plausible number)). Randomly select 2-3 unique distractors from available valid types, ensuring all values differ from correct answer
- [ ] T057 [US3] Implement real-world scenario templates (6 templates: prices, recipes, groups, candy, money, toys with Danish text). Enforce 30% minimum: track counter, every 3rd or 4th problem must use real-world context (not pure emoji)
- [ ] T058 [US3] Add problem uniqueness tracking (hash by operation_startValue, avoid duplicates within session)
- [ ] T059 [US3] Add emoji variation logic (track last 2 used emoji characters, avoid using same emoji character (🍎) more than 2 consecutive times, 🍎 and 🍐 count as different)
- [ ] T060 [US3] Implement emoji grouping notation (if count >= 7, return "🍎×8" format instead of repeated emoji)

### Logic Challenge Scene

- [ ] T061 [US3] Create src/game/scenes/LogicChallenge.ts (constructor with scene key 'LogicChallenge')
- [ ] T062 [US3] Implement LogicChallenge.create() method (initialize LogicProblemGenerator, set problemIndex = 0, totalProblems = 3, read GameSession.difficulty and challengeType)
- [ ] T063 [US3] Create UI elements in LogicChallenge (background, title, problem counter "Opgave X/3", question text area, feedback text, coin display)
- [ ] T064 [US3] Implement LogicChallenge.nextProblem() method (generate new problem from LogicProblemGenerator, update UI, create answer buttons)
- [ ] T065 [US3] Implement createAnswerButtons() method (reuse MathChallenge 2x2 grid layout 200x100px buttons, handle 3-4 variable options, empty slot for 3 options)
- [ ] T066 [US3] Add emoji rendering to answer buttons (use formatEmojiAnswer helper for count display, apply grouping notation for 7+ items)
- [ ] T067 [US3] Implement LogicChallenge.handleAnswer(answer) method (validate with currentProblem.isCorrect, decrement attemptsRemaining, award coins on correct, show feedback)
- [ ] T068 [US3] Implement 2-attempt logic (first wrong answer shows "Prøv igen!", second wrong answer shows correct answer with "Svaret er: X", then advance)
- [ ] T069 [US3] Reuse coin reward logic from MathChallenge (call calculateWaveConfig from src/game/data/waveConfig.ts, GameSession.addCoins with coinPerProblem, GameSession.incrementProblemsSolved). Verify logic puzzles earn identical coins to arithmetic at same difficulty/wave
- [ ] T070 [US3] Add coin display update with pulse animation (same pattern as MathChallenge)
- [ ] T071 [US3] Implement automatic advance after 3 problems (transition to TowerPlacement scene)

### Scene Registration

- [ ] T072 [US3] Register LogicChallenge scene in src/game/main.ts scene array

**Checkpoint**: Halves/doubles logic puzzles fully functional - emoji display, multiple choice, 2 attempts, color-coded feedback, coin rewards matching arithmetic challenges

---

## Phase 6: User Story 4 - Deterministic Problem Verification (Priority: P2)

**Goal**: Ensure all generated problems are mathematically valid with exactly one correct answer

**Independent Test**: Generate 100 consecutive problems → verify each has exactly one correct answer → verify no duplicates → verify emoji variety maintained

### Validation Logic

- [ ] T073 [P] [US4] Add LogicProblemGenerator.validateHalvingProblem(startValue, difficulty) method (ensure even number, whole number result, within difficulty limits)
- [ ] T074 [P] [US4] Add LogicProblemGenerator.validateDoublingProblem(startValue, difficulty) method (ensure result under difficulty limit)
- [ ] T075 [US4] Add LogicProblemGenerator.validateOptions(options, correctAnswer) method (ensure exactly one correct option, 2-3 distractors, all unique values)
- [ ] T076 [US4] Add LogicProblemGenerator.validateRealWorldScenario(scenario, values) method (ensure prices result in whole numbers or .50/.25 increments)

### Generator Integration

- [ ] T077 [US4] Integrate validation into LogicProblemGenerator.generate() method (validate problem before returning, retry up to 100 times if validation fails, throw error if unable to generate valid problem)
- [ ] T078 [US4] Add logging for validation failures (console.warn when validation fails, include problem details for debugging)

**Checkpoint**: Problem generation guarantees valid, solvable problems with deterministic verification

---

## Phase 7: Testing & Polish

**Purpose**: End-to-end testing and cross-cutting concerns

### E2E Tests

- [ ] T079 [P] Create tests/challenge-types/difficulty-selection.spec.ts (test difficulty selection UI, persistence in GameSession, transition to CategorySelection)
- [ ] T080 [P] Create tests/challenge-types/category-navigation.spec.ts (test category menu, submenu navigation, back buttons, state preservation)
- [ ] T080.1 [P] Create tests/challenge-types/back-navigation.spec.ts (test back button from all scenes preserves difficulty and category in GameSession, verify no re-selection required)
- [ ] T081 [P] Create tests/challenge-types/logic-puzzles.spec.ts (test halves/doubles generation, emoji display, grouping notation, multiple choice selection, 2-attempt validation, coin rewards)
- [ ] T082 [P] Create tests/challenge-types/multiple-choice-ui.spec.ts (test button layout for 3-4 options, touch targets, emoji rendering, feedback display within 300ms)
- [ ] T083 [P] Create tests/challenge-types/scoring-consistency.spec.ts (verify LogicChallenge awards same coins as MathChallenge for same wave - test at difficulty 2 wave 1, compare exact coin amounts between arithmetic and logic challenges)
- [ ] T084 Modify tests/game.spec.ts (update flow tests to use DifficultySelection instead of GradeSelection)

### Deprecation & Cleanup

- [ ] T085 Add deprecation comment to src/game/scenes/GradeSelection.ts (mark as deprecated, reference DifficultySelection as replacement)
- [ ] T086 Update .github/copilot-instructions.md (document new difficulty system, category navigation pattern, logic puzzle implementation, multiple choice UI pattern)

### Documentation

- [ ] T087 Create specs/006-challenge-types/quickstart.md (developer onboarding: how to add new challenge types, test locally, extend ChallengeRegistry)
- [ ] T088 Update README.md (document new difficulty selection, challenge categories, logic puzzles feature)
- [ ] T088.1 [BLOCKING] Verify bilingual compliance across all new files (scan code for English-only variable/function/class names, verify Danish text only in display strings, check danishText.ts usage). Required before PR merge per Constitution II

---

## Dependencies & Parallel Execution

### Parallel Opportunities Per Phase

**Phase 2 Foundational** - Can parallelize:
- T007-T008 (type definitions)
- T014-T016 (data configuration files)
- T012-T013 (GameSession methods)

**Phase 3 US1** - Must be sequential (scene registration depends on scene creation)

**Phase 4 US2** - Can parallelize:
- T029-T035 (CategorySelection scene)
- T036-T043 (ChallengeTypeMenu scene)

**Phase 5 US3** - Can parallelize:
- T048-T051 (entity definitions)
- T052-T060 (problem generator - independent of scene)
- T061-T071 (challenge scene - depends on entities and generator)

**Phase 6 US4** - All validation tasks (T073-T076) can parallelize

**Phase 7 Testing** - All test files (T079-T083) can parallelize

### Critical Path

1. Phase 1 (Setup) → Phase 2 (Foundational) - **BLOCKING**
2. Phase 2 complete → Phase 3 (US1) - **BLOCKING FOR ALL USER STORIES**
3. Phase 3 complete → Phase 4 (US2) - **BLOCKING FOR US3, US4**
4. Phase 4 complete → Phase 5 (US3), Phase 6 (US4) - **CAN PARALLELIZE**
5. Any phase complete → Phase 7 (Testing) for that phase

### Suggested Execution Order for MVP

**Sprint 1** (MVP - Difficulty Selection):
- Complete Phase 1, Phase 2, Phase 3 (T001-T028)
- Result: Working difficulty selection replacing grade selection

**Sprint 2** (Category Navigation):
- Complete Phase 4 (T029-T047)
- Result: Full navigation to arithmetic challenges via categories

**Sprint 3** (Logic Puzzles):
- Complete Phase 5, Phase 6 (T048-T078)
- Result: Halves/doubles logic puzzles fully functional

**Sprint 4** (Polish & Testing):
- Complete Phase 7 (T079-T088.1)
- Result: Feature complete with E2E tests, bilingual compliance validation, and documentation

---

## Implementation Strategy

**MVP First**: Phase 3 (US1) delivers immediate value - difficulty selection is independently usable

**Incremental Delivery**: Each user story adds value without breaking existing functionality

**Test Coverage**: E2E tests validate each user story independently

**Backward Compatibility**: GradeSelection scene deprecated but not removed initially for gradual migration

**Constitution Compliance**: All tasks follow scene-based architecture, bilingual implementation, type safety requirements