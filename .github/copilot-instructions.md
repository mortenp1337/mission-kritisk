# Copilot Instructions

## Project Overview
This is "Mission Kritisk" - a Phaser 3 game built with TypeScript and Vite. The project uses a scene-based architecture where each game state (Boot, Preloader, MainMenu, Game, GameOver) is a separate Phaser scene class.

## Language Guidelines
- **Code, comments, variable names, function names**: English
- **User-facing text (in-game text, UI labels, menu items)**: Danish
- **Documentation (README.md, etc.)**: Danish
- **Code structure and technical implementation**: English

## Architecture Patterns

### Scene Flow
Game follows this scene progression:
1. `Boot` → loads minimal assets (background)
2. `Preloader` → loads main game assets with progress bar
3. `MainMenu` → entry point for user interaction
4. `Game` → main gameplay scene
5. `GameOver` → end state with restart option

### Scene Structure
Each scene follows Phaser 3 lifecycle:
- `constructor()` - sets scene key
- `preload()` - loads assets (Boot/Preloader scenes)
- `create()` - initializes game objects and interactions
- Scene transitions via `this.scene.start('SceneName')`

### Asset Loading Strategy
- **Boot assets**: Essential files loaded immediately (`assets/bg.png`)
- **Main assets**: Bulk loading in Preloader with visual feedback
- **Path convention**: `this.load.setPath('assets')` then relative paths
- **Static assets**: Place in `public/assets/` for direct serving

## Development Workflow

### Essential Commands
```bash
npm run dev         # Development server on localhost:8080
npm run build       # Production build to dist/
npm run dev-nolog   # Development without analytics
npm run build-nolog # Production build without analytics
```

### Build Configuration
- **Development**: Uses `vite/config.dev.mjs` - basic config with dev server
- **Production**: Uses `vite/config.prod.mjs` - includes Terser minification and custom Phaser plugin
- **Code splitting**: Phaser is extracted to separate chunk for better caching

### TypeScript Configuration
- Strict mode enabled with `strictPropertyInitialization: false` for Phaser compatibility
- ES2020 target with DOM libraries
- Bundler mode resolution for Vite compatibility

## Project-Specific Conventions

### Scene Property Declarations
Always declare Phaser objects as class properties with explicit types (in English):
```typescript
export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;  // Display text will be in Danish
}
```

### User-Facing Text
All text displayed to users should be in Danish:
```typescript
// Good - Danish user-facing text
this.title = this.add.text(512, 460, 'Mission Kritisk', {
    fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff'
});

// Good - English code and comments
this.gameover_text = this.add.text(512, 384, 'Spillet Slut', {
    fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff'
});
```

### Game Configuration
Core game config in `src/game/main.ts`:
- 1024x768 resolution
- AUTO renderer (WebGL with Canvas fallback)
- Scene array defines load order
- Exported `StartGame` function takes parent DOM element

### File Organization
- `src/main.ts` - DOM-ready bootstrap
- `src/game/main.ts` - Phaser configuration and startup
- `src/game/scenes/` - All game scenes
- `public/assets/` - Static game assets
- `vite/` - Environment-specific build configs

### Scene Transitions
Use pointer events for scene transitions:
```typescript
this.input.once('pointerdown', () => {
    this.scene.start('NextScene');
});
```

## Asset Management
- Images loaded via `this.load.image(key, path)`
- Assets referenced by string keys throughout scenes
- Progress tracking in Preloader using LoaderPlugin events
- Background shared across scenes using same key

## Deployment System

### Overview
The project uses GitHub Actions for automated deployment to GitHub Pages with support for PR previews.

### Deployment Types

**Production Deployment** (`.github/workflows/deploy-main.yml`):
- **Triggers**: Push to `main` branch, manual workflow dispatch
- **Content**: Production build only (no preview)
- **URL**: `https://mortenp1337.github.io/mission-kritisk/`
- **Concurrency**: Queued (ensures completion, no cancellation)

**PR Preview Deployment** (`.github/workflows/deploy-pr-preview.yml`):
- **Triggers**: PR opened/updated/reopened, manual workflow dispatch
- **Content**: Production at root + PR preview in `/preview/` subdirectory
- **URLs**:
  - Production: `https://mortenp1337.github.io/mission-kritisk/`
  - Preview: `https://mortenp1337.github.io/mission-kritisk/preview/`
- **Concurrency**: Cancel-in-progress (only latest preview matters)

### Key Behaviors

- **Single Preview**: Only one preview can exist at a time. Each deployment replaces the entire GitHub Pages site.
- **Branch Detection**: Workflows automatically detect branch type:
  - `main` branch → production-only deployment
  - Other branches → combined deployment (production + preview)
- **Preview Path**: Always `/preview/` - no PR number or branch name in path
- **Automatic Updates**: PR previews update automatically when new commits are pushed

### For PR Authors

1. **Opening a PR**: Workflow automatically deploys within 3-5 minutes
2. **Preview URL**: Visit `https://mortenp1337.github.io/mission-kritisk/preview/`
3. **Updates**: Push new commits → automatic redeployment (cancels in-progress)
4. **After Merge**: Main deployment removes preview directory automatically

### For Reviewers

1. **Access Preview**: Check PR for "deploy-pr-preview" workflow status
2. **Test URL**: `https://mortenp1337.github.io/mission-kritisk/preview/`
3. **No Local Setup**: Test changes directly in browser without checkout
4. **Validation**: Verify game functionality, UI, and Danish text correctness

### Manual Deployments

Use workflow_dispatch for ad-hoc deployments:
1. Go to Actions → deploy-pr-preview workflow
2. Click "Run workflow"
3. Select branch (main = production, other = preview)
4. Workflow auto-detects deployment type

### Troubleshooting

**Preview 404**:
- Wait for workflow completion (~5 minutes)
- Check if another PR deployed after yours (only one preview active)
- Trigger manual deployment if needed

**Deployment Failed**:
- Check workflow logs in Actions tab
- Verify build passes locally: `npm run build-nolog`
- Fix errors and push new commit (automatic retry)

**Using Cached Main Build Warning**:
- Main branch build failed but PR preview continued
- Preview uses previous successful main build
- Not an error - your PR changes are still valid
- Check main branch status if concerned

## Key Files for Reference
- `src/game/main.ts` - Game configuration and scene registration
- `src/game/scenes/Boot.ts` - Minimal asset loading pattern
- `src/game/scenes/Preloader.ts` - Progress bar implementation
- `src/game/scenes/DefenseWave.ts` - Main wave gameplay scene with speed control integration
- `src/game/entities/SpeedControl.ts` - Speed adjustment UI buttons and display
- `src/game/entities/towers/Tower.ts` - Tower fire rate scaling with timeScale
- `src/game/entities/enemies/Zombie.ts` - Zombie movement scaling with timeScale
- `src/game/systems/WaveManager.ts` - Zombie spawn timing scaling with timeScale
- `vite/config.prod.mjs` - Production build optimizations
- `tsconfig.json` - Phaser-compatible TypeScript settings
- `.github/workflows/deploy-main.yml` - Production deployment workflow
- `.github/workflows/deploy-pr-preview.yml` - PR preview deployment workflow

## Game Speed Control

### Overview
The game supports adjustable speed controls during waves (0.5x to 5.0x) via `SpeedControl` UI component. Speed adjustments use Phaser's `time.timeScale` to globally affect all game systems.

### Architecture

**SpeedControl UI Entity** (`src/game/entities/SpeedControl.ts`):
- Provides +/- buttons positioned at bottom-right (x: 860-990, y: 720)
- Additive stepping: ±0.5x per press (1.0x → 1.5x → 2.0x ... up to 5.0x)
- 100ms debounce prevents rapid button mashing
- Updates display text in real-time ("1.0x", "1.5x", etc.)

**Speed Application** (`src/game/scenes/DefenseWave.ts`):
```typescript
// Speed callback connected to SpeedControl
this.speedControl = new SpeedControl(this, (speed: number) => {
    this.time.timeScale = speed;  // Affects all Phaser systems
    this.session.setGameSpeed(speed);  // Persist state
});
```

### Systems Affected by Speed Control

**Automatically Scaled by Phaser**:
- Physics bodies and tweens
- Timer events
- Animations and projectiles
- Delays (`time.delayedCall`)

**Manually Scaled** (require `delta * scene.time.timeScale`):
- Custom movement calculations (Zombie, Tower)
- Manual timing logic (spawn intervals)

### Implementation Pattern

When implementing custom movement or timing:
```typescript
// ✅ CORRECT: Scale manual calculations
update(delta: number): void {
    const scaledDelta = delta * this.scene.time.timeScale;
    const moveDistance = (this.speed * scaledDelta) / 1000;
    // ... move logic
}

// ✅ CORRECT: Scale manual fire rate checks
canFire(time: number): boolean {
    const scaledFireRate = this.fireRate / this.scene.time.timeScale;
    return time >= this.lastFireTime + scaledFireRate;
}

// ❌ WRONG: Phaser systems don't need manual scaling
this.tweens.add({ duration: 200 });  // Already respects timeScale
this.time.delayedCall(1000, callback);  // Already respects timeScale
```

### Reset Behavior
Game speed automatically resets to 1.0x when:
- Wave completes
- Game over (base destroyed)
- Scene transitions

Reset logic in `DefenseWave.ts`:
```typescript
this.time.timeScale = 1.0;
this.session.resetGameSpeed();
```