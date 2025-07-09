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
        """Format alignment result as Jira comment with structured sections"""
        divider = "⸻"
        
        # Header
        comment = f"{divider}\n\n"
        
        # Strategic Alignment Summary
        comment += "🎯 **Strategic Alignment Summary**\n"
        category_display = result.category.value.replace('_', ' ').title()
        comment += f"**Score**: {result.alignment_score}/100 — {category_display}\n"
        
        # Matched principles
        if result.matched_principles:
            comment += f"**Matched Principles**: {', '.join(result.matched_principles)}\n"
        else:
            comment += "**Matched Principles**: None\n"
        
        # Add explanation of score calculation
        comment += self._get_score_explanation(result)
        comment += f"\n\n{divider}\n\n"
        
        # Why This Aligns/Doesn't Align
        if result.alignment_score >= 60:
            comment += "🧠 **Why This Aligns**\n"
        else:
            comment += "🧠 **Why This Doesn't Align**\n"
        
        # Use the rationale but expand it
        comment += self._expand_rationale(result)
        comment += f"\n\n{divider}\n\n"
        
        # Recommendation
        comment += "🧭 **Recommendation**\n"
        comment += self._get_recommendation(result, rewrite)
        
        # Footer
        comment += f"\n\n{divider}\n\n"
        comment += "_Generated by STEVE — Strategic Ticket Evaluation & Vision Enforcer_"
        
        return comment
    
    def _get_score_explanation(self, result: AlignmentResult) -> str:
        """Generate explanation of how the score was calculated"""
        score = result.alignment_score
        
        if score >= 90:
            keyword_mention = "with strong keyword matches and direct principle alignment" if result.matched_principles else "through its core impact on our mission"
            return f"This ticket directly accelerates our core mission {keyword_mention}. All top-tier principles are strongly represented."
        elif score >= 60:
            keyword_mention = "with clear keyword presence" if result.matched_principles else "through supporting infrastructure"
            return f"This work supports strategic objectives {keyword_mention}. It provides necessary enablement for core value delivery."
        elif score >= 40:
            return "The alignment with strategic principles is weak, showing limited keyword matches and unclear value creation. Connection to mission is ambiguous."
        else:
            return "No meaningful alignment detected with our strategic principles. Absence of relevant keywords and no clear connection to mission or value creation."
    
    def _expand_rationale(self, result: AlignmentResult) -> str:
        """Expand the rationale with more strategic context"""
        # Start with the original rationale
        expanded = result.rationale
        
        # Add strategic context based on score category and infer ticket type
        ticket_type = self._infer_ticket_type(result)
        
        if result.alignment_score >= 90:
            expanded += f" This {ticket_type} work represents a direct advancement of our core strategic objectives. "
            expanded += "It introduces technical leverage and reinforces our market differentiation. "
            expanded += "The impact on product vision is immediate and measurable."
        elif result.alignment_score >= 60:
            expanded += f" While this {ticket_type} work is not directly mission-critical, it provides necessary infrastructure for future core value delivery. "
            expanded += "It complements our strategic initiatives and enables stronger execution capabilities. "
            expanded += "The foundational nature of this work supports long-term strategic goals."
        elif result.alignment_score >= 40:
            expanded += f" This {ticket_type} work appears well-intentioned but lacks clear strategic connection. "
            expanded += "The impact on our product vision is unclear, and the value creation pathway is ambiguous. "
            expanded += "Without reframing, this work risks becoming a resource drain with limited strategic return."
        else:
            expanded += f" This {ticket_type} work provides no identifiable connection to any strategic principle. "
            expanded += "It carries significant opportunity cost that may slow progress on mission-critical objectives. "
            expanded += "There is no clear benefit to builders, no integration leverage, and no enhancement to our core systems."
        
        return expanded
    
    def _get_recommendation(self, result: AlignmentResult, rewrite: Optional[Dict[str, str]]) -> str:
        """Generate strategic recommendation based on alignment score"""
        score = result.alignment_score
        recommendation = ""
        
        if score >= 90:
            # Core Value
            recommendation += "• ✅ **Action**: Prioritize and fast-track to execution\n"
            recommendation += "• 💡 **Rationale**: This creates foundational infrastructure with clear ROI in both product value and strategic momentum"
        elif score >= 60:
            # Strategic Enabler
            recommendation += "• ✅ **Action**: Keep in roadmap and schedule soon\n"
            recommendation += "• 💡 **Rationale**: Enables stronger Core Value delivery down the line. Ensure this is framed and communicated internally as platform-enabling, not standalone"
        elif score >= 40:
            # Drift
            recommendation += "• 🚧 **Action**: Reframe to improve strategic connection\n"
            recommendation += "• 💡 **Rationale**: If reframed to emphasize how this work enables builders or supports agent architecture, it could rise to Strategic Enabler level\n"
            if rewrite and 'revised_summary' in rewrite:
                recommendation += f"• ✏️ **Suggested Title**: \"{rewrite['revised_summary']}\""
            else:
                recommendation += "• ✏️ **Suggestion**: Reframe to emphasize builder enablement or agent capabilities"
        else:
            # Distraction
            recommendation += "• 🚫 **Action**: Deprioritize or archive\n"
            recommendation += "• 💡 **Rationale**: Completing this work would consume capacity with no return. Unless reframed toward strategic value, it should not proceed\n"
            if rewrite and 'revised_summary' in rewrite:
                recommendation += f"• ✏️ **Optional**: Consider reframing as \"{rewrite['revised_summary']}\" to add strategic value"
            else:
                recommendation += "• ✏️ **Optional**: Reconsider if this can enhance builder experience — if not, discard"
        
        return recommendation
    
    def _infer_ticket_type(self, result: AlignmentResult) -> str:
        """Infer the type of ticket based on its content and metadata"""
        # Use rationale and matched principles to infer type
        text = (result.ticket_key + " " + result.rationale).lower()
        
        if any(word in text for word in ['ui', 'interface', 'design', 'ux', 'frontend', 'style', 'css', 'visual']):
            return "UI/UX"
        elif any(word in text for word in ['agent', 'ai', 'automation', 'pipeline', 'orchestration', 'multi-agent']):
            return "agent architecture"
        elif any(word in text for word in ['api', 'backend', 'database', 'infrastructure', 'infra', 'performance', 'integration']):
            return "infrastructure"
        elif any(word in text for word in ['marketing', 'branding', 'content', 'campaign', 'brand']):
            return "marketing"
        elif any(word in text for word in ['bug', 'fix', 'error', 'issue', 'problem', 'critical']):
            return "bug fix"
        elif any(word in text for word in ['feature', 'enhancement', 'improvement', 'implement']):
            return "feature"
        else:
            return "development"
    
    def _update_custom_fields(self, issue: Issue, result: AlignmentResult):
        """Update custom fields with alignment data"""
        updates = {}
        
        # Get custom field IDs
        steve_score_field = self._get_custom_field_id("Steve Alignment Score")
        steve_category_field = self._get_custom_field_id("Steve Category")
        
        if steve_score_field:
            updates[steve_score_field] = result.alignment_score
        
        if steve_category_field:
            updates[steve_category_field] = result.category.value.replace('_', ' ').title()
        
        if updates:
            try:
                issue.update(fields=updates)
                logger.info(f"Updated custom fields for {issue.key}")
            except Exception as e:
                logger.warning(f"Could not update custom fields for {issue.key}: {e}")
    
    def _get_custom_field_id(self, field_name: str) -> Optional[str]:
        """Get custom field ID by name"""
        try:
            fields = self.jira.fields()
            for field in fields:
                if field['name'] == field_name:
                    return field['id']
        except Exception as e:
            logger.warning(f"Could not get custom field ID for {field_name}: {e}")
        return None
    
    def create_steve_custom_fields(self):
        """Create Steve custom fields if they don't exist"""
        if self.test_mode or self.dry_run:
            logger.info("[DRY RUN] Would create Steve custom fields")
            return
        
        logger.info("Checking for Steve custom fields...")
        
        # Check if Steve Score field exists
        steve_score_field = self._get_custom_field_id("Steve Alignment Score")
        if not steve_score_field:
            logger.info("Steve Alignment Score field not found. Please create it manually in Jira:")
            logger.info("1. Go to Jira Settings > Issues > Custom Fields")
            logger.info("2. Create a new Number field named 'Steve Alignment Score'")
            logger.info("3. Add it to the appropriate screens")
            logger.info("4. This field will allow sorting tickets by Steve score")
        else:
            logger.info("✅ Steve Alignment Score field found")
        
        # Check if Steve Category field exists
        steve_category_field = self._get_custom_field_id("Steve Category")
        if not steve_category_field:
            logger.info("Steve Category field not found. Please create it manually in Jira:")
            logger.info("1. Go to Jira Settings > Issues > Custom Fields")
            logger.info("2. Create a new Text field named 'Steve Category'")
            logger.info("3. Add it to the appropriate screens")
        else:
            logger.info("✅ Steve Category field found")
    
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