"""Pydantic models/schemas for API requests and responses"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.utils.statuses import APPLICATION_STATUS_PATTERN


class ContactPerson(BaseModel):
    """Designated contact person"""
    full_name: str
    facebook_link: Optional[str] = None
    mobile_number: str
    relationship: str


class ApplicationAddress(BaseModel):
    """Applicant address"""
    street: str
    barangay: str
    city_municipality: str
    province: str
    postal_code: str


class ApplicationImage(BaseModel):
    """Application image"""
    image_type: str  # e.g., "facebook_instagram", "gcash", "id_agreement", etc.
    image_url: str
    uploaded_at: datetime


class ApplicationBase(BaseModel):
    """Base application data"""
    email: EmailStr
    full_name: str
    date_of_birth: str
    age: int
    phone_number: str
    source_of_income: str
    address: ApplicationAddress
    
    # Loan details
    amount: float
    duration: str
    interest: float
    reason_for_borrowing: str
    
    # Social media
    facebook_link: Optional[str] = None
    instagram_link: Optional[str] = None
    
    # Contact persons
    contact_person_1: ContactPerson
    contact_person_2: Optional[ContactPerson] = None


class ApplicationCreate(ApplicationBase):
    """Schema for creating an application"""
    pass


class ApplicationStatusUpdate(BaseModel):
    """Schema for updating application status"""
    status: str = Field(..., pattern=APPLICATION_STATUS_PATTERN)
    rejection_reason: Optional[str] = None


class ApplicationNotesUpdate(BaseModel):
    """Schema for updating admin notes"""
    notes: str


class ApplicationResponse(ApplicationBase):
    """Complete application response"""
    id: str
    status: str = "pending"
    borrow_count: int = 1
    submitted_at: datetime
    status_updated_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    images: List[ApplicationImage] = []
    
    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    """Application list item"""
    id: str
    full_name: str
    email: str
    amount: float
    status: str
    borrow_count: int = 1
    submitted_at: datetime
    status_updated_at: Optional[datetime] = None


class DashboardSummary(BaseModel):
    """Dashboard summary statistics"""
    total_applications: int
    pending_count: int
    under_review_count: int = 0
    approved_count: int
    rejected_count: int
    released_count: int = 0
    partially_paid_count: int = 0
    paid_count: int = 0
    overdue_count: int = 0
    defaulted_count: int = 0
    cancelled_count: int = 0
    total_loan_amount: float


class ExportData(BaseModel):
    """Data for export"""
    applications: List[ApplicationListResponse]
    summary: DashboardSummary
    exported_at: datetime


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    token_type: str = "bearer"
    user_id: str


class ErrorResponse(BaseModel):
    """Error response"""
    detail: str
    error_code: Optional[str] = None
