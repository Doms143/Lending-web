"""Supabase integration service"""
from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class SupabaseService:
    """Service for interacting with Supabase"""
    
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
    
    # Auth
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        response = self.client.auth.sign_in_with_password({ "email": email, "password": password })
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user_id": response.user.id,
            "email": response.user.email,
        }
    
    def get_user_from_token(self, token: str) -> Optional[Dict[str, Any]]:
        response = self.client.auth.get_user(token)
        if not response or not response.user:
            return None
        user = response.user
        user_meta = user.user_metadata or {}
        app_meta = user.app_metadata or {}
        role = app_meta.get("role") or user_meta.get("role")
        is_admin = bool(app_meta.get("is_admin") or user_meta.get("is_admin") or role == "admin")
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user_meta.get("full_name", user.email),
            "is_admin": is_admin,
        }
    
    # Applications

    def upsert_applications(self, applications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            if not applications:
                return []

            result = self.client.table('applications').upsert(
                applications,
                on_conflict='id'
            ).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Failed to upsert applications: {str(e)}")
            raise

    def get_synced_applications(self, limit: int = 1000, offset: int = 0) -> List[Dict[str, Any]]:
        try:
            result = self.client.table('applications') \
                .select('*') \
                .order('submitted_at', desc=True) \
                .range(offset, offset + limit - 1) \
                .execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Failed to get synced applications: {str(e)}")
            raise

    def get_synced_application(self, app_id: str) -> Optional[Dict[str, Any]]:
        try:
            result = self.client.table('applications').select('*').eq('id', app_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get synced application: {str(e)}")
            raise

    def get_applications_sync_status(self) -> Dict[str, Any]:
        try:
            records = self.get_synced_applications(limit=5000, offset=0)
            last_synced_at = None

            for record in records:
                synced_at = record.get('synced_at')
                if synced_at and (not last_synced_at or synced_at > last_synced_at):
                    last_synced_at = synced_at

            return {
                "application_count": len(records),
                "last_synced_at": last_synced_at,
            }
        except Exception as e:
            logger.error(f"Failed to get applications sync status: {str(e)}")
            raise
    
    def get_application_status(self, app_id: str) -> Optional[Dict[str, Any]]:
        try:
            result = self.client.table('application_status').select('*').eq('app_id', app_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Failed to get application status: {str(e)}")
            raise
    
    def update_application_status(self, app_id: str, status: str, 
                                  rejection_reason: Optional[str] = None) -> Dict[str, Any]:
        try:
            update_data = { 'status': status, 'status_updated_at': 'now()' }
            if rejection_reason:
                update_data['rejection_reason'] = rejection_reason
            result = self.client.table('application_status').upsert(
                { 'app_id': app_id, **update_data }
            ).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Failed to update application status: {str(e)}")
            raise
    
    def update_admin_notes(self, app_id: str, notes: str) -> Dict[str, Any]:
        try:
            result = self.client.table('application_status').upsert(
                { 'app_id': app_id, 'admin_notes': notes }
            ).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Failed to update notes: {str(e)}")
            raise
    
    def get_all_applications_status(self, limit: int = 1000, offset: int = 0) -> List[Dict[str, Any]]:
        try:
            result = self.client.table('application_status').select('*').range(offset, offset + limit - 1).execute()
            return result.data
        except Exception as e:
            logger.error(f"Failed to get applications: {str(e)}")
            raise
    
    # Audit Log
    
    def log_action(self, user_id: str, action: str, application_id: Optional[str] = None, 
                  details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            result = self.client.table('audit_log').insert(
                { 'user_id': user_id, 'action': action, 'application_id': application_id, 'details': details }
            ).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Failed to log action: {str(e)}")
            raise
