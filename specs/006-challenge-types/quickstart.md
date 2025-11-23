# Quickstart Guide: Challenge Type System

**Developer onboarding for Feature 006 - Challenge Type System Restructure**

## Overview

The challenge type system allows players to select difficulty levels (1-4) and choose from categorized challenges (Arithmetic Operations and Logic Puzzles). This guide helps developers understand, test, and extend the system.

## Key Components

### Type Definitions
- **`src/game/types/ChallengeTypes.ts`**: Difficulty levels, challenge categories, challenge types
- **`src/game/types/LogicTypes.ts`**: Logic puzzle entities (LogicProblem, MultipleChoiceOption, EmojiSet)
- **`src/game/types/GameTypes.ts`**: Extended GameSession interface

### Systems
- **`src/game/systems/GameSession.ts`**: Manages game state including difficulty, category, and challenge type
- **`src/game/systems/ChallengeRegistry.ts`**: Maps categories to challenge types and scenes
- **`src/game/systems/LogicProblemGenerator.ts`**: Generates halves/doubles logic puzzles with validation

### Data Configuration
- **`src/game/data/difficultyConfig.ts`**: Difficulty level definitions (Danish labels)
- **`src/game/data/challengeCategories.ts`**: Challenge types organized by category
- **`src/game/data/emojiSets.ts`**: Emoji pools for logic puzzles with grouping notation
- **`src/game/data/danishText.ts`**: Danish UI text for all new elements

### Scenes (Navigation Flow)
1. **`DifficultySelection`**: Select difficulty level (1-4)
2. **`CategorySelection`**: Choose category (Math or Logic)
3. **`ChallengeTypeMenu`**: Select specific challenge type
4. **`MathChallenge`** or **`LogicChallenge`**: Complete problems
5. **`TowerPlacement`**: Spend earned coins on towers

## Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build-nolog

# Run tests
npm test
```

Navigate to `http://localhost:8080` and click "Start Spil" to test the new difficulty selection flow.

### Testing Difficulty Selection

1. Launch game → Main Menu
2. Click "Start Spil"
3. See 4 difficulty options with Danish labels
4. Select difficulty 2 (Niveau 2 - Let Øvet)
5. Verify transition to CategorySelection
6. Check that back button returns to DifficultySelection

### Testing Category Navigation

1. From CategorySelection, click "Regnearter"
2. See submenu with available operations (Addition, Subtraction for difficulty 2)
3. Click back button → verify return to CategorySelection
4. Click "Logik Opgaver"
5. See "Halvdele og Dobbelte" option
6. Select to start logic challenge

### Testing Logic Puzzles

1. Navigate to Logic Puzzles → Halvdele og Dobbelte
2. Complete 3 problems (mix of halves and doubles)
3. Verify emoji display and grouping notation (7+ items)
4. Test incorrect answers → should allow 2 attempts
5. Verify coin rewards match arithmetic challenges
6. Check transition to TowerPlacement after 3 problems

## Adding New Challenge Types

### Step 1: Define Challenge Type

Edit `src/game/data/challengeCategories.ts`:

```typescript
{
    id: 'new-challenge',
    name: 'Nyt Udfordring',  // Danish name
    category: ChallengeCategory.Logic,  // or Math
    sceneName: 'NewChallengeScene',
    minDifficulty: 1,
    maxDifficulty: 4,
    enabled: true
}
```

### Step 2: Create Challenge Scene

Create `src/game/scenes/NewChallengeScene.ts`:

```typescript
import { Scene } from 'phaser';
import { GameSession } from '../systems/GameSession';

export class NewChallengeScene extends Scene {
    constructor() {
        super('NewChallengeScene');
    }
    
    create() {
        const session = GameSession.getInstance();
        // Use session.difficulty for problem generation
        // Use session.currentWave for coin rewards
        // Transition to 'TowerPlacement' when complete
    }
}
```

### Step 3: Register Scene

Edit `src/game/main.ts`:

```typescript
import { NewChallengeScene } from './scenes/NewChallengeScene';

// Add to scene array
scene: [
    Boot,
    // ... other scenes
    NewChallengeScene,
    // ...
]
```

### Step 4: Add Danish Text

Edit `src/game/data/danishText.ts`:

```typescript
challengeTypeNames: {
    // ... existing types
    'new-challenge': 'Nyt Udfordring'
}
```

### Step 5: Test

1. Build: `npm run build-nolog`
2. Test navigation: DifficultySelection → CategorySelection → ChallengeTypeMenu
3. Verify new challenge appears in appropriate category
4. Verify difficulty filtering works correctly
5. Test challenge completion and coin rewards

## Emoji Guidelines

### Approved Emoji Categories

From `src/game/data/emojiSets.ts`:

- **Food**: 🍎 🍐 🍌 🍇 🍓
- **Animals**: 🐶 🐱 🐸 🐵 🐼
- **Shapes**: ⭐ ❤️ 🔵 ⬜ 🔷

### Testing Emoji Rendering

```typescript
import { formatEmojiDisplay } from '../data/emojiSets';

// Displays "🍎🍎🍎" for count < 7
formatEmojiDisplay('🍎', 3);  // "🍎🍎🍎"

// Displays "🍎×8" for count >= 7
formatEmojiDisplay('🍎', 8);  // "🍎×8"
```

### Adding New Emoji

1. Test rendering across browsers (Chrome, Firefox, Safari)
2. Add to appropriate category in `emojiSets.ts`
3. Include Danish `displayName`
4. Verify grouping notation works correctly

## Common Issues

### Issue: Scene Transition Not Working

**Symptom**: Clicking challenge type button does nothing

**Solution**:
1. Verify scene is registered in `main.ts`
2. Check ChallengeRegistry has correct scene name
3. Ensure scene constructor uses correct scene key

### Issue: Emoji Not Displaying

**Symptom**: Emoji shows as boxes or question marks

**Solution**:
1. Verify emoji is from approved list (Unicode 6.0-9.0)
2. Test in target browsers (Chrome, Firefox, Safari)
3. Check font fallback stack in Phaser text config

### Issue: State Not Preserved on Back Navigation

**Symptom**: Difficulty resets when navigating back

**Solution**:
1. Verify GameSession methods are called correctly
2. Check scene transitions use `this.scene.start()` not `this.scene.restart()`
3. Ensure `GameSession.reset()` is only called on initial game start

### Issue: Coin Rewards Not Matching

**Symptom**: Logic puzzles award different coins than arithmetic

**Solution**:
1. Verify `calculateWaveConfig()` is called with `session.currentWave`
2. Check `session.addCoins()` uses `waveConfig.rewards.coinPerProblem`
3. Test at same difficulty and wave level as arithmetic challenges

## Testing Strategy

### Unit Tests (Future)

Test files location: `tests/challenge-types/`

Planned coverage:
- `difficulty-selection.spec.ts`: Difficulty selection and persistence
- `category-navigation.spec.ts`: Category menu and back navigation
- `logic-puzzles.spec.ts`: Problem generation and validation
- `scoring-consistency.spec.ts`: Coin rewards match across challenge types

### Manual Testing Checklist

- [ ] All 4 difficulty levels selectable
- [ ] Category menu shows both categories
- [ ] Challenge type filtering by difficulty works
- [ ] Back buttons preserve state
- [ ] Logic puzzles display emoji correctly
- [ ] Grouping notation appears for 7+ items
- [ ] 2 attempts per problem enforced
- [ ] Color-coded feedback displays correctly
- [ ] Coin rewards match arithmetic challenges
- [ ] Transition to TowerPlacement after completion

## Architecture Notes

### Scene-Based Architecture

All game states are Phaser scenes following the pattern:
- `constructor()`: Set scene key
- `create()`: Initialize game objects and interactions
- Scene transitions via `this.scene.start('SceneName')`

### Bilingual Implementation

**Convention**: English code, Danish UI text
- Class names, variables, functions: English
- UI labels, button text, feedback: Danish
- Centralized in `danishText.ts`

### Difficulty Mapping

Difficulty levels (1-4) map to grade levels (0-3):
- Formula: `grade = difficulty - 1`
- Used internally for existing math problem templates
- Transparent to players who see only difficulty levels

## Additional Resources

- **Feature Specification**: `specs/006-challenge-types/spec.md`
- **Implementation Plan**: `specs/006-challenge-types/plan.md`
- **Research Findings**: `specs/006-challenge-types/research.md`
- **Task Breakdown**: `specs/006-challenge-types/tasks.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`

## Support

For questions or issues:
1. Check specification documents in `specs/006-challenge-types/`
2. Review existing scenes for implementation patterns
3. Test locally with `npm run dev` before committing
4. Verify builds with `npm run build-nolog`
