"""
widgetdc_contracts.security — Auto-generated Pydantic v2 models.
Source: @widgetdc/contracts schemas/security/
Do not edit manually — regenerate with: npm run python
"""

from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, Field
from typing import Literal
from uuid import UUID

__all__ = ["AuditHashChainEntry", "AuditHashChainVerification"]

class AuditHashChainEntry(BaseModel):
    event_id: UUID
    ts: AwareDatetime = Field(..., description='Canonical entry timestamp (UTC).')
    ts_raw: int | None = Field(
        None,
        description='Raw epoch-millis at entry creation for deterministic re-hashing.',
    )
    tool: str = Field(
        ...,
        description='Fully-qualified tool / event identifier (e.g. "mrp.produce", "gdpr.erase").',
    )
    payload_hash: str = Field(
        ..., description='Hex-encoded SHA-256 of the canonicalised payload.'
    )
    prev_hash: str = Field(
        ...,
        description='entry_hash of the previous chain entry; "GENESIS" for the first entry.',
    )
    entry_hash: str = Field(
        ...,
        description='Hex-encoded SHA-256 of (ts_raw || tool || payload_hash || prev_hash).',
    )
    bom_version: Literal['2.0']
    actor: str | None = Field(None, description='Authenticated client/agent id.')
    order_id: UUID | None = Field(None, description='Linked :ProductionOrder if any.')
    compliance_tier: str | None = None

class AuditHashChainVerification(BaseModel):
    verified: bool
    head_entry_hash: str | None = None
    entries_checked: int = Field(..., ge=0)
    first_break_event_id: str | None = None
    checked_at: AwareDatetime
