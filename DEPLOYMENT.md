# Deployment Guide

Complete guide to deploy the Loan Application Management System to production.

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Google Sheets and Supabase setup complete
- [ ] Code committed to GitHub
- [ ] No console errors or warnings
- [ ] Database schema verified
- [ ] API endpoints tested
- [ ] Frontend builds without errors

## Backend Deployment (Render.com)

### Step 1: Prepare Backend for Deployment

1. Update backend `.env` for production:
   ```
   ENVIRONMENT=production
   DEBUG=False
   API_HOST=0.0.0.0
   API_PORT=8000
   CORS_ORIGINS=["https://yourdomain.vercel.app"]
   ```

2. Ensure `render.yaml` is in the backend root:
   ```bash
   # From backend folder
   ls render.yaml  # Should exist
   ```

### Step 2: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Sign up or login
3. Click "New +" → "Web Service"
4. Select "Deploy an existing repo" (if using GitHub)
5. Or copy your Git repository URL
6. Configure:
   - **Name**: `loan-app-backend`
   - **Environment**: Python
   - **Region**: Choose closest to you (e.g., Oregon, N. Virginia)
   - **Branch**: main
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or Paid if you need more resources)

7. Add Environment Variables:
   ```
   GOOGLE_SHEETS_ID=your_sheet_id
   GOOGLE_CREDENTIALS_PATH=./credentials.json
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET_KEY=your_secret_key_change_this
   ENVIRONMENT=production
   DEBUG=False
   CORS_ORIGINS=["https://yourdomain.vercel.app"]
   ```

8. Click "Create Web Service"
9. Wait for deployment (2-5 minutes)
10. Your backend URL: `https://your-service-name.onrender.com`

### Step 3: Upload Google Credentials

Since Render doesn't support file uploads, you have two options:

**Option A: Use Base64 Encoding**
1. Encode your `credentials.json`:
   ```bash
   base64 credentials.json > credentials.b64
   ```
2. Add to Render environment:
   ```
   GOOGLE_CREDENTIALS_B64=<paste the contents of credentials.b64>
   ```
3. Modify Python to decode:
   ```python
   import base64
   creds_b64 = os.getenv("GOOGLE_CREDENTIALS_B64")
   if creds_b64:
       creds_json = base64.b64decode(creds_b64).decode('utf-8')
       with open("credentials.json", "w") as f:
           f.write(creds_json)
   ```

**Option B: Use Google Service Account Environment Variable**
1. Add raw JSON as environment variable (works if not too large)

**Option C: Store in Supabase Storage**
1. Upload credentials to Supabase storage
2. Fetch at runtime

### Test Backend Deployment

```bash
# Test health endpoint
curl https://your-service-name.onrender.com/health

# Should return:
# {"status":"healthy","environment":"production"}

# Test applications endpoint
curl https://your-service-name.onrender.com/api/v1/applications
```

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. Update environment variables for production
2. Build and test locally:
   ```bash
   npm run build
   npm run preview
   ```

3. Verify build succeeds without errors
4. Check bundle size (should be <1MB gzipped)

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up or login
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework**: Vite (auto-detected) or React
   - **Root Directory**: `frontend` (if monorepository)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-service-name.onrender.com
   ```

7. Click "Deploy"
8. Wait for deployment (1-3 minutes)
9. Your frontend URL: `https://yourdomain.vercel.app`

### Step 3: Update Backend CORS

Go back to Render and update:
```
CORS_ORIGINS=["https://yourdomain.vercel.app"]
```

### Test Frontend Deployment

1. Visit `https://yourdomain.vercel.app`
2. Login with test credentials
3. Test each feature:
   - View dashboard
   - View applications list
   - Click on an application
   - View images
   - Approve/reject an application
   - Export data

## Custom Domain Setup

### Add Custom Domain to Vercel

1. In Vercel project settings → Domains
2. Add your custom domain (e.g., `app.yourcompany.com`)
3. Follow DNS configuration instructions
4. Update CORS on backend

### Add Custom Domain to Render

1. In Render service settings → Custom Domains
2. Add domain for backend
3. Update frontend API URL

## Monitoring and Maintenance

### Logs

**Render Backend Logs:**
1. Go to your Render service
2. Click "Logs" tab
3. Monitor for errors

**Vercel Frontend Logs:**
1. Go to your Vercel project
2. Click "Deployments"
3. Click a deployment to see build logs
4. Check "Runtime Logs" for errors

### Performance Monitoring

**Backend Performance:**
- Monitor CPU and memory usage on Render dashboard
- Check API response times
- Monitor database queries

**Frontend Performance:**
- Use Vercel Analytics (paid feature)
- Use Google Lighthouse
- Monitor Core Web Vitals

### Security

1. **Keep secrets secure:**
   - Never commit `.env` files
   - Use environment variables
   - Rotate JWT secrets periodically

2. **Database security:**
   - Enable Supabase Row Level Security (RLS)
   - Restrict service role key usage
   - Monitor unauthorized access

3. **API security:**
   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs

## Rollback Procedure

### If Backend Deployment Fails

1. Go to Render dashboard
2. Click your service
3. Go to "Deploys" tab
4. Click the previous successful deployment
5. Click "Rollback" or redeploy from that commit

### If Frontend Deployment Fails

1. Go to Vercel project
2. Click "Deployments"
3. Click the previous successful deployment
4. Click "Promote to Production"

## Scaling

### Backend Scaling (Render)

- **Free tier**: Limited to 0.5 CPU, 512 MB RAM
- **Paid tiers**: Upgrade for better performance
- **Auto-scaling**: Not available on free tier

### Frontend Scaling (Vercel)

- **Automatic**: Vercel handles scaling
- **Edge Network**: Automatically distributed globally
- **Image Optimization**: Built-in

## Database Backups

### Supabase Backups

1. Go to Supabase dashboard
2. Select your project
3. Click "Settings" → "Backups"
4. Configure automatic backups
5. Download backups manually if needed

### Regular Maintenance

```bash
# Weekly: Vacuum database
# In Supabase SQL editor:
VACUUM;
ANALYZE;

# Monitor table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting Deployment

### Backend won't deploy

**Error: "Module not found"**
- Verify `requirements.txt` has all dependencies
- Check Python version compatibility

**Error: "Permission denied"**
- Check file permissions in repository
- Ensure credentials file path is correct

**Error: "Port already in use"**
- Render automatically assigns free port
- No action needed

### Frontend won't deploy

**Error: "Build failed"**
- Check build logs in Vercel
- Verify `npm run build` works locally
- Check for missing dependencies

**Error: "Cannot find module"**
- Run `npm install` locally
- Verify `package.json` has all imports

### Deployment too slow

**Backend:**
- Optimize database queries
- Implement caching
- Upgrade to paid tier

**Frontend:**
- Reduce bundle size
- Enable code splitting
- Optimize images

## Performance Optimization

### Backend Optimization

```python
# Add caching
from functools import lru_cache

@lru_cache(maxsize=100)
def get_applications():
    # This will cache results
    pass

# Add pagination to large queries
# Add database indexes
# Use async/await for I/O operations
```

### Frontend Optimization

```javascript
// Code splitting
const Dashboard = lazy(() => import('./features/admin/Dashboard'))

// Image optimization
<img loading="lazy" />

// Minification (automatic with Vite build)
```

## Monitoring Checklist

- [ ] Daily: Check error logs
- [ ] Weekly: Monitor performance metrics
- [ ] Monthly: Review database size and backups
- [ ] Quarterly: Security audit
- [ ] Yearly: Performance review and optimization

## Production Checklist

- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Database backups automated
- [ ] Error logging configured
- [ ] Monitoring alerts set up
- [ ] Team has access to deployment tools
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Load testing performed

## Useful Commands

```bash
# Backend
# Check Render logs
render logs [service-id]

# Frontend
# Check Vercel logs
vercel logs [project]

# Database
# Connect to Supabase via psql
psql "postgresql://[user]:[password]@[host]/postgres"

# Google Sheets
# Verify API access
python -c "from app.utils import GoogleSheetsService; print('OK')"
```

## Support Contacts

- **Render Support**: support@render.com
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Google Cloud**: support@google.com

## Post-Deployment

1. **Notify users**: Send login credentials
2. **Training**: Brief users on how to use the dashboard
3. **Monitor**: Keep eye on metrics for first week
4. **Feedback**: Collect feedback from users
5. **Iterate**: Make improvements based on feedback

Congratulations! Your system is now live in production! 🎉
