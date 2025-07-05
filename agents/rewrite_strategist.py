from typing import List, Dict, Optional
import yaml
from crewai import Agent, Task

from ..core.schemas import TicketSchema, AlignmentResult, AlignmentCategory, TicketRewrite
from ..utils.logger import get_logger

logger = get_logger(__name__)


class RewriteStrategistAgent:
    def __init__(self):
        self._load_config()
        self._load_principles()
        self.agent = self._create_agent()
    
    def _load_config(self):
        with open("config/agents.yaml", "r") as f:
            config = yaml.safe_load(f)
            self.config = config["agents"]["rewrite_strategist"]
            self.global_config = config["global"]
    
    def _load_principles(self):
        with open("config/principles.yaml", "r") as f:
            principles_data = yaml.safe_load(f)
            self.principles = principles_data["principles"]
    
    def _create_agent(self) -> Agent:
        """Create the rewrite strategist agent"""
        return Agent(
            role=self.config["role"],
            goal=self.config["goal"],
            backstory=self.config["backstory"],
            verbose=True,
            allow_delegation=False,
            temperature=self.config.get("temperature", 0.7)
        )
    
    def rewrite_ticket(self, ticket: TicketSchema, alignment: AlignmentResult) -> Optional[TicketRewrite]:
        """Rewrite a misaligned ticket"""
        # Only rewrite drift and distraction tickets
        if alignment.category not in [AlignmentCategory.DRIFT, AlignmentCategory.DISTRACTION]:
            return None
        
        # Find closest principle to target
        target_principle = self._find_target_principle(ticket, alignment)
        
        # Generate rewrite
        task = Task(
            description=f"""
            Rewrite this misaligned ticket to better align with our strategic principles:
            
            Current Ticket:
            - Key: {ticket.key}
            - Summary: {ticket.summary}
            - Description: {ticket.description}
            - Current Score: {alignment.alignment_score}/100 ({alignment.category.value})
            
            Target Principle: {target_principle['name']}
            - Description: {target_principle['description']}
            - Keywords: {', '.join(target_principle['keywords'])}
            
            Create a revised summary and description that:
            1. Preserves the core intent of the original ticket
            2. Clearly connects to the target principle
            3. Uses relevant keywords naturally
            4. Focuses on strategic value
            
            The rewrite should feel natural, not forced.
            """,
            expected_output="Revised summary and description",
            agent=self.agent
        )
        
        result = self.agent.execute_task(task)
        
        # Parse result (in real implementation, would use structured output)
        revised_summary = self._extract_summary(result)
        revised_description = self._extract_description(result)
        
        # Create Jira comment
        jira_comment = f"{self.config['comment_prefix']}: This ticket could better align with our '{target_principle['name']}' principle. Consider reframing to emphasize {target_principle['keywords'][0]}."
        
        rewrite = TicketRewrite(
            original_key=ticket.key,
            original_summary=ticket.summary,
            revised_summary=revised_summary,
            revised_description=revised_description,
            alignment_improvement=20.0,  # Estimated improvement
            targeted_principle=target_principle['name'],
            jira_comment=jira_comment
        )
        
        logger.steve.section("REWRITE", f"Suggested realignment for {ticket.key} toward {target_principle['name']}")
        
        return rewrite
    
    def _find_target_principle(self, ticket: TicketSchema, alignment: AlignmentResult) -> Dict:
        """Find the best principle to target for rewrite"""
        # If we have matched principles, use the first one
        if alignment.matched_principles:
            for principle in self.principles:
                if principle['name'] in alignment.matched_principles:
                    return principle
        
        # Otherwise, use the highest weighted principle
        return max(self.principles, key=lambda p: p.get('weight', 1.0))
    
    def _extract_summary(self, result: str) -> str:
        """Extract revised summary from agent result"""
        # Simple extraction - in production would use structured output
        if "Summary:" in result:
            lines = result.split('\n')
            for i, line in enumerate(lines):
                if "Summary:" in line:
                    return lines[i].replace("Summary:", "").strip()
        return "Revised ticket summary"
    
    def _extract_description(self, result: str) -> str:
        """Extract revised description from agent result"""
        # Simple extraction - in production would use structured output
        if "Description:" in result:
            lines = result.split('\n')
            for i, line in enumerate(lines):
                if "Description:" in line:
                    return '\n'.join(lines[i:]).replace("Description:", "").strip()
        return "Revised ticket description"
    
    def create_task(self, tickets: List[TicketSchema], alignments: List[AlignmentResult]) -> Task:
        """Create task for the agent"""
        misaligned_count = sum(1 for a in alignments 
                              if a.category in [AlignmentCategory.DRIFT, AlignmentCategory.DISTRACTION])
        
        return Task(
            description=f"""
            Review {misaligned_count} misaligned tickets and suggest strategic rewrites.
            
            Focus on:
            1. Preserving core functionality
            2. Connecting to company principles
            3. Highlighting strategic value
            4. Using natural language
            
            Generate rewrite suggestions that teams will want to implement.
            """,
            expected_output="List of TicketRewrite objects",
            agent=self.agent
        )
    
    def run(self, tickets: List[TicketSchema], alignments: List[AlignmentResult]) -> List[TicketRewrite]:
        """Execute the agent to rewrite misaligned tickets"""
        # Create ticket lookup
        ticket_map = {t.key: t for t in tickets}
        
        # Filter misaligned tickets
        misaligned = [(ticket_map[a.ticket_key], a) for a in alignments 
                     if a.category in [AlignmentCategory.DRIFT, AlignmentCategory.DISTRACTION]]
        
        if not misaligned:
            logger.steve.info("No misaligned tickets to rewrite")
            return []
        
        logger.steve.start_progress(f"Rewriting {len(misaligned)} misaligned tickets...")
        
        rewrites = []
        for ticket, alignment in misaligned:
            rewrite = self.rewrite_ticket(ticket, alignment)
            if rewrite:
                rewrites.append(rewrite)
        
        logger.steve.stop_progress()
        logger.steve.success(f"Generated {len(rewrites)} rewrite suggestions")
        
        return rewrites