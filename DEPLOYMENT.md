# Deployment Workflow Documentation

## Overview
This project implements a comprehensive CI/CD pipeline with automated testing and deployment to GitHub Pages.

## Workflow Architecture

### 1. Continuous Integration (CI)
**File**: `.github/workflows/ci.yml`
**Triggers**: All pushes and PRs to main/develop branches
**Matrix Testing**: Node.js versions 18 & 20
**Actions**:
- Install dependencies
- Build project
- Run Playwright tests across Chrome, Firefox, Safari
- Verify build integrity

### 2. Main Branch Deployment
**File**: `.github/workflows/deploy-main.yml`
**Trigger**: Push to `main` branch
**Destination**: GitHub Pages root
**Process**:
1. **Test Phase**: Full Playwright test suite
2. **Build Phase**: Production build generation
3. **Deploy Phase**: Deploy to GitHub Pages root directory

**Live URL**: `https://mortenp1337.github.io/mission-kritisk/`

### 3. PR Preview Deployment
**File**: `.github/workflows/deploy-pr-preview.yml`
**Trigger**: PR opened, synchronized, or reopened
**Destination**: GitHub Pages `/preview/pr-{number}/` subfolder
**Features**:
- Creates isolated preview environments
- Updates automatically on PR updates
- Posts preview URL as PR comment
- Includes direct links and deployment status

**Preview URL Pattern**: `https://mortenp1337.github.io/mission-kritisk/preview/pr-123/`

### 4. PR Preview Cleanup
**File**: `.github/workflows/cleanup-pr-preview.yml`
**Trigger**: PR closure
**Action**: Removes preview directory to keep repository clean

## Testing Strategy

### Development Testing
```bash
npm run test          # Run tests against dev server
npm run test:headed   # Run with visible browser
npm run test:ui       # Interactive test runner
```

### Production Testing
```bash
npm run test:prod     # Test against built version
```

### Test Coverage
- **Game Loading**: Verifies game initializes correctly
- **Scene Transitions**: Tests game flow and interactions
- **Responsive Design**: Validates multiple viewport sizes
- **Asset Loading**: Ensures all resources load successfully
- **Build Integrity**: Confirms production build works

## GitHub Pages Configuration

### Required Settings
1. **Repository Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages`
4. **Folder**: `/ (root)`

### Required Permissions
Workflows need these permissions in repository settings:
- **Actions**: Read and write
- **Contents**: Write
- **Pages**: Write
- **Pull Requests**: Write

## Directory Structure

```
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Continuous Integration
│   │   ├── deploy-main.yml          # Main branch deployment
│   │   ├── deploy-pr-preview.yml    # PR preview deployment
│   │   └── cleanup-pr-preview.yml   # PR cleanup
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── tests/
│   ├── game.spec.ts                 # Main game tests
│   └── build.spec.ts                # Build verification tests
├── playwright.config.ts             # Development test config
├── playwright.config.prod.ts        # Production test config
└── package.json                     # Updated with test scripts
```

## Deployment Flow

### Main Branch Flow
```
Push to main → CI Tests → Build → Deploy to root → Live site updated
```

### PR Flow
```
Create PR → CI Tests → Build → Deploy to preview → Comment with URL
Update PR → CI Tests → Build → Update preview → Update comment
Close PR → Remove preview directory
```

## Environment Variables

The workflows use these built-in GitHub secrets:
- `GITHUB_TOKEN`: For repository operations
- `secrets.GITHUB_TOKEN`: For authenticated operations

No additional secrets required for basic deployment.

## Monitoring & Debugging

### Test Reports
- Playwright generates HTML reports for all test runs
- Reports are uploaded as artifacts in GitHub Actions
- Available for 30 days after workflow completion

### Build Artifacts
- Production builds are uploaded during deployment
- Available for inspection in Actions tab

### Preview Management
- Preview index page lists all active previews
- Accessible at: `https://mortenp1337.github.io/mission-kritisk/preview/`

## Troubleshooting

### Common Issues

1. **Tests failing on specific browsers**
   - Check Playwright browser compatibility
   - Review test screenshots in artifacts

2. **Deployment failures**
   - Verify GitHub Pages is enabled
   - Check repository permissions
   - Review workflow logs

3. **Preview not updating**
   - Ensure PR has changes
   - Check workflow permissions
   - Verify gh-pages branch exists

### Local Testing
```bash
# Test the full pipeline locally
npm run build-nolog
npm run preview
npm run test:prod
```

This workflow provides a robust, automated deployment pipeline with comprehensive testing and preview capabilities for collaborative development.