# 🚀 Deployment Guide - PR Analysis UI

## ✅ Setup Complete!

All deployment files have been configured. Follow these steps to deploy to GitHub Pages.

---

## 📋 Pre-Deployment Checklist

### Files Created/Updated:

- ✅ `.github/workflows/deploy.yml` - GitHub Actions workflow
- ✅ `src/404.html` - SPA routing handler
- ✅ `src/index.html` - Updated with SPA redirect script
- ✅ `angular.json` - Production build configuration
- ✅ `package.json` - Deployment scripts
- ✅ `.gitignore` - Security (API keys excluded)
- ✅ `README.md` - Deployment instructions

### Configuration:

- ✅ Repository name: `ai-code-reviewer`
- ✅ Base href: `/ai-code-reviewer/`
- ✅ Branch: `master`
- ✅ Production build: Working ✅

---

## 🚀 Deployment Steps

### Step 1: Commit All Changes

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "feat: Add GitHub Pages deployment configuration"
```

### Step 2: Push to GitHub

```bash
# Push to master branch
git push origin master
```

### Step 3: Enable GitHub Pages

1. Go to your repository: `https://github.com/davidevnoir/ai-code-reviewer`
2. Click **Settings** tab
3. Click **Pages** in left sidebar
4. Under "Build and deployment":
   - **Source**: Select **GitHub Actions**
5. Click **Save**

### Step 4: Monitor Deployment

1. Go to **Actions** tab in your repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Wait 2-3 minutes for completion
4. Green checkmark = Success! ✅

### Step 5: Visit Your Site

Once deployment completes:

🌐 **Your live site:** https://davidevnoir.github.io/ai-code-reviewer/

---

## 🔄 Future Deployments

After initial setup, deployment is automatic:

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push origin master

# Automatic deployment will trigger!
```

---

## 📦 Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Option 1: Using npm script
npm run deploy

# Option 2: Build and deploy separately
npm run build:prod
npx angular-cli-ghpages --dir=dist/pr-analysis-ui/browser
```

---

## 🧪 Test Locally Before Deploying

Always test the production build locally:

```bash
# Build for production
npm run build:prod

# Serve the production build (install serve if needed)
npx serve dist/pr-analysis-ui/browser

# Open http://localhost:3000
```

---

## ⚙️ Configuration Details

### GitHub Actions Workflow

Location: `.github/workflows/deploy.yml`

**Triggers:**

- Push to `master` branch
- Manual workflow dispatch

**Steps:**

1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Build production bundle
5. Upload to GitHub Pages
6. Deploy

**Permissions:**

- `contents: read`
- `pages: write`
- `id-token: write`

### Build Configuration

**Base URL:** `/ai-code-reviewer/`  
**Output:** `dist/pr-analysis-ui/browser/`  
**Assets:** Includes `404.html` for SPA routing

### SPA Routing

The app handles client-side routing on GitHub Pages using:

1. `404.html` - Redirects to index with session storage
2. `index.html` - Restores route from session storage

This ensures direct links to routes work correctly.

---

## 🐛 Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**

1. Go to Actions tab
2. Click on failed workflow
3. Read error messages

**Common issues:**

- Node version mismatch (should be 20)
- Build errors (test with `npm run build:prod`)
- Permissions not set (enable in Settings → Pages)

### 404 Errors on Routes

**Symptoms:** Direct links to routes return 404

**Solution:**

- Verify `404.html` exists in `src/` folder
- Check `angular.json` includes 404.html in assets
- Rebuild: `npm run build:prod`

### Blank Page After Deployment

**Check:**

1. Base href is correct in `angular.json`
2. Console for JavaScript errors
3. Network tab shows assets loading correctly

**Fix:**

```bash
# Ensure base href matches repo name
# In angular.json:
"baseHref": "/ai-code-reviewer/"
```

### Styles Not Loading

**Check:**

1. Material theme is included in `styles` array
2. SCSS files compile without errors
3. Check browser DevTools console

---

## 🔐 Security Notes

### ⚠️ NEVER Commit:

- `.env.local` - Environment variables
- API keys or secrets
- Personal tokens

### ✅ Users Configure Their Own:

- Azure OpenAI credentials (via Settings UI)
- GitHub tokens (via Settings UI)
- All secrets stored in browser localStorage only

### GitHub Secrets (if needed later):

If you want to add server-side features:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secrets (never in code!)

---

## 📊 Deployment Status

After first deployment, add this badge to your README:

```markdown
[![Deploy Status](https://github.com/davidevnoir/ai-code-reviewer/actions/workflows/deploy.yml/badge.svg)](https://github.com/davidevnoir/ai-code-reviewer/actions/workflows/deploy.yml)
```

---

## 🎯 Deployment Checklist

Before you deploy:

- [x] All code committed
- [x] Build passes locally (`npm run build:prod`)
- [x] No sensitive data in code
- [x] README updated
- [x] `.gitignore` configured
- [x] GitHub Actions workflow created
- [x] Base href set correctly

Ready to deploy? Run:

```bash
git push origin master
```

---

## 🌐 Your Live URLs

**Production Site:**  
https://davidevnoir.github.io/ai-code-reviewer/

**GitHub Repository:**  
https://github.com/davidevnoir/ai-code-reviewer

**Actions/Deployments:**  
https://github.com/davidevnoir/ai-code-reviewer/actions

---

## 📈 Next Steps After Deployment

1. ✅ Visit your live site
2. ✅ Test the Settings dialog
3. ✅ Configure your API keys
4. ✅ Try analyzing a PR
5. ✅ Share the link!

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ Green checkmark in Actions tab  
✅ Site loads at `https://davidevnoir.github.io/ai-code-reviewer/`  
✅ No 404 errors on page routes  
✅ Settings dialog opens  
✅ Can analyze a PR

---

**Made with ❤️ using Angular 21**

Ready to deploy? Push to GitHub now! 🚀
