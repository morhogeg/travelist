import yaml
from crewai import Agent, Task

from core.schemas import SprintSummarySchema, ExecutiveSummary
from utils.logger import get_logger

logger = get_logger(__name__)


class FounderVoiceAgent:
    def __init__(self):
        self._load_config()
        self.agent = self._create_agent()
    
    def _load_config(self):
        with open("config/agents.yaml", "r") as f:
            config = yaml.safe_load(f)
            self.config = config["agents"]["founder_voice"]
            self.global_config = config["global"]
    
    def _create_agent(self) -> Agent:
        """Create the founder voice agent"""
        return Agent(
            role=self.config["role"],
            goal=self.config["goal"],
            backstory=self.config["backstory"],
            verbose=True,
            allow_delegation=False,
            temperature=self.config.get("temperature", 0.8)
        )
    
    def create_executive_summary(self, sprint_summary: SprintSummarySchema) -> ExecutiveSummary:
        """Transform sprint summary into founder voice"""
        task = Task(
            description=f"""
            Transform this sprint analysis into a {self.config['max_words']}-word executive message.
            
            Data:
            - Total tickets: {sprint_summary.total_tickets}
            - Average alignment: {sprint_summary.average_alignment_score:.0f}/100
            - Drift percentage: {sprint_summary.drift_percentage:.0f}%
            - Core value tickets: {sprint_summary.alignment_breakdown.get('core_value', 0)}
            - Distraction tickets: {sprint_summary.alignment_breakdown.get('distraction', 0)}
            
            Key insights:
            - Over-indexed: {', '.join(sprint_summary.over_indexed_areas) or 'None'}
            - Neglected: {', '.join(sprint_summary.neglected_principles) or 'None'}
            
            Recommendations:
            {chr(10).join('- ' + r for r in sprint_summary.recommendations)}
            
            Write in a tone that is: {self.config['tone']}
            
            TONE GUIDELINES:
            - {' '.join(self.config.get('tone_guidelines', {}).get('constructive_approach', []))}
            - AVOID phrases like: {', '.join(self.config.get('tone_guidelines', {}).get('avoid_phrases', []))}
            - PREFER phrases like: {', '.join(self.config.get('tone_guidelines', {}).get('prefer_phrases', []))}
            
            Structure:
            1. Acknowledge the team's momentum and effort
            2. Highlight what's working strategically
            3. After the Alignment Analysis, include a "🗂️ Strategic Category Definitions" section with:
               - Core Value: {self.config.get('category_definitions', {}).get('core_value', 'High-impact work directly advancing core mission')}
               - Strategic Enabler: {self.config.get('category_definitions', {}).get('strategic_enabler', 'Foundational infrastructure unlocking future value')}
               - Drift: {self.config.get('category_definitions', {}).get('drift', 'Well-intentioned work lacking clear strategic connection')}
               - Distraction: {self.config.get('category_definitions', {}).get('distraction', 'Work carrying opportunity cost that should be reframed')}
            4. Suggest pivots for misaligned work (without blame)
            5. End with a motivating, clarity-driven call to action
            
            Make it constructive, motivating, and solution-focused.
            """,
            expected_output=f"Executive summary in founder voice ({self.config['max_words']} words)",
            agent=self.agent
        )
        
        result = self.agent.execute_task(task)
        
        # Format for Slack
        slack_formatted = self._format_for_slack(result)
        
        summary = ExecutiveSummary(
            summary_text=slack_formatted,
            slack_formatted=True,
            signature=self.config['signature']
        )
        
        logger.steve.section("SUMMARY", "Executive summary generated")
        logger.info(f"\n{slack_formatted}")
        
        return summary
    
    def _format_for_slack(self, text: str) -> str:
        """Format text for Slack with markdown"""
        # Add bold formatting for emphasis
        formatted = text.replace("**", "*")  # Slack uses single * for bold
        
        # Add emoji header
        formatted = "🎯 *Strategic Alignment Report* 🎯\n\n" + formatted
        
        # Ensure signature is on its own line
        if self.config['signature'] in formatted:
            formatted = formatted.replace(
                self.config['signature'], 
                f"\n\n_{self.config['signature']}_"
            )
        else:
            formatted += f"\n\n_{self.config['signature']}_"
        
        return formatted
    
    def create_task(self, sprint_summary: SprintSummarySchema) -> Task:
        """Create task for the agent"""
        return Task(
            description="Transform sprint analysis into executive communication",
            expected_output="ExecutiveSummary object",
            agent=self.agent
        )
    
    def run(self, sprint_summary: SprintSummarySchema) -> ExecutiveSummary:
        """Execute the agent to create executive summary"""
        logger.steve.start_progress("Crafting executive summary...")
        
        summary = self.create_executive_summary(sprint_summary)
        
        logger.steve.stop_progress()
        logger.steve.success("Executive summary ready")
        
        return summary