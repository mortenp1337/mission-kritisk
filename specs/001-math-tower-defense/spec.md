# Feature Specification: Math Tower Defense Game

**Feature Branch**: `001-math-tower-defense`  
**Created**: 2025-11-22  
**Status**: Draft  
**Input**: User description: "Build a math game for young school children (grades 0-3) where they solve math problems to earn coins. Tower defense style game with 5 math problems between stages to earn coins for building towers to defend against zombies. Clean class-based code for buildings, structures, enemies, and level layouts. 2D grid levels where towers are purchased with coins. Difficulty and coins increase with levels, math problems scale with selected grade."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grade Selection & First Math Challenge (Priority: P1)

A child opens the game, selects their grade level (0-3), and completes their first math problem to earn coins. This validates the core learning mechanic.

**Why this priority**: This is the essential MVP - proving that children can select their grade and solve grade-appropriate math problems to earn rewards. Without this, the educational value doesn't exist.

**Independent Test**: Can be fully tested by launching game, selecting a grade (e.g., grade 1), seeing a grade-appropriate math problem (e.g., 2+3=?), answering correctly, and receiving coins. Delivers immediate educational value and reward feedback.

**Acceptance Scenarios**:

1. **Given** game starts, **When** child clicks "Klasse 0" button, **Then** grade 0 is selected and appropriate math problems are prepared (single-digit addition 0-5)
2. **Given** game starts, **When** child clicks "Klasse 1" button, **Then** grade 1 is selected and appropriate math problems are prepared (single-digit addition/subtraction 0-10)
3. **Given** game starts, **When** child clicks "Klasse 2" button, **Then** grade 2 is selected and appropriate math problems are prepared (two-digit addition, simple multiplication tables)
4. **Given** game starts, **When** child clicks "Klasse 3" button, **Then** grade 3 is selected and appropriate math problems are prepared (multi-digit operations, division)
5. **Given** grade is selected, **When** math problem appears with Danish text "Løs opgaven:", **Then** problem displays with multiple choice answers
6. **Given** math problem is displayed, **When** child selects correct answer, **Then** "Rigtigt!" message shows and coins are awarded (10 coins)
7. **Given** math problem is displayed, **When** child selects wrong answer, **Then** "Prøv igen!" message shows and problem remains unsolved with no coins awarded

---

### User Story 2 - Tower Placement & Defense Wave (Priority: P2)

After earning coins from math problems, a child can purchase and place towers on a 2D grid to defend against a wave of approaching zombies. This validates the tower defense gameplay mechanic.

**Why this priority**: This delivers the core gameplay loop that makes learning fun. Children see immediate consequences of their math success - they can build defenses and protect their base.

**Independent Test**: Can be fully tested by starting with pre-awarded coins (e.g., 100 coins), opening the tower shop with Danish text "Tårn Butik", purchasing a basic tower (e.g., "Basis Tårn - 50 mønter"), placing it on an empty grid cell, and watching it automatically shoot at zombies during a defense wave. Delivers engaging gameplay without requiring math problems first.

**Acceptance Scenarios**:

1. **Given** child has earned coins, **When** "Køb Tårn" button is clicked, **Then** tower shop menu appears showing available towers with prices
2. **Given** tower shop is open and child has sufficient coins (≥50), **When** "Basis Tårn" is selected, **Then** tower enters placement mode with grid highlighting available cells
3. **Given** tower is in placement mode, **When** child clicks empty grid cell, **Then** tower is placed, coins are deducted, and tower becomes active
4. **Given** tower is in placement mode and child has insufficient coins, **When** expensive tower is selected, **Then** "Ikke nok mønter!" message appears
5. **Given** tower is placed on grid, **When** zombie enters tower range during defense wave, **Then** tower automatically rotates and shoots projectile at zombie
6. **Given** zombie is hit by tower projectile, **When** damage is applied, **Then** zombie health decreases and zombie is destroyed when health reaches zero
7. **Given** defense wave completes with zombies destroyed, **When** wave ends, **Then** "Bølge Fuldført!" message shows and next math challenge phase begins

---

### User Story 3 - Multi-Wave Progression System (Priority: P3)

A child completes multiple rounds alternating between math challenges (5 problems) and defense waves, with increasing difficulty, more coins earned, and progression through multiple levels.

**Why this priority**: This creates the complete game loop with progression systems that keep children engaged over time. It's essential for retention but not needed for validating core mechanics.

**Independent Test**: Can be fully tested by completing one full cycle: solve 5 math problems (earning 50 total coins), complete defense wave 1, solve 5 harder math problems (earning 75 coins), complete defense wave 2 with more zombies. Delivers full gameplay experience showing difficulty scaling.

**Acceptance Scenarios**:

1. **Given** child is in math challenge phase, **When** 5 math problems are solved correctly, **Then** "Matematik Færdig! Forbered Forsvar!" message shows and game transitions to defense phase
2. **Given** defense wave starts, **When** zombies begin spawning from entry point, **Then** zombies follow path toward base at consistent speed
3. **Given** zombie reaches base without being destroyed, **When** zombie touches base, **Then** base health decreases by 1 and zombie disappears
4. **Given** base health reaches zero, **When** final zombie hits base, **Then** "Spil Tabt!" message shows with restart option
5. **Given** all zombies in wave are destroyed and base health > 0, **When** wave completes, **Then** bonus coins awarded (25 coins) and next math challenge begins
6. **Given** child advances to wave 2, **When** math problems appear, **Then** problems are more difficult (within grade level) and reward more coins (15 per problem)
7. **Given** child advances to wave 3+, **When** defense wave starts, **Then** more zombies spawn, zombies move faster, or zombies have more health
8. **Given** child completes wave 5, **When** final wave ends successfully, **Then** "Niveau Fuldført!" message shows with total score and option to play next level

---

### User Story 4 - Multiple Tower Types & Strategy (Priority: P4)

A child can purchase and strategically place different types of towers (basic, rapid-fire, area damage) with varying costs, ranges, and damage types to optimize their defense strategy.

**Why this priority**: This adds strategic depth and replayability. Children learn resource management and tactical thinking while still getting math practice. Not essential for MVP but significantly enhances engagement.

**Independent Test**: Can be fully tested by starting with sufficient coins (e.g., 500), purchasing three different tower types ("Basis Tårn" 50 coins, "Hurtig Tårn" 100 coins, "Område Tårn" 150 coins), placing them strategically on the grid, and observing different behaviors (basic shoots single target, rapid shoots quickly, area damages multiple zombies). Delivers strategic gameplay variety.

**Acceptance Scenarios**:

1. **Given** tower shop is open, **When** viewing tower options, **Then** three tower types are displayed: "Basis Tårn" (50 coins), "Hurtig Tårn" (100 coins), "Område Tårn" (150 coins)
2. **Given** basic tower is placed, **When** zombie enters range, **Then** tower shoots single projectile dealing 2 damage with 1 second fire rate
3. **Given** rapid-fire tower is placed, **When** zombie enters range, **Then** tower shoots single projectile dealing 1 damage with 0.5 second fire rate
4. **Given** area damage tower is placed, **When** zombie enters range, **Then** tower shoots explosive projectile dealing 3 damage to all zombies within 2 grid cells
5. **Given** multiple towers cover same area, **When** zombies enter range, **Then** all towers target and shoot independently creating combined firepower
6. **Given** child wants to improve defense, **When** clicking placed tower, **Then** tower info panel shows with "Opgradér" button (if affordable)
7. **Given** child clicks "Opgradér" on tower with sufficient coins, **When** upgrade is purchased, **Then** tower stats improve (damage +1, range +1 cell) and visual appearance changes

---

### Edge Cases

- What happens when child closes game mid-wave? **Assumed**: Game session ends, no progress saved (simplified for MVP - future: save/load system)
- What happens when child completes all grade-appropriate math problems? **Assumed**: Problems cycle/randomize with same difficulty level
- What happens when grid is full of towers and child wants to place more? **Assumed**: "Ingen Plads!" message appears, child must proceed with existing towers
- What happens when multiple zombies reach base simultaneously? **Assumed**: Each zombie deals damage sequentially, base health updates in real-time
- What happens when child answers math problem incorrectly 3 times in a row? **Assumed**: Correct answer is revealed with "Svaret er: [X]" message, child proceeds with no coins for that problem
- What happens when zombies are too strong for current towers? **Assumed**: Game over occurs, child sees "Prøv Igen!" with suggestion "Køb Flere Tårne!"
- What happens when child selects wrong grade (too easy/hard)? **Assumed**: Can return to main menu and reselect grade before starting first math challenge

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow children to select one of four grade levels (0, 1, 2, 3) at game start with Danish labels "Klasse 0", "Klasse 1", "Klasse 2", "Klasse 3"
- **FR-002**: System MUST generate grade-appropriate math problems: Grade 0 (addition 0-5), Grade 1 (add/subtract 0-10), Grade 2 (two-digit add, simple multiply), Grade 3 (multi-digit ops, division)
- **FR-003**: System MUST present math problems with Danish text labels ("Løs opgaven:", "Svar:", question text) and multiple choice answers (1 correct, 3 incorrect)
- **FR-004**: System MUST award 10 coins per correct answer on first attempt, 0 coins for incorrect answers, with Danish feedback messages ("Rigtigt!", "Prøv igen!")
- **FR-005**: System MUST display accumulated coin total with Danish label "Mønter: [X]" visible throughout gameplay
- **FR-006**: System MUST require 5 correctly answered math problems before transitioning to defense wave
- **FR-007**: System MUST provide tower shop with at least 3 tower types: Basic (50 coins), Rapid-Fire (100 coins), Area Damage (150 coins) with Danish names
- **FR-008**: System MUST implement 2D grid-based level layout where towers can be placed on empty cells during planning phase
- **FR-009**: System MUST prevent tower placement on occupied cells, path cells, or when insufficient coins available
- **FR-010**: System MUST spawn zombies during defense wave that follow predefined path from entry point to base
- **FR-011**: System MUST enable towers to automatically detect, target, and shoot zombies within their attack range
- **FR-012**: System MUST apply damage to zombies when hit by projectiles and remove zombies when health reaches zero
- **FR-013**: System MUST track base health starting at 10 and decrease by 1 for each zombie that reaches base
- **FR-014**: System MUST end game with "Spil Tabt!" message when base health reaches zero
- **FR-015**: System MUST increase difficulty across waves: more zombies spawned, faster zombie speed, or higher zombie health
- **FR-016**: System MUST increase coin rewards as waves progress: wave 1 (10 coins/problem), wave 2 (15 coins/problem), wave 3+ (20 coins/problem)
- **FR-017**: System MUST increase math problem difficulty within grade level as waves progress
- **FR-018**: System MUST display win message "Niveau Fuldført!" when player completes all 5 waves successfully
- **FR-019**: System MUST use Danish language for all user-facing text in menus, buttons, labels, and messages
- **FR-020**: System MUST implement scene-based architecture: GradeSelection (new scene), MathChallenge (new scene), TowerPlacement (new scene), DefenseWave (new scene), GameOver (extends existing scene)

### Key Entities

- **Grade Level**: Represents selected difficulty (0-3), determines math problem complexity and number ranges
- **Math Problem**: Question with one correct answer and three distractors, difficulty scales with grade and wave number, awards coins on correct answer
- **Coin Balance**: Accumulated currency earned from correct math answers and wave completion bonuses, spent on towers and upgrades
- **Tower**: Defensive structure placed on grid with properties: type (basic/rapid/area), cost, attack damage, attack range, fire rate, position
- **Zombie**: Enemy entity with properties: health points, movement speed, damage to base, path position, increases in difficulty per wave
- **Grid Cell**: 2D level layout unit that can be: empty (tower placeable), occupied (has tower), path (zombie route), base (player's objective)
- **Defense Wave**: Game phase with properties: wave number (1-5), zombie count, zombie stats, spawning pattern, determines difficulty scaling
- **Base**: Player's objective with health points (starts at 10), loses health when zombies reach it, game ends when health reaches zero
- **Game Session**: Overall state including: selected grade, current wave number, coin balance, placed towers, base health, progression through math/defense cycles

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Children can select grade level and begin playing within 10 seconds of game launch
- **SC-002**: Math problems generate correctly for all grade levels with appropriate difficulty (verified through grade 0 showing 0-5 addition, grade 3 showing division)
- **SC-003**: Children successfully complete at least one full cycle (5 math problems + defense wave) in 90% of playthroughs
- **SC-004**: Tower placement and combat mechanics function without errors (towers shoot zombies, zombies take damage, base health decreases correctly)
- **SC-005**: Game difficulty increases measurably across waves (wave 3 has 50% more zombies than wave 1, or zombies move 25% faster)
- **SC-006**: All Danish language text displays correctly throughout the game with no English placeholder text visible
- **SC-007**: Children can distinguish between different tower types through visual appearance and observe different combat behaviors (rapid tower fires twice as fast as basic tower)
- **SC-008**: Game runs at 60 FPS on target browsers (Chrome, Firefox, Safari) with 1024x768 resolution
- **SC-009**: Coin economy is balanced: children earn enough coins to purchase 2-3 towers after completing 5 math problems at wave 1
- **SC-010**: Game session completes successfully with win/lose conditions triggering appropriately (base destroyed = lose, wave 5 completed = win)

## Assumptions

- **Visual Design**: Game uses simple 2D sprites/shapes for towers and zombies - no complex animations required for MVP (future: animated sprites)
- **Audio**: No sound effects or music in MVP (future: audio feedback for correct answers, tower shooting, zombie damage)
- **Data Persistence**: No save/load system - each play session is independent (future: progress tracking, high scores)
- **Level Layouts**: Single pre-defined level layout for MVP with straight zombie path (future: multiple levels with varied paths)
- **Math Problem Pool**: Finite set of ~50 problems per grade level that can repeat (future: infinite generation algorithm)
- **Tower Upgrades**: Basic 1-level upgrade system (damage+1, range+1) sufficient for MVP (future: multi-tier upgrades with branching paths)
- **Zombie Variety**: Single zombie type with scaling health/speed sufficient for MVP (future: different zombie types with special abilities)
- **Multiplayer**: Single-player only (future: co-op or competitive modes)
- **Analytics**: No tracking of child performance or learning outcomes (future: teacher dashboard with progress reports)
- **Accessibility**: Standard mouse/touch controls, no special accessibility features in MVP (future: keyboard controls, colorblind mode, dyslexia-friendly fonts)

## Dependencies

- Existing Phaser 3 game architecture (Boot, Preloader, MainMenu scenes)
- Existing TypeScript build configuration and Vite setup
- Existing Playwright testing infrastructure
- Existing Danish language implementation pattern from copilot-instructions.md
- Existing scene-based architecture and transition patterns

## Out of Scope

- Teacher/parent dashboard for tracking progress
- Adaptive difficulty that adjusts mid-game based on performance
- Social features (leaderboards, sharing scores)
- Multiple game modes (endless mode, challenge mode)
- Character customization or avatars
- Story/narrative elements
- Mini-games or bonus rounds beyond core math + tower defense loop
- Internationalization beyond Danish (no English, German, etc. versions)
