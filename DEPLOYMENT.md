# Render Deployment Guide for OpenGov

## Prerequisites
- GitHub account with your code pushed
- Render account (sign up at https://render.com)

## Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `opengov-db`
   - Database: `opengov`
   - User: `opengov`
   - Region: Choose closest to your users
   - Plan: Free
4. Click "Create Database"
5. **Save the Internal Database URL** (you'll need this)

## Step 3: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `opengov-backend`
   - Region: Same as database
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt && python create_super_admin.py`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free

4. Add Environment Variables:
   ```
   GEMINI_API_KEY=AIzaSyC80C9AssOUR2-XCGEaM9DSYTJb6Uiqr0U
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=cjotieno04@gmail.com
   SMTP_PASSWORD=zjbcpvebpqajooqv
   FROM_EMAIL=cjotieno04@gmail.com
   DATABASE_URL=[Paste Internal Database URL from Step 2]
   SECRET_KEY=[Generate random string or let Render auto-generate]
   PYTHON_VERSION=3.11.0
   ```

5. Click "Create Web Service"
6. **Save the backend URL** (e.g., https://opengov-backend.onrender.com)

## Step 4: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - Name: `opengov-frontend`
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=[Your backend URL from Step 3]
   ```
   Example: `VITE_API_URL=https://opengov-backend.onrender.com`

5. Click "Create Static Site"

## Step 5: Update Backend CORS

1. Go to your backend service on Render
2. Add environment variable:
   ```
   FRONTEND_URL=[Your frontend URL]
   ```
   Example: `FRONTEND_URL=https://opengov-frontend.onrender.com`

3. Click "Save Changes" (this will redeploy)

## Step 6: Access Your Application

- Frontend: https://opengov-frontend.onrender.com
- Backend API: https://opengov-backend.onrender.com/docs
- Default Login:
  - Email: superadmin@opengov.ke
  - Password: SuperAdmin@2024

## Important Notes

1. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - First request after inactivity takes ~30 seconds
   - 750 hours/month free (enough for one service)

2. **Database Backups:**
   - Free tier: No automatic backups
   - Upgrade to paid plan for backups

3. **Custom Domain (Optional):**
   - Go to Settings → Custom Domain
   - Add your domain and configure DNS

4. **Environment Variables Security:**
   - Never commit .env to GitHub
   - Use Render's environment variables dashboard

## Troubleshooting

**Build fails:**
- Check build logs in Render dashboard
- Verify requirements.txt has all dependencies

**Database connection error:**
- Verify DATABASE_URL is correct
- Check database is in same region as backend

**CORS errors:**
- Verify FRONTEND_URL is set correctly
- Check frontend VITE_API_URL matches backend URL

**Email not working:**
- Verify Gmail app password is correct
- Check SMTP settings

## Monitoring

- View logs: Service → Logs tab
- Check metrics: Service → Metrics tab
- Set up alerts: Service → Settings → Notifications

## Upgrading to Paid Plan

For production use, consider:
- Starter plan ($7/month) - No spin down
- PostgreSQL Standard ($7/month) - Backups included
