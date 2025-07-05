import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from jira import JIRA, Issue
from dotenv import load_dotenv
import yaml

from core.schemas import TicketSchema, AlignmentResult, ReviewMode
from utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)


class JiraClient:
    def __init__(self, test_mode: bool = False, dry_run: bool = False):
        self.test_mode = test_mode
        self.dry_run = dry_run
        
        if not test_mode:
            self.jira = JIRA(
                server=os.getenv("JIRA_URL"),
                basic_auth=(os.getenv("JIRA_EMAIL"), os.getenv("JIRA_API_TOKEN"))
            )
        else:
            self.jira = None
            logger.info("Running in test mode - no Jira connection")
        
        self.project_key = os.getenv("JIRA_PROJECT_KEY", "PROJ")
        self._load_settings()
    
    def _load_settings(self):
        with open("config/settings.yaml", "r") as f:
            self.settings = yaml.safe_load(f)["jira"]
    
    def fetch_tickets(self, review_mode: ReviewMode, max_results: int = 1000) -> List[TicketSchema]:
        """Fetch tickets from Jira based on review mode"""
        if self.test_mode:
            return self._generate_test_tickets()
        
        # Load JQL templates
        with open("config/agents.yaml", "r") as f:
            jql_templates = yaml.safe_load(f)["agents"]["ticket_ingestor"]["jql_templates"]
        
        jql = jql_templates[review_mode.value].format(PROJECT_KEY=self.project_key)
        logger.info(f"Fetching tickets with JQL: {jql}")
        
        issues = self.jira.search_issues(jql, maxResults=max_results, expand="changelog")
        
        tickets = []
        for issue in issues:
            ticket = self._parse_issue(issue)
            tickets.append(ticket)
        
        logger.info(f"Fetched {len(tickets)} tickets")
        return tickets
    
    def _parse_issue(self, issue: Issue) -> TicketSchema:
        """Parse Jira issue into TicketSchema"""
        fields = issue.fields
        
        return TicketSchema(
            key=issue.key,
            summary=fields.summary,
            description=fields.description or "",
            status=fields.status.name,
            priority=fields.priority.name if fields.priority else "Medium",
            assignee=fields.assignee.displayName if fields.assignee else None,
            labels=fields.labels or [],
            sprint=self._get_sprint_name(fields),
            created=datetime.fromisoformat(fields.created.replace('Z', '+00:00')),
            updated=datetime.fromisoformat(fields.updated.replace('Z', '+00:00')),
            story_points=getattr(fields, 'customfield_10016', None),  # Common story points field
            epic_link=getattr(fields, 'customfield_10014', None)  # Common epic link field
        )
    
    def _get_sprint_name(self, fields) -> Optional[str]:
        """Extract sprint name from custom fields"""
        sprint_field = getattr(fields, 'customfield_10020', None)  # Common sprint field
        if sprint_field and len(sprint_field) > 0:
            sprint_data = sprint_field[0]
            if isinstance(sprint_data, str) and 'name=' in sprint_data:
                return sprint_data.split('name=')[1].split(',')[0]
        return None
    
    def update_ticket(self, ticket_key: str, alignment_result: AlignmentResult, rewrite: Optional[Dict[str, str]] = None):
        """Update Jira ticket with alignment results"""
        if self.test_mode or self.dry_run:
            logger.info(f"[DRY RUN] Would update ticket {ticket_key}")
            logger.info(f"  Score: {alignment_result.alignment_score}")
            logger.info(f"  Category: {alignment_result.category.value}")
            if rewrite:
                logger.info(f"  Rewrite suggestion: {rewrite}")
            return
        
        issue = self.jira.issue(ticket_key)
        
        # Add comment
        if self.settings["add_comments"]:
            comment = self._format_comment(alignment_result, rewrite)
            self.jira.add_comment(issue, comment)
        
        # Add labels
        if self.settings["add_labels"]:
            label = self.settings["labels"][alignment_result.category.value]
            issue.fields.labels.append(label)
            issue.update(fields={"labels": issue.fields.labels})
        
        # Update custom fields if they exist
        if self.settings["update_fields"]:
            self._update_custom_fields(issue, alignment_result)
        
        logger.info(f"Updated ticket {ticket_key}")
    
    def _format_comment(self, result: AlignmentResult, rewrite: Optional[Dict[str, str]]) -> str:
        """Format alignment result as Jira comment"""
        comment = f"{self.settings['comment_signature']}\n\n"
        comment += f"**Alignment Score**: {result.alignment_score}/100 ({result.category.value.replace('_', ' ').title()})\n\n"
        comment += f"**Rationale**: {result.rationale}\n\n"
        
        if result.matched_principles:
            comment += f"**Matched Principles**: {', '.join(result.matched_principles)}\n\n"
        
        if rewrite:
            comment += "**Strategic Realignment Suggestion**:\n"
            comment += f"- **Summary**: {rewrite['revised_summary']}\n"
            comment += f"- **Description**: {rewrite['revised_description']}\n"
        
        return comment
    
    def _update_custom_fields(self, issue: Issue, result: AlignmentResult):
        """Update custom fields with alignment data"""
        # This would need to be configured based on actual Jira instance
        # Custom field IDs vary by installation
        updates = {}
        
        # Example custom fields - these would need to be discovered/configured
        # updates['customfield_10100'] = result.alignment_score
        # updates['customfield_10101'] = result.category.value
        # updates['customfield_10102'] = result.rationale
        
        if updates:
            issue.update(fields=updates)
    
    def _generate_test_tickets(self) -> List[TicketSchema]:
        """Generate test tickets for development"""
        test_tickets = [
            TicketSchema(
                key="TEST-1",
                summary="Add dark mode to improve user experience",
                description="Users have requested a dark mode option for better visibility",
                status="In Progress",
                priority="High",
                labels=["ui", "enhancement"],
                created=datetime.now(),
                updated=datetime.now()
            ),
            TicketSchema(
                key="TEST-2",
                summary="Refactor legacy authentication module",
                description="Old auth code is slow and unreliable",
                status="To Do",
                priority="Medium",
                labels=["tech-debt", "performance"],
                created=datetime.now(),
                updated=datetime.now()
            ),
            TicketSchema(
                key="TEST-3",
                summary="Add animated GIF support to chat",
                description="Users want to send GIFs in chat messages",
                status="To Do",
                priority="Low",
                labels=["feature"],
                created=datetime.now(),
                updated=datetime.now()
            ),
            TicketSchema(
                key="TEST-4",
                summary="Optimize API response times for better performance",
                description="Current API calls take 2-3 seconds, target is under 500ms",
                status="In Progress",
                priority="High",
                labels=["performance", "api"],
                created=datetime.now(),
                updated=datetime.now()
            ),
            TicketSchema(
                key="TEST-5",
                summary="Fix critical bug causing data loss on logout",
                description="Users report losing unsaved work when logging out",
                status="To Do",
                priority="Critical",
                labels=["bug", "reliability"],
                created=datetime.now(),
                updated=datetime.now()
            )
        ]
        
        logger.info(f"Generated {len(test_tickets)} test tickets")
        return test_tickets