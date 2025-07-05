#!/usr/bin/env python3
"""
Steve CLI - Simple command line interface
"""

import click
from rich.console import Console
from crew_steve import run_steve

console = Console()

@click.command()
@click.option('--mode', '-m', 
              type=click.Choice(['execution', 'strategy', 'full_review']),
              default='execution',
              help='Review mode')
@click.option('--project', '-p', help='Jira project key')
@click.option('--test', is_flag=True, help='Test mode with mock data')
@click.option('--dry-run', is_flag=True, help='Analyze without updating Jira')
def main(mode, project, test, dry_run):
    """Steve - Strategic Ticket Evaluation & Vision Enforcer"""
    
    console.print(r"""
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
    
    try:
        results = run_steve(
            review_mode=mode,
            project_key=project,
            test_mode=test,
            dry_run=dry_run
        )
        console.print("[green]✅ Analysis complete![/green]")
        
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")

if __name__ == "__main__":
    main()