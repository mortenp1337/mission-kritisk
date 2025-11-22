# Quickstart: Math Tower Defense Game

**Purpose**: Guide for running, testing, and extending the math tower defense game  
**Created**: 2025-11-22

## Prerequisites

- Node.js 18+ or 20+
- npm 9+
- Git
- Modern web browser (Chrome, Firefox, or Safari)

## Installation

```bash
# Clone repository (if not already cloned)
git clone https://github.com/mortenp1337/mission-kritisk.git
cd mission-kritisk

# Checkout feature branch
git checkout 001-math-tower-defense

# Install dependencies
npm install
```

## Development

### Run Development Server

```bash
# With analytics logging
npm run dev

# Without logging
npm run dev-nolog
```

Game opens at `http://localhost:8080`

**Hot Reloading**: Changes to TypeScript files automatically reload the browser.

### Project Structure

```
src/game/
├── scenes/              # Phaser 3 scene classes
│   ├── GradeSelection.ts
│   ├── MathChallenge.ts
│   ├── TowerPlacement.ts
│   └── DefenseWave.ts
├── entities/            # Game objects
│   ├── towers/
│   ├── enemies/
│   └── projectiles/
├── systems/             # Game logic
├── data/                # Configuration
└── types/               # TypeScript interfaces
```

### Adding a New Tower Type

1. **Define stats** in `src/game/data/towerConfig.ts`:
```typescript
export const TOWER_CONFIG = {
  // ... existing towers
  freeze: [
    {
      cost: 200,
      attackDamage: 1,
      attackRange: 200,
      fireRate: 2000,
      upgradeCost: 100,
      special: 'Slows zombies by 50% for 3 seconds'
    }
  ]
};
```

2. **Create tower class** in `src/game/entities/towers/FreezeTower.ts`:
```typescript
import { Tower } from './Tower';
import { TowerType } from '../../types/TowerTypes';

export class FreezeTower extends Tower {
  constructor(scene: Phaser.Scene, position: GridPosition) {
    super(scene, position, TowerType.Freeze);
    
    // Custom initialization
    this.sprite.setTint(0x00FFFF); // Cyan color
  }
  
  protected onHit(zombie: Zombie): void {
    super.onHit(zombie);
    // Apply slow effect
    zombie.applySlow(0.5, 3000);
  }
}
```

3. **Update factory** in `src/game/entities/towers/TowerFactory.ts`:
```typescript
createTower(type: TowerType, position: GridPosition): Tower {
  switch (type) {
    case TowerType.Freeze:
      return new FreezeTower(this.scene, position);
    // ... other cases
  }
}
```

4. **Add to shop UI** in `src/game/scenes/TowerPlacement.ts`:
```typescript
this.createShopButton('Frys Tårn', TowerType.Freeze, 200);
```

5. **Load assets** in `src/game/scenes/Preloader.ts`:
```typescript
this.load.image('mtd-tower-freeze', 'towers/freeze.png');
```

### Adding a New Grade Level

1. **Update grade range** in `GameSession`:
```typescript
// Change grade validation from 0-3 to 0-4
grade: number = 0; // 0-4 for grades K-4
```

2. **Add problem templates** in `src/game/data/mathProblems.ts`:
```typescript
4: [
  {
    operation: 'multiply',
    rangeA: [10, 25],
    rangeB: [10, 25],
    displayFormat: '{a} × {b} = ?'
  },
  {
    operation: 'divide',
    rangeA: [100, 500],
    rangeB: [5, 20],
    displayFormat: '{a} ÷ {b} = ?'
  }
]
```

3. **Add grade button** in `src/game/scenes/GradeSelection.ts`:
```typescript
this.createGradeButton('Klasse 4', 4, 640);
```

4. **Update tests** in `tests/math-tower-defense/math-challenge.spec.ts`:
```typescript
test('Grade 4 generates appropriate problems', async ({ page }) => {
  await page.click('button:has-text("Klasse 4")');
  // Assert grade 4 problem difficulty
});
```

## Testing

### Run All Tests

```bash
# Development build tests
npm run test

# Production build tests
npm run test:prod

# Headed mode (visible browser)
npm run test:headed

# Interactive UI mode
npm run test:ui
```

### Test Files

```
tests/math-tower-defense/
├── grade-selection.spec.ts      # Grade selection UI
├── math-challenge.spec.ts       # Problem generation and answering
├── tower-placement.spec.ts      # Tower shop and placement
├── defense-wave.spec.ts         # Combat mechanics
└── full-game-flow.spec.ts       # End-to-end gameplay
```

### Writing Tests

Example test for new tower type:

```typescript
// tests/math-tower-defense/freeze-tower.spec.ts
import { test, expect } from '@playwright/test';

test('Freeze tower slows zombies', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // ... navigate to defense wave with freeze tower
  
  // Get zombie speed before slow
  const speedBefore = await page.evaluate(() => {
    const zombie = window.gameInstance.scene.getScene('DefenseWave').zombies[0];
    return zombie.speed;
  });
  
  // Wait for freeze tower to hit
  await page.waitForTimeout(2000);
  
  // Get zombie speed after slow
  const speedAfter = await page.evaluate(() => {
    const zombie = window.gameInstance.scene.getScene('DefenseWave').zombies[0];
    return zombie.speed;
  });
  
  expect(speedAfter).toBe(speedBefore * 0.5);
});
```

## Building

### Development Build

```bash
npm run build-nolog
```

Output: `dist/` directory

### Production Build

```bash
npm run build
```

Includes:
- Terser minification
- Code splitting (Phaser in separate chunk)
- Source maps
- Asset optimization

### Build Verification

```bash
# Serve production build locally
npm run preview
# Opens http://localhost:4173

# Run production tests
npm run test:prod
```

## Deployment

### GitHub Pages (Automated)

**Main Branch**:
```bash
git checkout main
git merge 001-math-tower-defense
git push origin main
```
→ Automatic deployment to `https://mortenp1337.github.io/mission-kritisk/`

**PR Preview**:
- Open Pull Request from `001-math-tower-defense` to `main`
- Automatic preview at `/preview/pr-{number}/`
- Preview updates on each commit
- Preview removed when PR closes

### Manual Deployment

```bash
# Build production version
npm run build

# Deploy dist/ contents to hosting service
# (e.g., Netlify, Vercel, custom server)
```

## Debugging

### Browser DevTools

**Access game state**:
```javascript
// In browser console
const session = window.gameInstance.scene.getScene('MathChallenge').gameSession;
console.log('Coins:', session.coins);
console.log('Wave:', session.currentWave);
console.log('Grade:', session.grade);
```

**Spawn test zombie**:
```javascript
const defenseScene = window.gameInstance.scene.getScene('DefenseWave');
defenseScene.spawnZombie({ health: 5, speed: 50 });
```

**Award test coins**:
```javascript
const session = GameSession.getInstance();
session.coins += 1000;
```

### Phaser Debug

Enable Phaser debug in `src/game/main.ts`:

```typescript
const config: Phaser.Types.Core.GameConfig = {
  // ... existing config
  physics: {
    default: 'arcade',
    arcade: {
      debug: true  // Shows collision boxes, velocity vectors
    }
  }
};
```

### TypeScript Errors

```bash
# Check TypeScript without building
npx tsc --noEmit
```

## Performance Optimization

### Monitoring FPS

```typescript
// In any scene's update()
update() {
  if (this.game.loop.actualFps < 55) {
    console.warn('Low FPS:', this.game.loop.actualFps);
  }
}
```

### Common Performance Issues

1. **Too many active projectiles**
   - Solution: Increase object pool size, destroy off-screen projectiles
   
2. **Path following calculations**
   - Solution: Cache waypoint positions, use squared distance checks
   
3. **Sprite updates every frame**
   - Solution: Only update sprites when state changes

## Troubleshooting

### Issue: Game doesn't load

**Check**:
1. Browser console for errors
2. Network tab for failed asset loads
3. Correct branch checked out

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run dev
```

### Issue: Tests failing

**Check**:
1. Development server running on correct port
2. Test timeouts sufficient for slow machines
3. Browser version compatibility

**Solution**:
```bash
# Increase timeout in playwright.config.ts
export default defineConfig({
  timeout: 60000  // 60 seconds
});
```

### Issue: Danish text not displaying

**Check**:
1. Text imported from `DanishText` constants
2. Font loaded correctly
3. Character encoding (UTF-8)

**Solution**:
```typescript
// Verify import
import { DanishText } from '../data/danishText';

// Use constant
this.add.text(x, y, DanishText.mathChallenge.prompt);
```

### Issue: Towers not targeting zombies

**Check**:
1. Zombie in tower range (debug draw range circle)
2. Zombie active and alive
3. Tower fire rate cooldown

**Debug**:
```typescript
// In Tower.update()
console.log('Range:', this.attackRange);
console.log('Zombies in scene:', zombies.length);
console.log('Distance to nearest:', this.getDistanceTo(zombies[0]));
```

## Best Practices

### Code Style

- **Danish UI strings**: Use `DanishText` constants
- **English code**: Variables, functions, comments in English
- **Type annotations**: Always declare types for Phaser objects
- **Scene lifecycle**: Initialize in `create()`, cleanup in `shutdown()`

### Asset Management

- Place assets in `public/assets/math-tower-defense/`
- Use consistent naming: `mtd-category-name`
- Load all assets in `Preloader` scene
- Use sprite atlases for multiple related images (future optimization)

### State Management

- Use `GameSession` singleton for persistent state
- Pass one-time data via `scene.start(name, data)`
- Don't store Phaser objects in GameSession (use data representations)
- Reset session on game over

### Testing

- Write tests before implementation (TDD)
- Test each user story independently
- Use descriptive test names
- Mock complex dependencies when needed

## Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mission Kritisk Constitution](../../.specify/memory/constitution.md)
- [Copilot Instructions](./.github/copilot-instructions.md)

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review specification: `specs/001-math-tower-defense/spec.md`
3. Review implementation plan: `specs/001-math-tower-defense/plan.md`
4. Create new GitHub issue with reproduction steps
