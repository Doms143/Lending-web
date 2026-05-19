"""Applications feature - Get and list loan applications"""
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from app.utils.google_sheets_service import GoogleSheetsService
from app.utils.supabase_service import SupabaseService
from app.utils.schemas import ApplicationResponse, ApplicationListResponse, DashboardSummary
from app.core.exceptions import ApplicationNotFound, GoogleSheetsError

logger = logging.getLogger(__name__)


class ApplicationService:
    """Service for managing loan applications"""
    
    def __init__(self, google_service: GoogleSheetsService, supabase_service: SupabaseService,
                 spreadsheet_id: str, sheet_name: str):
        """Initialize service
        
        Args:
            google_service: Google Sheets service instance
            supabase_service: Supabase service instance
            spreadsheet_id: Google Sheets ID
            sheet_name: Response sheet name
        """
        self.google_service = google_service
        self.supabase_service = supabase_service
        self.spreadsheet_id = spreadsheet_id
        self.sheet_name = sheet_name
    
    def get_all_applications(self, limit: int = 100, offset: int = 0,
                           status_filter: Optional[str] = None) -> tuple[List[ApplicationListResponse], int]:
        """Get all applications with pagination and optional filtering
        
        Args:
            limit: Number of records to return
            offset: Pagination offset
            status_filter: Filter by status (pending/approved/rejected)
        
        Returns:
            Tuple of (applications list, total count)
        """
        try:
            # Get form responses from Google Sheets
            responses = self.google_service.parse_form_responses(
                self.spreadsheet_id,
                self.sheet_name
            )
            
            # Get status data from Supabase for all applications
            all_statuses = self.supabase_service.get_all_applications_status()
            status_map = {s['app_id']: s for s in all_statuses}
            
            # Build application list with status
            applications = []
            for response in responses:
                app_id = self._generate_app_id(response.get('email', ''))
                status_data = status_map.get(app_id, {})
                
                app_list = ApplicationListResponse(
                    id=app_id,
                    full_name=response.get('full name___2', ''),
                    email=response.get('email', ''),
                    amount=self._parse_amount(response.get('amount')),
                    status=status_data.get('status', 'pending'),
                    submitted_at=self._parse_date(response.get('timestamp', '')),
                    status_updated_at=self._parse_date(status_data.get('status_updated_at'))
                )
                
                # Apply status filter
                if status_filter and app_list.status != status_filter:
                    continue
                
                applications.append(app_list)
            
            # Sort by submitted date descending
            applications.sort(key=lambda x: x.submitted_at, reverse=True)
            
            total_count = len(applications)
            paginated_apps = applications[offset:offset + limit]
            
            return paginated_apps, total_count
        
        except Exception as e:
            logger.error(f"Failed to get applications: {str(e)}")
            raise GoogleSheetsError(f"Failed to retrieve applications: {str(e)}")
    
    def get_application_detail(self, app_id: str) -> ApplicationResponse:
        """Get detailed information for an application
        
        Args:
            app_id: Application ID
        
        Returns:
            Detailed application data
        """
        try:
            # Get form responses
            responses = self.google_service.parse_form_responses(
                self.spreadsheet_id,
                self.sheet_name
            )
            
            # Find matching application by email/ID
            app_data = None
            for response in responses:
                if self._generate_app_id(response.get('email', '')) == app_id:
                    app_data = response
                    break
            
            if not app_data:
                raise ApplicationNotFound(f"Application {app_id} not found")
            
            # Get status from Supabase
            status_data = self.supabase_service.get_application_status(app_id) or {}
            
            # Build detailed response
            app_response = ApplicationResponse(
                id=app_id,
                email=app_data.get('email', ''),
                full_name=app_data.get('full name___2', ''),
                date_of_birth=app_data.get('date of birth___3', ''),
                age=int(app_data.get('age___4', 0)) if app_data.get('age___4') else 0,
                phone_number=app_data.get('phone number', ''),
                source_of_income=app_data.get('source of income', ''),
                address={
                    'street': app_data.get('street', ''),
                    'barangay': app_data.get('barangay', ''),
                    'city_municipality': app_data.get('city/municipality', ''),
                    'province': app_data.get('province', ''),
                    'postal_code': app_data.get('postal code', '')
                },
                amount=self._parse_amount(app_data.get('amount')),
                duration=app_data.get('duration', ''),
                interest=self._parse_amount(app_data.get('interest')),
                reason_for_borrowing=app_data.get('reason for borrowing', ''),
                facebook_link=app_data.get('facebook link___16', ''),
                instagram_link=app_data.get('instagram link___17', ''),
                contact_person_1={
                    'full_name': app_data.get('full name___21', ''),
                    'facebook_link': app_data.get('facebook link___22', ''),
                    'mobile_number': app_data.get('mobile number___24', ''),
                    'relationship': app_data.get('relationship___25', '')
                },
                contact_person_2={
                    'full_name': app_data.get('full name___26', ''),
                    'facebook_link': app_data.get('facebook link___27', ''),
                    'mobile_number': app_data.get('mobile number___29', ''),
                    'relationship': app_data.get('relationship___30', '')
                } if app_data.get('full name___26') else None,
                status=status_data.get('status', 'pending'),
                submitted_at=self._parse_date(app_data.get('timestamp', '')),
                status_updated_at=self._parse_date(status_data.get('status_updated_at')),
                admin_notes=status_data.get('admin_notes', ''),
                images=self._extract_images(app_data)
            )
            
            return app_response
        
        except Exception as e:
            logger.error(f"Failed to get application detail: {str(e)}")
            raise
    
    def get_dashboard_summary(self) -> DashboardSummary:
        """Get dashboard summary statistics
        
        Returns:
            Dashboard summary
        """
        try:
            # Get all applications
            responses = self.google_service.parse_form_responses(
                self.spreadsheet_id,
                self.sheet_name
            )
            
            # Get all statuses from Supabase
            all_statuses = self.supabase_service.get_all_applications_status()
            status_map = {s['app_id']: s for s in all_statuses}
            
            total = len(responses)
            pending = 0
            approved = 0
            rejected = 0
            total_amount = 0.0
            
            for response in responses:
                app_id = self._generate_app_id(response.get('email', ''))
                status = status_map.get(app_id, {}).get('status', 'pending')
                amount = self._parse_amount(response.get('amount'))
                
                if status == 'pending':
                    pending += 1
                elif status == 'approved':
                    approved += 1
                elif status == 'rejected':
                    rejected += 1
                
                total_amount += amount
            
            return DashboardSummary(
                total_applications=total,
                pending_count=pending,
                approved_count=approved,
                rejected_count=rejected,
                total_loan_amount=total_amount
            )
        
        except Exception as e:
            logger.error(f"Failed to get dashboard summary: {str(e)}")
            raise GoogleSheetsError(f"Failed to retrieve dashboard summary: {str(e)}")
    
    @staticmethod
    def _generate_app_id(email: str) -> str:
        """Generate application ID from email"""
        return email.lower().replace('@', '-').replace('.', '-')
    
    @staticmethod
    def _parse_date(date_string: str) -> datetime:
        """Parse date string to datetime"""
        if not date_string:
            return datetime.now()
        
        try:
            # Try multiple date formats
            for fmt in ['%m/%d/%Y %H:%M:%S', '%Y-%m-%d %H:%M:%S', '%m/%d/%Y', '%Y-%m-%d']:
                try:
                    return datetime.strptime(date_string, fmt)
                except ValueError:
                    continue
            
            return datetime.now()
        except Exception:
            return datetime.now()
    
    @staticmethod
    def _parse_amount(value: Any) -> float:
        """Parse amount/interest value, handling '1k', '1,000', etc."""
        if not value:
            return 0.0
        try:
            return float(str(value).replace(',', ''))
        except ValueError:
            s = str(value).lower().strip()
            if s.endswith('k'):
                try:
                    return float(s[:-1]) * 1000
                except ValueError:
                    return 0.0
            return 0.0

    @staticmethod
    def _extract_file_id(url: str) -> str:
        import re
        match = re.search(r'[?&]id=([^&\s]+)', url)
        if match:
            return match.group(1)
        match = re.search(r'/file/d/([^/]+)', url)
        if match:
            return match.group(1)
        return url

    @staticmethod
    def _extract_images(app_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        images = []
        image_fields = [
            ('facebook_instagram', 'screenshot of facebook and instagram account'),
            ('gcash', 'screenshot of gcash'),
            ('id_agreement', 'picture of the written agreement with your valid id (follow the template below)'),
            ('selfie_id', 'selfie of you holding your valid id (do not cover your face)'),
            ('selfie_agreement', 'selfie of you holding your valid id with the written agreement  (do not cover your face)'),
            ('online_order', 'screenshot of latest online order (address must be visible)')
        ]
        
        for field_key, field_label in image_fields:
            image_url = app_data.get(field_label, '')
            if image_url:
                file_id = ApplicationService._extract_file_id(image_url)
                images.append({
                    'image_type': field_key,
                    'image_url': f"/api/v1/applications/images/{file_id}",
                    'uploaded_at': datetime.now()
                })
        
        return images
