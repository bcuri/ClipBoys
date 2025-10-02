# ClipBoy Development Guide

## 🎯 **Development Rules**

### **1. One Change = One Deploy**
- Each change gets committed and deployed immediately
- Use clear version numbers (v1.0, v2.0, etc.)
- Always include cache-busting techniques

### **2. Deployment Process**
```bash
# Create deployment script
echo '#!/bin/bash
cd /Users/brunocuri/whop-app
rm -rf .git
git init
git add .
git commit -m "DESCRIPTION: vX.X"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
echo "Deployment complete!"' > deploy.sh

chmod +x deploy.sh && ./deploy.sh
```

**CRITICAL GIT RULE**: Always redo the git repository when making changes:
- `rm -rf .git` - Remove existing git repository
- `git init` - Initialize fresh repository
- `git add .` - Stage all changes
- `git commit -m "DESCRIPTION: vX.X"` - Commit with version
- `git branch -M main` - Set main branch
- `git remote add origin https://github.com/bcuri/ClipBoys.git` - Link to ClipBoys repo
- `git push -u origin main --force` - Force push to GitHub

**Why this is necessary**: The git repository gets corrupted during development, causing merge conflicts and deployment failures. Starting fresh ensures clean deployments.

**Important**: Vercel is connected to the GitHub repository `bcuri/ClipBoys`. Changes must be pushed to GitHub for Vercel to deploy them automatically.

### **3. Cache Busting Strategy**
- Add version comments: `{/* Cache bust: vX.X */}`
- Use inline styles for critical elements: `style={{color: 'red', fontSize: '4rem'}}`
- Force push with `--force` flag
- Add no-cache headers in layout metadata

### **4. Accessibility First**
- Always add `id` and `name` attributes to form fields
- Include `aria-label` for screen readers
- Use unique IDs for different pages

### **5. File Structure**
- `app/page.tsx` - Main landing page
- `app/experiences/[experienceId]/page.tsx` - Whop experience view
- `app/layout.tsx` - Root layout with metadata
- Both pages must be updated simultaneously

## 🚀 **What Fixed the Title Issue**

### **Problem**: Title wasn't showing despite multiple deployments
### **Root Cause**: CSS conflicts with Whop styles + caching issues

### **Solution**:
1. **Inline Styles**: Used `style={{color: 'red', fontSize: '4rem', fontWeight: '900'}}`
2. **Visual Indicators**: Added emojis 🚀 to make it obvious
3. **Force Deployment**: Used `--force` to override cached versions
4. **Cache Busting**: Added version comments and no-cache headers

### **Key Lesson**: When Tailwind classes don't work, use inline styles as fallback

## 🎨 **Current Design Elements**

### **Title Styling**:
- **Size**: `text-5xl md:text-6xl lg:text-7xl xl:text-8xl`
- **Weight**: `font-black` (heaviest)
- **Color**: Gradient `from-fuchsia-400 via-purple-300 to-indigo-300`
- **Fallback**: Inline styles for reliability

### **Layout**:
- **Container**: `max-w-6xl` for wider content
- **Background**: Dark gradient with grid pattern
- **Cards**: `bg-white/5 backdrop-blur-sm` with borders

## 🔧 **Troubleshooting**

### **If Changes Don't Appear**:
1. Check if build succeeds: `pnpm build`
2. Use inline styles as fallback
3. Add visual indicators (emojis, colors)
4. Force deploy with `--force`
5. Wait 2-3 minutes for Vercel deployment
6. Hard refresh browser (Ctrl+Shift+R)

### **Common Issues**:
- **Port 3000 in use**: Kill process with `lsof -i :3000` then `kill -9 <PID>`
- **Git conflicts**: Use `--force` to overwrite
- **CSS conflicts**: Use inline styles
- **Caching**: Add cache-busting comments and headers

## 🎨 Whop Styling Integration Rules (Read This First)

Whop ships global styles via `@whop/react/styles.css` which can affect text color, inputs, and typography. Follow these rules to avoid clashes:

- Import order in `app/globals.css` uses CSS layers. Keep Tailwind theme/base/utilities, then Whop styles, then our custom rules:
  - `@import "tailwindcss/theme.css" layer(theme);`
  - `@import "tailwindcss/preflight.css" layer(base);`
  - `@import "tailwindcss/utilities.css" layer(utilities);`
  - `@import "@whop/react/styles.css" layer(frosted_ui);`

- Gradient text can get hidden because `bg-clip-text text-transparent` may be overridden by upstream rules. For critical headings:
  - Prefer solid color with priority: add `!text-white` on the heading and span.
  - Optional glow for contrast: `drop-shadow-[0_0_18px_rgba(168,85,247,0.35)]`.
  - If using gradient text, wrap in a container with `isolate` and add `!text-transparent` on the span; verify in Whop.

- Form controls must be explicitly styled; Whop can restyle inputs. Always set background, border, and text classes on `select`, `input`, `textarea`.

- When something looks correct locally but not in Whop:
  1) Toggle a plain color fallback (`!text-white`) to confirm a color conflict.
  2) Add `isolate` to the section wrapper to prevent blending/inheritance issues.
  3) Avoid relying on global defaults; set explicit classes for color/size/weight.

- Deployment-safe patterns we use now:
  - Titles: solid `!text-white` + optional glow. No gradient for mission-critical text.
  - Secondary text can use gradients/animations.

## **CRITICAL GIT REPOSITORY RULE**

**ALWAYS REDO THE GIT REPOSITORY WHEN MAKING CHANGES**

The git repository gets corrupted during development, causing:
- Merge conflicts
- "Unrelated histories" errors  
- Push rejections
- Deployment failures

**Solution**: Always start fresh:
```bash
rm -rf .git
git init
git add .
git commit -m "DESCRIPTION: vX.X"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
```

**This is mandatory for every change** - do not try to use existing git repository.

## 📝 **Next Steps for Aesthetic Improvements**

1. **Remove debug styles** (red color, emojis)
2. **Implement proper gradient** with fallback
3. **Add animations** and hover effects
4. **Improve typography** and spacing
5. **Add visual hierarchy** with better contrast
