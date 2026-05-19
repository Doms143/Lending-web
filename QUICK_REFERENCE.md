# Quick Reference Guide

Fast reference for common tasks and API endpoints.

## Starting the Development Environment

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate  # Windows
python main.py
# Backend running at http://localhost:8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:3000
```

## API Endpoints Quick Reference

### Applications
```
GET  /api/v1/applications              List all applications
GET  /api/v1/applications?skip=0&limit=20&status=pending  With pagination/filter
GET  /api/v1/applications/summary      Dashboard statistics
GET  /api/v1/applications/{app_id}     Get single application
```

### Admin Actions
```
POST /api/v1/admin/applications/{app_id}/approve     Approve application
POST /api/v1/admin/applications/{app_id}/reject      Reject application
PUT  /api/v1/admin/applications/{app_id}/notes       Update notes
GET  /api/v1/admin/applications/export/csv           Export applications
```

### Authentication
```
POST /api/v1/auth/login                Admin login
POST /api/v1/auth/logout               Admin logout
GET  /api/v1/auth/me                   Current user
```

### Health/Status
```
GET  /health                           Health check
GET  /api/v1/status                    API status
```

## Frontend Components

### Main Components
- **ApplicationsList**: Paginated table of applications
- **ApplicationDetail**: Full application profile
- **ImageGallery**: Lightbox image viewer
- **AdminActions**: Approval/rejection controls
- **Dashboard**: Summary statistics
- **Login**: Admin authentication

### Common Components
- **Badge**: Status badge
- **Button**: Styled button
- **Card**: Container card
- **Modal**: Popup modal
- **Loading**: Spinner loader
- **Alert**: Alert messages

### Import Examples
```javascript
import { ApplicationsList } from './features/applications/ApplicationsList'
import { Badge, Button, Card } from './components/Common'
import { formatCurrency, formatDate } from './utils/helpers'
import { applicationApi } from './utils/apiService'
```

## Backend Modules

### Features (Vertical Slicing)
```
app/features/
├── applications/    Get and list applications
├── admin/          Approve/reject/notes
└── auth/           User authentication
```

### Core
```
app/core/
├── config.py       Environment configuration
└── exceptions.py   Custom exceptions
```

### Utils
```
app/utils/
├── google_sheets_service.py   Google Sheets API
├── supabase_service.py        Supabase database
└── schemas.py                 Pydantic models
```

## Common Tasks

### Adding a New Field to Application

1. **Frontend**: Update `ApplicationDetail.jsx` to display it
2. **Backend**: Update `ApplicationResponse` schema in `schemas.py`
3. **Backend**: Update `_parse_row()` in `ApplicationService`
4. **Database**: Ensure Supabase can store it

### Adding a New Admin Action

1. **Backend**: Add endpoint in `app/features/admin/routes.py`
2. **Backend**: Add service method in Supabase service
3. **Frontend**: Add button in `AdminActions.jsx`
4. **Frontend**: Add API call method in `apiService.js`

### Changing Database Schema

1. Go to Supabase SQL editor
2. Run SQL migration
3. Test locally with `npm run dev` and `python main.py`
4. Verify in Supabase dashboard

### Adding Environment Variable

1. Add to `.env.example` with description
2. Add to actual `.env` file
3. Reference in `app/core/config.py` (backend) or use directly (frontend)
4. Document in README.md

## Debugging

### Backend Debug
```bash
# Verbose logging
PYTHONUNBUFFERED=1 python main.py

# Check logs
tail -f app.log

# Test endpoint
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/applications

# Database test
python -c "from app.utils import SupabaseService; print('OK')"
```

### Frontend Debug
```bash
# Check browser console (F12)
# React DevTools extension
# Check Network tab for API calls
# Check Application tab for localStorage

# Debug specific component
console.log('variable:', variable)
```

### Common Issues

**"Module not found" error**
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
rm -rf node_modules package-lock.json && npm install
```

**"Cannot connect to database"**
- Verify Supabase credentials
- Check internet connection
- Verify tables were created

**"Google Sheets error"**
- Check credentials.json exists
- Verify service account has Sheet access
- Check GOOGLE_SHEETS_ID in .env

## Code Style

### Python (Backend)
```python
# Use type hints
def get_application(app_id: str) -> ApplicationResponse:
    pass

# Use descriptive names
result = service.get_application_detail(app_id)

# Use docstrings
"""Get application details by ID
Args:
    app_id: Application identifier
Returns:
    Application data or raises exception
"""
```

### JavaScript (Frontend)
```javascript
// Use ES6 syntax
const handleClick = () => { }

// Use meaningful variable names
const [isLoading, setIsLoading] = useState(false)

// Add comments for complex logic
// Filter applications by status
const filtered = apps.filter(app => app.status === status)
```

## Testing

### Test Backend Endpoints
```bash
# List applications
curl http://localhost:8000/api/v1/applications

# Get specific application
curl http://localhost:8000/api/v1/applications/test-app-id

# Dashboard summary
curl http://localhost:8000/api/v1/applications/summary
```

### Test Frontend Routes
- `/` → Login
- `/dashboard` → Dashboard
- `/applications` → List
- `/applications/{id}` → Detail

## File Locations Quick Map

```
Backend Settings       → backend/app/core/config.py
Backend Routes         → backend/app/features/*/routes.py
Backend Services       → backend/app/features/*/service.py
Database Connection    → backend/app/utils/supabase_service.py
Google Integration     → backend/app/utils/google_sheets_service.py

Frontend Config        → frontend/.env.local
Frontend API Client    → frontend/src/utils/api.js
Frontend Services      → frontend/src/utils/apiService.js
Frontend Features      → frontend/src/features/*/
Frontend Components    → frontend/src/components/Common.jsx
Frontend Styles        → frontend/src/styles/global.css
```

## Useful npm Commands

```bash
# Development
npm run dev              Start dev server
npm run build           Build for production
npm run preview         Preview production build

# Maintenance
npm install             Install dependencies
npm update              Update packages
npm audit              Check security
```

## Useful Python Commands

```bash
# Dependency management
pip install -r requirements.txt    Install
pip freeze > requirements.txt      Update list
pip install package-name --upgrade Upgrade package

# Testing
python -m pytest                    Run tests
python main.py                      Start dev server
```

## Database Tables Reference

### application_status
```
id              → UUID primary key
app_id          → Unique application identifier
status          → pending, approved, rejected
rejection_reason → Text explanation
admin_notes     → Admin comments
status_updated_at → When status changed
created_at      → When created
```

### users
```
id              → UUID primary key
email           → Unique email
full_name       → Admin name
is_admin        → Boolean admin flag
created_at      → When created
```

### audit_log
```
id              → UUID primary key
user_id         → References users(id)
action          → approve, reject, update_notes, export
application_id  → Related application
details         → JSON extra data
created_at      → When action occurred
```

## Performance Tips

### Backend
- Use pagination for large datasets
- Add database indexes
- Cache frequently accessed data
- Optimize Google Sheets queries

### Frontend
- Lazy load images
- Code split components
- Memoize expensive components
- Minimize API calls

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Keep JWT_SECRET_KEY secret
- [ ] Use HTTPS in production
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for trusted origins
- [ ] Enable HTTPS redirects
- [ ] Keep dependencies updated

## Useful Links

- [FastAPI Docs](http://localhost:8000/docs) - Auto-generated API docs
- [React DevTools](https://github.com/facebook/react/tree/main/packages/react-devtools)
- [Supabase Dashboard](https://app.supabase.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Render Dashboard](https://dashboard.render.com)
- [Vercel Dashboard](https://vercel.com/dashboard)

## Common Git Commands

```bash
git status              Check what changed
git add .               Stage all changes
git commit -m "msg"     Commit changes
git push                Push to GitHub
git pull                Pull latest changes
git branch -a           List all branches
```

## Keyboard Shortcuts

### VS Code
- `Ctrl+`\`` - Toggle terminal
- `Ctrl+/` - Toggle comment
- `Ctrl+Shift+P` - Command palette
- `F12` - Open DevTools (browser)

### Browser DevTools
- `F12` - Open DevTools
- `Ctrl+Shift+C` - Inspect element
- `Ctrl+Shift+J` - Open console
- `Ctrl+Shift+I` - Open DevTools

Remember: Read the individual README files in `backend/` and `frontend/` for more detailed information!
