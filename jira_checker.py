#!/usr/bin/env python3
"""
Check Jira configuration to see available issue types and fields
"""

import os
from dotenv import load_dotenv
from jira import JIRA
from rich.console import Console

load_dotenv()
console = Console()

def check_jira_config():
    """Check available issue types and fields in Jira"""
    
    # Connect
    jira_url = os.getenv("JIRA_URL")
    jira_email = os.getenv("JIRA_EMAIL") 
    jira_token = os.getenv("JIRA_API_TOKEN")
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    
    try:
        jira = JIRA(
            server=jira_url,
            basic_auth=(jira_email, jira_token)
        )
        console.print(f"[green]✅ Connected to {jira_url}[/green]")
        
        # Get project
        project = jira.project(project_key)
        console.print(f"\n[bold]Project: {project.name} ({project.key})[/bold]")
        
        # Get issue types
        console.print("\n[bold cyan]Available Issue Types:[/bold cyan]")
        issue_types = jira.issue_types()
        for it in issue_types:
            console.print(f"  • {it.name} (id: {it.id})")
        
        # Get priorities
        console.print("\n[bold cyan]Available Priorities:[/bold cyan]")
        try:
            priorities = jira.priorities()
            for p in priorities:
                console.print(f"  • {p.name} (id: {p.id})")
        except:
            console.print("  [yellow]Priority field not available[/yellow]")
        
        # Get fields
        console.print("\n[bold cyan]Available Fields:[/bold cyan]")
        fields = jira.fields()
        field_names = [f['name'] for f in fields if 'name' in f]
        # Show only common fields
        common_fields = ['Summary', 'Description', 'Issue Type', 'Priority', 'Labels', 'Sprint', 'Story Points', 'Epic Link']
        for field_name in common_fields:
            if field_name in field_names:
                console.print(f"  ✓ {field_name}")
            else:
                console.print(f"  ✗ {field_name} [red](not available)[/red]")
        
        # Check create meta
        console.print("\n[bold cyan]Create Metadata for Project:[/bold cyan]")
        try:
            # Get creatable issue types for the project
            issue_create_meta = jira.createmeta(projectKeys=project_key, expand='projects.issuetypes.fields')
            if issue_create_meta['projects']:
                project_meta = issue_create_meta['projects'][0]
                console.print(f"Project can create these issue types:")
                for issue_type in project_meta['issuetypes']:
                    console.print(f"  • {issue_type['name']}")
        except Exception as e:
            console.print(f"  [red]Could not fetch create metadata: {e}[/red]")
        
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")

if __name__ == "__main__":
    console.print("[bold]🔍 Jira Configuration Checker[/bold]\n")
    check_jira_config()