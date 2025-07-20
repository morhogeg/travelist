#!/usr/bin/env python3
"""
STEVE Frontend API - Simple Real Integration
Provides a REST API for the STEVE frontend to communicate with the backend
"""

import os
import sys
import json
import asyncio
import subprocess
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import yaml
# from dotenv import load_dotenv

# Add the steve directory to the Python path
steve_dir = os.path.join(os.path.dirname(__file__), '..', 'steve')
sys.path.append(steve_dir)

# Change working directory to steve so config files can be found
os.chdir(steve_dir)

# Load environment variables from steve/.env
# load_dotenv('.env')

try:
    from crew_steve import run_steve as crew_main
    from core.schemas import ReviewMode
    from core.jira_client import JiraClient
    from utils.logger import get_logger
    logger = get_logger(__name__)
    STEVE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import STEVE backend: {e}")
    print("Running in mock mode...")
    STEVE_AVAILABLE = False
    logger = None

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
    vision: Optional[dict] = None
    agentSettings: Optional[dict] = None

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
    
    executive_summary = """**Strategic Health Assessment: 67/100**

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

*Are we building what matters?*"""

    return AnalysisResult(
        status="completed",
        progress=100,
        tickets=mock_tickets,
        executiveSummary=executive_summary,
        timestamp=datetime.now().isoformat()
    )

def apply_user_settings(request: AnalysisRequest):
    """Apply user settings temporarily for this analysis"""
    # Store original files for restoration
    originals = {}
    
    try:
        # Apply custom agent settings if provided
        if request.agentSettings:
            agents_path = os.path.join(os.path.dirname(__file__), '..', 'steve', 'config', 'agents.yaml')
            
            # Backup original
            if os.path.exists(agents_path):
                with open(agents_path, 'r') as f:
                    originals['agents'] = f.read()
                    original_agents = yaml.safe_load(originals['agents'])
                
                # Update with user settings
                for agent_id, settings in request.agentSettings.items():
                    if 'instructions' in settings and settings['instructions']:
                        # Map frontend agent IDs to backend agent names
                        agent_map = {
                            'ticketIngestor': 'ticket_ingestor',
                            'alignmentEvaluator': 'alignment_evaluator',
                            'rewriteStrategist': 'rewrite_strategist',
                            'themeSynthesizer': 'theme_synthesizer',
                            'founderVoice': 'founder_voice'
                        }
                        
                        backend_id = agent_map.get(agent_id, agent_id)
                        
                        # Update backstory (which is used as instructions) in the agents config
                        if 'agents' in original_agents and backend_id in original_agents['agents']:
                            # Store original backstory to append custom instructions
                            original_backstory = original_agents['agents'][backend_id].get('backstory', '')
                            custom_instructions = settings['instructions']
                            
                            # Append custom instructions to backstory
                            original_agents['agents'][backend_id]['backstory'] = f"{original_backstory}\n\nCUSTOM INSTRUCTIONS: {custom_instructions}"
                            
                            # Handle enabled/disabled state
                            if 'enabled' in settings and not settings['enabled']:
                                # If disabled, set a flag that the backend can recognize
                                original_agents['agents'][backend_id]['skip'] = True
                
                # Write updated config
                with open(agents_path, 'w') as f:
                    yaml.dump(original_agents, f, default_flow_style=False)
                    
        return originals
        
    except Exception as e:
        print(f"Error applying user settings: {e}")
        return originals

def restore_original_files(originals):
    """Restore original configuration files"""
    try:
        if 'agents' in originals:
            agents_path = os.path.join(os.path.dirname(__file__), '..', 'steve', 'config', 'agents.yaml')
            with open(agents_path, 'w') as f:
                f.write(originals['agents'])
    except Exception as e:
        print(f"Error restoring files: {e}")

async def run_real_analysis(request: AnalysisRequest) -> AnalysisResult:
    """Run real STEVE analysis using the crew_steve backend"""
    if not STEVE_AVAILABLE:
        # Fallback to mock data if backend unavailable
        print("STEVE backend not available, using mock data")
        return generate_mock_data()
    
    # Apply user settings before analysis
    originals = apply_user_settings(request)
    
    try:
        # Get project key from env or request
        project_key = request.project or os.getenv("JIRA_PROJECT_KEY", "PROJ")
        
        print(f"Running real STEVE analysis for project: {project_key}, mode: {request.mode}")
        
        # Run STEVE analysis using crew_steve
        result = await asyncio.get_event_loop().run_in_executor(
            None, 
            lambda: crew_main(
                review_mode=request.mode,
                project_key=project_key,
                test_mode=False,
                dry_run=True  # Don't update Jira from the web interface
            )
        )
        
        # Convert STEVE result to frontend format
        tickets = []
        
        # Extract alignments from the result
        alignments = result.get('alignments', [])
        for alignment in alignments:
            ticket_key = alignment.get('ticket_key', '')
            score = alignment.get('score', 0)
            
            # Determine category based on score
            if score >= 90:
                category = "core_value"
            elif score >= 60:
                category = "strategic_enabler"
            elif score >= 40:
                category = "drift"
            else:
                category = "distraction"
            
            tickets.append(Ticket(
                key=ticket_key,
                summary=alignment.get('summary', ''),
                description=alignment.get('description', ''),
                alignmentScore=int(score),
                category=category,
                rationale=alignment.get('rationale', ''),
                suggestedSummary=alignment.get('suggested_summary'),
                suggestedDescription=alignment.get('suggested_description')
            ))
        
        # Extract executive summary
        executive_summary = result.get('executive_narrative', '')
        
        # Log what we got from backend
        print(f"Executive narrative from backend: {executive_summary[:100]}..." if executive_summary else "No executive narrative from backend")
        
        # Always build our comprehensive summary (comment out to use backend's narrative)
        # if not executive_summary:
        if True:  # Force using our rich format
            summary_data = result.get('summary', {})
            total_tickets = summary_data.get('total_tickets', len(alignments))
            avg_score = summary_data.get('average_alignment_score', 0)
            breakdown = summary_data.get('alignment_breakdown', {})
            recommendations = summary_data.get('recommendations', [])
            
            # Calculate percentages and collect ticket keys by category
            core_value_pct = (breakdown.get('core_value', 0) / total_tickets * 100) if total_tickets > 0 else 0
            strategic_pct = (breakdown.get('strategic_enabler', 0) / total_tickets * 100) if total_tickets > 0 else 0
            drift_pct = (breakdown.get('drift', 0) / total_tickets * 100) if total_tickets > 0 else 0
            distraction_pct = (breakdown.get('distraction', 0) / total_tickets * 100) if total_tickets > 0 else 0
            
            # Collect ticket keys by category
            tickets_by_category = {
                'core_value': [],
                'strategic_enabler': [],
                'drift': [],
                'distraction': []
            }
            
            for alignment in alignments:
                category = alignment.get('category', 'drift')
                ticket_key = alignment.get('ticket_key', '')
                if ticket_key and category in tickets_by_category:
                    tickets_by_category[category].append(ticket_key)
            
            # Determine health status
            if avg_score >= 75:
                health_status = "Strong Strategic Alignment"
                health_emoji = "🟢"
            elif avg_score >= 60:
                health_status = "Moderate Alignment - Attention Needed"
                health_emoji = "🟡"
            elif avg_score >= 40:
                health_status = "Significant Drift Detected"
                health_emoji = "🟠"
            else:
                health_status = "Critical Misalignment"
                health_emoji = "🔴"
            
            executive_summary = f"""**Strategic Health Assessment: {avg_score:.0f}/100 {health_emoji}**

Our current sprint analysis of {total_tickets} tickets reveals {health_status.lower()}.

**Key Insights:**
• **Core Value Focus**: {core_value_pct:.0f}% of work directly advances strategic goals ({breakdown.get('core_value', 0)} tickets) [[{', '.join(tickets_by_category['core_value'])}]]
• **Strategic Support**: {strategic_pct:.0f}% provides foundational value ({breakdown.get('strategic_enabler', 0)} tickets) [[{', '.join(tickets_by_category['strategic_enabler'])}]]
• **Drift Warning**: {drift_pct:.0f}% lacks clear strategic connection ({breakdown.get('drift', 0)} tickets) [[{', '.join(tickets_by_category['drift'])}]]
• **Distraction Alert**: {distraction_pct:.0f}% actively diverts from priorities ({breakdown.get('distraction', 0)} tickets) [[{', '.join(tickets_by_category['distraction'])}]]

**Performance Highlights:**

• Average alignment score of {avg_score:.0f}/100 {"exceeds" if avg_score >= 70 else "falls below"} target threshold
• {"Strong" if core_value_pct >= 60 else "Weak"} concentration on high-impact initiatives
• {"Minimal" if distraction_pct <= 15 else "Concerning level of"} resource allocation to non-strategic work

**Immediate Recommendations:**

"""
            
            # Add recommendations if available
            if recommendations:
                count = 0
                for rec in recommendations:
                    # Skip recommendation if it looks like a header (ends with colon or contains numbered subheading)
                    rec_clean = rec.strip()
                    
                    # Skip headers and numbered items
                    if (rec_clean.endswith(':') or 
                        'Sprint:' in rec_clean or
                        rec_clean.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.'))):
                        continue
                    
                    # Remove any leading numbers/bullets
                    rec_clean = rec_clean.lstrip('0123456789.-• ')
                    
                    executive_summary += f"• {rec_clean}\n"
                    count += 1
                    if count >= 5:  # Show up to 5 recommendations
                        break
            else:
                # Default recommendations based on scores
                if avg_score < 60:
                    executive_summary += "• Refocus sprint planning on core strategic principles\n"
                    executive_summary += "• Review and realign drift tickets with business objectives\n"
                    executive_summary += "• Consider deferring or removing distraction items\n"
                    executive_summary += "• Establish weekly alignment reviews to catch drift early\n"
                    executive_summary += "• Create strategic principle cheat sheet for ticket creation\n"
                elif avg_score < 75:
                    executive_summary += "• Elevate strategic enablers to core value status where possible\n"
                    executive_summary += "• Clarify strategic connections for drift tickets\n"
                    executive_summary += "• Maintain momentum on high-scoring initiatives\n"
                    executive_summary += "• Share alignment best practices from top performers\n"
                    executive_summary += "• Consider strategic value in sprint planning discussions\n"
                else:
                    executive_summary += "• Scale successful patterns across more tickets\n"
                    executive_summary += "• Document strategic wins for team learning\n"
                    executive_summary += "• Continue excellence in strategic alignment\n"
                    executive_summary += "• Mentor other teams on alignment best practices\n"
                    executive_summary += "• Celebrate and showcase high-scoring initiatives\n"
            
            executive_summary += f"""
**Bottom Line**: {"We're on track with strong strategic focus. Keep this momentum!" if avg_score >= 70 else "Time to realign our efforts with what truly matters for our users and business."}"""
            
        return AnalysisResult(
            status="completed",
            progress=100,
            tickets=tickets,
            executiveSummary=executive_summary,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return AnalysisResult(
            status="error",
            progress=0,
            tickets=[],
            executiveSummary="",
            timestamp=datetime.now().isoformat(),
            error=f"Analysis failed: {str(e)}"
        )
    finally:
        # Always restore original files
        restore_original_files(originals)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "STEVE Frontend API is running",
        "version": "1.0.0",
        "backend_available": STEVE_AVAILABLE,
        "jira_project": os.getenv("JIRA_PROJECT_KEY", "Not configured")
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

class VisionRequest(BaseModel):
    vision: dict
    format: str = "yaml"

@app.post("/vision")
async def update_vision(request: VisionRequest):
    """Update the product vision"""
    try:
        if request.format == "yaml":
            # Save as principles.yaml
            principles_path = os.path.join(os.path.dirname(__file__), '..', 'steve', 'config', 'principles.yaml')
            os.makedirs(os.path.dirname(principles_path), exist_ok=True)
            
            import yaml
            with open(principles_path, 'w') as f:
                yaml.dump(request.vision, f, default_flow_style=False)
        else:
            # Save as vision.md for backward compatibility
            vision_path = os.path.join(os.path.dirname(__file__), '..', 'steve', 'config', 'vision.md')
            os.makedirs(os.path.dirname(vision_path), exist_ok=True)
            
            with open(vision_path, 'w') as f:
                f.write(str(request.vision))
        
        return {"status": "success", "message": "Vision updated successfully"}
    except Exception as e:
        if logger:
            logger.error(f"Failed to update vision: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/vision")
async def get_vision():
    """Get the current product vision"""
    try:
        # First try to load from principles.yaml
        principles_path = os.path.join(os.path.dirname(__file__), '..', 'steve', 'config', 'principles.yaml')
        
        if os.path.exists(principles_path):
            import yaml
            with open(principles_path, 'r') as f:
                principles_data = yaml.safe_load(f)
            return {"vision": principles_data, "format": "yaml"}
        
        # Fallback to vision.md if it exists
        vision_path = os.path.join(os.path.dirname(__file__), '..', 'steve', 'config', 'vision.md')
        if os.path.exists(vision_path):
            with open(vision_path, 'r') as f:
                vision = f.read()
            return {"vision": vision, "format": "markdown"}
        
        # Return default structure
        return {
            "vision": {
                "principles": [
                    {
                        "name": "Define Your First Principle",
                        "description": "Describe what this principle means for your product",
                        "keywords": ["example", "keywords"],
                        "weight": 1.0
                    }
                ],
                "thresholds": {
                    "core_value": 90,
                    "strategic_enabler": 60,
                    "drift": 40
                }
            },
            "format": "yaml"
        }
    except Exception as e:
        if logger:
            logger.error(f"Failed to get vision: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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