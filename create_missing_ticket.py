#!/usr/bin/env python3
"""
Create the missing 15th ticket (mobile app)
"""

import os
from dotenv import load_dotenv
from jira import JIRA
from rich.console import Console

load_dotenv()
console = Console()

def create_missing_ticket():
    """Create the mobile app ticket that failed"""
    
    jira_url = os.getenv("JIRA_URL")
    jira_email = os.getenv("JIRA_EMAIL") 
    jira_token = os.getenv("JIRA_API_TOKEN")
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    
    try:
        jira = JIRA(
            server=jira_url,
            basic_auth=(jira_email, jira_token)
        )
        
        # The missing ticket (was supposed to be Epic, make it Story)
        missing_ticket = {
            'project': {'key': project_key},
            'summary': '[AI-BRIEF] Create mobile app for reading AI briefs on the go',
            'description': '''Develop iOS/Android app for mobile brief consumption.

Features:
- Native app experience
- Offline reading
- Push notifications
- Mobile-optimized UI

Major effort that diverges from builder tools focus.''',
            'issuetype': {'name': 'Story'},  # Changed from Epic to Story
            'priority': {'name': 'Low'},
            'labels': ['mobile', 'app', 'ios', 'android']
        }
        
        console.print("[yellow]Creating missing ticket: Mobile app...[/yellow]")
        new_issue = jira.create_issue(fields=missing_ticket)
        
        console.print(f"[green]✅ Created {new_issue.key}: Mobile app (Distraction)[/green]")
        console.print("[green]🎉 Now you have all 15 tickets![/green]")
        
        return new_issue.key
        
    except Exception as e:
        console.print(f"[red]❌ Failed: {e}[/red]")
        return None

if __name__ == "__main__":
    console.print("[bold]📱 Creating Missing Mobile App Ticket[/bold]\n")
    
    ticket_key = create_missing_ticket()
    if ticket_key:
        console.print(f"\n[cyan]Perfect! Now you have tickets SCRUM-23 through {ticket_key}[/cyan]")
        console.print("\n[bold]Ready to test Steve:[/bold]")
        console.print("python3 real_steve.py --mode full_review --dry-run")
    else:
        console.print("\n[yellow]Let's try a different approach...[/yellow]")