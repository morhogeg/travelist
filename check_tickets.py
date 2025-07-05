#!/usr/bin/env python3
"""
Check which tickets exist and identify our test tickets
"""

import os
from dotenv import load_dotenv
from jira import JIRA
from rich.console import Console
from rich.table import Table

load_dotenv()
console = Console()

def check_all_tickets():
    """List all tickets to see what we have"""
    
    jira_url = os.getenv("JIRA_URL")
    jira_email = os.getenv("JIRA_EMAIL") 
    jira_token = os.getenv("JIRA_API_TOKEN")
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    
    try:
        jira = JIRA(
            server=jira_url,
            basic_auth=(jira_email, jira_token)
        )
        
        # Get all tickets ordered by key
        jql = f"project = {project_key} ORDER BY key DESC"
        issues = jira.search_issues(jql, maxResults=50)
        
        console.print(f"\n[bold]All tickets in {project_key}:[/bold]")
        
        # Create table
        table = Table(title=f"Tickets in {project_key}")
        table.add_column("Key", style="cyan")
        table.add_column("Type", style="blue")
        table.add_column("Summary", style="white")
        table.add_column("Labels", style="yellow")
        
        ai_brief_tickets = []
        steve_test_tickets = []
        other_tickets = []
        
        for issue in issues:
            summary = issue.fields.summary
            issue_type = issue.fields.issuetype.name
            labels = ', '.join(issue.fields.labels) if issue.fields.labels else "None"
            
            # Categorize tickets
            if "[AI-BRIEF]" in summary:
                ai_brief_tickets.append(issue.key)
                table.add_row(issue.key, issue_type, summary[:60] + "...", labels, style="green")
            elif "[STEVE-TEST]" in summary:
                steve_test_tickets.append(issue.key)
                table.add_row(issue.key, issue_type, summary[:60] + "...", labels, style="blue")
            else:
                other_tickets.append(issue.key)
                table.add_row(issue.key, issue_type, summary[:60] + "...", labels, style="dim")
        
        console.print(table)
        
        # Summary
        console.print(f"\n[bold]Summary:[/bold]")
        console.print(f"[green]• {len(ai_brief_tickets)} AI-BRIEF tickets (our 15 test tickets)[/green]")
        console.print(f"[blue]• {len(steve_test_tickets)} STEVE-TEST tickets (older tests)[/blue]")
        console.print(f"[dim]• {len(other_tickets)} other tickets[/dim]")
        
        if len(ai_brief_tickets) == 15:
            console.print(f"\n[green]✅ Perfect! We have exactly 15 AI-BRIEF tickets to test[/green]")
            console.print(f"Range: {ai_brief_tickets[-1]} to {ai_brief_tickets[0]}")
        elif len(ai_brief_tickets) > 15:
            console.print(f"\n[yellow]⚠️ We have {len(ai_brief_tickets)} AI-BRIEF tickets (expected 15)[/yellow]")
            console.print("Some might be duplicates from failed runs")
        else:
            console.print(f"\n[red]❌ Only {len(ai_brief_tickets)} AI-BRIEF tickets found[/red]")
        
        return ai_brief_tickets, steve_test_tickets, other_tickets
        
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        return [], [], []

if __name__ == "__main__":
    console.print("[bold]🔍 Checking All Tickets[/bold]")
    ai_brief, steve_test, others = check_all_tickets()
    
    if len(ai_brief) >= 15:
        console.print(f"\n[green]🚀 Ready to test Steve on AI-BRIEF tickets![/green]")
        console.print("Run: python3 real_steve.py --mode full_review --dry-run")
        console.print("Look for tickets with [AI-BRIEF] in the output")