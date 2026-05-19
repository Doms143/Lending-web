# Loan Application Management System - Setup Guide

## Complete Setup Instructions

This guide walks through the entire setup process for the Loan Application Management System.

## Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 16 or higher
- **Git**: For version control
- **Google Cloud Account**: For Google Sheets/Drive API access
- **Supabase Account**: Free tier available
- **Text Editor**: VS Code recommended

## Step 1: Project Setup

### Clone or Create the Project

```bash
# Navigate to your working directory
cd your-projects-folder

# If you already have the folder, navigate to it
cd Lending\ page
```

## Step 2: Google Cloud Setup

### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project: "Loan Application Manager"
3. Enable APIs:
   - Search for "Google Sheets API" → Enable
   - Search for "Google Drive API" → Enable

### Create Service Account

1. Go to "Service Accounts" in Google Cloud Console
2. Click "Create Service Account"
3. Fill in details:
   - Service account name: `loan-app-backend`
   - Description: "Backend API for Loan Applications"
4. Grant roles: `Editor`
5. Create a key:
   - Click on the service account
   - Go to "Keys" tab
   - "Create new key" → JSON
   - Save the JSON file as `credentials.json` in the `backend/` folder

### Share Google Sheet with Service Account

1. Copy the email from the JSON credentials file (example: `service-account@project.iam.gserviceaccount.com`)
2. Open your Google Sheet
3. Click "Share"
4. Paste the service account email
5. Grant "Editor" access

## Step 3: Supabase Setup

### Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign up or login
3. Create a new project:
   - Project name: `loan-app`
   - Database password: Create a strong password
   - Region: Choose closest to you

### Create Tables

In Supabase SQL Editor, run:

```sql
-- Application Status Table
create table application_status (
  id uuid default uuid_generate_v4() primary key,
  app_id text unique not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  admin_notes text,
  status_updated_at timestamp default now(),
  created_at timestamp default now()
);

-- Users Table
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  full_name text,
  is_admin boolean default false,
  created_at timestamp default now()
);

-- Audit Log Table
create table audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade,
  action text not null,
  application_id text,
  details jsonb,
  created_at timestamp default now()
);

-- Create indexes for better performance
create index idx_app_status_id on application_status(app_id);
create index idx_app_status_status on application_status(status);
create index idx_users_email on users(email);
create index idx_audit_log_user on audit_log(user_id);
```

### Get Supabase Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL (SUPABASE_URL)
   - Anon Public Key (SUPABASE_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY) - Keep this private!

## Step 4: Backend Setup

### Install Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
# On macOS/Linux:
nano .env
# On Windows (with VS Code):
code .env
```

Fill in the following:

```
GOOGLE_SHEETS_ID=your_google_sheet_id_from_url
GOOGLE_FORM_RESPONSE_SHEET=Form Responses 1
GOOGLE_CREDENTIALS_PATH=./credentials.json

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET_KEY=generate_a_random_string_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

API_HOST=localhost
API_PORT=8000
ENVIRONMENT=development
DEBUG=True

CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### Get Google Sheet ID

1. Open your Google Sheet in browser
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
3. Copy the `SHEET_ID` part

### Run Backend

```bash
# From backend folder
python main.py
```

You should see:
```
INFO:     Started server process [XXXX]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test the API: Visit `http://localhost:8000/health` in your browser

## Step 5: Frontend Setup

### Install Dependencies

```bash
cd frontend

# Install npm packages
npm install
```

### Configure Environment

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local
# Make sure it has:
REACT_APP_API_URL=http://localhost:8000
```

### Run Frontend

```bash
# From frontend folder
npm run dev
```

You should see:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:3000/
```

Open `http://localhost:3000` in your browser

## Step 6: Testing the System

### Access the Dashboard

1. Open http://localhost:3000
2. You should see the Login page
3. Enter test credentials (any email/password - uses mock auth)
4. Click "Sign In"

### Verify Data Loading

1. You should see the Dashboard
2. If your Google Sheet has data, you should see:
   - Total Applications count
   - Pending/Approved/Rejected counts
3. Click "Applications" in the navigation
4. You should see a table with your applications

### Test Features

- **Search**: Type in the search box
- **Filter**: Select a status to filter
- **View Details**: Click "View Details" on an application
- **View Images**: Click "View Gallery" to see submitted images
- **Approve/Reject**: Test approval or rejection buttons
- **Add Notes**: Add admin notes and save
- **Export**: Export applications to CSV

## Deployment

### Deploy Backend (Render.com)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Create a new "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables from `.env`
7. Deploy

### Deploy Frontend (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Create a new project
4. Import your GitHub repository
5. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Add environment variables:
   - `REACT_APP_API_URL=https://your-render-backend.onrender.com`
7. Deploy

## Troubleshooting

### Backend won't start

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
source venv/bin/activate  # Activate virtual environment
pip install -r requirements.txt  # Reinstall packages
```

**Problem**: Port 8000 already in use

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux

# Or specify a different port
python main.py --port 8001
```

### Frontend won't start

**Problem**: `npm ERR! No such file or directory`

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem**: API calls fail / 404 errors

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check `.env.local` has correct API URL
3. Check CORS in backend `.env`: `CORS_ORIGINS=["http://localhost:3000"]`

### Google Sheets not connecting

**Problem**: `Google Sheets error` in console

**Solution**:
1. Verify `credentials.json` exists in backend folder
2. Verify service account has access to the Sheet
3. Check `GOOGLE_SHEETS_ID` in `.env`
4. Verify API is enabled in Google Cloud Console

### Supabase not connecting

**Problem**: `Connection error` messages

**Solution**:
1. Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
2. Test connection in Supabase dashboard
3. Verify tables were created correctly
4. Check network connectivity

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| GOOGLE_SHEETS_ID | Your Google Sheet ID | 1a2b3c4d5e6f7g8h9i0j |
| GOOGLE_FORM_RESPONSE_SHEET | Sheet name with form responses | Form Responses 1 |
| GOOGLE_CREDENTIALS_PATH | Path to credentials.json | ./credentials.json |
| SUPABASE_URL | Your Supabase project URL | https://project.supabase.co |
| SUPABASE_KEY | Supabase anon public key | eyJhbGc... |
| JWT_SECRET_KEY | Secret for JWT tokens | random-secret-string |
| API_HOST | API host | 0.0.0.0 |
| API_PORT | API port | 8000 |
| ENVIRONMENT | Environment mode | development or production |

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:8000 |

## Project File Structure

```
lending-page/
├── backend/
│   ├── app/
│   │   ├── core/config.py          # Settings
│   │   ├── features/               # Organized by features
│   │   │   ├── applications/
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   ├── utils/                  # Shared utilities
│   │   └── main.py                 # FastAPI app
│   ├── main.py                     # Entry point
│   ├── requirements.txt            # Python packages
│   ├── credentials.json            # Google credentials (ADD THIS)
│   ├── .env                        # Environment variables (CREATE FROM .env.example)
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── features/               # Organized by features
│   │   ├── components/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.local                  # Environment variables (CREATE FROM .env.example)
│   └── vercel.json
│
└── README.md
```

## Next Steps

1. ✅ Complete all setup steps above
2. ✅ Test the system locally
3. ✅ Deploy backend to Render.com
4. ✅ Deploy frontend to Vercel
5. Create admin users in Supabase database
6. Configure email notifications (optional)
7. Set up monitoring and logging

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Supabase Documentation](https://supabase.com/docs)
- [Render Deployment](https://render.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

## Support

For issues:
1. Check the troubleshooting section above
2. Review backend/README.md for backend-specific issues
3. Review frontend/README.md for frontend-specific issues
4. Check error logs in terminal
5. Review browser DevTools console

Good luck! 🚀
