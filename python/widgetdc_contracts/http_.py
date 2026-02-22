"""
widgetdc_contracts.http_ — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/http/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from pydantic import AwareDatetime, BaseModel, Field, constr
from pydantic import BaseModel, Field
from pydantic import BaseModel, Field, constr
from pydantic import RootModel
from typing import Any
from typing import Any, Literal
from typing import Literal

__all__ = ["ApiError", "ApiErrorCode", "ApiResponse", "PaginatedResponse", "ResponseMetadata"]

class ApiError(BaseModel):
    code: Literal[
        'VALIDATION_ERROR',
        'AUTH_ERROR',
        'NOT_FOUND',
        'RATE_LIMIT',
        'INTERNAL_ERROR',
        'TIMEOUT',
        'SERVICE_UNAVAILABLE',
    ]
    message: str
    status_code: int = Field(..., ge=400, le=599)
    details: dict[constr(pattern=r'^(.*)$'), Any] | None = None
    correlation_id: str | None = None

class ApiErrorCode(
    RootModel[
        Literal[
            'VALIDATION_ERROR',
            'AUTH_ERROR',
            'NOT_FOUND',
            'RATE_LIMIT',
            'INTERNAL_ERROR',
            'TIMEOUT',
            'SERVICE_UNAVAILABLE',
        ]
    ]
):
    root: Literal[
        'VALIDATION_ERROR',
        'AUTH_ERROR',
        'NOT_FOUND',
        'RATE_LIMIT',
        'INTERNAL_ERROR',
        'TIMEOUT',
        'SERVICE_UNAVAILABLE',
    ]

class Error(BaseModel):
    code: Literal[
        'VALIDATION_ERROR',
        'AUTH_ERROR',
        'NOT_FOUND',
        'RATE_LIMIT',
        'INTERNAL_ERROR',
        'TIMEOUT',
        'SERVICE_UNAVAILABLE',
    ]
    message: str
    status_code: int = Field(..., ge=400, le=599)
    details: dict[constr(pattern=r'^(.*)$'), Any] | None = None
    correlation_id: str | None = None


class Metadata(BaseModel):
    request_id: str | None = None
    timestamp: AwareDatetime | None = None
    duration_ms: int | None = Field(None, ge=0)
    correlation_id: str | None = None


class ApiResponse(BaseModel):
    success: bool
    data: Any | None = None
    error: Error | None = None
    metadata: Metadata | None = None

class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1)
    has_more: bool

class ResponseMetadata(BaseModel):
    request_id: str | None = None
    timestamp: AwareDatetime | None = None
    duration_ms: int | None = Field(None, ge=0)
    correlation_id: str | None = None

