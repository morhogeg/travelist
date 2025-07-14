#!/usr/bin/env python3
"""
STEVE Frontend API - Simple Real Integration
Provides a REST API for the STEVE frontend to communicate with the backend
"""

import os
import sys
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Add the steve directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'steve'))

try:
    from steve_main import run_steve_analysis
    from config.config import Config
except ImportError as e:
    print(f"Warning: Could not import STEVE backend: {e}")
    print("Running in mock mode...")
    run_steve_analysis = None

app = FastAPI(title="STEVE Frontend API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class AnalysisRequest(BaseModel):
    mode: str = "execution"
    project: Optional[str] = None
    principles: Optional[List[str]] = None

class Ticket(BaseModel):
    key: str
    summary: str
    description: str
    alignmentScore: int
    category: str
    rationale: str
    suggestedSummary: Optional[str] = None
    suggestedDescription: Optional[str] = None

class AnalysisResult(BaseModel):
    status: str
    progress: int
    tickets: List[Ticket]
    executiveSummary: str
    timestamp: str
    error: Optional[str] = None

# In-memory storage for analysis results
analysis_cache: Dict[str, AnalysisResult] = {}
current_analysis_id: Optional[str] = None

def generate_mock_data() -> AnalysisResult:
    """Generate mock data for testing"""
    mock_tickets = [
        Ticket(
            key="PROJ-001",
            summary="Implement user authentication system",
            description="Build a secure authentication system with JWT tokens and role-based access control",
            alignmentScore=85,
            category="core_value",
            rationale="Strong alignment with security and user experience principles"
        ),
        Ticket(
            key="PROJ-002", 
            summary="Add dark mode toggle",
            description="Implement a dark/light mode toggle for better user experience",
            alignmentScore=72,
            category="strategic_enabler",
            rationale="Supports user experience goals but not core business value"
        ),
        Ticket(
            key="PROJ-003",
            summary="Refactor legacy codebase",
            description="Clean up old code and improve maintainability",
            alignmentScore=45,
            category="drift",
            rationale="Technical debt work that doesn't directly serve user needs",
            suggestedSummary="Improve core user workflow performance",
            suggestedDescription="Optimize critical user paths by refactoring legacy components that impact user experience"
        ),
        Ticket(
            key="PROJ-004",
            summary="Add confetti animation",
            description="Add celebratory animations when users complete tasks",
            alignmentScore=25,
            category="distraction",
            rationale="Nice-to-have feature that doesn't align with core business objectives",
            suggestedSummary="Enhance task completion feedback",
            suggestedDescription="Improve user satisfaction with meaningful feedback when completing critical workflows"
        ),
        Ticket(
            key="PROJ-005",
            summary="Implement advanced analytics dashboard",
            description="Create comprehensive analytics for user behavior tracking",
            alignmentScore=88,
            category="core_value",
            rationale="Directly supports data-driven decision making and business intelligence"
        ),
        Ticket(
            key="PROJ-006",
            summary="Add social media sharing",
            description="Allow users to share achievements on social platforms",
            alignmentScore=35,
            category="distraction", 
            rationale="Feature that diverts focus from core product value"
        ),
        Ticket(
            key="PROJ-007",
            summary="Optimize API response times",
            description="Improve backend performance for faster user interactions",
            alignmentScore=78,
            category="strategic_enabler",
            rationale="Enables better user experience but is infrastructure-focused"
        ),
        Ticket(
            key="PROJ-008",
            summary="Implement real-time notifications",
            description="Add push notifications for important user events",
            alignmentScore=82,
            category="core_value",
            rationale="Critical for user engagement and retention"
        )
    ]
    
    executive_summary = \"\"\"**Strategic Health Assessment: 67/100**

Our current sprint shows mixed strategic alignment with several areas requiring immediate attention. While we have strong core value initiatives (3 tickets, 38%), we're also investing significant effort in distractions that don't serve our users.

**Key Insights:**
• **Core Value Strength**: Authentication system and analytics dashboard demonstrate solid commitment to user security and data-driven decisions
• **Strategic Drift Alert**: 25% of tickets (2/8) are categorized as distractions - this is above our 15% threshold
• **Performance Focus**: API optimization and real-time notifications show good technical foundation building

**Immediate Recommendations:**
• Consolidate or eliminate social media sharing and confetti features
• Reframe legacy refactoring in terms of user impact
• Maintain focus on authentication and analytics as flagship deliverables

**Bottom Line**: We're building meaningful features but getting distracted by nice-to-haves. The team needs to recommit to user-centric outcomes over feature completeness.

*Are we building what matters?*\"\"\"

    return AnalysisResult(
        status="completed",
        progress=100,
        tickets=mock_tickets,
        executiveSummary=executive_summary,
        timestamp=datetime.now().isoformat()
    )

async def run_real_analysis(request: AnalysisRequest) -> AnalysisResult:
    """Run real STEVE analysis if backend is available"""
    if run_steve_analysis is None:
        # Fallback to mock data if backend unavailable
        return generate_mock_data()
    
    try:
        # Configure STEVE based on request
        config = Config()
        config.MODE = request.mode
        if request.project:
            config.PROJECT_KEY = request.project
            
        # Run STEVE analysis
        result = await asyncio.get_event_loop().run_in_executor(
            None, run_steve_analysis, config
        )
        
        # Convert STEVE result to frontend format
        tickets = []
        for ticket_data in result.get('tickets', []):
            tickets.append(Ticket(
                key=ticket_data.get('key', ''),
                summary=ticket_data.get('summary', ''),
                description=ticket_data.get('description', ''),
                alignmentScore=ticket_data.get('alignment_score', 0),
                category=ticket_data.get('category', 'drift'),
                rationale=ticket_data.get('rationale', ''),
                suggestedSummary=ticket_data.get('suggested_summary'),
                suggestedDescription=ticket_data.get('suggested_description')
            ))
            
        return AnalysisResult(
            status="completed",
            progress=100,
            tickets=tickets,
            executiveSummary=result.get('executive_summary', ''),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        return AnalysisResult(
            status="error",
            progress=0,
            tickets=[],
            executiveSummary="",
            timestamp=datetime.now().isoformat(),
            error=f"Analysis failed: {str(e)}"
        )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "STEVE Frontend API is running",
        "version": "1.0.0",
        "backend_available": run_steve_analysis is not None
    }

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_tickets(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Start ticket analysis"""
    global current_analysis_id
    
    # Generate analysis ID
    analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    current_analysis_id = analysis_id
    
    # Store initial status
    analysis_cache[analysis_id] = AnalysisResult(
        status="running",
        progress=0,
        tickets=[],
        executiveSummary="",
        timestamp=datetime.now().isoformat()
    )
    
    # Run analysis
    result = await run_real_analysis(request)
    
    # Store result
    analysis_cache[analysis_id] = result
    
    return result

@app.get("/analysis/{analysis_id}", response_model=AnalysisResult)
async def get_analysis(analysis_id: str):
    """Get analysis result by ID"""
    if analysis_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return analysis_cache[analysis_id]

@app.get("/analysis", response_model=AnalysisResult)
async def get_latest_analysis():
    """Get the latest analysis result"""
    if not current_analysis_id or current_analysis_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="No analysis available")
    
    return analysis_cache[current_analysis_id]

@app.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete analysis result"""
    if analysis_id not in analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    del analysis_cache[analysis_id]
    return {"message": "Analysis deleted"}

if __name__ == "__main__":
    print("🎯 Starting STEVE Frontend API...")
    print("📊 Dashboard: http://localhost:5173")
    print("🔧 API Docs: http://localhost:8000/docs")
    print()
    
    uvicorn.run(
        "main_simple_real:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )