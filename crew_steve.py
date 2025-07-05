#!/usr/bin/env python3
"""
Steve - Strategic Ticket Evaluation & Vision Enforcer
Main CrewAI orchestrator following the exact pattern
"""

import os
import yaml
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv
from crewai import Agent, Task, Crew

from llm_config import get_llm, get_evaluator_llm, get_rewriter_llm
from data_collector import collect_all_context
from core.schemas import ReviewMode, AlignmentCategory
from utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)

# Initialize LLMs
general_llm = get_llm()
evaluator_llm = get_evaluator_llm()
rewriter_llm = get_rewriter_llm()

# Load configurations
with open("config/principles.yaml", "r") as f:
    principles_config = yaml.safe_load(f)

with open("config/agents.yaml", "r") as f:
    agents_config = yaml.safe_load(f)


def create_agents():
    """Create all Steve agents following CrewAI pattern"""
    
    # 1. Ticket Ingestor Agent
    ticket_ingestor = Agent(
        role="Jira Harvester",
        goal="Extract and normalize all relevant Jira tickets for strategic analysis",
        backstory="""You are an expert at navigating Jira's data structure. 
        You LOVE: clean data extraction, proper normalization, comprehensive ticket details
        You IGNORE: irrelevant fields, outdated tickets, noise
        You excel at pulling exactly what's needed for strategic analysis.""",
        verbose=True,
        allow_delegation=False,
        llm=general_llm
    )
    
    # 2. Alignment Evaluator Agent
    alignment_evaluator = Agent(
        role="Strategic Gatekeeper",
        goal="Score each ticket's alignment with company principles from 0-100",
        backstory=f"""You are the guardian of strategic alignment. You deeply understand these principles:
        {yaml.dump(principles_config['principles'])}
        
        You LOVE: tickets that clearly advance strategic goals
        You SCRUTINIZE: work that might be drifting from core values
        You REJECT: distractions that don't serve the mission
        
        Scoring thresholds:
        - ≥80: Core Value (directly advances strategy)
        - 60-79: Strategic Enabler (supports goals)
        - 40-59: Drift (weakly connected)
        - <40: Distraction (misaligned)""",
        verbose=True,
        allow_delegation=False,
        llm=evaluator_llm
    )
    
    # 3. Rewrite Strategist Agent
    rewrite_strategist = Agent(
        role="Alignment Fixer",
        goal="Transform misaligned tickets into strategic work",
        backstory="""You are a master at reframing work to align with company goals.
        You PRESERVE: the core intent and functionality
        You ADD: clear strategic value and connection to principles
        You AVOID: forced or artificial connections
        
        Your rewrites feel natural and inspire teams to see the strategic value.""",
        verbose=True,
        allow_delegation=False,
        llm=rewriter_llm
    )
    
    # 4. Theme Synthesizer Agent
    theme_synthesizer = Agent(
        role="Pattern Detector",
        goal="Identify trends, blind spots, and strategic drift across all tickets",
        backstory="""You see the forest through the trees. You detect:
        - Over-indexed areas (too much focus on one principle)
        - Neglected principles (strategic blind spots)
        - Drift patterns (gradual misalignment)
        - Team focus trends
        
        You provide ACTIONABLE insights, not just statistics.""",
        verbose=True,
        allow_delegation=False,
        llm=general_llm
    )
    
    # 5. Founder Voice Agent (optional)
    founder_voice = Agent(
        role="Executive Narrator",
        goal="Transform analysis into sharp, strategic communication",
        backstory="""You channel the founder's voice - direct, strategic, and inspiring.
        You WRITE: punchy, memorable insights
        You CHALLENGE: teams to focus on what matters
        You INSPIRE: action toward strategic goals
        
        Your tone is assertive but supportive. You end every message with:
        'Are we building what matters?'""",
        verbose=True,
        allow_delegation=False,
        llm=general_llm
    )
    
    return ticket_ingestor, alignment_evaluator, rewrite_strategist, theme_synthesizer, founder_voice


def create_tasks(context_data: Dict[str, str], review_mode: ReviewMode, dry_run: bool = False):
    """Create tasks for the crew following exact pattern"""
    
    # Get agents
    ticket_ingestor, alignment_evaluator, rewrite_strategist, theme_synthesizer, founder_voice = create_agents()
    
    # Task 1: Ingest and Parse Tickets
    task1 = Task(
        description=f"""Parse and structure the Jira ticket data for analysis.
        
        Raw ticket data to process:
        {context_data['tickets_data']}
        
        Extract and structure EACH ticket with:
        - Key, Summary, Description
        - Status, Priority, Assignee  
        - Labels, Sprint, Story Points
        - Created/Updated dates
        
        Return a clean, numbered list of all tickets with complete details.""",
        expected_output="Structured list of all Jira tickets with normalized fields",
        agent=ticket_ingestor
    )
    
    # Task 2: Evaluate Alignment
    task2 = Task(
        description=f"""Score each ticket's strategic alignment from 0-100.
        
        Company principles to evaluate against:
        {context_data['principles_context']}
        
        SCORING PROCESS:
        1. Compare ticket summary + description to each principle
        2. Calculate weighted similarity scores  
        3. Assign final score and category
        4. Write 2-3 sentence rationale
        
        STRICT CATEGORIES (use exact thresholds above):
        - core_value: directly advances strategy
        - strategic_enabler: clearly supports goals
        - drift: weak connection to principles  
        - distraction: no clear alignment
        
        For EACH ticket provide:
        - Ticket key
        - Alignment score (0-100)
        - Category (exact match to thresholds)
        - Matched principles (list)
        - Clear rationale (2-3 sentences)""",
        expected_output="Complete alignment analysis for all tickets with scores and rationales",
        agent=alignment_evaluator,
        context=[task1]
    )
    
    # Task 3: Rewrite Misaligned Tickets
    task3 = Task(
        description="""For ONLY drift and distraction tickets (score <60), create strategic rewrites.
        
        REWRITE PROCESS:
        1. Identify closest matching principle
        2. Reframe summary to highlight strategic value
        3. Rewrite description to connect with principle
        4. Preserve core functionality
        
        For EACH rewrite provide:
        - Original ticket key
        - Revised summary (clear strategic framing)
        - Revised description (natural connection to principles)
        - Target principle
        - Suggested Jira comment starting with: '🎯 Strategic Alignment Guard:'""",
        expected_output="List of rewrite suggestions for misaligned tickets",
        agent=rewrite_strategist,
        context=[task1, task2]
    )
    
    # Task 4: Synthesize Themes
    task4 = Task(
        description="""Analyze patterns across ALL tickets to identify strategic insights.
        
        CALCULATE:
        - Total tickets by category
        - Average alignment score
        - Drift percentage (drift + distraction tickets)
        
        IDENTIFY:
        - Over-indexed principles (>40% of tickets)
        - Neglected principles (<2 tickets)
        - Top 5 best aligned tickets
        - Bottom 5 worst aligned tickets
        
        GENERATE up to 7 recommendations:
        - Use emojis for visual impact
        - Be specific and actionable
        - Focus on strategic shifts needed
        - Call out concerning patterns""",
        expected_output="Complete sprint summary with statistics, patterns, and recommendations",
        agent=theme_synthesizer,
        context=[task1, task2, task3]
    )
    
    # Task 5: Create Executive Summary (optional)
    task5 = None
    if os.getenv("USE_FOUNDER_VOICE", "false").lower() == "true":
        task5 = Task(
            description="""Transform the analysis into a ~300 word executive summary.
            
            TONE: Sharp, strategic, assertive, direct
            
            STRUCTURE:
            1. Open with punchy observation about strategic health
            2. Highlight what's working (if anything)
            3. Call out what needs immediate attention
            4. Challenge the team to refocus
            5. End with: "Are we building what matters?"
            
            Make it memorable and action-inspiring.""",
            expected_output="Executive summary in founder voice for Slack",
            agent=founder_voice,
            context=[task1, task2, task3, task4]
        )
    
    return [t for t in [task1, task2, task3, task4, task5] if t]


def update_jira_tickets(jira_client: JiraClient, results: Dict[str, Any], dry_run: bool = False):
    """Update Jira with Steve's analysis"""
    if dry_run:
        logger.steve.info("[DRY RUN] Would update Jira tickets")
        return
    
    # Parse results from crew output
    tickets = results.get('tickets', [])
    alignments = results.get('alignments', [])
    rewrites = results.get('rewrites', [])
    
    for alignment in alignments:
        ticket_key = alignment['ticket_key']
        
        # Find corresponding rewrite if exists
        rewrite = next((r for r in rewrites if r['original_key'] == ticket_key), None)
        
        # Update Jira
        jira_client.update_ticket(
            ticket_key=ticket_key,
            alignment_result=alignment,
            rewrite=rewrite
        )


def run_steve(review_mode: str = "execution", project_key: str = None, 
              test_mode: bool = False, dry_run: bool = False):
    """Main entry point for Steve analysis"""
    
    logger.steve.info("🎯 Starting Steve - Strategic Alignment Guard")
    
    # Collect all context data
    review_mode_enum = ReviewMode(review_mode)
    context_data = collect_all_context(review_mode_enum, project_key, test_mode)
    
    # Create tasks with context
    tasks = create_tasks(context_data, review_mode_enum, dry_run)
    
    # Get agents for crew
    agents = list(create_agents())
    if not os.getenv("USE_FOUNDER_VOICE", "false").lower() == "true":
        agents = agents[:-1]  # Remove founder voice agent
    
    # Create and run crew
    crew = Crew(
        agents=agents,
        tasks=tasks,
        verbose=True
    )
    
    try:
        logger.steve.start_progress("Running strategic analysis...")
        result = crew.kickoff()
        logger.steve.stop_progress()
        
        # Process results
        results = parse_crew_results(result)
        
        # Update Jira
        if not dry_run and not test_mode:
            update_jira_tickets(jira_client, results, dry_run)
        
        # Display summary
        logger.steve.sprint_summary(results.get('summary', {}))
        
        # Save report
        save_report(results)
        
        logger.steve.success("✅ Steve analysis complete!")
        
        return results
        
    except Exception as e:
        logger.steve.error(f"Error during analysis: {e}")
        raise


def parse_crew_results(crew_output) -> Dict[str, Any]:
    """Parse CrewAI output into structured results"""
    # In a real implementation, would parse the crew output
    # For now, return a structured format
    return {
        'tickets': [],
        'alignments': [],
        'rewrites': [],
        'summary': {
            'total_tickets': 0,
            'average_alignment_score': 0,
            'drift_percentage': 0,
            'recommendations': []
        }
    }


def save_report(results: Dict[str, Any]):
    """Save analysis report"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"steve_report_{timestamp}.md"
    
    with open(filename, "w") as f:
        f.write(f"# Steve Analysis Report\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"## Summary\n")
        f.write(f"- Total Tickets: {results['summary']['total_tickets']}\n")
        f.write(f"- Average Alignment: {results['summary']['average_alignment_score']:.1f}/100\n")
        f.write(f"- Drift Rate: {results['summary']['drift_percentage']:.0f}%\n\n")
        f.write(f"## Recommendations\n")
        for rec in results['summary']['recommendations']:
            f.write(f"- {rec}\n")
    
    logger.steve.info(f"Report saved to {filename}")


if __name__ == "__main__":
    import sys
    
    # Simple CLI
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        run_steve(test_mode=True, dry_run=True)
    else:
        run_steve()