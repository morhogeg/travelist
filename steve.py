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
from crew_steve_core import run_steve as crew_main, create_agents, create_tasks
from real_steve import (
    connect_to_jira, 
    check_steve_custom_fields,
    update_jira_tickets,
    display_sorted_list
)
from core.schemas import ReviewMode
from utils.logger import get_logger
from utils.notion_integration import create_notion_manager

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
@click.option(
    "--no-notion", 
    is_flag=True, 
    help="Skip saving executive summary to Notion"
)
def main(mode, project, dry_run, test, sorted, analysis_only, no_notion):
    """
    STEVE - Strategic Ticket Evaluation & Vision Enforcer
    
    Unified command that runs complete strategic analysis:
    - Multi-agent AI analysis using CrewAI
    - Jira ticket updates with scores and categories
    - Executive summary generation
    - Strategic priority recommendations
    - Automatic Google Docs export with timestamped files
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
            analysis_results = crew_main(review_mode=mode, project_key=project_key, test_mode=test, dry_run=dry_run)
        else:
            # Run full CrewAI analysis with real data
            analysis_results = crew_main(review_mode=mode, project_key=project_key, test_mode=False, dry_run=dry_run)
        
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
        
        if analysis_results:
            # Display executive summary if available
            if 'executive_narrative' in analysis_results:
                console.print(analysis_results['executive_narrative'])
            elif 'summary' in analysis_results:
                console.print(analysis_results['summary'])
            
            # Step 4.1: Save to Notion (if not disabled)
            if not no_notion:
                console.print("\n[bold cyan]📄 Saving to Notion...[/bold cyan]")
                # Extract sprint name from ticket data if available
                sprint_name = extract_sprint_name(analysis_results.get('alignments', []))
                
                # Generate full structured report for Notion
                full_report = generate_structured_report(analysis_results, project_key, mode)
                    
                if full_report:
                    save_to_notion(full_report, project_key, mode, sprint_name)
                else:
                    console.print("[yellow]⚠️ No report data found to save[/yellow]")
            else:
                console.print("\n[dim]📄 Notion integration disabled[/dim]")
        
        if sorted and analysis_results and 'alignments' in analysis_results:
            # Display sorted priority list
            console.print("\n[bold cyan]📋 Strategic Priority List[/bold cyan]")
            display_sorted_results(analysis_results['alignments'])
        
        # Step 5: Success Message
        console.print(f"\n[green]🎉 STEVE analysis complete![/green]")
        
        if not test and not dry_run:
            console.print("\n[bold cyan]📋 Next Steps:[/bold cyan]")
            console.print("1. Check your Jira tickets for STEVE analysis comments")
            console.print("2. Sort your board by 'STEVE Alignment Score' for strategic prioritization")
            console.print("3. Review misaligned tickets for potential realignment")
            if not no_notion:
                console.print("4. Check the Notion page link above for the full executive summary")
        
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


def display_sorted_results(alignments):
    """Display sorted strategic priority list"""
    
    if not alignments:
        console.print("[yellow]⚠️ No alignments to display[/yellow]")
        return
    
    # Sort alignments by score (highest first)
    sorted_alignments = sorted(alignments, key=lambda x: x.get('score', 0), reverse=True)
    
    from rich.table import Table
    
    table = Table(title="Strategic Priority Ranking")
    table.add_column("Rank", style="dim")
    table.add_column("Score", style="bold")
    table.add_column("Ticket", style="cyan")
    table.add_column("Category", style="green")
    table.add_column("Rationale", style="white")
    table.add_column("Action", style="yellow")
    
    for i, alignment in enumerate(sorted_alignments[:10], 1):  # Show top 10
        score = alignment.get('score', 0)
        
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
            alignment.get('ticket_key', 'Unknown'),
            alignment.get('category', 'Unknown').replace('_', ' ').title(),
            alignment.get('rationale', 'No rationale')[:40] + "...",
            action
        )
    
    console.print(table)


def extract_sprint_name(alignments: list) -> str:
    """
    Extract sprint name from alignment data or create a generic one
    
    Args:
        alignments: List of alignment data from crew_steve
        
    Returns:
        str: Sprint name or None if not found
    """
    if not alignments:
        return None
    
    # For now, we'll create a generic sprint name based on the first ticket
    # Later this could be enhanced to extract actual sprint info from Jira
    if len(alignments) > 0:
        first_ticket = alignments[0].get('ticket_key', '')
        if first_ticket:
            # Extract project prefix (e.g., "SCRUM" from "SCRUM-123")
            project_prefix = first_ticket.split('-')[0] if '-' in first_ticket else 'PROJ'
            return f"{project_prefix}_Sprint"
    
    return None


def generate_structured_report(analysis_results: dict, project_key: str, mode: str) -> str:
    """
    Generate a full structured report like the example sprint summary
    
    Args:
        analysis_results: Results from the crew analysis
        project_key: The Jira project key
        mode: The review mode
        
    Returns:
        str: Formatted report content
    """
    from datetime import datetime
    
    # Extract data from results
    summary = analysis_results.get('summary', {})
    alignments = analysis_results.get('alignments', [])
    executive_narrative = analysis_results.get('executive_narrative', '')
    recommendations = summary.get('recommendations', [])
    
    total_tickets = summary.get('total_tickets', len(alignments))
    avg_score = summary.get('average_alignment_score', 0)
    drift_pct = summary.get('drift_percentage', 0)
    breakdown = summary.get('alignment_breakdown', {})
    
    # Calculate percentages
    core_value_pct = (breakdown.get('core_value', 0) / total_tickets * 100) if total_tickets > 0 else 0
    strategic_pct = (breakdown.get('strategic_enabler', 0) / total_tickets * 100) if total_tickets > 0 else 0
    drift_ticket_pct = (breakdown.get('drift', 0) / total_tickets * 100) if total_tickets > 0 else 0
    distraction_pct = (breakdown.get('distraction', 0) / total_tickets * 100) if total_tickets > 0 else 0
    
    # Sort alignments by score for the scorecard
    sorted_alignments = sorted(alignments, key=lambda x: x.get('score', 0), reverse=True)
    
    # Generate the report
    timestamp = datetime.now().strftime("%B %d, %Y")
    
    report = f"""# Strategic Alignment Report - {project_key} {mode.title()}

## Executive Summary

Analysis of {total_tickets} tickets shows an average strategic alignment of {avg_score:.1f}/100. """
    
    if avg_score >= 70:
        report += "The team demonstrates strong strategic focus with clear alignment to core principles."
    elif avg_score >= 50:
        report += "Moderate strategic alignment detected with opportunities for improvement."
    else:
        report += "Significant strategic drift identified - immediate course correction recommended."
    
    report += f"""

### What's Working Well
- {breakdown.get('core_value', 0)} Core Value tickets ({core_value_pct:.0f}%) directly advancing strategic goals
- {breakdown.get('strategic_enabler', 0)} Strategic Enabler tickets ({strategic_pct:.0f}%) building necessary foundation  
- Average alignment score of {avg_score:.1f}/100 shows {"strong" if avg_score >= 70 else "moderate" if avg_score >= 50 else "needs improvement"} performance

### Strategic Scorecard

| Rank | Ticket | Score | Category | Strategic Focus |
|------|--------|-------|----------|-----------------|"""
    
    # Add top tickets to scorecard
    for i, alignment in enumerate(sorted_alignments[:15], 1):  # Show top 15
        score = alignment.get('score', 0)
        ticket_key = alignment.get('ticket_key', 'Unknown')
        category = alignment.get('category', 'Unknown').replace('_', ' ').title()
        
        # Determine emoji and focus
        if score >= 80:
            emoji = "🟢"
            focus = "High Impact"
        elif score >= 60:
            emoji = "🟡"
            focus = "Strategic Support"
        elif score >= 40:
            emoji = "🟠"
            focus = "Needs Alignment"
        else:
            emoji = "🔴"
            focus = "Requires Review"
        
        report += f"\n| {i} | {ticket_key} | {emoji} {score:.0f} | {category} | {focus} |"
    
    report += f"""

### Alignment Analysis
- Average Score: {avg_score:.1f}/100 — {"Excellent progress!" if avg_score >= 70 else "Good foundation" if avg_score >= 50 else "Needs focus"}
- Core Value: {core_value_pct:.0f}% (Target: 60%+)
- Strategic Enabler: {strategic_pct:.0f}%
- Drift: {drift_ticket_pct:.0f}%
- Distraction: {distraction_pct:.0f}%

### Strategic Category Definitions

Core Value: High-impact work that directly advances our product's core mission and strategic principles. These tickets create visible progress toward our most important objectives.

Strategic Enabler: Foundational infrastructure or internal improvements that unlock future value. While not always user-facing, they are necessary to support Core Value delivery.

Drift: Well-intentioned work that lacks clear strategic connection. Often includes maintenance tasks or updates that consume capacity without clearly serving strategic priorities.

Distraction: Work that not only lacks alignment but carries opportunity cost — tasks that should be reframed, deferred, or stopped altogether to maintain strategic focus.

"""
    
    # Add executive narrative if available
    if executive_narrative:
        report += f"""### Executive Insights

{executive_narrative}

"""
    
    # Add recommendations
    if recommendations:
        report += "### Recommendations for Next Sprint\n\n"
        for i, rec in enumerate(recommendations[:7], 1):  # Max 7 recommendations
            report += f"{i}. {rec}\n"
    
    # Add detailed analysis of top and bottom performers
    if sorted_alignments:
        report += """## Detailed Ticket Analysis

### Top Performers (Expand & Scale)
"""
        top_performers = [a for a in sorted_alignments if a.get('score', 0) >= 80][:5]
        for alignment in top_performers:
            ticket_key = alignment.get('ticket_key', 'Unknown')
            score = alignment.get('score', 0)
            rationale = alignment.get('rationale', 'No rationale provided')
            report += f"- {ticket_key}: {score:.0f}/100 — {rationale}\n"
        
        if not top_performers:
            report += "- No tickets scoring 80+ points. Focus on aligning work with strategic principles.\n"
        
        report += "\n### Areas for Improvement\n"
        low_performers = [a for a in sorted_alignments if a.get('score', 0) < 60][-5:]  # Bottom 5
        for alignment in low_performers:
            ticket_key = alignment.get('ticket_key', 'Unknown')
            score = alignment.get('score', 0)
            rationale = alignment.get('rationale', 'No rationale provided')
            report += f"- {ticket_key}: {score:.0f}/100 — {rationale}\n"
    
    report += f"""

---

### Report Details

Generated on {timestamp} by **STEVE** - Strategic Ticket Evaluation & Vision Enforcer

*"Are we building what matters?" - The question that drives strategic excellence*

---

### Strategic Principles Reference

For reference, this analysis was conducted against the following strategic principles:

1. **Builder-First Value** (Weight: 1.5) - Every feature must help developers build real AI systems
2. **AI Agent Excellence** (Weight: 1.3) - Focus on multi-agent systems and agentic architectures  
3. **Fresh Intelligence** (Weight: 1.2) - Deliver cutting-edge AI insights from recent developments
4. **Premium Source Curation** (Weight: 1.1) - Aggregate from high-quality research and repositories
5. **Seamless Integration** (Weight: 1.0) - Integrate smoothly with developer workflows

*For questions about this analysis or to adjust strategic principles, contact the product strategy team.*
"""
    
    return report


def save_to_notion(summary_text: str, project_key: str, mode: str, sprint_name: str = None):
    """
    Save the executive summary to a Notion page
    
    Args:
        summary_text: The executive summary content
        project_key: The Jira project key
        mode: The review mode (execution, strategy, full_review)
        sprint_name: The actual sprint name from Jira (optional)
    """
    try:
        # Create Notion manager
        notion_manager = create_notion_manager()
        
        # Authenticate with Notion API
        if not notion_manager.authenticate():
            console.print("[yellow]⚠️ Failed to authenticate with Notion API[/yellow]")
            console.print("[dim]Make sure you have set up NOTION_TOKEN and NOTION_DATABASE_ID[/dim]")
            return
        
        # Use actual sprint name if available, otherwise create one
        if sprint_name:
            doc_sprint_name = f"{project_key}_{sprint_name}"
        else:
            doc_sprint_name = f"{project_key}_{mode}"
        
        # Save to Notion
        page_url = notion_manager.create_executive_summary_page(summary_text, doc_sprint_name)
        
        if page_url:
            console.print(f"[green]✅ Executive summary saved to Notion![/green]")
            console.print(f"[blue]📄 Page URL: {page_url}[/blue]")
        else:
            console.print("[yellow]⚠️ Failed to save to Notion[/yellow]")
            
    except Exception as e:
        console.print(f"[yellow]⚠️ Error saving to Notion: {str(e)}[/yellow]")
        logger.error(f"Notion save failed: {e}")


if __name__ == "__main__":
    main()