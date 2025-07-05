#!/usr/bin/env python3
"""
Steve - Strategic Ticket Evaluation & Vision Enforcer
Main CLI entry point
"""

import os
import sys
import click
from dotenv import load_dotenv
from rich.console import Console

from core.schemas import ReviewMode
from core.orchestrator import SteveOrchestrator
from utils.logger import get_logger

# Load environment variables
load_dotenv()

console = Console()
logger = get_logger(__name__)


@click.command()
@click.option(
    '--mode', '-m',
    type=click.Choice(['execution', 'strategy', 'full_review']),
    default='execution',
    help='Review mode: execution (current sprint), strategy (epics), or full_review (all)'
)
@click.option(
    '--project', '-p',
    help='Jira project key (overrides env variable)'
)
@click.option(
    '--test', 
    is_flag=True,
    help='Run in test mode with mock data'
)
@click.option(
    '--dry-run',
    is_flag=True,
    help='Analyze without updating Jira'
)
@click.option(
    '--report', '-r',
    type=click.Path(),
    help='Save HTML report to file'
)
@click.option(
    '--no-write',
    is_flag=True,
    help='Alias for --dry-run'
)
def main(mode, project, test, dry_run, report, no_write):
    """
    Steve - Strategic Ticket Evaluation & Vision Enforcer
    
    Analyzes Jira tickets for strategic alignment and suggests improvements.
    """
    # ASCII art banner
    console.print("""
    [bold cyan]
     _____ _______ ________      ________ 
    / ____|__   __|  ____\ \    / /  ____|
   | (___    | |  | |__   \ \  / /| |__   
    \___ \   | |  |  __|   \ \/ / |  __|  
    ____) |  | |  | |____   \  /  | |____ 
   |_____/   |_|  |______|   \/   |______|
   
   Strategic Ticket Evaluation & Vision Enforcer
    [/bold cyan]
    """)
    
    # Validate environment
    if not test and not os.getenv("JIRA_URL"):
        console.print("[red]Error: JIRA_URL not set in environment[/red]")
        console.print("Please copy .env.example to .env and configure it")
        sys.exit(1)
    
    # Handle dry run aliases
    if no_write:
        dry_run = True
    
    # Initialize Steve
    try:
        steve = SteveOrchestrator(test_mode=test, dry_run=dry_run)
        
        # Run analysis
        review_mode_enum = ReviewMode(mode)
        results = steve.run(
            review_mode=review_mode_enum,
            project_key=project
        )
        
        # Generate report if requested
        if report and results:
            generate_html_report(results, report)
            logger.steve.success(f"Report saved to {report}")
        
    except KeyboardInterrupt:
        console.print("\n[yellow]Analysis interrupted by user[/yellow]")
        sys.exit(0)
    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        logger.exception("Unexpected error")
        sys.exit(1)


def generate_html_report(results, output_path):
    """Generate HTML report from results"""
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Steve Alignment Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ background: #2c3e50; color: white; padding: 20px; border-radius: 8px; }}
            .metric {{ display: inline-block; margin: 20px; padding: 20px; background: #ecf0f1; border-radius: 8px; }}
            .core-value {{ color: #27ae60; }}
            .strategic-enabler {{ color: #3498db; }}
            .drift {{ color: #f39c12; }}
            .distraction {{ color: #e74c3c; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
            .recommendations {{ background: #fffacd; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎯 Steve Alignment Report</h1>
            <p>Strategic Ticket Evaluation & Vision Enforcer</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <h3>Total Tickets</h3>
                <p style="font-size: 2em;">{total}</p>
            </div>
            <div class="metric">
                <h3>Average Alignment</h3>
                <p style="font-size: 2em;">{avg_score:.1f}/100</p>
            </div>
            <div class="metric">
                <h3>Drift Rate</h3>
                <p style="font-size: 2em;">{drift_pct:.0f}%</p>
            </div>
        </div>
        
        <h2>Alignment Breakdown</h2>
        <table>
            <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Percentage</th>
            </tr>
            {breakdown_rows}
        </table>
        
        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            <ul>
                {recommendations}
            </ul>
        </div>
        
        <h2>Ticket Details</h2>
        <table>
            <tr>
                <th>Ticket</th>
                <th>Summary</th>
                <th>Score</th>
                <th>Category</th>
            </tr>
            {ticket_rows}
        </table>
    </body>
    </html>
    """
    
    summary = results['summary']
    
    # Generate breakdown rows
    breakdown_rows = ""
    for category, count in summary.alignment_breakdown.items():
        pct = (count / summary.total_tickets * 100) if summary.total_tickets > 0 else 0
        breakdown_rows += f"""
            <tr>
                <td class="{category.value}">{category.value.replace('_', ' ').title()}</td>
                <td>{count}</td>
                <td>{pct:.1f}%</td>
            </tr>
        """
    
    # Generate recommendations
    recommendations = "\n".join(f"<li>{rec}</li>" for rec in summary.recommendations)
    
    # Generate ticket rows
    ticket_rows = ""
    for ticket, alignment in zip(results['tickets'], results['alignments']):
        ticket_rows += f"""
            <tr>
                <td>{ticket.key}</td>
                <td>{ticket.summary}</td>
                <td>{alignment.alignment_score:.0f}</td>
                <td class="{alignment.category.value}">{alignment.category.value.replace('_', ' ').title()}</td>
            </tr>
        """
    
    # Fill template
    html = html_template.format(
        total=summary.total_tickets,
        avg_score=summary.average_alignment_score,
        drift_pct=summary.drift_percentage,
        breakdown_rows=breakdown_rows,
        recommendations=recommendations,
        ticket_rows=ticket_rows
    )
    
    with open(output_path, 'w') as f:
        f.write(html)


if __name__ == '__main__':
    main()