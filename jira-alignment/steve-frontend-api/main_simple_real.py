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
import requests
# from dotenv import load_dotenv

# Add the steve directory to the Python path
steve_dir = os.path.join(os.path.dirname(__file__), '..', 'steve')
sys.path.append(steve_dir)

# Change working directory to steve so config files can be found
os.chdir(steve_dir)

# Load environment variables from steve/.env
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

try:
    import sys
    import os
    # Add steve directory to Python path
    steve_path = os.path.join(os.path.dirname(__file__), '..', 'steve')
    if steve_path not in sys.path:
        sys.path.insert(0, steve_path)
    
    from crew_steve_core import run_steve as crew_main
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
    quickSuggestion: Optional[dict] = None
    strategicComment: Optional[str] = None

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

def generate_strategic_comment(ticket: dict) -> str:
    """Generate STEVE's strategic analysis comment for a ticket"""
    score = ticket.get('alignmentScore', ticket.get('score', 0))
    category = ticket.get('category', '')
    summary = ticket.get('summary', '')
    rationale = ticket.get('rationale', '')
    matched_principles = ticket.get('matched_principles', [])
    
    divider = "⸻"
    comment = f"{divider}\n\n"
    
    # Strategic Alignment Summary
    comment += "🎯 **Strategic Alignment Summary**\n"
    category_display = category.replace('_', ' ').title()
    comment += f"**Score**: {score}/100 — {category_display}\n"
    
    # Matched principles
    if matched_principles:
        comment += f"**Matched Principles**: {', '.join(matched_principles)}\n"
    else:
        comment += "**Matched Principles**: None\n"
    
    # Score explanation
    if score >= 90:
        comment += "This ticket directly accelerates our core mission. All top-tier principles are strongly represented.\n"
    elif score >= 60:
        comment += "This work supports strategic objectives. It provides necessary enablement for core value delivery.\n"
    elif score >= 40:
        comment += "The alignment with strategic principles is weak. Connection to mission is ambiguous.\n"
    else:
        comment += "No meaningful alignment detected with our strategic principles.\n"
    
    comment += f"\n{divider}\n\n"
    
    # Why This Aligns/Doesn't Align
    if score >= 60:
        comment += "🧠 **Why This Aligns**\n"
    else:
        comment += "🧠 **Why This Doesn't Align**\n"
    
    comment += rationale
    
    if score >= 90:
        comment += " This work represents a direct advancement of our core strategic objectives."
    elif score >= 60:
        comment += " While not directly mission-critical, it provides necessary infrastructure for future core value delivery."
    elif score >= 40:
        comment += " This work appears well-intentioned but lacks clear strategic connection."
    else:
        comment += " This work provides no identifiable connection to any strategic principle."
    
    comment += f"\n\n{divider}\n\n"
    
    # Recommendation
    comment += "🧭 **Recommendation**\n"
    
    if score >= 90:
        comment += "• ✅ **Action**: Prioritize and fast-track to execution\n"
        comment += "• 💡 **Rationale**: This creates foundational infrastructure with clear ROI"
    elif score >= 60:
        comment += "• ✅ **Action**: Keep in roadmap and schedule soon\n"
        comment += "• 💡 **Rationale**: Enables stronger Core Value delivery down the line"
    elif score >= 40:
        comment += "• 🚧 **Action**: Reframe to improve strategic connection\n"
        comment += "• 💡 **Rationale**: Could deliver value with better alignment to principles"
        if ticket.get('suggestedSummary'):
            comment += f"\n• 🔄 **Reframe Tip**: \"{ticket['suggestedSummary']}\""
    else:
        comment += "• ❌ **Action**: Remove from backlog or dramatically reframe\n"
        comment += "• 💡 **Rationale**: Opportunity cost too high given lack of strategic alignment"
    
    return comment

def generate_quick_suggestion(score: int, summary: str, category: str) -> dict:
    """Generate quick actionable suggestion based on score"""
    if score >= 80:  # Core Value
        return {
            "action": "prioritize",
            "text": "✅ Fast-track this high-value work",
            "type": "success"
        }
    elif score >= 60:  # Strategic Enabler
        return {
            "action": "enhance",
            "text": "📈 Consider adding strategic elements to boost alignment",
            "type": "info"
        }
    elif score >= 40:  # Drift
        return {
            "action": "rephrase",
            "text": "✏️ Rephrase to emphasize strategic value",
            "type": "warning"
        }
    else:  # Distraction
        return {
            "action": "remove",
            "text": "❌ Consider removing or deprioritizing",
            "type": "danger"
        }

def generate_mock_data() -> AnalysisResult:
    """Generate mock data for testing"""
    mock_tickets = [
        Ticket(
            key="PROJ-001",
            summary="Implement user authentication system",
            description="Build a secure authentication system with JWT tokens and role-based access control",
            alignmentScore=85,
            category="core_value",
            rationale="Strong alignment with security and user experience principles",
            quickSuggestion=generate_quick_suggestion(85, "Implement user authentication system", "core_value"),
            strategicComment=generate_strategic_comment({
                'alignmentScore': 85,
                'category': 'core_value',
                'summary': 'Implement user authentication system',
                'rationale': 'Strong alignment with security and user experience principles',
                'matched_principles': ['Security', 'User Experience']
            })
        ),
        Ticket(
            key="PROJ-002", 
            summary="Add dark mode toggle",
            description="Implement a dark/light mode toggle for better user experience",
            alignmentScore=72,
            category="strategic_enabler",
            rationale="Supports user experience goals but not core business value",
            quickSuggestion=generate_quick_suggestion(72, "Add dark mode toggle", "strategic_enabler")
        ),
        Ticket(
            key="PROJ-003",
            summary="Refactor legacy codebase",
            description="Clean up old code and improve maintainability",
            alignmentScore=45,
            category="drift",
            rationale="Technical debt work that doesn't directly serve user needs",
            suggestedSummary="Improve core user workflow performance",
            suggestedDescription="Optimize critical user paths by refactoring legacy components that impact user experience",
            quickSuggestion=generate_quick_suggestion(45, "Refactor legacy codebase", "drift"),
            strategicComment=generate_strategic_comment({
                'alignmentScore': 45,
                'category': 'drift',
                'summary': 'Refactor legacy codebase',
                'rationale': 'Technical debt work that doesn\'t directly serve user needs',
                'matched_principles': [],
                'suggestedSummary': 'Improve core user workflow performance'
            })
        ),
        Ticket(
            key="PROJ-004",
            summary="Add confetti animation",
            description="Add celebratory animations when users complete tasks",
            alignmentScore=25,
            category="distraction",
            rationale="Nice-to-have feature that doesn't align with core business objectives",
            suggestedSummary="Enhance task completion feedback",
            suggestedDescription="Improve user satisfaction with meaningful feedback when completing critical workflows",
            quickSuggestion=generate_quick_suggestion(25, "Add confetti animation", "distraction"),
            strategicComment=generate_strategic_comment({
                'alignmentScore': 25,
                'category': 'distraction',
                'summary': 'Add confetti animation',
                'rationale': 'Nice-to-have feature that doesn\'t align with core business objectives',
                'matched_principles': [],
                'suggestedSummary': 'Enhance task completion feedback'
            })
        ),
        Ticket(
            key="PROJ-005",
            summary="Implement advanced analytics dashboard",
            description="Create comprehensive analytics for user behavior tracking",
            alignmentScore=88,
            category="core_value",
            rationale="Directly supports data-driven decision making and business intelligence",
            quickSuggestion=generate_quick_suggestion(88, "Implement advanced analytics dashboard", "core_value")
        ),
        Ticket(
            key="PROJ-006",
            summary="Add social media sharing",
            description="Allow users to share achievements on social platforms",
            alignmentScore=35,
            category="distraction", 
            rationale="Feature that diverts focus from core product value",
            quickSuggestion=generate_quick_suggestion(35, "Add social media sharing", "distraction")
        ),
        Ticket(
            key="PROJ-007",
            summary="Optimize API response times",
            description="Improve backend performance for faster user interactions",
            alignmentScore=78,
            category="strategic_enabler",
            rationale="Enables better user experience but is infrastructure-focused",
            quickSuggestion=generate_quick_suggestion(78, "Optimize API response times", "strategic_enabler")
        ),
        Ticket(
            key="PROJ-008",
            summary="Implement real-time notifications",
            description="Add push notifications for important user events",
            alignmentScore=82,
            category="core_value",
            rationale="Critical for user engagement and retention",
            quickSuggestion=generate_quick_suggestion(82, "Implement real-time notifications", "core_value")
        )
    ]
    
    executive_summary = """**Strategic Health Assessment: 67/100**

Our current sprint shows mixed strategic alignment with several areas requiring immediate attention. While we have strong core value initiatives (3 tickets, 38%), we're also investing significant effort in distractions that don't serve our users.

**Key Insights:**
• **Core Value Strength**: Authentication system and analytics dashboard demonstrate solid commitment to user security and data-driven decisions [[PROJ-001, PROJ-005, PROJ-007]]
• **Strategic Drift Alert**: 25% of tickets (2/8) are categorized as distractions - this is above our 15% threshold [[PROJ-004, PROJ-008]]
• **Performance Focus**: API optimization and real-time notifications show good technical foundation building [[PROJ-003, PROJ-006]]

**Bottom Line**: We're building meaningful features but getting distracted by nice-to-haves. The team needs to recommit to user-centric outcomes over feature completeness.

**📋 Next Steps:**
• Review ticket priorities based on alignment scores
• Focus sprint planning on Core Value tickets  
• Address or defer Distraction category tickets
• Implement strategic alignment review for future work
• Schedule strategic alignment checkpoint for next sprint

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
        
        # Check if we should use test mode (no real Jira connection)
        # Default to false to use real Jira
        use_test_mode = os.getenv("STEVE_TEST_MODE", "false").lower() == "true"
        print(f"Test mode: {use_test_mode} (False = using real Jira)")
        print(f"Environment TEST_MODE: {os.getenv('TEST_MODE', 'not set')}")
        print(f"Environment STEVE_TEST_MODE: {os.getenv('STEVE_TEST_MODE', 'not set')}")
        
        # Run STEVE analysis using crew_steve
        result = await asyncio.get_event_loop().run_in_executor(
            None, 
            lambda: crew_main(
                review_mode=request.mode,
                project_key=project_key,
                test_mode=use_test_mode,  # Uses real Jira by default (false)
                dry_run=False  # Update Jira tickets with analysis results
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
            
            ticket_data = {
                'alignmentScore': int(score),
                'category': category,
                'summary': alignment.get('summary', ''),
                'rationale': alignment.get('rationale', ''),
                'matched_principles': alignment.get('matched_principles', []),
                'suggestedSummary': alignment.get('suggested_summary')
            }
            
            # Use the actual Jira comment from crew_steve if available
            jira_comment = alignment.get('jira_comment', '')
            
            # Use backend rationale directly - it should now be varied and contextual
            rationale = alignment.get('rationale', '')
            
            tickets.append(Ticket(
                key=ticket_key,
                summary=alignment.get('summary', ''),
                description=alignment.get('description', ''),
                alignmentScore=int(score),
                category=category,
                rationale=rationale,
                suggestedSummary=alignment.get('suggested_summary'),
                suggestedDescription=alignment.get('suggested_description'),
                quickSuggestion=generate_quick_suggestion(int(score), alignment.get('summary', ''), category),
                strategicComment=jira_comment or generate_strategic_comment(ticket_data)
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
            
            # Count categories for better insights
            core_value_count = breakdown.get('core_value', 0)
            strategic_count = breakdown.get('strategic_enabler', 0)
            drift_count = breakdown.get('drift', 0)
            distraction_count = breakdown.get('distraction', 0)
            
            executive_summary = f"""**Strategic Health Assessment: {avg_score:.0f}/100 {health_emoji}**

Our current sprint analysis of {total_tickets} tickets reveals {health_status.lower()}.

**Key Insights:**
• **Core Value Focus**: {core_value_pct:.0f}% of work directly advances strategic goals ({core_value_count} tickets) [[{', '.join(tickets_by_category['core_value'])}]]
• **Strategic Support**: {strategic_pct:.0f}% provides foundational value ({strategic_count} tickets) [[{', '.join(tickets_by_category['strategic_enabler'])}]]
• **Drift Warning**: {drift_pct:.0f}% lacks clear strategic connection ({drift_count} tickets) [[{', '.join(tickets_by_category['drift'])}]]
• **Distraction Alert**: {distraction_pct:.0f}% actively diverts from priorities ({distraction_count} tickets) [[{', '.join(tickets_by_category['distraction'])}]]

**Performance Highlights:**

• Sprint velocity opportunity: Cut {distraction_count} distraction tickets to gain ~{distraction_pct*0.4:.0f}% velocity increase
• Strategic coverage: {core_value_count + strategic_count}/{total_tickets} tickets ({(core_value_pct + strategic_pct):.0f}%) aligned with business objectives
• Immediate wins: {len([t for t in tickets if 60 <= t.alignmentScore < 80])} tickets are one scope adjustment away from Core Value status
• Resource efficiency: {100 - distraction_pct - drift_pct:.0f}% of engineering effort directly supports strategic goals

"""
            
            # Generate intelligent, product-focused next steps
            next_steps = []
            mentioned_tickets = set()  # Track which tickets we've already mentioned
            
            # Analyze ticket relationships and patterns
            auth_tickets = [t for t in tickets if any(word in t.summary.lower() for word in ['auth', 'login', 'user', 'account', 'security'])]
            ui_tickets = [t for t in tickets if any(word in t.summary.lower() for word in ['ui', 'ux', 'interface', 'design', 'frontend', 'dark mode', 'animation'])]
            data_tickets = [t for t in tickets if any(word in t.summary.lower() for word in ['analytics', 'data', 'metrics', 'tracking', 'report'])]
            api_tickets = [t for t in tickets if any(word in t.summary.lower() for word in ['api', 'backend', 'performance', 'optimization', 'response'])]
            
            # Priority 1: Strategic ticket combinations
            if auth_tickets and len(auth_tickets) > 1:
                auth_keys = [t.key for t in auth_tickets[:2]]
                for key in auth_keys:
                    mentioned_tickets.add(key)
                next_steps.append(f"Combine {' and '.join(auth_keys)} into comprehensive 'User Identity & Access Management' epic - this creates a cohesive security narrative vs scattered features")
            
            # Priority 2: Reframe low performers with specific suggestions
            worst_tickets = sorted([t for t in tickets if t.alignmentScore < 40 and t.key not in mentioned_tickets], key=lambda x: x.alignmentScore)[:1]
            if worst_tickets:
                ticket = worst_tickets[0]
                mentioned_tickets.add(ticket.key)
                if 'animation' in ticket.summary.lower() or 'confetti' in ticket.summary.lower():
                    next_steps.append(f"Reframe {ticket.key} as 'User Achievement & Engagement System' - expand to include progress tracking, milestones, and retention metrics")
                elif 'refactor' in ticket.summary.lower():
                    next_steps.append(f"Pivot {ticket.key} from technical debt to 'Performance Enhancement for User Experience' - tie refactoring to specific user journey improvements")
                elif 'social' in ticket.summary.lower():
                    next_steps.append(f"Transform {ticket.key} into 'Community-Driven Growth Engine' - include viral loops, referral tracking, and network effects")
                else:
                    next_steps.append(f"Revise {ticket.key} to include measurable user outcomes - add success metrics, user stories, and business KPIs")
            
            # Priority 3: Elevate mid-range tickets with specific enhancements
            mid_tickets = [t for t in tickets if 50 <= t.alignmentScore < 75 and t.key not in mentioned_tickets]
            if mid_tickets:
                ticket = mid_tickets[0]
                mentioned_tickets.add(ticket.key)
                if 'api' in ticket.summary.lower() or 'performance' in ticket.summary.lower():
                    next_steps.append(f"Enhance {ticket.key} scope: Add user-facing performance metrics dashboard showing impact on customer experience")
                elif 'notification' in ticket.summary.lower():
                    next_steps.append(f"Expand {ticket.key}: Include intelligent notification preferences, ML-driven timing, and engagement analytics")
                elif 'dark mode' in ticket.summary.lower() or 'theme' in ticket.summary.lower():
                    next_steps.append(f"Elevate {ticket.key}: Position as accessibility initiative supporting WCAG compliance and inclusive design")
                else:
                    next_steps.append(f"Strengthen {ticket.key}: Add A/B testing framework, success metrics, and rollback strategy")
            
            # Priority 4: Create strategic initiatives from patterns
            if ui_tickets and api_tickets:
                # Find tickets not yet mentioned
                ui_candidates = [t for t in ui_tickets if t.key not in mentioned_tickets]
                api_candidates = [t for t in api_tickets if t.key not in mentioned_tickets]
                
                if ui_candidates and api_candidates:
                    ui_key = ui_candidates[0].key
                    api_key = api_candidates[0].key
                    mentioned_tickets.add(ui_key)
                    mentioned_tickets.add(api_key)
                    next_steps.append(f"Create unified initiative: Combine {ui_key} (frontend) with {api_key} (backend) for end-to-end feature delivery")
            
            if data_tickets:
                data_candidates = [t for t in data_tickets if t.key not in mentioned_tickets]
                if data_candidates:
                    data_key = data_candidates[0].key
                    mentioned_tickets.add(data_key)
                    next_steps.append(f"Build 'Data-Driven Decision Platform' by connecting {data_key} to product analytics and user behavior insights")
            
            # Priority 5: Sprint-level strategic guidance
            if avg_score < 60:
                problematic = [t for t in tickets if t.alignmentScore < 50]
                if problematic:
                    next_steps.append(f"Emergency pivot: {len(problematic)} tickets need immediate reframing. Schedule 2-hour workshop to align on product vision")
            elif avg_score < 75:
                improvable = [t for t in tickets if 60 <= t.alignmentScore < 80 and t.key not in mentioned_tickets]
                if improvable:
                    tickets_to_mention = improvable[:2]
                    for t in tickets_to_mention:
                        mentioned_tickets.add(t.key)
                    next_steps.append(f"Quick wins available: Add user metrics to {', '.join([t.key for t in tickets_to_mention])} to push into Core Value territory")
            else:
                top_performer = max([t for t in tickets if t.key not in mentioned_tickets], key=lambda x: x.alignmentScore, default=None) if tickets else None
                if top_performer:
                    mentioned_tickets.add(top_performer.key)
                    next_steps.append(f"Scale success pattern from {top_performer.key}: Apply same user-centric framing to next sprint's backlog")
            
            # Add context-aware suggestion based on category distribution
            if distraction_count >= 3:
                next_steps.append("Consider 'Innovation Friday' approach: Dedicate 20% time to transform distraction tickets into strategic experiments")
            elif drift_count >= 3:
                next_steps.append("Implement 'North Star' metric: All drift tickets must connect to single primary KPI before approval")
            
            executive_summary += "**📋 Next Steps:**\n"
            for step in next_steps[:5]:  # Top 5 actions
                executive_summary += f"• {step}\n"
            
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

class NotionExportRequest(BaseModel):
    analysisResult: AnalysisResult
    projectKey: str = "PROJ"
    mode: str = "execution"

class NotionPublishRequest(BaseModel):
    summary: str
    token: str
    databaseId: str
    tickets: List[Ticket]

@app.post("/publish-to-notion")
async def publish_to_notion(request: NotionPublishRequest):
    """Publish executive summary to Notion with user-provided credentials"""
    try:
        # Create Notion API headers
        headers = {
            "Authorization": f"Bearer {request.token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        
        # Group tickets by category
        core_value_tickets = [t for t in request.tickets if t.category == "core_value"]
        strategic_enabler_tickets = [t for t in request.tickets if t.category == "strategic_enabler"]
        drift_tickets = [t for t in request.tickets if t.category == "drift"]
        distraction_tickets = [t for t in request.tickets if t.category == "distraction"]
        
        # Calculate metrics
        total_tickets = len(request.tickets)
        avg_score = sum(t.alignmentScore for t in request.tickets) / total_tickets if total_tickets > 0 else 0
        
        # Create a new page in the database
        page_data = {
            "parent": {"database_id": request.databaseId},
            "properties": {
                "Name": {
                    "title": [
                        {
                            "text": {
                                "content": f"STEVE Strategic Report - Test Sprint {datetime.now().strftime('%Y-%m-%d')}"
                            }
                        }
                    ]
                }
            },
            "children": []
        }
        
        # Add header with title and strategic health
        page_data["children"].extend([
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"text": {"content": f"📊 STEVE Strategic Analysis Report"}}]
                }
            },
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [
                        {"text": {"content": f"Strategic Health Assessment: {avg_score:.0f}/100 "}},
                        {"text": {"content": f"{'🟢' if avg_score >= 80 else '🟡' if avg_score >= 60 else '🟠' if avg_score >= 40 else '🔴'}"}}
                    ],
                    "icon": {"emoji": "🎯"},
                    "color": "gray_background"
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": f"Analyzed {total_tickets} tickets • {len(core_value_tickets)} Core Value • {len(strategic_enabler_tickets)} Strategic Enablers • {len(drift_tickets)} Drift • {len(distraction_tickets)} Distractions"}}]
                }
            },
            {
                "object": "block",
                "type": "divider",
                "divider": {}
            }
        ])
        
        # Add Executive Summary section if provided
        if request.summary:
            page_data["children"].extend([
                {
                    "object": "block", 
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"text": {"content": "📊 Executive Summary"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "divider",
                    "divider": {}
                }
            ])
            
            # Parse the executive summary into sections
            summary_lines = request.summary.split('\n')
            current_section = None
            next_steps = []
            
            for line in summary_lines:
                line = line.strip()
                if not line:
                    continue
                
                # Handle Key Insights section
                if line.startswith('**Key Insights:**') or line.startswith('Key Insights:'):
                    page_data["children"].append({
                        "object": "block",
                        "type": "heading_3",
                        "heading_3": {
                            "rich_text": [{"text": {"content": "🔍 Key Insights"}}]
                        }
                    })
                    current_section = 'insights'
                    continue
                
                # Handle Performance Highlights section
                elif line.startswith('**Performance Highlights:**') or line.startswith('Performance Highlights:'):
                    page_data["children"].append({
                        "object": "block",
                        "type": "heading_3",
                        "heading_3": {
                            "rich_text": [{"text": {"content": "⚡ Performance Highlights"}}]
                        }
                    })
                    current_section = 'highlights'
                    continue
                
                # Handle Next Steps section - skip it here, we'll add it as a separate section
                elif line.startswith('**Next Steps:**') or line.startswith('Next Steps:'):
                    current_section = 'steps'
                    continue
                
                # Process bullet points
                if line.startswith('*') or line.startswith('-') or line.startswith('•'):
                    bullet_text = line.lstrip('*-• ').replace('**', '')
                    if current_section == 'steps':
                        # Collect next steps for later
                        next_steps.append(bullet_text)
                    else:
                        # Use bullet points for other sections
                        page_data["children"].append({
                            "object": "block",
                            "type": "bulleted_list_item",
                            "bulleted_list_item": {
                                "rich_text": [{"text": {"content": bullet_text}}]
                            }
                        })
                else:
                    # Regular paragraph
                    clean_text = line.replace('**', '')
                    if clean_text:
                        page_data["children"].append({
                            "object": "block",
                            "type": "paragraph",
                            "paragraph": {
                                "rich_text": [{"text": {"content": clean_text}}]
                            }
                        })
            
            page_data["children"].append({
                "object": "block",
                "type": "divider",
                "divider": {}
            })
        
        # Add Next Steps section if we collected any
        if next_steps:
            page_data["children"].extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"text": {"content": "📌 Next Steps"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"text": {"content": "Immediate actions to improve strategic alignment"}}]
                    }
                }
            ])
            
            for step in next_steps:
                page_data["children"].append({
                    "object": "block",
                    "type": "to_do",
                    "to_do": {
                        "rich_text": [{"text": {"content": step}}],
                        "checked": False
                    }
                })
            
            page_data["children"].append({
                "object": "block",
                "type": "divider",
                "divider": {}
            })
        
        # Add Core Value tickets
        if core_value_tickets:
            page_data["children"].extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"text": {"content": "🟢 Core Value Tickets"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"text": {"content": f"High-impact work that directly advances strategic goals ({len(core_value_tickets)} tickets)"}}]
                    }
                }
            ])
            
            for ticket in sorted(core_value_tickets, key=lambda x: x.alignmentScore, reverse=True):
                page_data["children"].extend([
                    {
                        "object": "block",
                        "type": "callout",
                        "callout": {
                            "rich_text": [
                                {"text": {"content": f"#{ticket.key} - 🟢 {ticket.alignmentScore}\n"}},
                                {"text": {"content": f"Category: Core Value\n"}},
                                {"text": {"content": f"Summary: {ticket.summary}\n"}},
                                {"text": {"content": f"Action: {ticket.rationale}"}}
                            ],
                            "icon": {"emoji": "🟢"},
                            "color": "green_background"
                        }
                    }
                ])
            
            # Add spacing
            page_data["children"].append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": ""}}]
                }
            })
        
        # Add Strategic Enabler tickets
        if strategic_enabler_tickets:
            page_data["children"].extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"text": {"content": "🔵 Strategic Enabler Tickets"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"text": {"content": f"Work that supports strategic objectives ({len(strategic_enabler_tickets)} tickets)"}}]
                    }
                }
            ])
            
            for ticket in sorted(strategic_enabler_tickets, key=lambda x: x.alignmentScore, reverse=True):
                page_data["children"].extend([
                    {
                        "object": "block",
                        "type": "callout",
                        "callout": {
                            "rich_text": [
                                {"text": {"content": f"#{ticket.key} - 🔵 {ticket.alignmentScore}\n"}},
                                {"text": {"content": f"Category: Strategic Enabler\n"}},
                                {"text": {"content": f"Summary: {ticket.summary}\n"}},
                                {"text": {"content": f"Action: {ticket.rationale}"}}
                            ],
                            "icon": {"emoji": "🔵"},
                            "color": "blue_background"
                        }
                    }
                ])
        
        # Add Drift tickets
        if drift_tickets:
            page_data["children"].extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"text": {"content": "🟡 Drift Tickets"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"text": {"content": f"Well-intentioned work with weak strategic connection ({len(drift_tickets)} tickets)"}}]
                    }
                }
            ])
            
            for ticket in sorted(drift_tickets, key=lambda x: x.alignmentScore, reverse=True):
                page_data["children"].extend([
                    {
                        "object": "block",
                        "type": "callout",
                        "callout": {
                            "rich_text": [
                                {"text": {"content": f"#{ticket.key} - 🟡 {ticket.alignmentScore}\n"}},
                                {"text": {"content": f"Category: Drift\n"}},
                                {"text": {"content": f"Summary: {ticket.summary}\n"}},
                                {"text": {"content": f"Action: {ticket.rationale}"}}
                            ],
                            "icon": {"emoji": "🟡"},
                            "color": "yellow_background"
                        }
                    }
                ])
        
        # Add Distraction tickets
        if distraction_tickets:
            page_data["children"].extend([
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"text": {"content": "🔴 Distraction Tickets"}}]
                    }
                },
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"text": {"content": f"Work with no meaningful strategic alignment ({len(distraction_tickets)} tickets)"}}]
                    }
                }
            ])
            
            for ticket in sorted(distraction_tickets, key=lambda x: x.alignmentScore, reverse=True):
                page_data["children"].extend([
                    {
                        "object": "block",
                        "type": "callout",
                        "callout": {
                            "rich_text": [
                                {"text": {"content": f"#{ticket.key} - 🔴 {ticket.alignmentScore}\n"}},
                                {"text": {"content": f"Category: Distraction\n"}},
                                {"text": {"content": f"Summary: {ticket.summary}\n"}},
                                {"text": {"content": f"Action: {ticket.rationale}"}}
                            ],
                            "icon": {"emoji": "🔴"},
                            "color": "red_background"
                        }
                    }
                ])
        
        # Add Strategic Blind Spots section
        page_data["children"].extend([
            {
                "object": "block",
                "type": "divider",
                "divider": {}
            },
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"text": {"content": "💭 Strategic Blind Spots"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": "Critical gaps and missing opportunities in your current sprint"}}]
                }
            }
        ])
        
        # Add dynamic blind spots based on analysis
        if len(core_value_tickets) == 0:
            page_data["children"].append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"text": {"content": "No Core Value tickets in current sprint. Your highest priority work is missing from the backlog."}}]
                }
            })
        
        if len(distraction_tickets) > total_tickets * 0.3:
            page_data["children"].append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"text": {"content": f"{len(distraction_tickets)} Distraction tickets ({len(distraction_tickets)/total_tickets*100:.0f}% of sprint). Too much energy diverted from strategic goals."}}]
                }
            })
        
        if avg_score < 60:
            page_data["children"].append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"text": {"content": f"Average strategic alignment of {avg_score:.0f}/100 indicates systemic drift from product vision."}}]
                }
            })
        
        # Add Strategic Recommendations section
        page_data["children"].extend([
            {
                "object": "block",
                "type": "divider",
                "divider": {}
            },
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"text": {"content": "🎯 Strategic Recommendations"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": "Actionable steps to improve strategic alignment"}}]
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": f"🔥 Focus development on Core Value tickets ({len(core_value_tickets)} tickets{': ' + ', '.join([t.key for t in core_value_tickets]) if core_value_tickets else ''})"}}],
                    "checked": False
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": f"⏸️ Deprioritize or pause Distraction tickets ({len(distraction_tickets)} tickets{': ' + ', '.join([t.key for t in distraction_tickets]) if distraction_tickets else ''})"}}],
                    "checked": False
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": "📏 Add 'Strategic Principle' as a required tag in all future tickets"}}],
                    "checked": False
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": "✅ Run STEVE analysis pre-sprint during backlog grooming"}}],
                    "checked": False
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": "🚫 Flag and halt any new ticket scoring below 40 before grooming"}}],
                    "checked": False
                }
            }
        ])
        
        # Create the page
        response = requests.post(
            "https://api.notion.com/v1/pages",
            headers=headers,
            json=page_data
        )
        
        print(f"Notion API Response Status: {response.status_code}")
        print(f"Notion API Response: {response.text[:500]}")  # First 500 chars
        
        if response.status_code == 200:
            page_info = response.json()
            page_url = page_info.get("url", "")
            print(f"Notion page created successfully: {page_url}")
            return {"success": True, "url": page_url}
        else:
            error_data = response.json()
            error_msg = error_data.get("message", "Unknown error")
            error_code = error_data.get("code", "")
            print(f"Notion API Error: {error_code} - {error_msg}")
            return {"success": False, "error": f"{error_code}: {error_msg}"}
            
    except Exception as e:
        print(f"Error publishing to Notion: {e}")
        return {"success": False, "error": str(e)}

@app.post("/export-notion")
async def export_to_notion(request: NotionExportRequest):
    """Export analysis results to Notion (legacy endpoint)"""
    try:
        # Import Notion integration utilities
        from utils.notion_integration import create_notion_manager
        
        # Generate full structured report
        # Convert frontend result to the format expected by steve.py
        analysis_data = {
            'alignments': [],
            'executive_narrative': request.analysisResult.executiveSummary,
            'summary': {
                'total_tickets': len(request.analysisResult.tickets),
                'average_alignment_score': sum(t.alignmentScore for t in request.analysisResult.tickets) / len(request.analysisResult.tickets) if request.analysisResult.tickets else 0,
                'alignment_breakdown': {},
                'recommendations': []
            }
        }
        
        # Convert tickets to alignments format
        for ticket in request.analysisResult.tickets:
            analysis_data['alignments'].append({
                'ticket_key': ticket.key,
                'summary': ticket.summary,
                'description': ticket.description,
                'score': ticket.alignmentScore,
                'category': ticket.category,
                'rationale': ticket.rationale,
                'jira_comment': ticket.strategicComment
            })
        
        # Calculate breakdown
        for ticket in request.analysisResult.tickets:
            category = ticket.category
            if category not in analysis_data['summary']['alignment_breakdown']:
                analysis_data['summary']['alignment_breakdown'][category] = 0
            analysis_data['summary']['alignment_breakdown'][category] += 1
        
        # Generate the structured report (similar to steve.py)
        from datetime import datetime
        
        # Build the report content
        report = f"""# STEVE Strategic Analysis Report
Project: {request.projectKey}
Mode: {request.mode}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Executive Summary
{request.analysisResult.executiveSummary}

## Ticket Analysis
"""
        
        # Add ticket details
        for ticket in sorted(request.analysisResult.tickets, key=lambda x: x.alignmentScore, reverse=True):
            report += f"\n### {ticket.key}: {ticket.summary}"
            report += f"\n**Score**: {ticket.alignmentScore}/100 ({ticket.category.replace('_', ' ').title()})"
            report += f"\n**Rationale**: {ticket.rationale}\n"
        
        # Create Notion manager and save
        notion_manager = create_notion_manager()
        
        if not notion_manager.authenticate():
            return {"success": False, "error": "Failed to authenticate with Notion API"}
        
        # Extract sprint name from tickets if available
        sprint_name = "Current Sprint"  # Default
        
        # Create the Notion page
        page_title = f"STEVE Analysis - {request.projectKey} - {datetime.now().strftime('%Y-%m-%d')}"
        if sprint_name != "Current Sprint":
            page_title = f"STEVE Analysis - {sprint_name} - {datetime.now().strftime('%Y-%m-%d')}"
        
        page_url = notion_manager.create_executive_summary_page(
            summary_content=report,
            sprint_name=sprint_name
        )
        
        if page_url:
            return {
                "success": True,
                "notionUrl": page_url,
                "pageId": None  # NotionManager returns URL directly
            }
        else:
            return {"success": False, "error": "Failed to create Notion page"}
            
    except Exception as e:
        print(f"Error exporting to Notion: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

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