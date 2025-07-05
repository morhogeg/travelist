"""
Data Collector for Steve
Handles all data gathering from Jira
"""

import os
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

from core.jira_client import JiraClient
from core.schemas import ReviewMode, TicketSchema
from utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)


def collect_jira_data(review_mode: ReviewMode, project_key: str = None, 
                      test_mode: bool = False) -> str:
    """
    Collect all Jira data and format it for CrewAI agents
    Returns formatted string that agents can easily parse
    """
    
    # Initialize Jira client
    jira_client = JiraClient(test_mode=test_mode)
    if project_key:
        jira_client.project_key = project_key
    
    logger.steve.info(f"Collecting data for project {jira_client.project_key}")
    
    # Fetch tickets
    tickets = jira_client.fetch_tickets(review_mode)
    
    if not tickets:
        return "No tickets found for analysis."
    
    # Format for agents
    formatted_data = f"""
JIRA TICKETS FOR ANALYSIS
Project: {jira_client.project_key}
Review Mode: {review_mode.value}
Total Tickets: {len(tickets)}
Collection Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

TICKET DATA:
"""
    
    for i, ticket in enumerate(tickets, 1):
        formatted_data += f"""
{i}. TICKET: {ticket.key}
   Summary: {ticket.summary}
   Description: {ticket.description or 'No description'}
   Status: {ticket.status}
   Priority: {ticket.priority or 'Not set'}
   Assignee: {ticket.assignee or 'Unassigned'}
   Labels: {', '.join(ticket.labels) if ticket.labels else 'No labels'}
   Sprint: {ticket.sprint or 'No sprint'}
   Story Points: {ticket.story_points or 'Not estimated'}
   Created: {ticket.created.strftime('%Y-%m-%d')}
   Updated: {ticket.updated.strftime('%Y-%m-%d')}
   Epic: {ticket.epic_link or 'No epic'}

"""
    
    logger.steve.section("COLLECT", f"Formatted {len(tickets)} tickets for analysis")
    
    return formatted_data


def load_principles_context() -> str:
    """Load company principles for agent context"""
    import yaml
    
    with open("config/principles.yaml", "r") as f:
        principles_data = yaml.safe_load(f)
    
    context = "COMPANY STRATEGIC PRINCIPLES:\n\n"
    
    for i, principle in enumerate(principles_data['principles'], 1):
        context += f"""{i}. {principle['name']} (Weight: {principle.get('weight', 1.0)})
   Description: {principle['description']}
   Keywords: {', '.join(principle['keywords'])}

"""
    
    context += f"""
ALIGNMENT THRESHOLDS:
- Core Value: ≥{principles_data['thresholds']['core_value']} points
- Strategic Enabler: ≥{principles_data['thresholds']['strategic_enabler']} points  
- Drift: ≥{principles_data['thresholds']['drift']} points
- Distraction: <{principles_data['thresholds']['drift']} points
"""
    
    return context


def collect_all_context(review_mode: ReviewMode, project_key: str = None,
                       test_mode: bool = False) -> Dict[str, str]:
    """
    Collect all context data needed by CrewAI agents
    Returns dictionary with formatted context strings
    """
    
    return {
        'tickets_data': collect_jira_data(review_mode, project_key, test_mode),
        'principles_context': load_principles_context(),
        'analysis_metadata': f"""
ANALYSIS METADATA:
- Mode: {review_mode.value}
- Project: {project_key or os.getenv('JIRA_PROJECT_KEY', 'PROJ')}
- Test Mode: {test_mode}
- Timestamp: {datetime.now().isoformat()}
"""
    }