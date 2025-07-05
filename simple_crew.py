#!/usr/bin/env python3
"""
Simple Steve Runner - Strategic Alignment Guard
Simplified version that works without complex imports
"""

import os
import sys
import yaml
import click
from datetime import datetime
from dotenv import load_dotenv
from rich.console import Console

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
console = Console()

def load_test_tickets():
    """Generate test tickets for demo"""
    return [
        {
            "key": "TEST-1",
            "summary": "Improve API response times for better user experience",
            "description": "Current API calls take 2-3 seconds, users expect under 500ms",
            "status": "In Progress",
            "priority": "High"
        },
        {
            "key": "TEST-2", 
            "summary": "Add animated GIF support to chat messages",
            "description": "Users want to send GIFs in chat for more engaging conversations",
            "status": "To Do",
            "priority": "Low"
        },
        {
            "key": "TEST-3",
            "summary": "Fix critical data loss bug on user logout",
            "description": "Users report losing unsaved work when session expires",
            "status": "To Do", 
            "priority": "Critical"
        },
        {
            "key": "TEST-4",
            "summary": "Refactor authentication module for better maintainability",
            "description": "Legacy auth code is difficult to maintain and extend",
            "status": "Backlog",
            "priority": "Medium"
        },
        {
            "key": "TEST-5",
            "summary": "Add dark mode theme option",
            "description": "Users have requested a dark mode for better visibility",
            "status": "To Do",
            "priority": "Low"
        }
    ]

def load_principles():
    """Load company principles from config"""
    with open("config/principles.yaml", "r") as f:
        return yaml.safe_load(f)

def calculate_alignment_score(ticket, principles_data):
    """Improved alignment scoring"""
    text = f"{ticket['summary']} {ticket['description']}".lower()
    
    max_score = 0
    matched_principles = []
    
    for principle in principles_data['principles']:
        score = 0
        weight = principle.get('weight', 1.0)
        
        # Check for keyword matches (more generous)
        keyword_matches = 0
        for keyword in principle['keywords']:
            if keyword.lower() in text:
                keyword_matches += 1
                score += 25 * weight  # Increased from 20
        
        # Bonus for multiple keyword matches
        if keyword_matches > 1:
            score += 20 * weight
        
        # Check description match (more generous)
        desc_words = principle['description'].lower().split()
        desc_matches = sum(1 for word in desc_words if len(word) > 3 and word in text)
        if desc_matches > 0:
            score += 15 * weight * desc_matches  # Increased from 10
        
        # Special high-value keywords
        high_value_words = ['performance', 'speed', 'user', 'customer', 'critical', 'bug', 'fix', 'reliability']
        for word in high_value_words:
            if word in text:
                score += 10 * weight
        
        if score > 10:  # Lower threshold for match
            matched_principles.append(principle['name'])
            
        max_score = max(max_score, score)
    
    # Add baseline score for any ticket
    max_score += 15
    
    # Cap at 100
    return min(max_score, 100), matched_principles

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

def analyze_tickets(tickets, test_mode=False):
    """Main analysis function"""
    console.print("[cyan]🔍 Analyzing tickets...[/cyan]")
    
    # Load principles
    principles_data = load_principles()
    
    results = []
    
    for ticket in tickets:
        # Calculate alignment
        score, matched = calculate_alignment_score(ticket, principles_data)
        category = categorize_score(score, principles_data['thresholds'])
        
        # Generate rationale
        if category == 'core_value':
            rationale = f"Strongly aligns with {matched[0] if matched else 'core principles'}, directly advancing strategic goals."
        elif category == 'strategic_enabler':
            rationale = f"Supports strategic objectives, particularly {matched[0] if matched else 'key principles'}."
        elif category == 'drift':
            rationale = "Has some strategic value but connection to core principles is weak."
        else:
            rationale = "Limited strategic alignment. Consider deprioritizing or reframing."
        
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
        console.print(f"   {rationale}")
        if matched:
            console.print(f"   Principles: {', '.join(matched)}")
        console.print()
    
    return results

def generate_summary(results):
    """Generate executive summary"""
    console.print("[cyan]📈 Generating summary...[/cyan]")
    
    total = len(results)
    categories = [r['category'] for r in results]
    scores = [r['score'] for r in results]
    
    # Statistics
    avg_score = sum(scores) / total if total > 0 else 0
    
    category_counts = {
        'core_value': categories.count('core_value'),
        'strategic_enabler': categories.count('strategic_enabler'),
        'drift': categories.count('drift'),
        'distraction': categories.count('distraction')
    }
    
    drift_pct = ((category_counts['drift'] + category_counts['distraction']) / total * 100) if total > 0 else 0
    
    # Display summary
    console.print("\n" + "="*50)
    console.print("[bold cyan]🎯 STRATEGIC ALIGNMENT SUMMARY[/bold cyan]")
    console.print("="*50)
    
    console.print(f"📊 Total Tickets: {total}")
    console.print(f"📈 Average Alignment: {avg_score:.1f}/100")
    console.print(f"📉 Drift Rate: {drift_pct:.0f}%")
    
    console.print("\n[bold]Category Breakdown:[/bold]")
    for category, count in category_counts.items():
        pct = (count / total * 100) if total > 0 else 0
        color = {'core_value': 'green', 'strategic_enabler': 'blue', 'drift': 'yellow', 'distraction': 'red'}[category]
        console.print(f"  [{color}]{category.replace('_', ' ').title()}: {count} ({pct:.0f}%)[/{color}]")
    
    # Recommendations
    console.print("\n[bold yellow]💡 Recommendations:[/bold yellow]")
    
    if drift_pct > 40:
        console.print("  🚨 High drift detected - review sprint planning process")
    
    if category_counts['distraction'] > 2:
        console.print(f"  📵 {category_counts['distraction']} distraction tickets - consider deprioritizing")
    
    if category_counts['core_value'] < total * 0.3:
        console.print("  🎯 Focus more on core value initiatives")
    
    if drift_pct < 20:
        console.print("  ✅ Strong strategic alignment - keep up the focused execution!")
    
    console.print("="*50)
    
    return {
        'total': total,
        'avg_score': avg_score,
        'drift_pct': drift_pct,
        'categories': category_counts
    }

@click.command()
@click.option('--test', is_flag=True, help='Use test data')
@click.option('--mode', default='execution', help='Review mode')
@click.option('--project', help='Project key') 
def main(test, mode, project):
    """Steve - Strategic Alignment Guard (Simplified)"""
    
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
        if test:
            console.print("[yellow]🧪 Running in test mode with mock data[/yellow]\n")
            tickets = load_test_tickets()
        else:
            console.print("[red]❌ Real Jira integration not implemented in simple version[/red]")
            console.print("Use --test flag to see demo with mock data")
            return
        
        # Run analysis
        results = analyze_tickets(tickets, test_mode=test)
        summary = generate_summary(results)
        
        # Save report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"steve_report_{timestamp}.md"
        
        with open(filename, "w") as f:
            f.write("# Steve Strategic Alignment Report\n\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"## Summary\n")
            f.write(f"- Total Tickets: {summary['total']}\n")
            f.write(f"- Average Alignment: {summary['avg_score']:.1f}/100\n")
            f.write(f"- Drift Rate: {summary['drift_pct']:.0f}%\n\n")
            
            f.write("## Ticket Analysis\n")
            for result in results:
                f.write(f"### {result['ticket']['key']}: {result['score']}/100\n")
                f.write(f"- **Category**: {result['category']}\n")
                f.write(f"- **Rationale**: {result['rationale']}\n")
                if result['matched_principles']:
                    f.write(f"- **Principles**: {', '.join(result['matched_principles'])}\n")
                f.write("\n")
        
        console.print(f"\n[green]✅ Report saved to {filename}[/green]")
        console.print("[green]✅ Analysis complete![/green]")
        
    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()