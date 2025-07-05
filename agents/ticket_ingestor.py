from typing import List
import yaml
from crewai import Agent, Task
from crewai.tools import Tool

from ..core.schemas import TicketSchema, ReviewMode
from ..core.jira_client import JiraClient
from ..utils.logger import get_logger

logger = get_logger(__name__)


class TicketIngestorAgent:
    def __init__(self, jira_client: JiraClient):
        self.jira_client = jira_client
        self._load_config()
        self.agent = self._create_agent()
    
    def _load_config(self):
        with open("config/agents.yaml", "r") as f:
            config = yaml.safe_load(f)
            self.config = config["agents"]["ticket_ingestor"]
            self.global_config = config["global"]
    
    def _create_agent(self) -> Agent:
        """Create the ticket ingestor agent"""
        return Agent(
            role=self.config["role"],
            goal=self.config["goal"],
            backstory=self.config["backstory"],
            verbose=True,
            allow_delegation=False,
            tools=[self._create_fetch_tool()]
        )
    
    def _create_fetch_tool(self) -> Tool:
        """Create tool for fetching Jira tickets"""
        def fetch_tickets(review_mode: str) -> List[TicketSchema]:
            mode = ReviewMode(review_mode)
            tickets = self.jira_client.fetch_tickets(
                review_mode=mode,
                max_results=self.config.get("max_tickets", 1000)
            )
            logger.steve.section("INGEST", f"Pulled {len(tickets)} tickets from {self.jira_client.project_key}")
            return tickets
        
        return Tool(
            name="fetch_jira_tickets",
            description="Fetch tickets from Jira based on review mode",
            func=fetch_tickets
        )
    
    def create_task(self, review_mode: ReviewMode) -> Task:
        """Create task for the agent"""
        return Task(
            description=f"""
            Fetch Jira tickets using review mode: {review_mode.value}
            
            Use the appropriate JQL query:
            - execution: Current sprint tickets only
            - strategy: Strategic epics only  
            - full_review: All project tickets
            
            Normalize the data and return a list of TicketSchema objects.
            """,
            expected_output="List of normalized Jira tickets",
            agent=self.agent
        )
    
    def run(self, review_mode: ReviewMode) -> List[TicketSchema]:
        """Execute the agent to fetch tickets"""
        logger.steve.start_progress(f"Fetching tickets in {review_mode.value} mode...")
        
        task = self.create_task(review_mode)
        tickets = self.agent.execute_task(task)
        
        logger.steve.stop_progress()
        logger.steve.success(f"Ingested {len(tickets)} tickets")
        
        return tickets