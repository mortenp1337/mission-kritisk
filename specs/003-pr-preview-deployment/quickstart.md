# Quickstart: PR Preview Deployment System

**Audience**: Developers working on Mission Kritisk  
**Time to Read**: 5 minutes  
**Prerequisites**: Git, GitHub account with repo access

## Overview

Mission Kritisk uses automatic preview deployments for pull requests. When you open a PR, GitHub Actions automatically deploys your changes to a preview URL where reviewers can test the game without checking out your branch locally.

---

## How It Works

### Production Deployment (Main Branch)

```
Push to main → Build game → Deploy to root → https://mortenp1337.github.io/mission-kritisk/
```

**What gets deployed**: Only main branch content at the root URL

---

### Preview Deployment (Pull Requests)

```
Open/Update PR → Build main + PR → Combine → Deploy both
```

**What gets deployed**:
- **Root URL**: Main branch content (production)
- **Preview URL**: Your PR changes (https://mortenp1337.github.io/mission-kritisk/preview/)

**Important**: Only ONE preview can exist at a time. If someone else opens a PR after you, their preview replaces yours.

---

## For PR Authors

### Opening a Pull Request

1. **Create your branch**:
   ```bash
   git checkout -b my-feature-branch
   # Make changes
   git commit -m "Add new feature"
   git push origin my-feature-branch
   ```

2. **Open PR on GitHub**:
   - Go to repository → Pull Requests → New Pull Request
   - Select your branch
   - Click "Create Pull Request"

3. **Wait for deployment**:
   - GitHub Actions automatically starts building
   - Watch the "deploy-pr-preview" check in your PR
   - Deployment typically completes in ~3-5 minutes

4. **Access your preview**:
   - Once deployment succeeds, visit: `https://mortenp1337.github.io/mission-kritisk/preview/`
   - Test your changes in the live environment
   - Share URL with reviewers

### Updating Your PR

1. **Push new commits**:
   ```bash
   git add .
   git commit -m "Address review feedback"
   git push origin my-feature-branch
   ```

2. **Automatic redeployment**:
   - GitHub Actions automatically cancels any in-progress deployment
   - Builds and deploys your latest changes
   - Same preview URL updates with new content
   - No manual action needed

### After PR is Merged

1. **Main branch deployment**:
   - Merging triggers production deployment
   - Your changes go live at the root URL
   - Preview directory is removed automatically

2. **Cleanup**:
   - Delete your feature branch (GitHub offers this automatically)
   - Preview URL returns 404 (expected - production only now)

---

## For Reviewers

### Testing a PR

1. **Check PR page**:
   - Look for "deploy-pr-preview" check status
   - ✅ Green check = deployment successful
   - ⏳ Orange circle = deployment in progress (wait)
   - ❌ Red X = deployment failed (author needs to fix)

2. **Access preview**:
   - Visit: `https://mortenp1337.github.io/mission-kritisk/preview/`
   - Test the game functionality
   - Verify visual changes
   - Check Danish text correctness

3. **Provide feedback**:
   - Leave PR comments with findings
   - Approve or request changes
   - No need to check out branch locally (unless debugging)

### What to Test

**Functional Testing**:
- Game loads without errors
- Scene transitions work (Boot → Preloader → MainMenu → Game → GameOver)
- New features behave as expected
- Controls are responsive

**Visual Testing**:
- UI elements render correctly at 1024x768 resolution
- Assets load properly (no broken images)
- Text is in Danish and grammatically correct
- Animations and effects work

**Cross-Browser** (if critical change):
- Test in Chrome, Firefox, Safari
- Report browser-specific issues

---

## For Manual Deployments

### Deploying Without a PR

**Use Case**: Testing a branch for a demo or experiment without opening a PR

**Steps**:
1. Go to GitHub Actions → deploy-pr-preview workflow
2. Click "Run workflow"
3. Select your branch from dropdown
4. Click "Run workflow"
5. Wait for deployment to complete
6. Visit preview URL

**Branch Detection**:
- If you select `main` branch → production-only deployment (replaces preview)
- If you select any other branch → preview deployment (main + preview)

---

## Troubleshooting

### Preview Deployment Failed

**Symptoms**: Red X on PR check, workflow shows errors

**Common Causes**:
1. **Build errors**: TypeScript or Vite compilation failed
   - Check workflow logs for build errors
   - Fix errors in your branch and push

2. **Test failures**: Playwright tests failed
   - Run tests locally: `npm run test`
   - Fix failing tests and push

3. **Size limit exceeded**: Artifact >1GB
   - Check dist/ folder size
   - Remove unnecessary assets
   - Optimize images/bundles

**Fix Process**:
```bash
# Fix the issue locally
git add .
git commit -m "Fix deployment issue"
git push origin my-feature-branch
# Workflow automatically retries
```

---

### Preview URL Returns 404

**Possible Reasons**:

1. **Deployment still in progress**:
   - Wait for "deploy-pr-preview" check to complete
   - Refresh after a few minutes

2. **Different PR deployed after yours**:
   - Only one preview exists at a time
   - Your preview was replaced
   - Trigger a manual deployment to restore your preview

3. **Main branch deployed**:
   - Main deployment removes preview directory
   - Your PR preview no longer active
   - Trigger a manual deployment to restore

**Resolution**:
- Manually trigger your PR's deployment via Actions UI
- Or: push a new commit to your PR branch

---

### "Using Cached Main Build" Warning

**What it means**: Main branch build failed, but preview deployment continued using a previous successful main build.

**Is it a problem?**: 
- ⚠️ Yellow warning (not an error)
- Your preview is still valid
- Production content might be slightly outdated
- Check main branch status

**Should you do anything?**:
- If your changes don't depend on recent main updates: No action needed
- If you need latest main: Wait for main to be fixed, then redeploy

---

### Preview Shows Old Content

**Symptoms**: Preview doesn't reflect your latest commit

**Cause**: Browser caching

**Fix**:
```
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Or: Clear browser cache for the site
3. Or: Open in incognito/private window
```

---

## FAQ

**Q: Can multiple PRs have previews at the same time?**  
A: No, only one preview can exist. The most recent deployment wins.

**Q: How long does preview deployment take?**  
A: Typically 3-5 minutes from pushing a commit.

**Q: Do I need to manually trigger deployments?**  
A: No, opening/updating a PR automatically triggers deployment.

**Q: What happens to preview when PR is merged?**  
A: Main deployment automatically removes preview directory.

**Q: Can I test my changes before opening a PR?**  
A: Yes, use workflow_dispatch to manually deploy your branch.

**Q: Does preview deployment affect production?**  
A: No, production content remains unchanged until PR is merged to main.

**Q: What if main branch is broken?**  
A: Preview deployment uses cached main build and shows a warning. Your preview still works.

**Q: How do I share my preview with non-technical stakeholders?**  
A: Share the preview URL: `https://mortenp1337.github.io/mission-kritisk/preview/`  
(Currently manual sharing - automatic PR comments may be added later)

**Q: Does this work for branches without PRs?**  
A: Yes, use workflow_dispatch to manually deploy any branch.

**Q: What if deployment fails with permissions error?**  
A: Contact repository admin - GitHub Pages permissions may need adjustment.

---

## Best Practices

### For PR Authors

✅ **Wait for deployment before requesting review**: Ensure preview is accessible  
✅ **Test your preview first**: Catch obvious issues before reviewers do  
✅ **Update PR description with test instructions**: Help reviewers know what to test  
✅ **Fix build failures promptly**: Don't leave PR in failed state  
✅ **Keep commits focused**: Makes review and testing easier

### For Reviewers

✅ **Test preview before approving**: Don't rely solely on code review  
✅ **Test key user flows**: Scene transitions, new features, critical paths  
✅ **Verify bilingual compliance**: Check for English code/Danish UI text  
✅ **Report issues clearly**: Link to preview, describe steps to reproduce  
✅ **Approve promptly**: Don't block PRs if preview works correctly

---

## Related Resources

- **Specification**: [spec.md](./spec.md) - Full feature requirements
- **Implementation Plan**: [plan.md](./plan.md) - Technical design
- **Workflow Contracts**: [contracts/](./contracts/) - Detailed workflow specifications
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project governance
- **Copilot Instructions**: [.github/copilot-instructions.md](../../.github/copilot-instructions.md) - Development patterns

---

## Getting Help

**Workflow Issues**:
- Check workflow logs in GitHub Actions tab
- Look for error messages in failed steps
- Search GitHub Issues for similar problems

**Game Issues**:
- Run Playwright tests locally: `npm run test`
- Check browser console for JavaScript errors
- Verify Danish text in `src/game/data/danishText.ts`

**Questions**:
- Ask in PR comments
- Post in repository Discussions
- Check project README for contact info
