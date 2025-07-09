from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator


class ReviewMode(str, Enum):
    EXECUTION = "execution"
    STRATEGY = "strategy"
    FULL_REVIEW = "full_review"


class AlignmentCategory(str, Enum):
    CORE_VALUE = "core_value"
    STRATEGIC_ENABLER = "strategic_enabler"
    DRIFT = "drift"
    DISTRACTION = "distraction"


class TicketSchema(BaseModel):
    key: str
    summary: str
    description: Optional[str] = ""
    status: str
    priority: Optional[str] = "Medium"
    assignee: Optional[str] = None
    labels: List[str] = Field(default_factory=list)
    sprint: Optional[str] = None
    created: datetime
    updated: datetime
    story_points: Optional[float] = None
    epic_link: Optional[str] = None
    
    @field_validator('description', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        return v or ""


class AlignmentResult(BaseModel):
    ticket_key: str
    alignment_score: float = Field(ge=0, le=100)
    category: AlignmentCategory
    rationale: str
    matched_principles: List[str] = Field(default_factory=list)
    suggested_rewrite: Optional[Dict[str, str]] = None
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v, info):
        if hasattr(info, 'data') and 'alignment_score' in info.data:
            score = info.data['alignment_score']
            expected = cls.score_to_category(score)
            if v != expected:
                raise ValueError(f"Category {v} doesn't match score {score}")
        return v
    
    @classmethod
    def score_to_category(cls, score: float) -> AlignmentCategory:
        if score >= 90:
            return AlignmentCategory.CORE_VALUE
        elif score >= 60:
            return AlignmentCategory.STRATEGIC_ENABLER
        elif score >= 40:
            return AlignmentCategory.DRIFT
        else:
            return AlignmentCategory.DISTRACTION


class TicketRewrite(BaseModel):
    original_key: str
    original_summary: str
    revised_summary: str
    revised_description: str
    alignment_improvement: float
    targeted_principle: str
    jira_comment: str


class SprintSummarySchema(BaseModel):
    total_tickets: int
    alignment_breakdown: Dict[AlignmentCategory, int]
    average_alignment_score: float
    drift_percentage: float
    over_indexed_areas: List[str] = Field(default_factory=list)
    neglected_principles: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list, max_items=7)
    top_aligned_tickets: List[Dict[str, Any]] = Field(default_factory=list)
    bottom_aligned_tickets: List[Dict[str, Any]] = Field(default_factory=list)
    
    @field_validator('drift_percentage')
    @classmethod
    def calculate_drift_percentage(cls, v, info):
        if hasattr(info, 'data'):
            breakdown = info.data.get('alignment_breakdown', {})
            total = info.data.get('total_tickets', 0)
            if total == 0:
                return 0
            drift_count = breakdown.get(AlignmentCategory.DRIFT, 0) + breakdown.get(AlignmentCategory.DISTRACTION, 0)
            return (drift_count / total) * 100
        return v


class ExecutiveSummary(BaseModel):
    summary_text: str = Field(max_length=2000)
    slack_formatted: bool = True
    timestamp: datetime = Field(default_factory=datetime.now)
    signature: str = "Are we building what matters?"