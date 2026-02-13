# 🚀 Frontend Deployment Guide

## Overview
This guide will help you deploy the Invoice Governance System frontend to production.

## Prerequisites
- GitHub account
- Vercel or Netlify account (free tier is sufficient)
- Backend API URL (from Render deployment)

## Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin master
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository: `ZahranTech/Zahran-System`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `nvoice System/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.onrender.com`)
7. Click "Deploy"

#### Step 3: Access Your App
- Vercel will provide a URL like: `https://your-app.vercel.app`
- You can add a custom domain later

---

### Option 2: Netlify

#### Step 1: Push to GitHub (same as above)

#### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select your repository
5. Configure:
   - **Base directory**: `nvoice System/frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `nvoice System/frontend/dist`
6. Click "Show advanced" → "New variable":
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL
7. Click "Deploy site"

---

## Environment Variables

The frontend requires the following environment variable:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://zahran-backend.onrender.com` |

⚠️ **Important**: Make sure your backend URL does NOT end with a slash.

---

## Post-Deployment Checklist

- [ ] Frontend is accessible via the deployment URL
- [ ] Login functionality works
- [ ] API calls are reaching the backend
- [ ] CORS is properly configured on the backend
- [ ] Environment variables are set correctly
- [ ] Mobile sync QR code displays the correct URL

---

## Troubleshooting

### Issue: "Network Error" or API calls failing
**Solution**: 
1. Check that `VITE_API_URL` is set correctly in Vercel/Netlify
2. Verify backend CORS settings allow your frontend domain
3. Check backend logs for errors

### Issue: 404 on page refresh
**Solution**: This is handled by `vercel.json` or `netlify.toml` redirects. Make sure these files are committed.

### Issue: Environment variables not working
**Solution**: 
1. In Vercel/Netlify, go to Settings → Environment Variables
2. Add `VITE_API_URL` with your backend URL
3. Redeploy the application

---

## Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify:
1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS records

---

## Continuous Deployment

Both Vercel and Netlify automatically redeploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin master
# Deployment happens automatically!
```

---

## Backend Configuration

Make sure your backend (on Render) has these CORS settings in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'https://your-app.vercel.app',
    'https://your-custom-domain.com',
]
```

Or use:
```python
CORS_ALLOW_ALL_ORIGINS = True  # For development/testing only
```

---

## Support

For issues, check:
- Vercel/Netlify deployment logs
- Browser console for errors
- Backend logs on Render

---

**Last Updated**: February 2026
