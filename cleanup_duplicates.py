#!/usr/bin/env python3
"""
Clean up duplicate AI-BRIEF tickets, keeping only SCRUM-23 to SCRUM-37
"""

import os
from dotenv import load_dotenv
from jira import JIRA
from rich.console import Console

load_dotenv()
console = Console()

def cleanup_duplicates():
    """Delete duplicate tickets, keep only our test set"""
    
    jira_url = os.getenv("JIRA_URL")
    jira_email = os.getenv("JIRA_EMAIL") 
    jira_token = os.getenv("JIRA_API_TOKEN")
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    
    try:
        jira = JIRA(server=jira_url, basic_auth=(jira_email, jira_token))
        
        # Tickets to delete (duplicates from failed runs)
        tickets_to_delete = [
            "SCRUM-11", "SCRUM-12", "SCRUM-13", "SCRUM-14", "SCRUM-15",
            "SCRUM-16", "SCRUM-17", "SCRUM-18", "SCRUM-19", "SCRUM-20", "SCRUM-21"
        ]
        
        console.print(f"[bold red]🗑️ Cleaning up {len(tickets_to_delete)} duplicate tickets[/bold red]")
        console.print("[yellow]These are duplicates from failed creation attempts[/yellow]")
        console.print("[green]Keeping SCRUM-23 to SCRUM-37 (our perfect test set)[/green]\\n")
        
        # Show what will be deleted
        for ticket_key in tickets_to_delete:
            try:
                issue = jira.issue(ticket_key)
                console.print(f"Will delete: {ticket_key} - {issue.fields.summary[:60]}...")
            except:
                console.print(f"[dim]{ticket_key} not found (already deleted?)[/dim]")
        
        # Auto-confirm deletion (these are confirmed duplicates)
        console.print(f"\\n[green]Proceeding to delete {len(tickets_to_delete)} duplicate tickets...[/green]")
        
        # Delete tickets
        deleted_count = 0
        for ticket_key in tickets_to_delete:
            try:
                issue = jira.issue(ticket_key)
                issue.delete()
                console.print(f"[red]🗑️ Deleted {ticket_key}[/red]")
                deleted_count += 1
            except Exception as e:
                console.print(f"[yellow]⚠️ Couldn't delete {ticket_key}: {e}[/yellow]")
        
        console.print(f"\\n[green]✅ Successfully deleted {deleted_count} duplicate tickets![/green]")
        console.print("[cyan]Your board now has a clean test set: SCRUM-23 to SCRUM-37[/cyan]")
        
        return deleted_count
        
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        return 0

if __name__ == "__main__":
    console.print("[bold]🧹 Jira Cleanup - Remove Duplicate Test Tickets[/bold]\\n")
    cleanup_duplicates()