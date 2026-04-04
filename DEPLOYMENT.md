# OpenGov — Render Deployment Guide

This guide covers deploying OpenGov to Render's free tier.
The app uses **SQLite** (file-based) — no separate database service is needed.

---

## Prerequisites

- Your code pushed to GitHub (with `.env` and `opengov.db` in `.gitignore`)
- A Render account — https://render.com
- Your environment variable values ready (see README.md — Environment Variables Guide)

---

## Before You Deploy — Security Checklist

> Complete these before pushing anything to GitHub or Render.

- [ ] `.env` is listed in `.gitignore` and has never been committed
- [ ] `opengov.db` is listed in `.gitignore`
- [ ] No API keys, passwords, or secrets exist anywhere in your source code
- [ ] You have a fresh Gemini API key from a new Google Cloud project
- [ ] You have a valid Gmail App Password (not your regular Gmail password)
- [ ] `SECRET_KEY` in `.env` is a randomly generated 64-character hex string

To verify nothing sensitive is tracked:
```bash
git status
git log --all --full-history -- backend/.env
```

If `.env` appears in git history, remove it:
```bash
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
git push
```

---

## Step 1: Push Code to GitHub

```bash
git add backend/ frontend/ README.md DEPLOYMENT.md .gitignore
git commit -m "Prepare for deployment"
git push origin main
```

> **Do NOT use `git add .`** — it may accidentally stage sensitive files if `.gitignore` is misconfigured.

---

## Step 2: Deploy the Backend

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---|---|
| Name | `opengov-backend` |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Plan | Free |

5. Under **Environment Variables**, add the following — enter values manually, never paste from a file:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key from https://aistudio.google.com/app/apikey |
| `SMTP_SERVER` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | Your Gmail address |
| `SMTP_PASSWORD` | Your 16-character Gmail App Password |
| `FROM_EMAIL` | Your Gmail address |
| `DATABASE_URL` | `sqlite:///./opengov.db` |
| `SECRET_KEY` | Run `python -c "import secrets; print(secrets.token_hex(32))"` and paste output |
| `FRONTEND_URL` | `https://opengov-frontend.onrender.com` (update after Step 3) |
| `PYTHON_VERSION` | `3.10.0` |

> **Never paste your actual `.env` file contents into chat, documentation, or public issues.**

6. Click **Create Web Service**
7. Wait for the build to complete — check the **Logs** tab for errors
8. **Save your backend URL** (e.g., `https://opengovnew.onrender.com`)

---

## Step 3: Seed the Database on First Deploy

Since the app uses SQLite, the database file needs to be initialized on first run.

In the Render backend service dashboard:
1. Go to **Shell** tab (or add to Build Command temporarily)
2. Run:
```bash
python create_super_admin.py
```

This creates the super admin account. You only need to do this once.

---

## Step 4: Deploy the Frontend

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| Name | `opengov-frontend` |
| Branch | `main` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

4. Add Environment Variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | Your backend URL from Step 2 (e.g., `https://opengovnew.onrender.com`) |

5. Click **Create Static Site**
6. **Save your frontend URL** (e.g., `https://opengov-frontend.onrender.com`)

> The `public/_redirects` file is already included in the repo and handles SPA client-side routing on Render automatically.

---

## Step 5: Update Backend CORS

1. Go to your backend service on Render
2. Update the `FRONTEND_URL` environment variable to your actual frontend URL:
   ```
   FRONTEND_URL=https://opengov-frontend.onrender.com
   ```
3. Click **Save Changes** — this triggers a redeploy

---

## Step 6: Verify the Deployment

1. Open your frontend URL in a browser
2. Log in with the super admin account:

| Field | Value |
|---|---|
| Email | `collins@opengov.ke` |
| Password | *(set during `create_super_admin.py`)* |

3. Test the following:
   - [ ] Login and dashboard load
   - [ ] Budget data displays correctly
   - [ ] AI Assistant responds
   - [ ] Submit feedback and check email notification
   - [ ] Forum post creation, edit, and delete
   - [ ] Admin panel accessible with admin account
   - [ ] Privacy Policy and Terms pages load at `/privacy-policy` and `/terms`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini AI key for moderation and insights |
| `SMTP_SERVER` | Yes | Gmail SMTP server (`smtp.gmail.com`) |
| `SMTP_PORT` | Yes | SMTP port (`587`) |
| `SMTP_USERNAME` | Yes | Your Gmail address |
| `SMTP_PASSWORD` | Yes | Gmail App Password (16 characters, no spaces) |
| `FROM_EMAIL` | Yes | Sender email address |
| `DATABASE_URL` | Yes | `sqlite:///./opengov.db` |
| `SECRET_KEY` | Yes | Random 64-char hex string for JWT signing |
| `FRONTEND_URL` | Yes | Frontend URL for CORS whitelist |
| `PYTHON_VERSION` | Recommended | Pin to `3.10.0` for consistency |

---

## Troubleshooting

**Build fails on Render**
- Check the Logs tab for the exact error
- Verify `requirements.txt` includes all dependencies
- Ensure `PYTHON_VERSION` is set to `3.10.0`

**Gemini AI returns fallback messages**
- Check `GEMINI_API_KEY` is set correctly in Render environment variables
- If logs show `429 RESOURCE_EXHAUSTED` or `limit: 0`, the free quota is exhausted
- Create a new Google Cloud project and generate a fresh API key

**Emails not sending**
- Verify `SMTP_PASSWORD` is a Gmail App Password, not your regular password
- Confirm 2-Step Verification is enabled on the Gmail account
- App passwords are invalidated if 2FA is turned off — regenerate if needed

**CORS errors in browser**
- Verify `FRONTEND_URL` in backend environment variables matches your exact frontend URL
- Ensure no trailing slash in the URL

**Forum Edit/Delete buttons not showing**
- Clear browser localStorage and log in again
- Ensure you are viewing your own post or reply

**Cold start delay (~30 seconds)**
- This is expected on Render's free tier after 15 minutes of inactivity
- The app retries AI requests automatically during slow starts

**SPA routes return 404 on refresh**
- Verify `frontend/public/_redirects` exists and contains: `/* /index.html 200`
- This file is already included in the repository

---

## Free Tier Limitations

| Limitation | Detail |
|---|---|
| Spin down | Services sleep after 15 min of inactivity |
| Cold start | ~30 seconds on first request after sleep |
| Hours | 750 free hours/month per service |
| SQLite persistence | File resets on each redeploy — use with caution in production |
| No automatic backups | Upgrade to paid plan for database backups |

---

## Upgrading for Production

If deploying beyond a demo/capstone context:

- Upgrade to **Render Starter ($7/month)** — eliminates cold starts
- Migrate from SQLite to **PostgreSQL** for persistent, backed-up data
- Set up a **custom domain** via Settings → Custom Domain
- Enable **Render health checks** to monitor uptime
- Rotate all secrets (Gemini key, SMTP password, SECRET_KEY) before go-live

---

## Monitoring

- **Logs:** Service → Logs tab (real-time and historical)
- **Metrics:** Service → Metrics tab (CPU, memory, response times)
- **Alerts:** Service → Settings → Notifications (email on deploy failure)
