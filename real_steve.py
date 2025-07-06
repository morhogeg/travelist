#!/usr/bin/env python3
"""
Real Steve - Connects to actual Jira
Strategic Ticket Evaluation & Vision Enforcer with real Jira integration
"""

import os
import sys
import yaml
import click
from datetime import datetime
from dotenv import load_dotenv
from jira import JIRA
from rich.console import Console
from rich.table import Table

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
console = Console()

def check_steve_custom_fields(jira):
    """Check for Steve custom fields and provide setup instructions"""
    try:
        fields = jira.fields()
        steve_score_field = None
        steve_category_field = None
        
        for field in fields:
            if field['name'] == "Steve Alignment Score":
                steve_score_field = field['id']
            elif field['name'] == "Steve Category":
                steve_category_field = field['id']
        
        if steve_score_field:
            console.print("[green]✅ Steve Alignment Score field found[/green]")
        else:
            console.print("[yellow]⚠️ Steve Alignment Score field not found[/yellow]")
            console.print("[dim]Create it in Jira Settings > Issues > Custom Fields (Number field)[/dim]")
        
        if steve_category_field:
            console.print("[green]✅ Steve Category field found[/green]")
        else:
            console.print("[yellow]⚠️ Steve Category field not found[/yellow]")
            console.print("[dim]Create it in Jira Settings > Issues > Custom Fields (Text field)[/dim]")
            
        return steve_score_field, steve_category_field
        
    except Exception as e:
        console.print(f"[red]❌ Could not check custom fields: {e}[/red]")
        return None, None

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
        
        # Check for Steve custom fields
        check_steve_custom_fields(jira)
        
        return jira
        
    except Exception as e:
        console.print(f"[red]❌ Failed to connect to Jira: {e}[/red]")
        return None

def fetch_jira_tickets(jira, project_key, mode="execution"):
    """Fetch tickets from Jira based on mode"""
    
    # JQL queries for different modes
    jql_queries = {
        "execution": f"project = {project_key} AND status != Done ORDER BY updated DESC",
        "strategy": f"project = {project_key} AND labels in (strategic_epic) ORDER BY updated DESC", 
        "full_review": f"project = {project_key} ORDER BY updated DESC",
        "test": f"project = {project_key} AND summary ~ 'STEVE-TEST' ORDER BY created DESC"
    }
    
    jql = jql_queries.get(mode, jql_queries["execution"])
    console.print(f"[cyan]🔍 Fetching tickets with JQL: {jql}[/cyan]")
    
    try:
        issues = jira.search_issues(jql, maxResults=50)
        console.print(f"[green]✅ Found {len(issues)} tickets[/green]")
        
        tickets = []
        for issue in issues:
            ticket = {
                "key": issue.key,
                "summary": issue.fields.summary,
                "description": issue.fields.description or "",
                "status": issue.fields.status.name,
                "priority": issue.fields.priority.name if issue.fields.priority else "Medium",
                "assignee": issue.fields.assignee.displayName if issue.fields.assignee else "Unassigned",
                "labels": issue.fields.labels or [],
                "created": issue.fields.created,
                "updated": issue.fields.updated
            }
            tickets.append(ticket)
        
        return tickets
        
    except Exception as e:
        console.print(f"[red]❌ Error fetching tickets: {e}[/red]")
        return []

def load_principles():
    """Load company principles from config"""
    with open("config/principles.yaml", "r") as f:
        return yaml.safe_load(f)

def calculate_alignment_score(ticket, principles_data):
    """Calculate alignment score for a ticket with detailed diagnostics"""
    text = f"{ticket['summary']} {ticket['description']}".lower()
    
    max_score = 0
    matched_principles = []
    scoring_breakdown = []
    
    for principle in principles_data['principles']:
        score = 0
        weight = principle.get('weight', 1.0)
        principle_breakdown = {
            'name': principle['name'],
            'keyword_matches': [],
            'desc_matches': 0,
            'high_value_matches': [],
            'score': 0
        }
        
        # Check for keyword matches
        keyword_matches = 0
        for keyword in principle['keywords']:
            if keyword.lower() in text:
                keyword_matches += 1
                score += 25 * weight
                principle_breakdown['keyword_matches'].append(keyword)
        
        # Bonus for multiple keyword matches
        if keyword_matches > 1:
            score += 20 * weight
        
        # Check description match
        desc_words = principle['description'].lower().split()
        desc_matches = sum(1 for word in desc_words if len(word) > 3 and word in text)
        if desc_matches > 0:
            score += 15 * weight * desc_matches
            principle_breakdown['desc_matches'] = desc_matches
        
        # Special high-value keywords
        high_value_words = ['performance', 'speed', 'user', 'customer', 'critical', 'bug', 'fix', 'reliability', 'security']
        for word in high_value_words:
            if word in text:
                score += 10 * weight
                principle_breakdown['high_value_matches'].append(word)
        
        principle_breakdown['score'] = score
        scoring_breakdown.append(principle_breakdown)
        
        if score > 10:
            matched_principles.append(principle['name'])
            
        max_score = max(max_score, score)
    
    # Add baseline score
    max_score += 15
    
    # Cap at 100
    return min(max_score, 100), matched_principles, scoring_breakdown

def categorize_score(score, thresholds):
    """Categorize alignment score"""
    if score >= thresholds['core_value']:
        return 'core_value'
    elif score >= thresholds['strategic_enabler']:
        return 'strategic_enabler'
    elif score >= thresholds['drift']:
        return 'drift'
    else:
        return 'distraction'

def generate_detailed_rationale(score, category, matched, breakdown, principles_data):
    """Generate detailed rationale explaining the score"""
    if category == 'core_value':
        return f"Strongly aligns with {matched[0] if matched else 'core principles'}, directly advancing strategic goals."
    
    # For non-perfect scores, explain what's missing or problematic
    rationale_parts = []
    
    if category == 'strategic_enabler':
        rationale_parts.append(f"Supports strategic objectives, particularly {matched[0] if matched else 'key principles'}.")
    elif category == 'drift':
        rationale_parts.append("Has some strategic value but connection to core principles is weak.")
    else:
        rationale_parts.append("Limited strategic alignment. Consider deprioritizing or reframing.")
    
    # Add specific feedback for low scores
    if score < 80:
        issues = []
        missing_principles = []
        weak_matches = []
        
        # Check which principles had no matches at all
        for principle in principles_data['principles']:
            principle_breakdown = next((b for b in breakdown if b['name'] == principle['name']), None)
            if not principle_breakdown or principle_breakdown['score'] <= 10:
                missing_principles.append(principle['name'])
            elif principle['name'] not in matched and principle_breakdown['score'] <= 25:
                # Principle has some alignment but not enough to be "matched"
                weak_matches.append(principle['name'])
        
        if missing_principles:
            issues.append(f"No alignment with: {', '.join(missing_principles[:2])}")
        
        if weak_matches:
            issues.append(f"Weak alignment with: {', '.join(weak_matches[:2])}")
        
        # Check if matched principles have strong keyword alignment
        matched_but_weak = []
        for principle_name in matched:
            principle_breakdown = next((b for b in breakdown if b['name'] == principle_name), None)
            if principle_breakdown and len(principle_breakdown['keyword_matches']) == 0:
                matched_but_weak.append(principle_name)
        
        if matched_but_weak:
            issues.append(f"Matched principles lack strong keywords: {', '.join(matched_but_weak[:2])}")
        
        # Check if ticket lacks strategic keywords overall
        total_keywords = sum(len(b['keyword_matches']) for b in breakdown)
        if total_keywords == 0:
            issues.append("Missing strategic keywords (buildable, actionable, AI, agent, etc.)")
        
        if issues:
            rationale_parts.append(f"Issues: {'; '.join(issues[:2])}")
    
    return " ".join(rationale_parts)

def analyze_tickets(tickets):
    """Analyze tickets for strategic alignment"""
    console.print("[cyan]🔍 Analyzing tickets for strategic alignment...[/cyan]")
    
    principles_data = load_principles()
    results = []
    
    for ticket in tickets:
        # Calculate alignment
        score, matched, breakdown = calculate_alignment_score(ticket, principles_data)
        category = categorize_score(score, principles_data['thresholds'])
        
        # Generate detailed rationale
        rationale = generate_detailed_rationale(score, category, matched, breakdown, principles_data)
        
        result = {
            'ticket': ticket,
            'score': score,
            'category': category,
            'matched_principles': matched,
            'rationale': rationale
        }
        results.append(result)
        
        # Display result
        color = {
            'core_value': 'green',
            'strategic_enabler': 'blue', 
            'drift': 'yellow',
            'distraction': 'red'
        }[category]
        
        console.print(f"📊 {ticket['key']}: [{color}]{score}/100 ({category.replace('_', ' ').title()})[/{color}]")
        console.print(f"   📝 {ticket['summary'][:60]}...")
        console.print(f"   💭 {rationale}")
        if matched:
            console.print(f"   🎯 Principles: {', '.join(matched[:3])}")
        console.print()
    
    return results

def update_jira_tickets(jira, results, dry_run=False):
    """Update Jira tickets with Steve's analysis"""
    if dry_run:
        console.print("[yellow]🧪 DRY RUN - Would update Jira tickets with:[/yellow]")
        for result in results:
            console.print(f"  {result['ticket']['key']}: Add comment with score {result['score']}/100")
        return
    
    console.print("[cyan]📝 Updating Jira tickets with Steve's analysis...[/cyan]")
    
    # Get custom field IDs
    steve_score_field, steve_category_field = check_steve_custom_fields(jira)
    
    for result in results:
        try:
            ticket_key = result['ticket']['key']
            
            # Create Steve comment
            comment = f"""🎯 **Strategic Alignment Guard Analysis**

**Alignment Score**: {result['score']}/100 ({result['category'].replace('_', ' ').title()})

**Rationale**: {result['rationale']}

**Matched Principles**: {', '.join(result['matched_principles']) if result['matched_principles'] else 'None'}

---
*Generated by Steve - Strategic Ticket Evaluation & Vision Enforcer*"""
            
            # Add comment to Jira
            jira.add_comment(ticket_key, comment)
            
            # Update custom fields if they exist
            if steve_score_field or steve_category_field:
                issue = jira.issue(ticket_key)
                updates = {}
                
                if steve_score_field:
                    updates[steve_score_field] = result['score']
                    
                if steve_category_field:
                    updates[steve_category_field] = result['category'].replace('_', ' ').title()
                
                if updates:
                    try:
                        issue.update(fields=updates)
                        console.print(f"[green]✅ Updated {ticket_key} with alignment analysis and custom fields[/green]")
                        console.print(f"[dim]   Steve Score: {updates.get(steve_score_field, 'N/A')} | Category: {updates.get(steve_category_field, 'N/A')}[/dim]")
                    except Exception as e:
                        console.print(f"[green]✅ Updated {ticket_key} with alignment analysis[/green]")
                        console.print(f"[yellow]⚠️ Could not update custom fields: {e}[/yellow]")
                else:
                    console.print(f"[green]✅ Updated {ticket_key} with alignment analysis[/green]")
            else:
                console.print(f"[green]✅ Updated {ticket_key} with alignment analysis[/green]")
            
        except Exception as e:
            console.print(f"[red]❌ Failed to update {ticket_key}: {e}[/red]")

def display_sorted_list(results):
    """Display tickets sorted by Steve score"""
    console.print("\n[bold cyan]📊 STRATEGIC PRIORITY LIST (Sorted by Steve Score)[/bold cyan]\n")
    
    # Sort by score descending
    sorted_results = sorted(results, key=lambda x: x['score'], reverse=True)
    
    # Create table
    table = Table(show_header=True, header_style="bold cyan")
    table.add_column("Rank", style="cyan", width=6)
    table.add_column("Score", style="bold", width=8)
    table.add_column("Ticket", style="white", width=12)
    table.add_column("Category", width=20)
    table.add_column("Summary", style="dim", width=50)
    table.add_column("Action", width=30)
    
    for idx, result in enumerate(sorted_results):
        rank = f"#{idx + 1}"
        score = f"{result['score']}/100"
        ticket = result['ticket']['key']
        category = result['category'].replace('_', ' ').title()
        summary = result['ticket']['summary'][:47] + "..." if len(result['ticket']['summary']) > 50 else result['ticket']['summary']
        
        # Color code by category
        if result['category'] == 'core_value':
            category_style = "[green]" + category + "[/green]"
            action = "[green]✅ Keep prioritized[/green]"
        elif result['category'] == 'strategic_enabler':
            category_style = "[blue]" + category + "[/blue]"
            action = "[blue]📈 Consider promoting[/blue]"
        elif result['category'] == 'drift':
            category_style = "[yellow]" + category + "[/yellow]"
            action = "[yellow]⚠️ Needs realignment[/yellow]"
        else:
            category_style = "[red]" + category + "[/red]"
            action = "[red]❌ Consider removing[/red]"
        
        table.add_row(rank, score, ticket, category_style, summary, action)
    
    console.print(table)
    
    # Show JQL for Jira
    project_key = os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    console.print("\n[bold cyan]🔍 To see this in Jira:[/bold cyan]")
    console.print(f'[dim]Issues → Search → JQL: project = {project_key} ORDER BY "Steve Alignment Score" DESC[/dim]')
    console.print('[dim]Then save as filter "Steve Strategic View"[/dim]')

def generate_summary(results):
    """Generate strategic summary"""
    console.print("[cyan]📈 Generating strategic summary...[/cyan]")
    
    total = len(results)
    if total == 0:
        console.print("[yellow]⚠️ No tickets to analyze[/yellow]")
        return
    
    categories = [r['category'] for r in results]
    scores = [r['score'] for r in results]
    
    # Statistics
    avg_score = sum(scores) / total
    
    category_counts = {
        'core_value': categories.count('core_value'),
        'strategic_enabler': categories.count('strategic_enabler'),
        'drift': categories.count('drift'),
        'distraction': categories.count('distraction')
    }
    
    drift_pct = ((category_counts['drift'] + category_counts['distraction']) / total * 100)
    
    # Display summary
    console.print("\n" + "="*60)
    console.print("[bold cyan]🎯 STEVE'S STRATEGIC ALIGNMENT REPORT[/bold cyan]")
    console.print("="*60)
    
    console.print(f"📊 Total Tickets Analyzed: {total}")
    console.print(f"📈 Average Alignment Score: {avg_score:.1f}/100")
    console.print(f"📉 Strategic Drift Rate: {drift_pct:.0f}%")
    
    console.print(f"\n[bold]🏷️ Category Breakdown:[/bold]")
    for category, count in category_counts.items():
        pct = (count / total * 100)
        color = {'core_value': 'green', 'strategic_enabler': 'blue', 'drift': 'yellow', 'distraction': 'red'}[category]
        console.print(f"  [{color}]{category.replace('_', ' ').title()}: {count} tickets ({pct:.0f}%)[/{color}]")
    
    # Strategic recommendations
    console.print(f"\n[bold yellow]💡 Strategic Recommendations:[/bold yellow]")
    
    if drift_pct > 50:
        console.print("  🚨 CRITICAL: High strategic drift detected - immediate sprint review needed")
    elif drift_pct > 30:
        console.print("  ⚠️ WARNING: Moderate drift - consider refocusing on core initiatives")
    
    if category_counts['distraction'] > 3:
        console.print(f"  📵 {category_counts['distraction']} distraction tickets - recommend deprioritizing")
    
    if category_counts['core_value'] < total * 0.4:
        console.print("  🎯 Increase focus on core value initiatives")
    
    if category_counts['core_value'] > total * 0.6:
        console.print("  ✅ Excellent strategic focus - maintain current priorities")
    
    if drift_pct < 20:
        console.print("  🎉 Strong strategic alignment - team is well-focused!")
    
    console.print("="*60)
    
    # Save report
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"steve_real_analysis_{timestamp}.md"
    
    with open(filename, "w") as f:
        f.write("# Steve Real Jira Analysis Report\n\n")
        f.write(f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**Project**: {os.getenv('JIRA_PROJECT_KEY')}\n\n")
        f.write(f"## Executive Summary\n")
        f.write(f"- **Total Tickets**: {total}\n")
        f.write(f"- **Average Alignment**: {avg_score:.1f}/100\n")
        f.write(f"- **Strategic Drift**: {drift_pct:.0f}%\n\n")
        
        f.write("## Detailed Analysis\n")
        for result in results:
            f.write(f"### {result['ticket']['key']}: {result['score']}/100\n")
            f.write(f"- **Summary**: {result['ticket']['summary']}\n")
            f.write(f"- **Category**: {result['category']}\n")
            f.write(f"- **Rationale**: {result['rationale']}\n")
            if result['matched_principles']:
                f.write(f"- **Principles**: {', '.join(result['matched_principles'])}\n")
            f.write("\n")
    
    console.print(f"[green]💾 Report saved to {filename}[/green]")

@click.command()
@click.option('--mode', default='execution', 
              type=click.Choice(['execution', 'strategy', 'full_review', 'test']),
              help='Analysis mode')
@click.option('--dry-run', is_flag=True, help='Analyze without updating Jira')
@click.option('--project', help='Override project key')
@click.option('--sorted', is_flag=True, help='Show tickets sorted by Steve score')
def main(mode, dry_run, project, sorted):
    """Steve - Real Jira Strategic Alignment Analysis"""
    
    console.print(r"""
[bold cyan]
🎯 STEVE - REAL JIRA ANALYSIS
Strategic Ticket Evaluation & Vision Enforcer
[/bold cyan]
    """)
    
    project_key = project or os.getenv("JIRA_PROJECT_KEY", "SCRUM")
    
    # Connect to Jira
    jira = connect_to_jira()
    if not jira:
        return
    
    # Fetch tickets
    tickets = fetch_jira_tickets(jira, project_key, mode)
    if not tickets:
        console.print("[yellow]⚠️ No tickets found to analyze[/yellow]")
        return
    
    # Analyze tickets
    results = analyze_tickets(tickets)
    
    # Update Jira (unless dry run)
    update_jira_tickets(jira, results, dry_run)
    
    # Generate summary
    generate_summary(results)
    
    # Display sorted list if requested
    if sorted:
        display_sorted_list(results)
    
    console.print(f"\n[green]🎉 Steve analysis complete! Analyzed {len(results)} real Jira tickets.[/green]")
    
    # Show sorting instructions
    console.print("\n[bold cyan]📋 How to sort by Steve Score in Jira:[/bold cyan]")
    console.print("1. Go to your Jira board")
    console.print("2. Click on the column header dropdown")
    console.print("3. Select 'Steve Alignment Score' to sort by strategic alignment")
    console.print("4. Use 'Steve Category' to group by alignment category")
    console.print("[dim]Note: Custom fields must be added to your board layout first[/dim]")

if __name__ == "__main__":
    main()