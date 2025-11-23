# Feature Specification: Challenge Type System Restructure

**Feature Branch**: `006-challenge-types`  
**Created**: 2025-11-23  
**Status**: Draft  
**Input**: User description: "Refactor grade selection to difficulty levels (1-4) with challenge type categories (Arithmetic Operations, Logic Puzzles) including submenu navigation and implement new logic-based halves/doubles challenge with deterministic verification engine, visual representations using emojis, and multiple choice format"

## Clarifications

### Session 2025-11-23

- Q: When a user answers a halves/doubles problem incorrectly, how should the system handle multiple attempts? → A: Allow 2 attempts total - show correct answer after second wrong answer
- Q: How many halves/doubles problems should be required to complete before earning coins and progressing to tower placement? → A: 3 problems (matching existing math challenge behavior)
- Q: Should the difficulty level labels use descriptive names or just numbers? → A: Numbers with descriptive subtitles (e.g., "Niveau 1 - Begynder", "Niveau 2 - Let Øvet")
- Q: When displaying emoji grouping notation for large quantities (e.g., "🍎×8"), at what threshold should grouping begin? → A: 7 or more items
- Q: Should coins earned from logic puzzles match arithmetic challenge rewards or use a different reward structure? → A: Match existing reward structure (maintain consistency across challenge types)
- Q: How do difficulty levels (1-4) map to the existing grade system (0-3)? → A: Direct mapping using formula: grade = difficulty - 1 (Difficulty 1→Grade 0, 2→1, 3→2, 4→3)
- Q: What constitutes "same emoji" for variation tracking? → A: Same emoji character (🍎 is different from 🍐), regardless of category
- Q: How are distractor answers selected when multiple types are available? → A: Randomly select 2-3 from available valid distractor types (off-by-1, reversed operation, adjacent value), ensuring all values are unique
- Q: Are decimal answers supported for halves/doubles problems? → A: No, v1 only supports whole number answers. Problems must be designed to produce whole number results only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select Difficulty Level (Priority: P1)

A child playing the game needs to choose their skill level before playing. Instead of selecting a grade (0-3), they now select a difficulty level (1-4) that matches their comfort with the type of challenge they want to attempt.

**Why this priority**: Core navigation change that affects all gameplay. Without this, users cannot access any challenges. Establishes the foundation for the new challenge categorization system.

**Independent Test**: Can be fully tested by launching the game, clicking through to difficulty selection, selecting a difficulty level (1-4), and verifying the selection is stored and used for subsequent challenge generation. Delivers clear value by providing age-neutral difficulty selection.

**Acceptance Scenarios**:

1. **Given** the game main menu is displayed, **When** the user clicks "Start Spil", **Then** a difficulty selection screen appears with 4 difficulty options (labeled with numbers and descriptive subtitles in Danish, e.g., "Niveau 1 - Begynder")
2. **Given** the difficulty selection screen is displayed, **When** the user hovers over a difficulty button, **Then** the button provides visual feedback (scale/color change)
3. **Given** the difficulty selection screen is displayed, **When** the user clicks difficulty level 2, **Then** the difficulty level is saved to the game session and the challenge type selection screen appears
4. **Given** a difficulty level has been selected, **When** returning from gameplay, **Then** the previously selected difficulty is remembered for the session

---

### User Story 2 - Navigate Challenge Categories (Priority: P1)

After selecting a difficulty level, a child needs to choose what type of challenge they want to practice. They can select from different categories of challenges organized by subject area (e.g., arithmetic operations, logic puzzles).

**Why this priority**: Essential navigation layer that enables the categorization system. Without this, users cannot access the new challenge types. This is a prerequisite for all challenge-specific features.

**Independent Test**: Can be fully tested by selecting a difficulty level, viewing the challenge category menu, selecting a category, and verifying the appropriate challenge type is loaded. Delivers value by organizing challenges into meaningful groups for better learning structure.

**Acceptance Scenarios**:

1. **Given** a difficulty level has been selected, **When** the challenge type selection screen loads, **Then** two category groups are displayed: "Regnearter" (Arithmetic Operations) and "Logik Opgaver" (Logic Puzzles)
2. **Given** the challenge type selection screen is displayed, **When** the user clicks "Regnearter", **Then** a submenu appears showing arithmetic challenge types (addition, subtraction, multiplication, division based on difficulty)
3. **Given** an arithmetic submenu is displayed, **When** the user selects "Addition", **Then** the math challenge scene starts with addition problems at the selected difficulty level
4. **Given** the challenge type selection screen is displayed, **When** the user clicks "Logik Opgaver", **Then** a submenu appears showing logic challenge types (starting with "Halvdele og Dobbelte")
5. **Given** the user is in a challenge, **When** they return to challenge selection, **Then** the previously selected category remains highlighted/remembered

---

### User Story 3 - Complete Halves and Doubles Logic Challenge (Priority: P2)

A child wants to practice understanding the concepts of halving and doubling through visual, context-based problems rather than pure arithmetic. They encounter problems presented with emojis and real-world scenarios (like half-price at a supermarket), and select answers from multiple choices.

**Why this priority**: Introduces the first logic-based challenge type and establishes the pattern for future logic puzzles. Demonstrates the value of the new categorization system with a tangible new feature.

**Independent Test**: Can be fully tested by selecting difficulty level, choosing Logic Puzzles → Halves and Doubles, completing 3 challenge problems with emoji representations and multiple choice answers, and verifying correct answer validation. Delivers educational value by teaching proportional relationships through visual and contextual examples.

**Acceptance Scenarios**:

1. **Given** the user selects "Logik Opgaver" → "Halvdele og Dobbelte", **When** a challenge problem is generated, **Then** the problem presents a scenario using emojis (e.g., "🍎🍎🍎🍎 Hvad er halvdelen?") with 3-4 multiple choice options and requires 3 problems to be completed before earning coins
2. **Given** a halves problem is displayed with 4 apples, **When** the user selects the choice showing 2 apples, **Then** the answer is validated as correct and positive feedback is shown
3. **Given** a doubles problem is displayed with 3 squares (⬜⬜⬜), **When** the user selects the choice showing 6 squares, **Then** the answer is validated as correct
4. **Given** a real-world context problem is displayed (e.g., "En ting koster 20 kr. Hvad er halvpris?"), **When** the user selects "10 kr", **Then** the answer is validated as correct
5. **Given** an incorrect answer is selected, **When** validation occurs and it's the first attempt, **Then** feedback indicates the answer is wrong and allows one more attempt
6. **Given** an incorrect answer is selected twice, **When** validation occurs after the second attempt, **Then** feedback shows the correct answer with explanation and advances to next problem
7. **Given** multiple problems are presented in sequence, **When** reviewing the problems, **Then** no two consecutive problems use identical emoji sets or scenarios (non-repetitive generation)
8. **Given** a problem requires displaying 7 or more items, **When** the problem is rendered, **Then** grouping notation is used (e.g., "🍎×8" instead of 8 individual apple emojis)

---

### User Story 4 - Deterministic Problem Verification (Priority: P2)

As the system generates halves and doubles problems, it needs to verify that all generated problems have mathematically sound solutions and that the multiple choice options include exactly one correct answer and plausible distractors.

**Why this priority**: Ensures educational integrity and prevents frustration from impossible or ambiguous problems. Critical for trust in the learning system but doesn't directly impact user interaction (behind-the-scenes quality).

**Independent Test**: Can be tested by reviewing generated problem sets, verifying each problem has a single determinable correct answer, confirming distractors are plausible but incorrect, and checking that problem generation rules are consistently applied. Delivers value by maintaining educational quality.

**Acceptance Scenarios**:

1. **Given** a halves problem is being generated, **When** the system creates the problem, **Then** the starting quantity must be an even number or a value that produces a whole number when halved
2. **Given** a doubles problem is being generated, **When** the system creates the problem, **Then** the result must not exceed reasonable limits for the difficulty level (e.g., under 20 for difficulty 1)
3. **Given** multiple choice options are generated for a problem, **When** the options are presented, **Then** exactly one option matches the correct answer and 2-3 distractors are mathematically related but incorrect (e.g., off by 1, doubled instead of halved)
4. **Given** a real-world context scenario is generated, **When** the scenario involves prices, **Then** the math must result in whole number currency values or standard decimal increments (e.g., .50, .25)
5. **Given** 100 consecutive problems are generated, **When** checking for patterns, **Then** no identical problem appears twice and emoji/scenario variety is maintained

---

### Edge Cases

- What happens when difficulty level 1 is selected but the requested challenge type is too advanced (e.g., division)? System MUST disable unavailable challenge types in the submenu by either graying out buttons or hiding them entirely based on the difficulty-to-operations mapping in FR-009. Division should not be visible/selectable until difficulty 4.
- How does the system handle returning to the challenge type selection menu after starting a challenge? System MUST preserve difficulty selection and category state in GameSession. Back button navigation from any submenu must restore the previous menu state without requiring re-selection. This behavior must be validated in E2E tests.
- What happens if a halves problem would require decimal answers (e.g., 5 ÷ 2)? System should only generate problems with whole number answers or clearly indicate decimal expectations.
- How does the system present multiple choice options when emoji counts become large (e.g., 20+ items)? System uses grouping notation (e.g., "🍎×8") for 7 or more items per FR-020. Real-world scenario templates must use appropriate Danish phrasing and cultural conventions (Danish kroner for prices, metric measurements). Example templates should be provided in data-model.md with Danish text review for cultural appropriateness.
- What happens when both attempts fail for a logic puzzle? Should show the correct answer with explanation and move to next problem (no third attempt).
- How are coins awarded for logic puzzles? Should match the existing reward structure used for arithmetic challenges to maintain consistency.

## Requirements *(mandatory)*

### Functional Requirements

**Navigation & Structure**

- **FR-001**: System MUST replace "grade selection" (Klasse 0-3) with "difficulty selection" (Niveau 1-4) using age-neutral language with descriptive subtitles (e.g., "Niveau 1 - Begynder", "Niveau 2 - Let Øvet", "Niveau 3 - Øvet", "Niveau 4 - Ekspert")
- **FR-002**: System MUST display challenge type categories as primary menu options after difficulty selection
- **FR-003**: System MUST organize challenge types into two groups: "Regnearter" (Arithmetic Operations) and "Logik Opgaver" (Logic Puzzles)
- **FR-004**: System MUST display submenu navigation when a category group is selected, showing available challenge types within that group
- **FR-005**: System MUST allow users to navigate back from submenus to the main challenge category selection without losing difficulty selection
- **FR-006**: System MUST remember the selected difficulty level throughout the game session until explicitly changed or session ends

**Arithmetic Operations Category**

- **FR-007**: System MUST include existing math challenge types (addition, subtraction, multiplication, division) under the "Regnearter" category
- **FR-008**: System MUST map difficulty levels 1-4 to the existing grade 0-3 problem templates for arithmetic challenges
- **FR-009**: System MUST display only appropriate arithmetic operations in the submenu based on selected difficulty level using the following mapping: Difficulty 1 = Addition only, Difficulty 2 = Addition + Subtraction, Difficulty 3 = Addition + Subtraction + Multiplication, Difficulty 4 = All operations (Addition + Subtraction + Multiplication + Division)

**Logic Puzzles Category - Halves and Doubles**

- **FR-010**: System MUST provide a "Halvdele og Dobbelte" (Halves and Doubles) challenge type under "Logik Opgaver"
- **FR-011**: System MUST generate problems that test understanding of halving quantities (e.g., "8 items → what is half?")
- **FR-012**: System MUST generate problems that test understanding of doubling quantities (e.g., "3 items → what is double?")
- **FR-013**: System MUST use emoji representations for visual quantities (🍎 apples, 🍐 pears, 🐵 monkeys, ⬜ squares, etc.)
- **FR-014**: System MUST include real-world context scenarios in at least 30% of problems (e.g., half-price at supermarket, doubling recipe ingredients). Implementation: Every 3rd or 4th problem generated must use a real-world context scenario (tracked via counter in LogicProblemGenerator)
- **FR-015**: System MUST present all halves/doubles problems in multiple choice format with 3-4 answer options. Use 3 options when only 3 valid distractors can be generated, otherwise default to 4 options
- **FR-016**: System MUST generate exactly one correct answer per problem
- **FR-017**: System MUST generate 2-3 plausible distractor answers that are mathematically related but incorrect. Distractor types include: off-by-1 (±1 from correct answer), reversed operation (e.g., doubled instead of halved), and adjacent value (nearby plausible value). When generating, randomly select 2-3 from available valid distractor types, ensuring all values are unique and different from the correct answer
- **FR-018**: System MUST require users to complete 3 halves/doubles problems before earning coins and progressing to tower placement (matching existing math challenge behavior)
- **FR-019**: System MUST allow 2 attempts per problem - display correct answer with explanation after second incorrect attempt
- **FR-020**: System MUST use grouping notation (e.g., "🍎×8") when displaying 7 or more items in problems or answer choices
- **FR-021**: System MUST award coins using the same reward structure as arithmetic challenges (maintain consistency across challenge types)

**Problem Generation & Verification**

- **FR-022**: System MUST implement deterministic logic engine for halves/doubles that guarantees valid, solvable problems
- **FR-023**: System MUST verify that halving operations produce whole number results. Decimal answers are NOT supported in v1 - all problems must be designed to produce whole number results only
- **FR-024**: System MUST verify that doubling operations stay within reasonable magnitude limits for the difficulty level
- **FR-025**: System MUST ensure generated problems are non-repetitive within a game session (track used problems). Problem uniqueness tracking resets on GameSession.reset() and is limited to current session only (not persistent across browser sessions)
- **FR-026**: System MUST vary emoji types and scenarios across consecutive problems (no more than 2 consecutive problems with same emoji character). Definition: 'same emoji' means identical emoji character (🍎 vs 🍐 are different), regardless of category. Scenario variation means different template types (price vs recipe vs groups, etc.)
- **FR-027**: System MUST scale problem complexity based on selected difficulty level using the following limits for STARTING values: Difficulty 1=under 10, Difficulty 2=under 20, Difficulty 3=under 35, Difficulty 4=up to 50. Note: Doubling operations may produce results that exceed starting value limits (e.g., difficulty 1 can start with 8, double to 16)

**User Feedback**

- **FR-028**: System MUST provide immediate validation feedback when user selects an answer (correct/incorrect indication) with color-coded text: green for correct answers, red for incorrect answers, yellow for "try again" message. Feedback must appear within 300ms of selection with smooth fade-in animation
- **FR-029**: System MUST display the correct answer with visual representation when user exhausts both attempts with incorrect answers
- **FR-030**: System MUST advance to the next problem automatically after correct answer or after showing correct answer for two failed attempts
- **FR-031**: System MUST reuse existing scoring and coin reward logic from arithmetic challenges for logic puzzles to maintain consistency. Implementation must call the same calculateWaveConfig() function and GameSession.addCoins() pattern. Validation: Logic challenges at difficulty 2, wave 1 must earn identical coin amounts to arithmetic challenges at the same difficulty and wave

### Key Entities

- **Difficulty Level**: Numeric indicator (1-4) representing problem complexity independent of school grade. Replaces grade-based selection. Maps to problem generation parameters (number ranges, operation complexity).

- **Challenge Category Group**: Top-level organizational grouping for challenge types (e.g., "Regnearter", "Logik Opgaver"). Contains multiple challenge types. Used for primary navigation after difficulty selection.

- **Challenge Type**: Specific type of problem within a category group (e.g., "Addition", "Halvdele og Dobbelte"). Associated with a generation engine/template. Determines problem format and validation rules.

- **Logic Problem**: Problem entity for logic-based challenges. Contains: question text/visual representation, problem type (halves/doubles), correct answer, multiple choice options (3-4), emoji set used, difficulty level, context scenario (optional).

- **Problem Generator (Logic Engine)**: Component responsible for creating valid, non-repetitive logic problems. Maintains: generation rules per difficulty level, used problem tracking, emoji pool, context scenario templates, validation rules for answer correctness.

- **Multiple Choice Option**: Individual answer choice for a logic problem. Contains: display text/visual representation, value (number - numeric answer value for validation), correctness flag (boolean). 3-4 options per problem with exactly one correct.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from main menu to challenge selection to an active challenge in under 15 seconds with clear visual progression at each step. Definition: Navigation is complete when the first challenge problem is fully rendered, answer buttons are interactive, and feedback text area is visible
- **SC-002**: 100% of generated halves/doubles problems have exactly one mathematically correct answer and 2-3 plausible incorrect options. Validation includes automated verification that coin rewards match arithmetic challenges at equivalent difficulty levels
- **SC-003**: Users can complete 10 consecutive halves/doubles problems without encountering duplicate problems or identical emoji sequences more than twice
- **SC-004**: Children aged 6-10 can understand and correctly answer at least 60% of halves/doubles problems on first attempt (user testing validation)
- **SC-005**: The challenge type categorization system supports adding new challenge types without modifying difficulty selection or navigation structure
- **SC-006**: Visual feedback for correct/incorrect answers appears within 300ms of selection for immediate user confirmation
- **SC-007**: 90% of users successfully navigate back from submenus to category selection without confusion (observe navigation patterns)

## Assumptions

- Danish language proficiency is assumed for all user-facing text (labels, instructions, feedback)
- Users are familiar with the existing tower defense gameplay loop (challenges → tower placement → wave defense)
- Emoji rendering is supported across all target browsers/devices for visual problem representation
- Multiple choice selection interaction is touch-friendly for tablet/mobile devices
- The existing math challenge scene structure can be adapted to support multiple choice format
- Real-world context scenarios (prices, recipes) use Danish cultural conventions (kr for currency, metric measurements)
- Problem difficulty scaling is relative within each challenge type (halves/doubles difficulty 1 ≠ multiplication difficulty 1 in absolute terms)
- Users will explore and discover new challenge types through category navigation rather than explicit tutorial
