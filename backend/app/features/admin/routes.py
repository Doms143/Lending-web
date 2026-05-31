"""Admin feature - Manage approvals, rejections, and notes"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import logging
from app.utils.supabase_service import SupabaseService
from app.utils.google_sheets_service import GoogleSheetsService
from app.utils.schemas import ApplicationStatusUpdate, ApplicationNotesUpdate
from app.features.applications.service import ApplicationService
from app.core.config import get_settings
from app.core.dependencies import get_current_admin
from app.utils.statuses import ALLOWED_STATUS_TRANSITIONS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


def get_supabase_service() -> SupabaseService:
    """Dependency to get Supabase service"""
    settings = get_settings()
    return SupabaseService(
        settings.supabase_url,
        settings.supabase_service_role_key or settings.supabase_key
    )


def get_application_service() -> ApplicationService:
    """Dependency to get application sync service"""
    settings = get_settings()
    google_service = GoogleSheetsService(settings.google_credentials_path, settings.google_credentials_json)
    supabase_service = SupabaseService(
        settings.supabase_url,
        settings.supabase_service_role_key or settings.supabase_key
    )
    return ApplicationService(
        google_service,
        supabase_service,
        settings.google_sheets_id,
        settings.google_form_response_sheet
    )


def validate_status_transition(service: SupabaseService, app_id: str, next_status: str) -> str:
    current_record = service.get_application_status(app_id) or {}
    current_status = current_record.get("status", "pending")
    allowed_next_statuses = ALLOWED_STATUS_TRANSITIONS.get(current_status, set())

    if next_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot move application from {current_status} to {next_status}"
        )

    return current_status


@router.post("/sync/google-sheets")
async def sync_google_sheets(
    current_user: dict = Depends(get_current_admin),
    service: ApplicationService = Depends(get_application_service),
    audit_service: SupabaseService = Depends(get_supabase_service)
):
    try:
        result = service.sync_google_sheets_to_database()
        audit_service.log_action(current_user["id"], "sync_google_sheets", None, result)
        return result
    except Exception as e:
        logger.error(f"Failed to sync Google Sheets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sync/status")
async def get_sync_status(
    service: SupabaseService = Depends(get_supabase_service)
):
    try:
        return service.get_applications_sync_status()
    except Exception as e:
        logger.error(f"Failed to get sync status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get sync status")


@router.post("/applications/{app_id}/approve")
async def approve_application(
    app_id: str,
    current_user: dict = Depends(get_current_admin),
    service: SupabaseService = Depends(get_supabase_service)
):
    try:
        validate_status_transition(service, app_id, "approved")
        result = service.update_application_status(app_id, "approved")
        service.log_action(current_user["id"], "approve", app_id, {"status": "approved"})
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Failed to approve application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to approve application")


@router.post("/applications/{app_id}/reject")
async def reject_application(
    app_id: str,
    status_update: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_admin),
    service: SupabaseService = Depends(get_supabase_service)
):
    if status_update.status != "rejected":
        raise HTTPException(status_code=400, detail="Status must be 'rejected'")
    try:
        validate_status_transition(service, app_id, "rejected")
        result = service.update_application_status(app_id, "rejected", status_update.rejection_reason)
        service.log_action(current_user["id"], "reject", app_id, {
            "status": "rejected", "reason": status_update.rejection_reason
        })
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Failed to reject application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reject application")


@router.put("/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    status_update: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_admin),
    service: SupabaseService = Depends(get_supabase_service)
):
    if status_update.status == "rejected" and not (status_update.rejection_reason or "").strip():
        raise HTTPException(status_code=400, detail="Rejection reason is required when status is rejected")

    try:
        validate_status_transition(service, app_id, status_update.status)
        result = service.update_application_status(
            app_id,
            status_update.status,
            status_update.rejection_reason
        )
        service.log_action(current_user["id"], "update_status", app_id, {
            "status": status_update.status,
            "reason": status_update.rejection_reason,
        })
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Failed to update application status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update application status")


@router.put("/applications/{app_id}/notes")
async def update_application_notes(
    app_id: str,
    notes_update: ApplicationNotesUpdate,
    current_user: dict = Depends(get_current_admin),
    service: SupabaseService = Depends(get_supabase_service)
):
    try:
        result = service.update_admin_notes(app_id, notes_update.notes)
        service.log_action(current_user["id"], "update_notes", app_id, {"notes_updated": True})
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Failed to update notes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update notes")


@router.get("/applications/export/csv")
async def export_applications_csv(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_admin),
    service: SupabaseService = Depends(get_supabase_service)
):
    try:
        all_apps = service.get_all_applications_status()
        if status_filter:
            all_apps = [app for app in all_apps if app.get('status') == status_filter]
        service.log_action(current_user["id"], "export", None, {"status_filter": status_filter})
        return {"success": True, "count": len(all_apps), "data": all_apps}
    except Exception as e:
        logger.error(f"Failed to export applications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export applications")
