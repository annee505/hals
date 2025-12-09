---
description: Deploy HALS Platform to production
---

# HALS Platform Deployment Guide

This workflow will guide you through deploying the HALS Platform to production. The project is located at:
`c:\Users\Anna\Downloads\hals-platform-main\.gemini\antigravity\scratch\hals_platform`

## Prerequisites

Before deploying, ensure you have:
- A GitHub account (for all deployment options)
- Node.js and npm installed
- Git installed

## Option 1: Deploy to Vercel (Recommended - Fastest & Easiest)

Vercel is optimized for Vite/React applications and provides automatic deployments.

### Step 1: Install Vercel CLI

```powershell
cd "c:\Users\Anna\Downloads\hals-platform-main\.gemini\antigravity\scratch\hals_platform"
npm install -g vercel
```

### Step 2: Build the project

```powershell
npm run build
```

### Step 3: Deploy to Vercel

```powershell
vercel
```

Follow the interactive prompts:
- "Set up and deploy?" → Yes
- "Which scope?" → Select your account
- "Link to existing project?" → No
- "What's your project's name?" → hals-platform (or your preferred name)
- "In which directory is your code located?" → ./
- Vercel will auto-detect the framework settings

### Step 4: Deploy to Production

```powershell
vercel --prod
```

Your app will be live at: `https://your-project-name.vercel.app`

### Continuous Deployment (Optional)

To enable automatic deployments on every git push:

1. Create a GitHub repository for your project
2. Push your code to GitHub:
```powershell
cd "c:\Users\Anna\Downloads\hals-platform-main\.gemini\antigravity\scratch\hals_platform"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/hals-platform.git
git push -u origin main
```
3. Go to [vercel.com](https://vercel.com)
4. Click "New Project"
5. Import your GitHub repository
6. Vercel will auto-configure everything based on your `vercel.json`
7. Click "Deploy"

---

## Option 2: Deploy to Netlify (Alternative)

Netlify is another excellent option for static sites with great features like form handling and serverless functions.

### Step 1: Install Netlify CLI

```powershell
cd "c:\Users\Anna\Downloads\hals-platform-main\.gemini\antigravity\scratch\hals_platform"
npm install -g netlify-cli
```

### Step 2: Build the project

```powershell
npm run build
```

### Step 3: Deploy to Netlify

```powershell
netlify deploy
```

Follow the prompts:
- Authorize with your Netlify account
- "Create & configure a new site" → Yes
- "Team" → Select your team
- "Site name" → hals-platform (or your preferred name)
- "Publish directory" → dist

### Step 4: Deploy to Production

```powershell
netlify deploy --prod
```

Your app will be live at: `https://hals-platform.netlify.app`

### Continuous Deployment with Netlify (Optional)

1. Create a GitHub repository (same steps as Vercel above)
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add redirect rule by creating `public/_redirects` file (or `netlify.toml`):
   ```
   /*    /index.html   200
   ```
7. Click "Deploy site"

---

## Option 3: Deploy to GitHub Pages (Free Static Hosting)

GitHub Pages is free and great for open-source projects.

### Step 1: Install gh-pages package

```powershell
cd "c:\Users\Anna\Downloads\hals-platform-main\.gemini\antigravity\scratch\hals_platform"
npm install --save-dev gh-pages
```

### Step 2: Update vite.config.js

Add the base URL for your GitHub Pages site. If your repository is named `hals-platform` and your username is `your-username`, add:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/hals-platform/'
})
```

### Step 3: Add deployment scripts to package.json

Add these scripts to your package.json:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

### Step 4: Create GitHub repository and push code

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/hals-platform.git
git push -u origin main
```

### Step 5: Deploy to GitHub Pages

```powershell
npm run deploy
```

### Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Under "Source", select the `gh-pages` branch
4. Click Save

Your app will be live at: `https://your-username.github.io/hals-platform/`

---

## Environment Variables & Supabase Configuration

If your app uses Supabase or other environment variables:

### For Vercel:
1. Go to your project dashboard on Vercel
2. Navigate to Settings → Environment Variables
3. Add your variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### For Netlify:
1. Go to your site dashboard on Netlify
2. Navigate to Site settings → Environment variables
3. Add your variables

### For GitHub Pages:
Create a `.env.production` file in your project root:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Never commit API keys to public repositories. Use GitHub Secrets for sensitive data.

---

## Custom Domain Setup

All three platforms support custom domains:

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify:
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records as instructed

### GitHub Pages:
1. Go to repository Settings → Pages
2. Enter your custom domain
3. Add a CNAME record pointing to `your-username.github.io`

---

## Troubleshooting

### Build fails:
```powershell
# Clear cache and reinstall dependencies
rm -r node_modules
rm package-lock.json
npm install
npm run build
```

### Routes not working (404 errors):
- Ensure your deployment platform has proper SPA redirect rules
- Vercel: Check `vercel.json` has rewrites configured
- Netlify: Add `_redirects` file or netlify.toml
- GitHub Pages: May need to use HashRouter instead of BrowserRouter

### Environment variables not working:
- Make sure variables are prefixed with `VITE_`
- Restart dev server after adding variables
- For production, add them in your deployment platform's dashboard

---

## Next Steps After Deployment

1. **Test your deployed app** thoroughly
2. **Set up monitoring** (Vercel Analytics, Netlify Analytics, or Google Analytics)
3. **Configure CI/CD** for automatic deployments on git push
4. **Add a custom domain** for a professional look
5. **Set up SSL certificate** (automatic on all platforms)
6. **Monitor performance** and optimize as needed

---

## Quick Reference Commands

### Vercel:
```powershell
vercel                 # Deploy to preview
vercel --prod         # Deploy to production
vercel logs           # View logs
```

### Netlify:
```powershell
netlify deploy        # Deploy to preview
netlify deploy --prod # Deploy to production
netlify open          # Open site dashboard
```

### GitHub Pages:
```powershell
npm run deploy        # Build and deploy
```
