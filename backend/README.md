# Loan Application Backend API

Python FastAPI backend for the Loan Application Management System. Provides REST API endpoints for managing loan applications, authentication, and admin functions.

## Features

- **Applications Management**: Retrieve and manage loan applications from Google Sheets
- **Admin Functions**: Approve/reject applications, add notes and comments
- **Authentication**: Admin user authentication with Supabase
- **Export**: Export application data to CSV/Excel
- **Dashboard**: Summary statistics and analytics
- **Google Sheets Integration**: Real-time data synchronization
- **Image Handling**: Support for multiple application images

## Architecture

Vertical slicing architecture with feature-based organization:

```
app/
├── features/          # Feature modules (vertical slices)
│   ├── applications/  # Core application listing & details
│   ├── admin/        # Admin approval/rejection functions
│   └── auth/         # Authentication
├── core/             # Core configuration and exceptions
├── utils/            # Shared utilities (Google Sheets, Supabase services)
└── main.py           # FastAPI app factory
```

## Requirements

- Python 3.11+
- FastAPI
- Google Sheets API
- Supabase
- PostgreSQL (for Supabase)

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `GOOGLE_SHEETS_ID`: Your Google Sheets ID
- `GOOGLE_CREDENTIALS_PATH`: Path to Google service account JSON
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET_KEY`: Secret key for JWT tokens

### 3. Set Up Supabase

Create the following tables in your Supabase database:

**application_status**
```sql
create table application_status (
  id uuid default uuid_generate_v4() primary key,
  app_id text unique,
  status text default 'pending',
  rejection_reason text,
  admin_notes text,
  status_updated_at timestamp default now(),
  created_at timestamp default now()
);
```

**users**
```sql
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique,
  full_name text,
  is_admin boolean default false,
  created_at timestamp default now()
);
```

**audit_log**
```sql
create table audit_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  action text,
  application_id text,
  details jsonb,
  created_at timestamp default now()
);
```

### 4. Google Sheets Setup

1. Create a Google Cloud project
2. Enable Google Sheets API and Google Drive API
3. Create a service account and download the JSON credentials file
4. Place the JSON file in the `backend/` directory or specify its path in `.env`
5. Share your Google Sheet with the service account email

### 5. Run the Application

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Applications
- `GET /api/v1/applications` - List all applications (with pagination & filters)
- `GET /api/v1/applications/summary` - Get dashboard summary
- `GET /api/v1/applications/{app_id}` - Get application details

### Admin
- `POST /api/v1/admin/applications/{app_id}/approve` - Approve application
- `POST /api/v1/admin/applications/{app_id}/reject` - Reject application
- `PUT /api/v1/admin/applications/{app_id}/notes` - Update admin notes
- `GET /api/v1/admin/applications/export/csv` - Export to CSV

### Auth
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/signup` - Admin signup
- `POST /api/v1/auth/logout` - Admin logout
- `GET /api/v1/auth/me` - Get current user

### Health
- `GET /health` - Health check
- `GET /api/v1/status` - API status

## Testing

```bash
# Run with pytest
pytest

# With coverage
pytest --cov=app
```

## Deployment

### Render.com

The `render.yaml` file is configured for Render deployment:

```bash
# Deploy using Render CLI
render deploy

# Or push to GitHub and connect repository to Render
```

### Docker

```bash
# Build image
docker build -t loan-app-backend .

# Run container
docker run -p 8000:8000 --env-file .env loan-app-backend
```

## Environment Setup for Different Platforms

### Development (localhost)
```
API_HOST=localhost
API_PORT=8000
ENVIRONMENT=development
DEBUG=True
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### Production (Render)
```
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=["https://yourdomain.vercel.app"]
```

## Logging

Logs are output to console. Configure logging level in `app/main.py`:

```python
logging.basicConfig(level=logging.INFO)  # or DEBUG, WARNING, ERROR
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "detail": "Error message",
  "error_code": "OPTIONAL_ERROR_CODE"
}
```

## Security Considerations

1. Use environment variables for all sensitive data
2. Enable HTTPS in production
3. Set strong JWT secret keys
4. Implement rate limiting
5. Use Supabase RLS (Row Level Security) for data protection
6. Regularly rotate service account credentials

## Future Enhancements

- [ ] Email notifications for status changes
- [ ] Bulk application import/export
- [ ] Advanced filtering and search
- [ ] Webhooks for status updates
- [ ] Multi-language support
- [ ] Custom fields support
- [ ] Application workflow automation

## Contributing

Please follow the vertical slicing architecture pattern when adding new features.

## License

MIT License
