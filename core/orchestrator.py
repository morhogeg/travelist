import os
from typing import Optional
from crewai import Crew

from .schemas import ReviewMode
from .jira_client import JiraClient
from agents.ticket_ingestor import TicketIngestorAgent
from agents.alignment_evaluator import AlignmentEvaluatorAgent
from agents.rewrite_strategist import RewriteStrategistAgent
from agents.theme_synthesizer import ThemeSynthesizerAgent
from agents.founder_voice import FounderVoiceAgent
from utils.logger import get_logger

logger = get_logger(__name__)


class SteveOrchestrator:
    """Main orchestrator for Steve - Strategic Ticket Evaluation & Vision Enforcer"""
    
    def __init__(self, test_mode: bool = False, dry_run: bool = False):
        self.test_mode = test_mode
        self.dry_run = dry_run
        self.jira_client = JiraClient(test_mode=test_mode, dry_run=dry_run)
        
        # Initialize agents
        logger.steve.info("Initializing Steve agents...")
        self.ticket_ingestor = TicketIngestorAgent(self.jira_client)
        self.alignment_evaluator = AlignmentEvaluatorAgent()
        self.rewrite_strategist = RewriteStrategistAgent()
        self.theme_synthesizer = ThemeSynthesizerAgent()
        self.founder_voice = FounderVoiceAgent() if os.getenv("USE_FOUNDER_VOICE", "false").lower() == "true" else None
        
        logger.steve.success("Steve is ready for strategic alignment!")
    
    def run(self, 
            review_mode: Optional[ReviewMode] = None,
            project_key: Optional[str] = None):
        """Run the complete Steve workflow"""
        
        # Use provided values or defaults from env
        review_mode = review_mode or ReviewMode(os.getenv("REVIEW_MODE", "execution"))
        if project_key:
            self.jira_client.project_key = project_key
        
        logger.steve.info(f"Starting Steve analysis for project {self.jira_client.project_key}")
        logger.steve.info(f"Review mode: {review_mode.value}")
        
        # 1. Ingest tickets
        tickets = self.ticket_ingestor.run(review_mode)
        if not tickets:
            logger.steve.warning("No tickets found to analyze")
            return
        
        # 2. Evaluate alignment
        alignments = self.alignment_evaluator.run(tickets)
        
        # 3. Rewrite misaligned tickets
        rewrites = self.rewrite_strategist.run(tickets, alignments)
        
        # 4. Update Jira (if not in dry run)
        if not self.dry_run:
            self._update_jira(tickets, alignments, rewrites)
        
        # 5. Synthesize themes
        sprint_summary = self.theme_synthesizer.run(tickets, alignments)
        
        # 6. Generate executive summary (if enabled)
        if self.founder_voice:
            executive_summary = self.founder_voice.run(sprint_summary)
            self._send_to_slack(executive_summary)
        
        logger.steve.success("Steve analysis complete!")
        return {
            "tickets": tickets,
            "alignments": alignments,
            "rewrites": rewrites,
            "summary": sprint_summary
        }
    
    def _update_jira(self, tickets, alignments, rewrites):
        """Update Jira with alignment results"""
        logger.steve.start_progress("Updating Jira tickets...")
        
        # Create lookup maps
        alignment_map = {a.ticket_key: a for a in alignments}
        rewrite_map = {r.original_key: r for r in rewrites}
        
        for ticket in tickets:
            alignment = alignment_map.get(ticket.key)
            if alignment:
                rewrite = rewrite_map.get(ticket.key)
                rewrite_dict = None
                if rewrite:
                    rewrite_dict = {
                        "revised_summary": rewrite.revised_summary,
                        "revised_description": rewrite.revised_description
                    }
                
                self.jira_client.update_ticket(
                    ticket.key,
                    alignment,
                    rewrite_dict
                )
        
        logger.steve.stop_progress()
    
    def _send_to_slack(self, executive_summary):
        """Send executive summary to Slack"""
        webhook_url = os.getenv("SLACK_WEBHOOK_URL")
        if not webhook_url:
            logger.steve.warning("No Slack webhook configured")
            return
        
        # Would implement actual Slack posting here
        logger.steve.info("Executive summary ready for Slack")
    
    def create_crew(self) -> Crew:
        """Create CrewAI crew with all agents"""
        agents = [
            self.ticket_ingestor.agent,
            self.alignment_evaluator.agent,
            self.rewrite_strategist.agent,
            self.theme_synthesizer.agent
        ]
        
        if self.founder_voice:
            agents.append(self.founder_voice.agent)
        
        return Crew(
            agents=agents,
            verbose=True
        )