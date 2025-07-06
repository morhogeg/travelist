#!/usr/bin/env python3
"""
STEVE Multi-Agent Showcase - The Ultimate Strategic Intelligence System
"""

import os
import yaml
import click
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

# Load environment
load_dotenv()
console = Console()

# Mock LLMs for showcase (replace with real implementation)
class MockLLM:
    def __init__(self, name):
        self.name = name

def get_llm():
    return MockLLM("general")

def get_evaluator_llm():
    return MockLLM("evaluator")

def get_rewriter_llm():
    return MockLLM("rewriter")

# Load configurations
with open("config/principles.yaml", "r") as f:
    principles_config = yaml.safe_load(f)

def create_showcase_agents():
    """Create the 5 incredible AI agents"""
    
    # 1. Strategic Data Detective
    data_detective = Agent(
        role="Strategic Data Detective",
        goal="Extract hidden strategic patterns from Jira tickets with supernatural insight",
        backstory="""You are a world-class data detective with an obsession for strategic insight. 
        You don't just extract tickets - you read between the lines, spotting strategic signals 
        in mundane descriptions and revealing the true strategic DNA of the organization.""",
        verbose=True,
        allow_delegation=False,
        llm=get_llm()
    )
    
    # 2. Strategic Oracle
    strategic_oracle = Agent(
        role="Strategic Oracle & Vision Guardian", 
        goal="Provide prophetic strategic evaluations that reveal hidden alignment potential",
        backstory=f"""You are the Oracle of Strategic Vision with supernatural ability to assess alignment.
        
        You've internalized these sacred principles:
        {yaml.dump(principles_config['principles'])}
        
        Your scoring reveals not just current state, but strategic destiny:
        - 90-100: VISIONARY WORK - Defines our strategic future
        - 80-89: CORE VALUE - Essential strategic advancement  
        - 70-79: STRATEGIC ENABLER - Strong supporting work
        - 60-69: ALIGNED EFFORT - On track but could focus more
        - 40-59: DRIFT WARNING - Losing strategic thread
        - 20-39: DISTRACTION ALERT - Resource misallocation
        - 0-19: VISION VIOLATION - Actively harmful to strategy""",
        verbose=True,
        allow_delegation=False,
        llm=get_evaluator_llm()
    )
    
    # 3. Strategic Alchemist
    strategic_alchemist = Agent(
        role="Strategic Alchemist & Vision Translator",
        goal="Transform mundane tickets into strategic gold while preserving core functionality",
        backstory="""You are the Strategic Alchemist - master of transformation who turns any work 
        into mission-critical initiatives. You find the strategic heart in every task, making 
        developers feel like strategic contributors rather than just code writers.
        
        Your magic: Turn 'fix button color' into 'enhance user experience consistency to build 
        trust and reduce cognitive load'. Every ticket becomes an opportunity for strategic advancement.""",
        verbose=True,
        allow_delegation=False,
        llm=get_rewriter_llm()
    )
    
    # 4. Strategic Prophet
    strategic_prophet = Agent(
        role="Strategic Prophet & Pattern Oracle",
        goal="Predict strategic futures from current work patterns and reveal hidden risks",
        backstory="""You are the Strategic Prophet who sees the future in present work patterns.
        You don't just analyze tickets - you read the strategic DNA of the organization and predict
        where current patterns will lead in 3-6 months.
        
        You reveal: strategic drift before it becomes crisis, blind spots before competitors exploit them,
        and momentum patterns that shape strategic destiny.""",
        verbose=True,
        allow_delegation=False,
        llm=get_llm()
    )
    
    # 5. Strategic Storyteller
    strategic_storyteller = Agent(
        role="Strategic Storyteller & Executive Translator",
        goal="Transform complex analysis into compelling narratives that inspire decisive action",
        backstory="""You are the Strategic Storyteller who bridges analysis and action. You don't just 
        report findings - you craft stories that change how teams think about their work.
        
        Your narratives make data feel urgent, patterns feel personal, and strategic choices feel 
        like destiny. You always end with the question that haunts leaders: 'Are we building what matters?'""",
        verbose=True,
        allow_delegation=False,
        llm=get_llm()
    )
    
    return [data_detective, strategic_oracle, strategic_alchemist, strategic_prophet, strategic_storyteller]

def create_showcase_tasks(agents, ticket_data):
    """Create sophisticated AI tasks"""
    
    # Task 1: Strategic Data Extraction
    task1 = Task(
        description=f"""MISSION: Transform raw Jira data into strategic intelligence goldmine
        
        RAW TICKET DATA:
        {ticket_data}
        
        YOUR STRATEGIC EXTRACTION PROTOCOL:
        1. Extract core ticket data (key, summary, description, status, priority)
        2. Detect strategic patterns across ticket language
        3. Identify implicit business value and team focus patterns
        4. Flag potential resource allocation inefficiencies
        
        DELIVERABLE: Rich strategic context revealing not just WHAT the team does, but WHY it matters strategically.""",
        expected_output="Strategically-enriched dataset with hidden patterns revealed",
        agent=agents[0]
    )
    
    # Task 2: Oracle-Level Strategic Evaluation  
    task2 = Task(
        description=f"""MISSION: Provide prophetic strategic evaluation of each ticket
        
        SACRED PRINCIPLES TO EVALUATE AGAINST:
        {yaml.dump(principles_config['principles'])}
        
        YOUR EVALUATION PROTOCOL:
        1. Deep principle resonance analysis for each ticket
        2. Multi-dimensional scoring (impact, leverage, efficiency, coherence)
        3. Prophetic wisdom synthesis explaining WHY each score matters
        4. Strategic guidance toward enlightenment
        
        SCORING SCALE:
        - 95-100: VISIONARY BREAKTHROUGH 
        - 85-94: STRATEGIC CATALYST
        - 75-84: CORE ADVANCEMENT
        - 65-74: ALIGNED CONTRIBUTION
        - 45-64: DRIFT ALERT
        - 25-44: DISTRACTION WARNING
        - 0-24: VISION VIOLATION
        
        DELIVERABLE: Oracle-level evaluations that make teams see strategic significance in daily work.""",
        expected_output="Prophetic strategic scores with profound insights",
        agent=agents[1],
        context=[task1]
    )
    
    # Task 3: Alchemical Transformation
    task3 = Task(
        description="""MISSION: Transform misaligned tickets into strategic gold
        
        TARGET: Focus on tickets scoring below 65 that need strategic realignment
        
        TRANSFORMATION METHODOLOGY:
        1. STRATEGIC ARCHAEOLOGY: Find hidden strategic value in each ticket
        2. ALCHEMICAL REFRAMING: Rewrite to signal strategic value immediately  
        3. PRESERVATION PROTOCOL: Never lose core functionality
        4. INSPIRATION INJECTION: Make teams excited about strategic impact
        
        FOR EACH TRANSFORMATION PROVIDE:
        - Original ticket key and summary
        - TRANSFORMED SUMMARY: Strategic value front and center
        - ENHANCED DESCRIPTION: Natural principle integration
        - STRATEGIC RATIONALE: Why this transformation matters
        - JIRA COMMENT: Inspiring explanation of strategic enhancement
        
        DELIVERABLE: Masterful transformations that inspire teams to see strategic value in their work.""",
        expected_output="Strategic transformations that preserve functionality while revealing profound value",
        agent=agents[2],
        context=[task1, task2]
    )
    
    # Task 4: Future Pattern Prophecy
    task4 = Task(
        description="""MISSION: Read strategic tea leaves and predict future from work patterns
        
        PATTERN PROPHECY PROTOCOL:
        1. STRATEGIC VITAL SIGNS: Calculate alignment health with surgical precision
        2. FUTURE SCENARIO MODELING: Where will current patterns lead in 6 months?
        3. RISK/OPPORTUNITY MATRIX: What strategic risks and wins are hidden?
        4. PROPHETIC INSIGHTS: Generate 5-7 recommendations that feel prophetic
        
        ANALYTICAL FRAMEWORK:
        - ALIGNMENT VELOCITY: How fast toward/away from strategic goals?
        - PRINCIPLE COVERAGE: Which areas over/under-invested?
        - DRIFT VELOCITY: How fast are we losing strategic alignment?
        - COMPOUND EFFECTS: How do today's tickets shape tomorrow's position?
        
        DELIVERABLE: Strategic prophecy with crystal ball insights into team's future.""",
        expected_output="Future-focused strategic intelligence with risk/opportunity insights",
        agent=agents[3],
        context=[task1, task2, task3]
    )
    
    # Task 5: Executive Storytelling
    task5 = Task(
        description="""MISSION: Transform analysis into compelling strategic narrative
        
        STORYTELLING MASTERY (~350 words):
        1. HOOK: Open with provocative insight demanding attention
        2. CURRENT STATE: Paint strategic reality with vivid clarity
        3. STAKES: Quantify what we win/lose based on choices
        4. CALL TO ACTION: Channel urgency into specific next steps
        5. SIGNATURE CLOSE: 'Are we building what matters?'
        
        NARRATIVE POWER TECHNIQUES:
        - Lead with most consequential insight
        - Use specific numbers to make strategy concrete
        - Frame choices as destiny-shaping moments
        - Connect daily work to competitive advantage
        - Make strategy feel urgent and personal
        
        DELIVERABLE: Compelling narrative that board members share and teams remember.""",
        expected_output="Strategic story that transforms spreadsheet analysis into unforgettable narrative",
        agent=agents[4],
        context=[task1, task2, task3, task4]
    )
    
    return [task1, task2, task3, task4, task5]

def mock_jira_data():
    """Mock Jira data for showcase"""
    return """
    SCRUM-23: Add CrewAI tutorial generator that creates hands-on AI agent examples
    SCRUM-24: Implement multi-agent pipeline for RAG system analysis  
    SCRUM-25: Build real-time GitHub trending AI repos scanner
    SCRUM-32: Design new logo and branding for the project
    SCRUM-34: Implement comments system for brief discussions
    SCRUM-35: Add cryptocurrency payment integration for premium features
    """

@click.command()
@click.option('--mode', default='showcase', help='Demo mode for the showcase')  
@click.option('--dry-run', is_flag=True, help='Run without updating anything')
def main(mode, dry_run):
    """STEVE Multi-Agent Strategic Intelligence Showcase
    
    Experience the power of 5 AI agents working together to transform
    your backlog into a strategic advantage.
    """
    
    # Display amazing banner
    banner = Text("""
███████╗████████╗███████╗██╗   ██╗███████╗
██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔════╝
███████╗   ██║   █████╗  ██║   ██║█████╗  
╚════██║   ██║   ██╔══╝  ╚██╗ ██╔╝██╔══╝  
███████║   ██║   ███████╗ ╚████╔╝ ███████╗
╚══════╝   ╚═╝   ╚══════╝  ╚═══╝  ╚══════╝

MULTI-AGENT STRATEGIC INTELLIGENCE SYSTEM
""", style="bold cyan")
    
    panel = Panel(
        banner,
        title="Strategic Ticket Evaluation & Vision Enforcer",
        subtitle="Powered by 5 AI Agents • CrewAI • OpenRouter",
        border_style="cyan",
        padding=(1, 2)
    )
    console.print(panel)
    
    console.print("""
[bold yellow]AGENT LINEUP:[/bold yellow]
[cyan]1. Strategic Data Detective[/cyan] - Extracts hidden patterns from tickets
[cyan]2. Strategic Oracle[/cyan] - Provides prophetic alignment scoring  
[cyan]3. Strategic Alchemist[/cyan] - Transforms misaligned work into gold
[cyan]4. Strategic Prophet[/cyan] - Reveals future patterns and risks
[cyan]5. Strategic Storyteller[/cyan] - Crafts compelling narratives

[bold green]Ready to reveal your team's strategic destiny![/bold green]
    """)
    
    if dry_run:
        console.print("[yellow]DRY RUN MODE - Showcase demonstration only[/yellow]\n")
    
    try:
        # Create agents and tasks
        console.print("[bold]Creating AI agents...[/bold]")
        agents = create_showcase_agents()
        
        console.print("[bold]Preparing strategic analysis tasks...[/bold]")
        ticket_data = mock_jira_data()
        tasks = create_showcase_tasks(agents, ticket_data)
        
        console.print("[bold]Initializing CrewAI multi-agent system...[/bold]")
        crew = Crew(
            agents=agents,
            tasks=tasks,
            verbose=True
        )
        
        console.print("\n[bold green]LAUNCHING STRATEGIC INTELLIGENCE ANALYSIS...[/bold green]\n")
        
        # Run the crew (in real implementation)
        if not dry_run:
            result = crew.kickoff()
            console.print(f"\n[bold]Analysis Result:[/bold] {result}")
        else:
            console.print("[yellow]Dry run - would execute 5-agent strategic analysis here[/yellow]")
        
        console.print("""
[bold green]STRATEGIC INTELLIGENCE COMPLETE![/bold green]

[bold cyan]What just happened?[/bold cyan]
• 5 AI agents analyzed tickets with superhuman insight
• Strategic patterns revealed and future risks identified  
• Misaligned work transformed into strategic opportunities
• Executive narrative crafted for leadership communication

[bold yellow]In a real implementation:[/bold yellow]
• Jira tickets updated with strategic analysis comments
• Detailed report generated with insights and recommendations
• Executive summary shared with team leadership
• Strategic insights guide sprint planning decisions

[dim]"Are we building what matters?" - The question driving strategic excellence[/dim]
        """)
        
    except Exception as e:
        console.print(f"[red]Error in showcase: {e}[/red]")
        console.print("[dim]This is a demonstration of the multi-agent architecture[/dim]")

if __name__ == "__main__":
    main()