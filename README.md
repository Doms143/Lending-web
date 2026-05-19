# Loan Application Management System

Complete loan application management dashboard built with React (frontend), Python FastAPI (backend), Google Sheets (data), and Supabase (database).

## Project Overview

This system allows admin users to:
- View all loan applications from Google Forms/Sheets
- Review applicant information and submitted images
- Approve or reject applications
- Add notes and comments
- Export data to CSV
- Track application status with timestamps

## Tech Stack

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Variables
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn
- **Data Source**: Google Sheets API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Deployment**: Render.com

### Infrastructure
- **Data Integration**: Google Sheets API, Google Drive API
- **Auth**: Supabase Authentication
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Frontend), Render (Backend)

## Project Structure

```
lending-page/
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── core/                    # Core configuration
│   │   │   ├── config.py            # Settings & environment variables
│   │   │   └── exceptions.py        # Custom exceptions
│   │   ├── features/                # Vertical slicing
│   │   │   ├── applications/        # Application listing
│   │   │   ├── admin/               # Admin actions (approve/reject)
│   │   │   └── auth/                # Authentication
│   │   ├── utils/                   # Shared utilities
│   │   │   ├── google_sheets_service.py
│   │   │   ├── supabase_service.py
│   │   │   └── schemas.py           # Pydantic models
│   │   └── main.py                  # FastAPI app factory
│   ├── main.py                      # Entry point
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Docker container config
│   ├── render.yaml                  # Render.com deployment config
│   ├── .env.example                 # Environment variables template
│   └── README.md                    # Backend documentation
│
└── frontend/                         # React frontend
    ├── src/
    │   ├── features/                # Vertical slicing
    │   │   ├── applications/        # List, detail, gallery
    │   │   ├── admin/               # Dashboard, actions
    │   │   └── auth/                # Login
    │   ├── components/              # Reusable components
    │   ├── utils/                   # API, helpers, utilities
    │   ├── styles/                  # Global styles
    │   ├── App.jsx                  # Main app component
    │   └── main.jsx                 # React entry point
    ├── index.html                   # HTML template
    ├── vite.config.js               # Vite config
    ├── package.json                 # Dependencies
    ├── vercel.json                  # Vercel deployment config
    ├── .env.example                 # Environment variables template
    └── README.md                    # Frontend documentation
```

## Quick Start

### Prerequisites
- Python 3.11+ (for backend)
- Node.js 16+ (for frontend)
- Google Cloud account with Sheets API enabled
- Supabase account

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
python main.py
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Configuration

### Google Sheets Integration

1. Create a Google Cloud project
2. Enable Google Sheets API and Google Drive API
3. Create a service account and download JSON credentials
4. Place `credentials.json` in backend root or specify path in `.env`
5. Share your Google Sheet with the service account email

### Supabase Setup

1. Create a Supabase project
2. Create required tables (see backend README)
3. Get project URL and API keys
4. Add to `.env` file

### Environment Variables

**Backend (.env)**
```
GOOGLE_SHEETS_ID=your_google_sheet_id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
JWT_SECRET_KEY=your_secret_key
```

**Frontend (.env.local)**
```
REACT_APP_API_URL=http://localhost:8000
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Vercel automatically deploys on push

### Backend (Render.com)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

See individual README files for detailed deployment instructions.

## API Endpoints

### Applications
- `GET /api/v1/applications` - List applications with pagination
- `GET /api/v1/applications/{app_id}` - Get application details
- `GET /api/v1/applications/summary` - Get dashboard summary

### Admin
- `POST /api/v1/admin/applications/{app_id}/approve` - Approve application
- `POST /api/v1/admin/applications/{app_id}/reject` - Reject application
- `PUT /api/v1/admin/applications/{app_id}/notes` - Update admin notes
- `GET /api/v1/admin/applications/export/csv` - Export applications

### Auth
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Admin logout
- `GET /api/v1/auth/me` - Get current user

### Health
- `GET /health` - Health check
- `GET /api/v1/status` - API status

## Features

### Admin Dashboard
- View summary statistics (total, pending, approved, rejected)
- Export applications to CSV

### Applications Management
- View all loan applications in a table
- Search by name or email
- Filter by status
- Paginate through results

### Applicant Details
- View comprehensive applicant information
- See all submitted images in a gallery
- Lightbox image viewer
- Zoom and navigate through images

### Admin Actions
- Approve applications with one click
- Reject applications with reasons
- Add notes and comments
- View status history

## Architecture

Both frontend and backend follow **Vertical Slicing Architecture** for better organization:
- Features are self-contained modules
- Each feature has its own components, services, and styles
- Easy to understand, maintain, and extend
- Simple to add new features

## Development

### Running Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

### Code Style

- Python: Follow PEP 8
- JavaScript: Use modern ES6+
- CSS: Use CSS custom properties for consistency
- Components: Named exports, self-descriptive names

### Testing

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend
npm test
```

## Security Considerations

- All sensitive data stored in environment variables
- JWT tokens for authentication
- CORS properly configured
- HTTPS recommended for production
- Rate limiting recommended for API
- Input validation on both client and server

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (needs 3.11+)
- Verify environment variables: `cat .env`
- Check port 8000 isn't in use

### Frontend won't load
- Check Node version: `node --version` (needs 16+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check API URL in .env.local

### Google Sheets not syncing
- Verify credentials.json is valid
- Check service account has access to Sheet
- Review API quota limits

### Supabase not connected
- Verify URL and keys are correct
- Check network connectivity
- Review Supabase dashboard for errors

## Performance Optimization

- Frontend code splitting with Vite
- Backend request caching
- Image lazy loading
- Database query optimization
- Pagination for large datasets

## Future Enhancements

- Email notifications for status changes
- Bulk application operations
- Advanced search and filtering
- Mobile app (React Native)
- Webhook support
- Two-factor authentication
- Dark mode
- Multi-language support

## Support

For issues or questions:
1. Check relevant README in backend/ or frontend/
2. Review API documentation
3. Check environment variable configuration
4. Review browser console and server logs

## License

MIT License

## Contributing

Follow the project's architecture patterns:
- Use vertical slicing for new features
- Write self-documenting code
- Update relevant README files
- Test before deploying
