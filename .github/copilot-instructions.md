# Copilot Instructions

## Project Overview
This is a Phaser 3 game built with TypeScript and Vite. The project uses a scene-based architecture where each game state (Boot, Preloader, MainMenu, Game, GameOver) is a separate Phaser scene class.

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
Always declare Phaser objects as class properties with explicit types:
```typescript
export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
}
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

## Key Files for Reference
- `src/game/main.ts` - Game configuration and scene registration
- `src/game/scenes/Boot.ts` - Minimal asset loading pattern
- `src/game/scenes/Preloader.ts` - Progress bar implementation
- `vite/config.prod.mjs` - Production build optimizations
- `tsconfig.json` - Phaser-compatible TypeScript settings