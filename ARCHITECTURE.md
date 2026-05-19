# System Architecture & Data Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Loan Application Management System            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   React App     │         │   FastAPI Backend │        │   Supabase   │
│   (Vercel)      │◄────────│   (Render.com)   │────────►│(PostgreSQL) │
│                 │         │                  │         │             │
│ • Dashboard     │ REST    │ • Applications   │  ORM    │ • Users     │
│ • List View     │ JSON    │ • Admin Actions  │         │ • App Status│
│ • Detail View   │ JWT     │ • Auth           │         │ • Audit Log │
│ • Image Gallery │ Tokens  │ • Google Sheets  │         │             │
│ • Admin Panel   │         │   Integration    │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
       ▲                              ▲                           
       │                              │                           
       │ Submits                      │ Reads                      
       │ Forms                        │ Data                       
       │                              │                           
┌──────┴──────────────────────────────┴─────────────────┐          
│                   Google Ecosystem                      │          
│  ┌──────────────────┐         ┌────────────────────┐  │          
│  │  Google Forms    │────────►│  Google Sheets     │  │          
│  │  (Applicants)    │ Auto    │  (Form Responses)  │  │          
│  │                  │ Sync    │                    │  │          
│  └──────────────────┘         └────────────────────┘  │          
│                                        │               │          
│                                        ▼               │          
│                               ┌────────────────────┐  │          
│                               │   Google Drive     │  │          
│                               │  (Image Files)     │  │          
│                               └────────────────────┘  │          
└────────────────────────────────────────────────────────┘          
```

## Data Flow - Application Submission to Approval

```
1. APPLICANT FILLS FORM
   ┌─────────────────────┐
   │ Google Form         │
   │ - Personal Info     │
   │ - Images (6-7)      │
   │ - Contact Persons   │
   └────────────┬────────┘
                │ Auto Submit
                ▼
2. FORM RESPONSE CAPTURED
   ┌─────────────────────┐
   │ Google Sheet        │
   │ Form Responses 1    │
   │ (All submissions)   │
   └────────────┬────────┘
                │ Pull Data
                ▼
3. BACKEND SYNC
   ┌─────────────────────┐
   │ FastAPI Service     │
   │ Parse Google Sheet  │
   │ Extract Images      │
   │ Create ID           │
   └────────────┬────────┘
                │ Store Status
                ▼
4. DATABASE STORAGE
   ┌─────────────────────┐
   │ Supabase            │
   │ application_status  │
   │ - Status: pending   │
   │ - Admin: empty      │
   │ - Notes: empty      │
   └────────────┬────────┘
                │ Query
                ▼
5. ADMIN VIEWS
   ┌─────────────────────┐
   │ React Dashboard     │
   │ - See in list       │
   │ - See details       │
   │ - View images       │
   └────────────┬────────┘
                │ Click Approve/Reject
                ▼
6. ADMIN ACTION
   ┌─────────────────────┐
   │ Admin Clicks        │
   │ APPROVE             │
   │ + Optional Notes    │
   └────────────┬────────┘
                │ POST to API
                ▼
7. UPDATE DATABASE
   ┌─────────────────────┐
   │ Supabase Update     │
   │ - Status: approved  │
   │ - Admin Notes: text │
   │ - Timestamp: now    │
   │ - Log Action        │
   └────────────┬────────┘
                │ Reflect
                ▼
8. UI UPDATES
   ┌─────────────────────┐
   │ Dashboard Refreshes │
   │ - Status changed    │
   │ - Summary updated   │
   │ - Can export data   │
   └─────────────────────┘
```

## API Request/Response Flow

```
FRONTEND REQUEST
┌──────────────────────────┐
│ GET /api/v1/applications │
│ Authorization: Bearer... │
│ ?skip=0&limit=20         │
└────────────┬─────────────┘
             │
             ▼
BACKEND PROCESSING
┌──────────────────────────┐
│ 1. Validate token        │
│ 2. Parse query params    │
│ 3. Read from Google API  │
│ 4. Get status from DB    │
│ 5. Combine data          │
│ 6. Format response       │
└────────────┬─────────────┘
             │
             ▼
RESPONSE (JSON)
┌──────────────────────────┐
│ {                        │
│   "data": [...],         │
│   "total": 150,          │
│   "skip": 0,             │
│   "limit": 20,           │
│   "count": 20            │
│ }                        │
└────────────┬─────────────┘
             │
             ▼
FRONTEND DISPLAY
┌──────────────────────────┐
│ Render table with:       │
│ - Application data       │
│ - Pagination controls    │
│ - Search box             │
│ - Filter dropdown        │
└──────────────────────────┘
```

## Component Hierarchy - Frontend

```
App (Main Component)
├── Navbar (Navigation)
│   ├── Brand
│   ├── Menu Links
│   ├── User Profile
│   └── Logout Button
│
├── Router/Views
│   ├── Login
│   │   └── Login Component
│   │       └── Form Group
│   │           ├── Input
│   │           └── Button
│   │
│   ├── Dashboard
│   │   ├── Card (Summary 1)
│   │   │   ├── Icon
│   │   │   └── Stats
│   │   ├── Card (Summary 2)
│   │   ├── Card (Summary 3)
│   │   ├── Card (Summary 4)
│   │   └── Card (Export)
│   │       ├── Button
│   │       ├── Button
│   │       └── Button
│   │
│   ├── ApplicationsList
│   │   ├── Search Input
│   │   ├── Status Filter
│   │   ├── Table
│   │   │   ├── Header Row
│   │   │   ├── Body Rows
│   │   │   │   ├── Badge
│   │   │   │   └── Button
│   │   │   └── More Rows...
│   │   └── Pagination
│   │       ├── Prev Button
│   │       ├── Page Info
│   │       └── Next Button
│   │
│   └── ApplicationDetail
│       ├── Back Button
│       ├── Title
│       ├── Card (Personal Info)
│       │   └── Grid of Info Items
│       ├── Card (Address)
│       ├── Card (Loan Details)
│       ├── Card (Social Media)
│       ├── Card (Contact Person 1)
│       ├── Card (Contact Person 2)
│       ├── Card (Images)
│       │   ├── Thumbnails
│       │   └── View Gallery Button
│       ├── Card (Admin Actions)
│       │   ├── Status Badge
│       │   ├── Approve Button
│       │   ├── Reject Button
│       │   ├── Modal (Reject Reason)
│       │   └── Notes Textarea
│       │
│       └── ImageGallery Modal
│           ├── Header (Title & Close)
│           ├── Main Viewer
│           │   ├── Prev Arrow
│           │   ├── Main Image
│           │   ├── Image Info
│           │   └── Next Arrow
│           └── Thumbnails
```

## Service Layer Architecture - Backend

```
routes.py (API Endpoints)
    ▲
    │ calls
    ▼
service.py (Business Logic)
    ├── ApplicationService
    │   ├── get_all_applications()
    │   ├── get_application_detail()
    │   └── get_dashboard_summary()
    │
    └── AdminService
        ├── approve_application()
        ├── reject_application()
        └── update_notes()
        
    Dependencies:
    ▼
google_sheets_service.py
    ├── get_sheet_values()
    ├── parse_form_responses()
    └── ensure_column_exists()
    
supabase_service.py
    ├── get_application_status()
    ├── update_application_status()
    ├── update_admin_notes()
    └── log_action()
```

## Database Schema Relationships

```
┌─────────────────────────────┐
│     application_status      │
├─────────────────────────────┤
│ id (UUID) [PRIMARY]         │
│ app_id (Text) [UNIQUE]      │◄─────┐
│ status (Text)               │      │
│ rejection_reason (Text)     │      │ References
│ admin_notes (Text)          │      │ (Implicit)
│ status_updated_at (Timestamp)│     │
│ created_at (Timestamp)      │      │
└─────────────────────────────┘      │
                                     │
         ┌───────────────────────────┘
         │
         │ Also references via audit_log
         │
         ▼
┌─────────────────────────────┐
│        users                │
├─────────────────────────────┤
│ id (UUID) [PRIMARY]         │
│ email (Text) [UNIQUE]       │
│ full_name (Text)            │
│ is_admin (Boolean)          │
│ created_at (Timestamp)      │
└─────────────────────────────┘
         ▲
         │ Many-to-One
         │
┌─────────────────────────────┐
│      audit_log              │
├─────────────────────────────┤
│ id (UUID) [PRIMARY]         │
│ user_id (UUID) [FOREIGN KEY]│
│ action (Text)               │
│ application_id (Text)       │
│ details (JSONB)             │
│ created_at (Timestamp)      │
└─────────────────────────────┘
```

## Authentication Flow

```
STEP 1: LOGIN
┌──────────────────────────┐
│ Admin enters:            │
│ - Email                  │
│ - Password               │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ POST /api/v1/auth/login  │
│ {                        │
│   "email": "...",        │
│   "password": "..."      │
│ }                        │
└────────────┬─────────────┘
             │
             ▼
STEP 2: VALIDATE & CREATE TOKEN
┌──────────────────────────┐
│ Backend:                 │
│ 1. Check email exists    │
│ 2. Verify password       │
│ 3. Generate JWT token    │
│ 4. Set expiry (30 min)   │
└────────────┬─────────────┘
             │
             ▼
STEP 3: RETURN TOKEN
┌──────────────────────────┐
│ Response:                │
│ {                        │
│   "access_token": "...", │
│   "token_type": "bearer",│
│   "user_id": "..."       │
│ }                        │
└────────────┬─────────────┘
             │
             ▼
STEP 4: STORE TOKEN
┌──────────────────────────┐
│ Frontend localStorage:   │
│ authToken = ...          │
└────────────┬─────────────┘
             │
             ▼
STEP 5: USE TOKEN IN REQUESTS
┌──────────────────────────┐
│ Every request includes:  │
│ Authorization: Bearer... │
└────────────┬─────────────┘
             │
             ▼
STEP 6: VERIFY & PROCESS
┌──────────────────────────┐
│ Backend verifies token   │
│ If valid: Process        │
│ If invalid: Return 401   │
│ If expired: Redirect     │
│ to login                 │
└──────────────────────────┘
```

## Image Processing Flow

```
FORM SUBMISSION
┌──────────────────────────┐
│ Admin uploads 6-7 images │
│ - Facebook/Instagram SS  │
│ - Gcash SS               │
│ - ID + Agreement         │
│ - Selfie with ID         │
│ - Selfie with Agreement  │
│ - Latest Order SS        │
└────────────┬─────────────┘
             │
             ▼
GOOGLE SHEETS RESPONSE
┌──────────────────────────┐
│ Google Forms auto-stores │
│ in Google Drive          │
│ Generates file URLs      │
│ Stores URLs in Sheet     │
└────────────┬─────────────┘
             │
             ▼
BACKEND EXTRACTION
┌──────────────────────────┐
│ Parse Google Sheet       │
│ Extract image URLs       │
│ Create image objects:    │
│ {                        │
│   type: "facebook",      │
│   url: "...",            │
│   timestamp: now()       │
│ }                        │
└────────────┬─────────────┘
             │
             ▼
DATABASE STORAGE
┌──────────────────────────┐
│ Store in JSON format     │
│ in application_detail    │
│ or separate table        │
└────────────┬─────────────┘
             │
             ▼
API RESPONSE
┌──────────────────────────┐
│ Include images array in  │
│ ApplicationResponse      │
│ {                        │
│   "images": [...]        │
│ }                        │
└────────────┬─────────────┘
             │
             ▼
FRONTEND DISPLAY
┌──────────────────────────┐
│ ApplicationDetail shows: │
│ - Image thumbnails      │
│ - View Gallery button   │
│                         │
│ ImageGallery modal:     │
│ - Full image display    │
│ - Thumbnails            │
│ - Navigation            │
│ - Fullscreen view       │
└──────────────────────────┘
```

## Export Flow

```
ADMIN CLICKS EXPORT
┌──────────────────────────┐
│ Select Export Type:      │
│ - All Applications       │
│ - Pending Only           │
│ - Approved Only          │
│ - Rejected Only          │
└────────────┬─────────────┘
             │
             ▼
GET /api/v1/admin/applications/export/csv
┌──────────────────────────┐
│ ?status_filter=pending   │
└────────────┬─────────────┘
             │
             ▼
BACKEND PROCESSES
┌──────────────────────────┐
│ 1. Get all data          │
│ 2. Filter if needed      │
│ 3. Convert to CSV        │
│ 4. Return CSV data       │
└────────────┬─────────────┘
             │
             ▼
FRONTEND CONVERTS
┌──────────────────────────┐
│ 1. Receive CSV text      │
│ 2. Create blob           │
│ 3. Create download link  │
└────────────┬─────────────┘
             │
             ▼
USER DOWNLOADS
┌──────────────────────────┐
│ applications-pending     │
│ -2026-05-18.csv         │
│                         │
│ Contains:               │
│ - All application data  │
│ - Status info           │
│ - Admin notes           │
│ - Ready for Excel       │
└──────────────────────────┘
```

---

This architecture ensures:
- **Scalability**: Can handle growth
- **Maintainability**: Clear separation of concerns
- **Reliability**: Error handling at each layer
- **Security**: Authentication and validation
- **Performance**: Optimized queries and caching
- **Extensibility**: Easy to add new features

