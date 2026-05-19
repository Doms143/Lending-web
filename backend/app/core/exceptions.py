"""Custom exceptions for the application"""


class ApplicationNotFound(Exception):
    """Raised when an application is not found"""
    pass


class InvalidStatusUpdate(Exception):
    """Raised when an invalid status is provided"""
    pass


class GoogleSheetsError(Exception):
    """Raised when there's an error accessing Google Sheets"""
    pass


class AuthenticationError(Exception):
    """Raised when authentication fails"""
    pass


class AuthorizationError(Exception):
    """Raised when user is not authorized to perform an action"""
    pass


class DataValidationError(Exception):
    """Raised when data validation fails"""
    pass
