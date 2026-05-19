# Loan Application Frontend Dashboard

React-based admin dashboard for managing loan applications. Built with React, Vite, and Axios for efficient development and deployment.

## Features

- **Dashboard**: Summary statistics (total, pending, approved, rejected applications)
- **Applications List**: Paginated table with search and filter capabilities
- **Application Details**: Comprehensive view of all applicant information
- **Image Gallery**: Lightbox-style gallery for reviewing submitted images
- **Admin Actions**: Approve/reject applications with comments
- **Export**: Download application data to CSV
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth interactions

## Architecture

Vertical slicing with feature-based organization:

```
src/
├── features/            # Feature modules (vertical slices)
│   ├── applications/    # List, detail, and gallery views
│   ├── admin/          # Dashboard, approval actions
│   └── auth/           # Login page
├── components/         # Reusable UI components
├── utils/              # API services and helpers
├── styles/             # Global styles
└── App.jsx            # Main application component
```

## Requirements

- Node.js 16+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)
- Backend API running (see backend README)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```
REACT_APP_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically reload when you make changes.

### 4. Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` directory ready for deployment.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── App.jsx                 # Main app component with routing
├── App.css                # App-level styles
├── main.jsx               # React entry point
├── features/
│   ├── applications/
│   │   ├── ApplicationsList.jsx      # Paginated applications table
│   │   ├── ApplicationDetail.jsx     # Detailed application view
│   │   ├── ImageGallery.jsx         # Lightbox image gallery
│   │   └── applications.css
│   ├── admin/
│   │   ├── Dashboard.jsx             # Summary dashboard
│   │   ├── AdminActions.jsx          # Approve/reject controls
│   │   └── admin.css
│   └── auth/
│       ├── Login.jsx                 # Admin login page
│       └── auth.css
├── components/
│   ├── Common.jsx              # Reusable UI components (Badge, Button, Modal, etc.)
│   └── utils.css               # Component styles
├── utils/
│   ├── api.js                 # Axios HTTP client configuration
│   ├── apiService.js          # API service methods
│   └── helpers.js             # Utility functions (formatting, validation)
└── styles/
    └── global.css              # Global CSS variables and base styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

## API Integration

The frontend communicates with the backend API at the URL specified in environment variables. Key endpoints:

**Applications**
- `GET /api/v1/applications` - List applications
- `GET /api/v1/applications/{id}` - Get application details
- `GET /api/v1/applications/summary` - Get dashboard summary

**Admin**
- `POST /api/v1/admin/applications/{id}/approve` - Approve application
- `POST /api/v1/admin/applications/{id}/reject` - Reject application
- `PUT /api/v1/admin/applications/{id}/notes` - Update notes
- `GET /api/v1/admin/applications/export/csv` - Export data

**Auth**
- `POST /api/v1/auth/login` - Admin login
- `POST /api/v1/auth/logout` - Admin logout

## Authentication

Admin authentication is handled via JWT tokens. The token is stored in localStorage and automatically included in API requests.

To log in:
1. Use admin credentials on the login page
2. Token is stored in localStorage
3. Token is included in all subsequent API requests
4. On logout, token is cleared

## Styling

The application uses a CSS-based design system with:
- CSS custom properties (variables) for colors, spacing, shadows, etc.
- BEM naming convention for CSS classes
- Mobile-first responsive design
- Smooth transitions and animations

## Deployment

### Vercel

The `vercel.json` file is configured for automatic Vercel deployment:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
# Manual deployment with Vercel CLI
vercel
```

### Other Platforms

**Netlify:**
```bash
# Build
npm run build

# Deploy dist folder to Netlify
```

**Traditional Server:**
```bash
npm run build
# Upload dist folder to your web server
# Configure server to redirect all routes to index.html
```

## Environment Variables

### Development
```
REACT_APP_API_URL=http://localhost:8000
```

### Production (Vercel)
```
REACT_APP_API_URL=https://your-backend-api.com
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari 12+
- Edge (latest)

## Performance

- Code splitting with Vite
- Lazy loading of routes
- Image optimization
- CSS minification in production
- Gzip compression

## Security

- XSS protection headers
- CORS properly configured
- JWT token handling
- Input validation
- Environment variables for sensitive data

## Troubleshooting

### "Cannot find module" errors
```bash
rm node_modules package-lock.json
npm install
```

### API connection issues
- Verify backend is running on the correct port
- Check `REACT_APP_API_URL` environment variable
- Check CORS configuration on backend

### Build fails
```bash
npm run build -- --verbose
```

### Styling issues
- Clear browser cache
- Verify CSS file imports
- Check browser DevTools for errors

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Real-time notifications
- [ ] Bulk operations
- [ ] Advanced filtering
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Webhook integrations
- [ ] Mobile app (React Native)

## Contributing

Follow the vertical slicing architecture when adding new features. Each feature should be self-contained with its own:
- Components
- Services
- Styles
- Tests

## License

MIT License
