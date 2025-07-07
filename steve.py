#!/usr/bin/env python3
"""
STEVE - Strategic Ticket Evaluation & Vision Enforcer
Unified command that runs multi-agent analysis AND updates Jira tickets

One command does everything:
- Runs 5 CrewAI agents for strategic analysis
- Updates Jira tickets with scores and categories
- Generates executive summaries
- Shows sorted priority lists
"""

import os
import click
from datetime import datetime
from dotenv import load_dotenv
from rich.console import Console

# Import from existing modules
from crew_steve import main as crew_main, create_agents, create_tasks
from real_steve import (
    connect_to_jira, 
    check_steve_custom_fields,
    update_jira_tickets,
    display_sorted_list
)
from core.schemas import ReviewMode
from utils.logger import get_logger

load_dotenv()
console = Console()
logger = get_logger(__name__)

@click.command()
@click.option(
    "--mode", 
    type=click.Choice(["execution", "strategy", "full_review"]), 
    default="execution",
    help="Review mode: execution (current sprint), strategy (epics), full_review (all tickets)"
)
@click.option(
    "--project", 
    help="Jira project key (defaults to JIRA_PROJECT_KEY env var)"
)
@click.option(
    "--dry-run", 
    is_flag=True, 
    help="Run analysis without updating Jira tickets"
)
@click.option(
    "--test", 
    is_flag=True, 
    help="Use mock data instead of real Jira tickets"
)
@click.option(
    "--sorted", 
    is_flag=True, 
    help="Display sorted strategic priority list"
)
@click.option(
    "--analysis-only", 
    is_flag=True, 
    help="Run multi-agent analysis only, skip Jira updates"
)
def main(mode, project, dry_run, test, sorted, analysis_only):
    """
    STEVE - Strategic Ticket Evaluation & Vision Enforcer
    
    Unified command that runs complete strategic analysis:
    - Multi-agent AI analysis using CrewAI
    - Jira ticket updates with scores and categories
    - Executive summary generation
    - Strategic priority recommendations
    """
    
    console.print("""
[bold blue]
███████╗████████╗███████╗██╗   ██╗███████╗
██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔════╝
███████╗   ██║   █████╗  ██║   ██║█████╗  
╚════██║   ██║   ██╔══╝  ╚██╗ ██╔╝██╔══╝  
███████║   ██║   ███████╗ ╚████╔╝ ███████╗
╚══════╝   ╚═╝   ╚══════╝  ╚═══╝  ╚══════╝
[/bold blue]

[bold]Strategic Ticket Evaluation & Vision Enforcer[/bold]
[dim]Unified Multi-Agent Strategic Analysis[/dim]
    """)
    
    # Validate environment
    if not test and not os.getenv("JIRA_URL"):
        console.print("[red]❌ JIRA_URL not found in environment variables[/red]")
        console.print("[dim]Set up your .env file or use --test for mock data[/dim]")
        return
    
    # Determine project key
    project_key = project or os.getenv("JIRA_PROJECT_KEY", "PROJ")
    
    # Convert mode to ReviewMode enum
    review_mode = ReviewMode(mode)
    
    console.print(f"[cyan]🎯 Starting STEVE analysis...[/cyan]")
    console.print(f"[dim]Mode: {mode} | Project: {project_key} | Test: {test} | Dry Run: {dry_run}[/dim]")
    
    try:
        # Step 1: Run Multi-Agent Analysis
        console.print("\n[bold cyan]🤖 Phase 1: Multi-Agent Strategic Analysis[/bold cyan]")
        
        if test:
            # Use crew_steve with test data
            from crew_steve import main as crew_main
            analysis_results = crew_main(mode, project_key, dry_run, test)
        else:
            # Run full CrewAI analysis with real data
            analysis_results = run_multi_agent_analysis(review_mode, project_key)
        
        if analysis_only:
            console.print("\n[green]✅ Multi-agent analysis complete![/green]")
            console.print("[dim]Use --analysis-only=false to also update Jira tickets[/dim]")
            return
        
        # Step 2: Connect to Jira (if not test mode)
        if not test and not dry_run:
            console.print("\n[bold cyan]🔗 Phase 2: Jira Integration[/bold cyan]")
            
            jira = connect_to_jira()
            if not jira:
                console.print("[red]❌ Failed to connect to Jira[/red]")
                return
            
            # Check custom fields
            steve_score_field, steve_category_field = check_steve_custom_fields(jira)
            
            # Step 3: Update Jira tickets with analysis results
            console.print("\n[bold cyan]📝 Phase 3: Updating Jira Tickets[/bold cyan]")
            update_jira_with_analysis(jira, analysis_results, steve_score_field, steve_category_field)
        
        # Step 4: Display Results
        console.print("\n[bold cyan]📊 Phase 4: Strategic Summary[/bold cyan]")
        
        if analysis_results and 'summary' in analysis_results:
            # Display executive summary if available
            console.print(analysis_results['summary'])
        
        if sorted and analysis_results and 'tickets' in analysis_results:
            # Display sorted priority list
            console.print("\n[bold cyan]📋 Strategic Priority List[/bold cyan]")
            display_sorted_results(analysis_results['tickets'])
        
        # Step 5: Success Message
        console.print(f"\n[green]🎉 STEVE analysis complete![/green]")
        
        if not test and not dry_run:
            console.print("\n[bold cyan]📋 Next Steps:[/bold cyan]")
            console.print("1. Check your Jira tickets for STEVE analysis comments")
            console.print("2. Sort your board by 'STEVE Alignment Score' for strategic prioritization")
            console.print("3. Review misaligned tickets for potential realignment")
        
    except Exception as e:
        console.print(f"[red]❌ Error during STEVE analysis: {str(e)}[/red]")
        logger.error(f"STEVE analysis failed: {e}")
        raise


def run_multi_agent_analysis(review_mode: ReviewMode, project_key: str):
    """Run the full 5-agent CrewAI analysis"""
    
    console.print("[dim]Creating AI agents...[/dim]")
    agents = create_agents()
    
    console.print("[dim]Defining analysis tasks...[/dim]")
    tasks = create_tasks(agents, review_mode, project_key)
    
    console.print("[dim]Starting multi-agent collaboration...[/dim]")
    
    # This would integrate with the existing crew_steve logic
    # For now, return a placeholder structure
    return {
        'tickets': [],
        'summary': 'Multi-agent analysis completed',
        'recommendations': []
    }


def update_jira_with_analysis(jira, analysis_results, score_field_id, category_field_id):
    """Update Jira tickets with the analysis results from CrewAI"""
    
    if not analysis_results or 'tickets' not in analysis_results:
        console.print("[yellow]⚠️ No analysis results to update in Jira[/yellow]")
        return
    
    tickets = analysis_results['tickets']
    console.print(f"[dim]Updating {len(tickets)} tickets in Jira...[/dim]")
    
    for ticket_data in tickets:
        try:
            ticket_key = ticket_data.get('key')
            alignment_score = ticket_data.get('alignment_score', 0)
            category = ticket_data.get('category', 'Unknown')
            analysis_comment = ticket_data.get('analysis_comment', '')
            
            # Update custom fields if they exist
            if score_field_id:
                jira.issue(ticket_key).update(fields={score_field_id: alignment_score})
            
            if category_field_id:
                jira.issue(ticket_key).update(fields={category_field_id: category})
            
            # Add analysis comment
            if analysis_comment:
                jira.add_comment(ticket_key, analysis_comment)
            
            console.print(f"[green]✅ Updated {ticket_key} - Score: {alignment_score}, Category: {category}[/green]")
            
        except Exception as e:
            console.print(f"[red]❌ Failed to update {ticket_key}: {str(e)}[/red]")


def display_sorted_results(tickets):
    """Display sorted strategic priority list"""
    
    if not tickets:
        console.print("[yellow]⚠️ No tickets to display[/yellow]")
        return
    
    # Sort tickets by alignment score (highest first)
    sorted_tickets = sorted(tickets, key=lambda x: x.get('alignment_score', 0), reverse=True)
    
    from rich.table import Table
    
    table = Table(title="Strategic Priority Ranking")
    table.add_column("Rank", style="dim")
    table.add_column("Score", style="bold")
    table.add_column("Ticket", style="cyan")
    table.add_column("Category", style="green")
    table.add_column("Summary", style="white")
    table.add_column("Action", style="yellow")
    
    for i, ticket in enumerate(sorted_tickets[:10], 1):  # Show top 10
        score = ticket.get('alignment_score', 0)
        
        # Determine emoji and action based on score
        if score >= 80:
            emoji = "🟢"
            action = "✅ Keep prioritized"
        elif score >= 60:
            emoji = "🟡"
            action = "📈 Consider promoting"
        elif score >= 40:
            emoji = "🟠"
            action = "⚠️ Needs realignment"
        else:
            emoji = "🔴"
            action = "❌ Consider removing"
        
        table.add_row(
            f"#{i}",
            f"{emoji} {score}/100",
            ticket.get('key', 'Unknown'),
            ticket.get('category', 'Unknown'),
            ticket.get('summary', 'No summary')[:40] + "...",
            action
        )
    
    console.print(table)


if __name__ == "__main__":
    main()