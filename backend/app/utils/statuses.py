"""Application status constants."""

APPLICATION_STATUSES = [
    "pending",
    "under_review",
    "approved",
    "rejected",
    "released",
    "active",
    "partially_paid",
    "paid",
    "overdue",
    "defaulted",
    "cancelled",
]

APPLICATION_STATUS_PATTERN = "^(" + "|".join(APPLICATION_STATUSES) + ")$"

ALLOWED_STATUS_TRANSITIONS = {
    "pending": {"under_review"},
    "under_review": {"approved", "rejected"},
    "approved": {"released", "cancelled"},
    "released": {"active", "cancelled"},
    "active": {"partially_paid", "paid"},
    "partially_paid": {"paid"},
    "overdue": {"paid", "defaulted"},
    "defaulted": {"paid"},
    "paid": {"approved"},
}
