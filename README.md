# Phaser Vite TypeScript Template - Mission Kritisk

This is a Phaser 3 project template that uses Vite for bundling. It supports hot-reloading for quick development workflow, includes TypeScript support and scripts to generate production-ready builds.

This project includes automated deployment workflows and comprehensive testing with Playwright.

**[This Template is also available as a JavaScript version.](https://github.com/phaserjs/template-vite)**

## 🚀 Deployment & Workflows

This project features automated CI/CD workflows for GitHub Pages deployment:

### Production Deployment
- **Workflow**: `.github/workflows/deploy-main.yml`
- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Destination**: GitHub Pages root
- **URL**: `https://mortenp1337.github.io/mission-kritisk/`
- **Content**: Production build only (no preview artifacts)
- **Concurrency**: Queued (ensures completion)

### PR Preview Deployment
- **Workflow**: `.github/workflows/deploy-pr-preview.yml`
- **Trigger**: Pull Request opened/updated/reopened or manual workflow dispatch
- **Destination**: GitHub Pages with preview subdirectory
- **URLs**:
  - **Production**: `https://mortenp1337.github.io/mission-kritisk/` (main branch content)
  - **Preview**: `https://mortenp1337.github.io/mission-kritisk/preview/` (PR branch content)
- **Concurrency**: Cancel-in-progress (only latest preview active)
- **Important**: Only one preview can exist at a time - each deployment replaces the entire site

#### How PR Previews Work

1. **Open a PR**: Workflow automatically triggers on PR creation
2. **Wait for Deployment**: Usually completes within 3-5 minutes
3. **Access Preview**: Visit `https://mortenp1337.github.io/mission-kritisk/preview/`
4. **Test Changes**: Both production (root) and preview (subdirectory) are accessible
5. **Auto-Update**: Push new commits → automatic redeployment
6. **After Merge**: Main deployment removes preview directory

#### Manual Deployments

You can manually trigger preview deployments:
1. Go to **Actions** → **Deploy PR Preview** workflow
2. Click **Run workflow**
3. Select your branch from the dropdown
4. Workflow automatically detects deployment type:
   - `main` branch → production-only deployment
   - Other branches → combined deployment (production + preview)

#### For Reviewers

- Check PR for "deploy-pr-preview" workflow status (✅ = ready)
- Visit preview URL to test changes without local setup
- Verify game functionality, UI elements, and Danish text
- No need to check out branch locally for basic testing

## 🎮 Game Features

### Challenge Type System
The game features a comprehensive challenge system with multiple difficulty levels and challenge categories:

- **Difficulty Levels**: Choose from 4 difficulty levels (Niveau 1-4)
  - Niveau 1 - Begynder (Beginner)
  - Niveau 2 - Let Øvet (Slightly Practiced)
  - Niveau 3 - Øvet (Practiced)
  - Niveau 4 - Ekspert (Expert)
  
- **Challenge Categories**:
  - **Regnearter (Arithmetic Operations)**: Traditional math problems
    - Addition (available at all difficulty levels)
    - Subtraction (available from difficulty 2+)
    - Multiplication (available from difficulty 3+)
    - Division (available only at difficulty 4)
  - **Logik Opgaver (Logic Puzzles)**: Visual logic challenges
    - Halvdele og Dobbelte (Halves and Doubles): Emoji-based problems with multiple choice answers

- **Navigation Flow**: DifficultySelection → CategorySelection → ChallengeTypeMenu → Challenge → TowerPlacement
- **Back Navigation**: All menus have back buttons that preserve your difficulty and category selections
- **State Persistence**: Your difficulty and category choices persist throughout the game session

### Logic Puzzles Features
- **Visual Representation**: Problems displayed with emoji icons (🍎🍐🐶🐱⭐)
- **Multiple Choice**: 3-4 answer options per problem
- **Real-World Contexts**: 30% of problems use scenarios like prices, recipes, and quantities
- **Smart Feedback**: 2 attempts per problem with color-coded feedback
  - Green: Correct answer
  - Yellow: Try again (first attempt failed)
  - Orange: Show correct answer (both attempts exhausted)
- **Emoji Grouping**: Large quantities displayed as "🍎×8" for better readability
- **Difficulty Scaling**: Problem complexity increases with difficulty level
- **Consistent Rewards**: Earn the same coins as arithmetic challenges

### Adjustable Game Speed Control
Control the pace of gameplay with real-time speed adjustment:

- **Speed Range**: 0.5x (slow motion) to 5.0x (fast forward)
- **Controls**: +/- buttons positioned at bottom-right during waves
- **Incremental Stepping**: 0.5x per button press (smooth progression)
- **Real-time Feedback**: Visual speed display updates instantly
- **Smart Scaling**: Affects all gameplay elements proportionally:
  - Enemy movement and spawn timing
  - Tower fire rate and projectile speed
  - Wave duration and completion time
- **Reset Behavior**: Automatically resets to 1.0x between waves

**Usage**: During DefenseWave scene, press the +/- buttons at bottom-right to adjust game speed. All enemies and towers respond dynamically to speed changes while maintaining gameplay balance.

### Continuous Integration
- **Workflow**: `.github/workflows/ci.yml`
- **Trigger**: All pushes and PRs
- **Validation**: Build verification and output checks

## 🧪 Testing

The project includes comprehensive end-to-end testing with Playwright:

```bash
# Run tests in development mode
npm run test

# Run tests with visible browser
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Test production build
npm run test:prod
```

Test coverage includes:
- Game loading and initialization
- Scene transitions and interactions
- Responsive design validation
- Asset loading verification
- Build integrity checks

### Versions

This template has been updated for:

- [Phaser 3.90.0](https://github.com/phaserjs/phaser)
- [Vite 6.3.1](https://github.com/vitejs/vite)
- [TypeScript 5.7.2](https://github.com/microsoft/TypeScript)

![screenshot](screenshot.png)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |
| `npm run dev-nolog` | Launch a development web server without sending anonymous data |
| `npm run build-nolog` | Create a production build without sending anonymous data |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Playwright tests |
| `npm run test:headed` | Run Playwright tests with visible browser |
| `npm run test:ui` | Run Playwright tests in interactive UI mode |
| `npm run test:prod` | Run Playwright tests against production build |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the local development server by running `npm run dev`.

The local development server runs on `http://localhost:8080` by default. Please see the Vite documentation if you wish to change this, or add SSL support.

Once the server is running you can edit any of the files in the `src` folder. Vite will automatically recompile your code and then reload the browser.

## Template Project Structure

We have provided a default project structure to get you started. This is as follows:

## Template Project Structure

We have provided a default project structure to get you started:

| Path                         | Description                                                |
|------------------------------|------------------------------------------------------------|
| `index.html`                 | A basic HTML page to contain the game.                     |
| `public/assets`              | Game sprites, audio, etc. Served directly at runtime.      |
| `public/style.css`           | Global layout styles.                                      |
| `src/main.ts`                | Application bootstrap.                                     |
| `src/game`                   | Folder containing the game code.                           |
| `src/game/main.ts`           | Game entry point: configures and starts the game.          |
| `src/game/scenes`            | Folder with all Phaser game scenes.                        | 


## Handling Assets

Vite supports loading assets via JavaScript module `import` statements.

This template provides support for both embedding assets and also loading them from a static folder. To embed an asset, you can import it at the top of the JavaScript file you are using it in:

```js
import logoImg from './assets/logo.png'
```

To load static files such as audio files, videos, etc place them into the `public/assets` folder. Then you can use this path in the Loader calls within Phaser:

```js
preload ()
{
    //  This is an example of an imported bundled image.
    //  Remember to import it at the top of this file
    this.load.image('logo', logoImg);

    //  This is an example of loading a static image
    //  from the public/assets folder:
    this.load.image('background', 'assets/bg.png');
}
```

When you issue the `npm run build` command, all static assets are automatically copied to the `dist/assets` folder.

## Deploying to Production

After you run the `npm run build` command, your code will be built into a single bundle and saved to the `dist` folder, along with any other assets your project imported, or stored in the public assets folder.

In order to deploy your game, you will need to upload *all* of the contents of the `dist` folder to a public facing web server.

## Customizing the Template

### Vite

If you want to customize your build, such as adding plugin (i.e. for loading CSS or fonts), you can modify the `vite/config.*.mjs` file for cross-project changes, or you can modify and/or create new configuration files and target them in specific npm tasks inside of `package.json`. Please see the [Vite documentation](https://vitejs.dev/) for more information.

## About log.js

If you inspect our node scripts you will see there is a file called `log.js`. This file makes a single silent API call to a domain called `gryzor.co`. This domain is owned by Phaser Studio Inc. The domain name is a homage to one of our favorite retro games.

We send the following 3 pieces of data to this API: The name of the template being used (vue, react, etc). If the build was 'dev' or 'prod' and finally the version of Phaser being used.

At no point is any personal data collected or sent. We don't know about your project files, device, browser or anything else. Feel free to inspect the `log.js` file to confirm this.

Why do we do this? Because being open source means we have no visible metrics about which of our templates are being used. We work hard to maintain a large and diverse set of templates for Phaser developers and this is our small anonymous way to determine if that work is actually paying off, or not. In short, it helps us ensure we're building the tools for you.

However, if you don't want to send any data, you can use these commands instead:

Dev:

```bash
npm run dev-nolog
```

Build:

```bash
npm run build-nolog
```

Or, to disable the log entirely, simply delete the file `log.js` and remove the call to it in the `scripts` section of `package.json`:

Before:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

After:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

Either of these will stop `log.js` from running. If you do decide to do this, please could you at least join our Discord and tell us which template you're using! Or send us a quick email. Either will be super-helpful, thank you.

## Join the Phaser Community!

We love to see what developers like you create with Phaser! It really motivates us to keep improving. So please join our community and show-off your work 😄

**Visit:** The [Phaser website](https://phaser.io) and follow on [Phaser Twitter](https://twitter.com/phaser_)<br />
**Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)<br />
**Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)<br />
**Discord:** Join us on [Discord](https://discord.gg/phaser)<br />
**Code:** 2000+ [Examples](https://labs.phaser.io)<br />
**Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter<br />

Created by [Phaser Studio](mailto:support@phaser.io). Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2025 Phaser Studio Inc.

All rights reserved.
