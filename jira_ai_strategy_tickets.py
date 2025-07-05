#!/usr/bin/env python3
"""
Create AI Strategy Brief Generator tickets for Jira
Mix of strategic and non-strategic tickets to test all Steve categories
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from jira import JIRA
from rich.console import Console

load_dotenv()
console = Console()

# AI Strategy Brief Generator tickets - mix of all alignment levels
AI_STRATEGY_TICKETS = [
    # CORE VALUE tickets (should score 80-100)
    {
        "summary": "Add CrewAI tutorial generator that creates hands-on 30-minute projects",
        "description": """Implement a new agent that generates buildable CrewAI tutorials from trending GitHub repos.

Requirements:
- Scan trending AI agent repos
- Generate step-by-step implementation guides
- Include working code examples
- Target 30-60 minute build time
- Output as actionable Notion pages

This directly supports our builder-first mission by creating practical, hands-on content.""",
        "issuetype": "Story",
        "priority": "High",
        "labels": ["core-feature", "agents", "buildable"]
    },
    {
        "summary": "Implement multi-agent pipeline for RAG system analysis with code examples",
        "description": """Create a specialized multi-agent system to analyze and score RAG implementations.

Agents needed:
- RAG Scanner: Find latest RAG implementations
- Code Analyzer: Extract buildable patterns
- Tutorial Builder: Create hands-on guides
- Pipeline Orchestrator: Manage agent workflow

Must include working demos and practical implementation steps.""",
        "issuetype": "Story",
        "priority": "High",
        "labels": ["multi-agent", "RAG", "pipeline"]
    },
    {
        "summary": "Build real-time GitHub trending AI repos scanner with daily fresh content",
        "description": """Develop agent to scan GitHub for trending AI repositories from last 24 hours.

Features:
- Real-time monitoring of AI/ML topics
- Filter for repos with working demos
- Extract buildable examples
- Daily fresh content updates
- Integration with existing pipeline

Ensures we always have the latest buildable AI content.""",
        "issuetype": "Story",
        "priority": "Critical",
        "labels": ["fresh-content", "github", "real-time"]
    },
    
    # STRATEGIC ENABLER tickets (should score 60-79)
    {
        "summary": "Add Notion API v2 integration for better workflow automation",
        "description": """Upgrade to Notion API v2 for improved integration capabilities.

Benefits:
- Better automation support
- Faster page creation
- Enhanced formatting options
- Webhook support for real-time updates

Supports seamless integration principle.""",
        "issuetype": "Story",
        "priority": "Medium",
        "labels": ["integration", "notion", "automation"]
    },
    {
        "summary": "Create premium source validator for Hacker News AI discussions",
        "description": """Build a validator to ensure high-quality content from HN discussions.

Requirements:
- Score comment quality
- Filter by user reputation
- Verify linked resources
- Focus on technical discussions

Enhances our premium source curation.""",
        "issuetype": "Task",
        "priority": "Medium",
        "labels": ["curation", "quality", "sources"]
    },
    {
        "summary": "Implement scheduled daily runs with workflow automation",
        "description": """Set up automated daily execution of the brief generator.

Features:
- Cron-based scheduling
- Error recovery
- Status notifications
- Pipeline monitoring

Improves workflow integration.""",
        "issuetype": "Task",
        "priority": "Medium",
        "labels": ["automation", "scheduled", "workflow"]
    },
    
    # DRIFT tickets (should score 40-59)
    {
        "summary": "Add email digest feature for weekly summaries",
        "description": """Create email digest functionality to send weekly AI brief summaries.

Requirements:
- HTML email templates
- Weekly aggregation logic
- Subscriber management
- Unsubscribe handling

While useful, this drifts from our core builder-first focus.""",
        "issuetype": "Story",
        "priority": "Low",
        "labels": ["email", "digest", "weekly"]
    },
    {
        "summary": "Build analytics dashboard for tracking brief performance",
        "description": """Create dashboard to visualize brief metrics and engagement.

Metrics:
- View counts
- Click-through rates
- Popular topics
- User engagement

Provides insights but doesn't directly help builders.""",
        "issuetype": "Story",
        "priority": "Low",
        "labels": ["analytics", "dashboard", "metrics"]
    },
    {
        "summary": "Implement user authentication system for personalized briefs",
        "description": """Add user accounts for personalized AI brief experiences.

Features:
- Login/signup flow
- User preferences
- Saved searches
- History tracking

Adds complexity without advancing core mission.""",
        "issuetype": "Story",
        "priority": "Low",
        "labels": ["auth", "users", "personalization"]
    },
    
    # DISTRACTION tickets (should score <40)
    {
        "summary": "Design new logo and branding for the project",
        "description": """Create professional branding assets for AI Strategy Brief.

Deliverables:
- Logo design
- Color palette
- Typography guide
- Brand guidelines

Important for marketing but not our core focus.""",
        "issuetype": "Task",
        "priority": "Low",
        "labels": ["design", "branding", "marketing"]
    },
    {
        "summary": "Add social media sharing buttons to brief pages",
        "description": """Implement social sharing functionality.

Platforms:
- Twitter/X
- LinkedIn
- Facebook
- Reddit

Increases reach but doesn't help builders build.""",
        "issuetype": "Task",
        "priority": "Low",
        "labels": ["social", "sharing", "marketing"]
    },
    {
        "summary": "Create mobile app for reading AI briefs on the go",
        "description": """Develop iOS/Android app for mobile brief consumption.

Features:
- Native app experience
- Offline reading
- Push notifications
- Mobile-optimized UI

Major effort that diverges from builder tools focus.""",
        "issuetype": "Epic",
        "priority": "Low",
        "labels": ["mobile", "app", "ios", "android"]
    },
    {
        "summary": "Implement comments system for brief discussions",
        "description": """Add commenting functionality to brief pages.

Requirements:
- User comments
- Threading
- Moderation tools
- Spam protection

Creates community but doesn't advance core mission.""",
        "issuetype": "Story",
        "priority": "Low",
        "labels": ["comments", "community", "discussion"]
    },
    {
        "summary": "Add cryptocurrency payment integration for premium tiers",
        "description": """Integrate crypto payments for subscription model.

Support:
- Bitcoin
- Ethereum
- USDC
- Payment processing

Completely unrelated to our AI builder focus.""",
        "issuetype": "Story",
        "priority": "Low",
        "labels": ["crypto", "payments", "monetization"]
    },
    {
        "summary": "Build SEO optimization tools for better search ranking",
        "description": """Implement SEO features to improve search visibility.

Features:
- Meta tag optimization
- Sitemap generation
- Schema markup
- Page speed optimization

Marketing focus that doesn't help builders.""",
        "issuetype": "Task",
        "priority": "Low",
        "labels": ["seo", "marketing", "optimization"]
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

def create_tickets(jira, project_key):
    """Create AI Strategy tickets in Jira"""
    created_tickets = []
    
    # Get available issue types
    issue_types = jira.issue_types()
    available_types = [it.name for it in issue_types]
    
    # Get available priorities
    try:
        priorities = jira.priorities()
        available_priorities = [p.name for p in priorities]
    except:
        available_priorities = []
    
    console.print(f"[cyan]Creating {len(AI_STRATEGY_TICKETS)} tickets...[/cyan]")
    
    for i, ticket_data in enumerate(AI_STRATEGY_TICKETS, 1):
        try:
            # Map issue type
            issue_type = ticket_data["issuetype"]
            if issue_type not in available_types:
                if "Story" in available_types:
                    issue_type = "Story"
                elif "Task" in available_types:
                    issue_type = "Task"
                else:
                    issue_type = available_types[0]
            
            # Prepare issue
            issue_dict = {
                'project': {'key': project_key},
                'summary': f"[AI-BRIEF] {ticket_data['summary']}",
                'description': ticket_data['description'],
                'issuetype': {'name': issue_type}
            }
            
            # Add priority if available
            if ticket_data['priority'] in available_priorities:
                issue_dict['priority'] = {'name': ticket_data['priority']}
            
            # Create issue
            new_issue = jira.create_issue(fields=issue_dict)
            
            # Add labels
            if ticket_data.get('labels'):
                new_issue.update(fields={'labels': ticket_data['labels']})
            
            created_tickets.append(new_issue.key)
            
            # Show progress with category hint
            if i <= 3:
                category_hint = "[green](Core Value)[/green]"
            elif i <= 6:
                category_hint = "[blue](Strategic Enabler)[/blue]"
            elif i <= 9:
                category_hint = "[yellow](Drift)[/yellow]"
            else:
                category_hint = "[red](Distraction)[/red]"
            
            console.print(f"✅ Created {new_issue.key}: {ticket_data['summary'][:40]}... {category_hint}")
            
        except Exception as e:
            console.print(f"[red]❌ Failed to create ticket {i}: {e}[/red]")
    
    return created_tickets

def main():
    """Main function"""
    console.print("""
[bold cyan]🎯 AI Strategy Brief Generator - Ticket Creator[/bold cyan]
Creating diverse tickets to test Steve's alignment scoring...
    """)
    
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    
    # Connect to Jira
    jira = connect_to_jira()
    if not jira:
        return
    
    # Confirm
    console.print(f"\n[yellow]About to create {len(AI_STRATEGY_TICKETS)} tickets in project {project_key}[/yellow]")
    console.print("[yellow]Tickets will test all alignment categories:[/yellow]")
    console.print("  • 3 Core Value tickets (80-100 score)")
    console.print("  • 3 Strategic Enabler tickets (60-79 score)")
    console.print("  • 3 Drift tickets (40-59 score)")
    console.print("  • 6 Distraction tickets (<40 score)")
    
    response = input("\nProceed? (y/N): ")
    if response.lower() != 'y':
        console.print("[yellow]Cancelled.[/yellow]")
        return
    
    # Create tickets
    created_tickets = create_tickets(jira, project_key)
    
    if created_tickets:
        console.print(f"\n[green]🎉 Successfully created {len(created_tickets)} tickets![/green]")
        console.print("\n[bold]Next steps:[/bold]")
        console.print("1. Move tickets to your STEVE Test sprint")
        console.print("2. Run: python3 real_steve.py --mode full_review --dry-run")
        console.print("3. Watch Steve score them based on your AI Strategy vision!")
        
        console.print("\n[cyan]Expected results:[/cyan]")
        console.print("  • CrewAI tutorial generator → ~95/100 (Core Value)")
        console.print("  • Multi-agent RAG pipeline → ~90/100 (Core Value)")
        console.print("  • Notion API v2 upgrade → ~70/100 (Strategic Enabler)")
        console.print("  • Email digest feature → ~50/100 (Drift)")
        console.print("  • Mobile app → ~20/100 (Distraction)")
        console.print("  • Crypto payments → ~10/100 (Distraction)")
    else:
        console.print("[red]❌ No tickets were created[/red]")

if __name__ == "__main__":
    main()