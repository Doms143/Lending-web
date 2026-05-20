"""Google Sheets integration service"""
import os
import pickle
import json
from google.auth.transport.requests import Request
from google.oauth2.service_account import Credentials
from google.oauth2.credentials import Credentials as UserCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]


def _load_service_account_credentials(credentials_path: str, credentials_json: str = ""):
    if credentials_json:
        return Credentials.from_service_account_info(
            json.loads(credentials_json),
            scopes=SCOPES
        )

    if os.path.exists(credentials_path):
        return Credentials.from_service_account_file(
            credentials_path,
            scopes=SCOPES
        )

    logger.warning(f"Credentials file not found: {credentials_path}")
    return None


class GoogleSheetsService:
    """Service for interacting with Google Sheets"""
    
    def __init__(self, credentials_path: str, credentials_json: str = ""):
        """Initialize Google Sheets service
        
        Args:
            credentials_path: Path to Google credentials JSON file
            credentials_json: Google service account JSON from an environment variable
        """
        self.credentials_path = credentials_path
        self.credentials_json = credentials_json
        self.creds = None
        self.sheets_service = None
        self.drive_service = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google API"""
        try:
            self.creds = _load_service_account_credentials(self.credentials_path, self.credentials_json)
            if not self.creds:
                return
            
            self.sheets_service = build('sheets', 'v4', credentials=self.creds)
            self.drive_service = build('drive', 'v3', credentials=self.creds)
            logger.info("Successfully authenticated with Google API")
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise
    
    def get_sheet_values(self, spreadsheet_id: str, range_name: str) -> List[List[Any]]:
        """Get values from a sheet range
        
        Args:
            spreadsheet_id: Google Sheets ID
            range_name: A1 notation range (e.g., "Form Responses 1!A1:Z100")
        
        Returns:
            List of rows with cell values
        """
        if not self.sheets_service:
            raise RuntimeError(
                "Google Sheets API not authenticated. "
                "Set GOOGLE_CREDENTIALS_JSON environment variable on Render "
                "or ensure credentials.json exists locally."
            )
        try:
            result = self.sheets_service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            return result.get('values', [])
        except Exception as e:
            logger.error(f"Failed to get sheet values: {str(e)}")
            raise
    
    def update_sheet_value(self, spreadsheet_id: str, range_name: str, values: List[List[Any]]):
        """Update values in a sheet range
        
        Args:
            spreadsheet_id: Google Sheets ID
            range_name: A1 notation range
            values: List of rows to update
        """
        try:
            body = {'values': values}
            result = self.sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            
            logger.info(f"Updated {result.get('updatedCells')} cells")
            return result
        except Exception as e:
            logger.error(f"Failed to update sheet: {str(e)}")
            raise
    
    def append_sheet_row(self, spreadsheet_id: str, sheet_name: str, values: List[Any]):
        """Append a row to a sheet
        
        Args:
            spreadsheet_id: Google Sheets ID
            sheet_name: Sheet name
            values: Row values to append
        """
        try:
            body = {'values': [values]}
            result = self.sheets_service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=f"{sheet_name}!A:Z",
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            
            return result
        except Exception as e:
            logger.error(f"Failed to append row: {str(e)}")
            raise
    
    def get_sheet_headers(self, spreadsheet_id: str, sheet_name: str) -> List[str]:
        """Get headers from first row
        
        Args:
            spreadsheet_id: Google Sheets ID
            sheet_name: Sheet name
        
        Returns:
            List of header column names
        """
        try:
            values = self.get_sheet_values(spreadsheet_id, f"{sheet_name}!1:1")
            return values[0] if values else []
        except Exception as e:
            logger.error(f"Failed to get headers: {str(e)}")
            raise
    
    def ensure_column_exists(self, spreadsheet_id: str, sheet_name: str, column_name: str) -> int:
        """Ensure a column exists, create if needed
        
        Args:
            spreadsheet_id: Google Sheets ID
            sheet_name: Sheet name
            column_name: Column name to check/create
        
        Returns:
            Column index (0-based)
        """
        try:
            headers = self.get_sheet_headers(spreadsheet_id, sheet_name)
            
            if column_name in headers:
                return headers.index(column_name)
            else:
                # Add new column
                last_col_index = len(headers)
                self.update_sheet_value(
                    spreadsheet_id,
                    f"{sheet_name}!{self._index_to_letter(last_col_index)}1",
                    [[column_name]]
                )
                return last_col_index
        except Exception as e:
            logger.error(f"Failed to ensure column: {str(e)}")
            raise
    
    @staticmethod
    def _index_to_letter(index: int) -> str:
        """Convert column index to letter(s)"""
        letters = ""
        while index > 0:
            index -= 1
            letters = chr(65 + (index % 26)) + letters
            index //= 26
        return letters or "A"
    
    def parse_form_responses(self, spreadsheet_id: str, sheet_name: str) -> List[Dict[str, Any]]:
        """Parse form responses from sheet
        
        Args:
            spreadsheet_id: Google Sheets ID
            sheet_name: Sheet name with form responses
        
        Returns:
            List of parsed application data
        """
        try:
            values = self.get_sheet_values(spreadsheet_id, f"{sheet_name}!A:ZZ")
            
            if not values or len(values) < 2:
                return []
            
            headers = values[0]
            applications = []
            
            for row_idx, row in enumerate(values[1:], start=2):
                try:
                    app_data = self._parse_row(headers, row)
                    if app_data:
                        app_data['row_index'] = row_idx  # Store for updates
                        applications.append(app_data)
                except Exception as e:
                    logger.warning(f"Failed to parse row {row_idx}: {str(e)}")
                    continue
            
            return applications
        except Exception as e:
            logger.error(f"Failed to parse form responses: {str(e)}")
            raise
    
    @staticmethod
    def _parse_row(headers: List[str], row: List[Any]) -> Optional[Dict[str, Any]]:
        """Parse a single row of form response"""
        # Map headers to values
        data = {}
        for idx, header in enumerate(headers):
            if idx < len(row):
                key = header.lower().strip().rstrip(':').strip()
                data[key] = row[idx]
                data[f"{key}___{idx}"] = row[idx]
        
        # Skip empty responses
        if not data.get('email'):
            return None
        
        return data


class GoogleDriveService:
    """Service for accessing Google Drive files (images)"""
    
    _instance = None
    
    @classmethod
    def get_instance(cls, credentials_path: str = "", credentials_json: str = ""):
        """Get or create a cached GoogleDriveService singleton"""
        if cls._instance is None:
            cls._instance = cls(credentials_path, credentials_json)
        return cls._instance
    
    def __init__(self, credentials_path: str, credentials_json: str = ""):
        """Initialize Google Drive service
        
        Args:
            credentials_path: Path to Google credentials JSON file
            credentials_json: Google service account JSON from an environment variable
        """
        self.credentials_path = credentials_path
        self.credentials_json = credentials_json
        self.creds = None
        self.drive_service = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Drive API"""
        try:
            self.creds = _load_service_account_credentials(self.credentials_path, self.credentials_json)
            if not self.creds:
                return
            self.drive_service = build('drive', 'v3', credentials=self.creds)
            logger.info("Successfully authenticated with Google Drive")
        except Exception as e:
            logger.error(f"Drive authentication failed: {str(e)}")
            raise
    
    def get_file_download_link(self, file_id: str) -> str:
        """Get direct download link for a file"""
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    
    def get_file_preview_link(self, file_id: str) -> str:
        """Get preview link for a file"""
        return f"https://drive.google.com/file/d/{file_id}/preview"
    
    def get_file_metadata(self, file_id: str) -> dict:
        """Get file metadata from Google Drive
        
        Args:
            file_id: Google Drive file ID
        
        Returns:
            Dictionary with mime_type, etag, and size
        """
        try:
            file_metadata = self.drive_service.files().get(
                fileId=file_id,
                fields="mimeType,md5Checksum,size"
            ).execute()
            return {
                'mime_type': file_metadata.get('mimeType', 'image/jpeg'),
                'etag': file_metadata.get('md5Checksum', ''),
                'size': file_metadata.get('size', 0),
            }
        except Exception as e:
            logger.error(f"Failed to get file metadata {file_id}: {str(e)}")
            raise
    
    def download_file(self, file_id: str) -> tuple:
        """Download file content and MIME type from Google Drive
        
        Args:
            file_id: Google Drive file ID
        
        Returns:
            Tuple of (file_bytes, mime_type, etag)
        """
        try:
            file_metadata = self.drive_service.files().get(
                fileId=file_id,
                fields="mimeType,md5Checksum"
            ).execute()
            mime_type = file_metadata.get('mimeType', 'image/jpeg')
            etag = file_metadata.get('md5Checksum', '')
            content = self.drive_service.files().get_media(fileId=file_id).execute()
            return content, mime_type, etag
        except Exception as e:
            logger.error(f"Failed to download file {file_id}: {str(e)}")
            raise
