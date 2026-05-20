"""Application routes"""
from fastapi import APIRouter, HTTPException, Query, Depends, Response
from typing import Optional, List
import logging
from app.features.applications.service import ApplicationService
from app.utils.schemas import ApplicationResponse, ApplicationListResponse, DashboardSummary
from app.utils.google_sheets_service import GoogleSheetsService, GoogleDriveService
from app.utils.supabase_service import SupabaseService
from app.core.config import get_settings
from app.core.dependencies import get_current_user
from app.core.exceptions import ApplicationNotFound, GoogleSheetsError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/applications", tags=["applications"], dependencies=[Depends(get_current_user)])
images_router = APIRouter(prefix="/api/v1/applications", tags=["applications-images"])


def get_application_service() -> ApplicationService:
    """Dependency to get application service"""
    settings = get_settings()
    google_service = GoogleSheetsService(settings.google_credentials_path, settings.google_credentials_json)
    supabase_service = SupabaseService(
        settings.supabase_url,
        settings.supabase_service_role_key or settings.supabase_key
    )
    return ApplicationService(google_service, supabase_service, settings.google_sheets_id, settings.google_form_response_sheet)


@router.get("/", response_model=dict)
async def list_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, pattern="^(pending|approved|rejected)$"),
    service: ApplicationService = Depends(get_application_service)
):
    """Get all loan applications with pagination
    
    Query parameters:
    - skip: Number of records to skip (pagination offset)
    - limit: Number of records to return
    - status: Filter by status (pending, approved, rejected)
    """
    try:
        applications, total = service.get_all_applications(limit=limit, offset=skip, status_filter=status)
        return {
            "data": [app.model_dump() for app in applications],
            "total": total,
            "skip": skip,
            "limit": limit,
            "count": len(applications)
        }
    except GoogleSheetsError as e:
        logger.error(f"Google Sheets error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve applications")


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(service: ApplicationService = Depends(get_application_service)):
    """Get dashboard summary statistics"""
    try:
        return service.get_dashboard_summary()
    except Exception as e:
        logger.error(f"Failed to get summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dashboard summary")


@images_router.get("/images/{file_id}")
async def proxy_image(file_id: str, _user: dict = Depends(get_current_user)):
    """Proxy Google Drive images through backend"""
    try:
        settings = get_settings()
        drive_service = GoogleDriveService(settings.google_credentials_path, settings.google_credentials_json)
        content, mime_type = drive_service.download_file(file_id)
        return Response(content=content, media_type=mime_type, headers={
            "Cache-Control": "public, max-age=86400"
        })
    except Exception as e:
        logger.error(f"Failed to proxy image {file_id}: {str(e)}")
        raise HTTPException(status_code=404, detail="Image not found")


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: str,
    service: ApplicationService = Depends(get_application_service)
):
    """Get detailed information for a specific application"""
    try:
        return service.get_application_detail(app_id)
    except ApplicationNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve application")
