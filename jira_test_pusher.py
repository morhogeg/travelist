#!/usr/bin/env python3
"""
Jira Test Ticket Pusher
Creates test tickets in your real Jira for Steve to analyze
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from jira import JIRA
from rich.console import Console

load_dotenv()
console = Console()

# Test tickets to create (mix of strategic and non-strategic)
TEST_TICKETS = [
    {
        "summary": "Optimize API response times to improve user experience",
        "description": """Current API endpoints are taking 2-3 seconds to respond, causing poor user experience.
        
Target: Reduce response time to under 500ms
Impact: Better customer satisfaction and retention
        
Technical approach:
- Database query optimization
- Add Redis caching layer
- Review N+1 queries""",
        "issuetype": "Story",
        "priority": "High"
    },
    {
        "summary": "Add animated GIF support to chat messages",
        "description": """Users have requested the ability to send animated GIFs in chat messages for more engaging conversations.
        
Requirements:
- Support common GIF formats
- File size limit: 5MB
- Preview functionality
- Mobile compatibility""",
        "issuetype": "Story", 
        "priority": "Low"
    },
    {
        "summary": "Fix critical bug causing data loss on session timeout",
        "description": """CRITICAL: Users are losing unsaved work when their session expires unexpectedly.
        
Steps to reproduce:
1. User works on document for 30+ minutes
2. Session expires
3. User data is lost
        
Impact: Customer complaints, data loss, poor reliability
Priority: Must fix immediately""",
        "issuetype": "Bug",
        "priority": "Critical"
    },
    {
        "summary": "Implement real-time collaboration features for better teamwork",
        "description": """Add real-time collaboration capabilities to improve team productivity.
        
Features:
- Live cursor tracking
- Real-time text editing
- Presence indicators
- Conflict resolution
        
Business value: Increase team efficiency and user engagement""",
        "issuetype": "Story",
        "priority": "Medium"
    },
    {
        "summary": "Refactor legacy authentication module",
        "description": """The current authentication system is outdated and difficult to maintain.
        
Issues:
- Old code patterns
- Hard to extend
- Performance concerns
- Security vulnerabilities
        
Proposal: Modernize with current best practices""",
        "issuetype": "Task",
        "priority": "Medium"
    },
    {
        "summary": "Add custom emoji picker to improve user engagement",
        "description": """Users want to express themselves with custom emojis in the platform.
        
Requirements:
- Custom emoji upload
- Emoji picker UI
- Emoji categories
- Search functionality""",
        "issuetype": "Story",
        "priority": "Low"
    }
]

def connect_to_jira():
    """Connect to Jira using credentials from .env"""
    jira_url = os.getenv("JIRA_URL")
    jira_email = os.getenv("JIRA_EMAIL") 
    jira_token = os.getenv("JIRA_API_TOKEN")
    
    if not all([jira_url, jira_email, jira_token]):
        console.print("[red]❌ Missing Jira credentials in .env file[/red]")
        return None
    
    try:
        jira = JIRA(
            server=jira_url,
            basic_auth=(jira_email, jira_token)
        )
        console.print(f"[green]✅ Connected to {jira_url}[/green]")
        return jira
        
    except Exception as e:
        console.print(f"[red]❌ Failed to connect to Jira: {e}[/red]")
        return None

def get_project_info(jira, project_key):
    """Get project information and available issue types"""
    try:
        project = jira.project(project_key)
        console.print(f"[green]✅ Found project: {project.name}[/green]")
        
        # Get available issue types
        issue_types = jira.issue_types()
        available_types = [it.name for it in issue_types]
        console.print(f"Available issue types: {', '.join(available_types)}")
        
        return project, available_types
        
    except Exception as e:
        console.print(f"[red]❌ Error accessing project {project_key}: {e}[/red]")
        return None, []

def create_test_tickets(jira, project_key, available_types):
    """Create test tickets in Jira"""
    created_tickets = []
    
    for i, ticket_data in enumerate(TEST_TICKETS, 1):
        try:
            # Use available issue type or default to Story
            issue_type = ticket_data["issuetype"]
            if issue_type not in available_types:
                if "Story" in available_types:
                    issue_type = "Story"
                elif "Task" in available_types:
                    issue_type = "Task"
                else:
                    issue_type = available_types[0]  # Use first available
            
            # Prepare issue data
            issue_dict = {
                'project': {'key': project_key},
                'summary': f"[STEVE-TEST] {ticket_data['summary']}",
                'description': ticket_data['description'],
                'issuetype': {'name': issue_type}
            }
            
            # Add priority if available
            try:
                priorities = jira.priorities()
                available_priorities = [p.name for p in priorities]
                if ticket_data['priority'] in available_priorities:
                    issue_dict['priority'] = {'name': ticket_data['priority']}
            except:
                pass  # Skip priority if not available
            
            # Create the issue
            new_issue = jira.create_issue(fields=issue_dict)
            created_tickets.append(new_issue.key)
            
            console.print(f"[green]✅ Created {new_issue.key}: {ticket_data['summary'][:50]}...[/green]")
            
        except Exception as e:
            console.print(f"[red]❌ Failed to create ticket {i}: {e}[/red]")
    
    return created_tickets

def main():
    """Main function"""
    console.print("""
[bold cyan]🎯 Jira Test Ticket Pusher[/bold cyan]
Creating test tickets for Steve to analyze...
    """)
    
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    
    # Connect to Jira
    jira = connect_to_jira()
    if not jira:
        return
    
    # Get project info
    project, available_types = get_project_info(jira, project_key)
    if not project:
        return
    
    # Confirm before creating tickets
    console.print(f"\n[yellow]About to create {len(TEST_TICKETS)} test tickets in project {project_key}[/yellow]")
    console.print("[yellow]All tickets will be prefixed with [STEVE-TEST][/yellow]")
    
    response = input("\nProceed? (y/N): ")
    if response.lower() != 'y':
        console.print("[yellow]Cancelled.[/yellow]")
        return
    
    # Create tickets
    console.print(f"\n[cyan]Creating {len(TEST_TICKETS)} test tickets...[/cyan]")
    created_tickets = create_test_tickets(jira, project_key, available_types)
    
    if created_tickets:
        console.print(f"\n[green]🎉 Successfully created {len(created_tickets)} test tickets![/green]")
        console.print("\n[bold]Created tickets:[/bold]")
        for ticket_key in created_tickets:
            console.print(f"  • {ticket_key}")
        
        console.print(f"\n[cyan]Next steps:[/cyan]")
        console.print("1. ✅ View tickets in your Jira")
        console.print("2. ✅ Run Steve analysis: python3 real_steve.py")
        console.print("3. ✅ See how Steve scores and categorizes them")
        
    else:
        console.print("[red]❌ No tickets were created successfully[/red]")

if __name__ == "__main__":
    main()