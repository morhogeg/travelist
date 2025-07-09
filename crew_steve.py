#!/usr/bin/env python3
"""
Steve - Strategic Ticket Evaluation & Vision Enforcer
Main CrewAI orchestrator following the exact pattern
"""

import os
import yaml
import click
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from rich.panel import Panel
from rich.text import Text

from llm_config import get_llm, get_evaluator_llm, get_rewriter_llm
from data_collector import collect_all_context
from core.schemas import ReviewMode, AlignmentCategory
from core.jira_client import JiraClient
from utils.logger import get_logger

load_dotenv()
logger = get_logger(__name__)

# Initialize LLMs
general_llm = get_llm()
evaluator_llm = get_evaluator_llm()
rewriter_llm = get_rewriter_llm()

# Load configurations
with open("config/principles.yaml", "r") as f:
    principles_config = yaml.safe_load(f)

with open("config/agents.yaml", "r") as f:
    agents_config = yaml.safe_load(f)


def create_agents():
    """Create all Steve agents following CrewAI pattern"""
    
    # 1. Ticket Ingestor Agent - "Data Detective"
    ticket_ingestor = Agent(
        role="Strategic Data Analyst",
        goal="Extract and analyze Jira tickets to identify strategic patterns and business context",
        backstory="""You are a Strategic Data Analyst focused on extracting meaningful insights from project tickets.
        
        YOUR CAPABILITIES:
        - Analyze ticket content for strategic business value
        - Identify patterns and dependencies across tickets
        - Extract business context from technical descriptions
        - Assess priority alignment and resource allocation
        
        YOUR APPROACH:
        You systematically analyze tickets as indicators of team focus and strategic direction.
        You identify what work is being prioritized and how it aligns with business objectives.
        
        YOUR DELIVERABLES:
        Provide structured, data-driven analysis that enables strategic assessment and decision-making.""",
        verbose=True,
        allow_delegation=False,
        llm=general_llm
    )
    
    # 2. Alignment Evaluator Agent - "Strategic Oracle"
    alignment_evaluator = Agent(
        role="Strategic Alignment Analyst",
        goal="Evaluate strategic alignment between tickets and company principles with clear scoring rationale",
        backstory=f"""You are a Strategic Alignment Analyst specializing in objective evaluation of work against business principles.
        
        YOUR EVALUATION FRAMEWORK:
        You assess alignment against these core principles:
        {yaml.dump(principles_config['principles'])}
        
        YOUR METHODOLOGY:
        - Identify clear connections between ticket content and strategic principles
        - Score alignment based on objective criteria and keyword matching
        - Provide specific rationale for scores with evidence-based reasoning
        - Balance immediate value with long-term strategic impact
        
        YOUR SCORING APPROACH:
        - 90-100: Direct advancement of core strategic objectives
        - 80-89: Strong alignment with multiple principles
        - 70-79: Clear support for strategic goals
        - 60-69: Some strategic value but indirect
        - 40-59: Limited strategic connection
        - 20-39: Minimal strategic benefit
        - 0-19: No clear strategic alignment
        
        YOUR OUTPUT:
        Provide clear, justified scores with specific explanations of alignment strengths and gaps.""",
        verbose=True,
        allow_delegation=False,
        llm=evaluator_llm
    )
    
    # 3. Rewrite Strategist Agent - "Strategic Alchemist"
    rewrite_strategist = Agent(
        role="Strategic Content Optimizer",
        goal="Rewrite misaligned tickets to better reflect their strategic value and business impact",
        backstory="""You are a Strategic Content Optimizer focused on improving ticket descriptions to highlight business value.
        
        YOUR OPTIMIZATION PROCESS:
        - Identify the core business value in existing work
        - Connect technical tasks to strategic business outcomes
        - Reframe functionality in terms of user and business benefits
        - Maintain technical accuracy while adding strategic context
        
        YOUR REWRITING APPROACH:
        1. PRESERVE REQUIREMENTS: Maintain all functional and technical requirements
        2. ADD CONTEXT: Explain how the work supports business objectives
        3. CLARIFY IMPACT: Describe expected outcomes and benefits
        4. ALIGN LANGUAGE: Use terminology that connects to strategic principles
        
        YOUR IMPROVEMENTS:
        Transform generic task descriptions into clear statements of business value,
        helping teams understand how their work contributes to strategic goals.
        
        YOUR GOAL:
        Create ticket descriptions that clearly communicate both functional requirements and strategic importance.""",
        verbose=True,
        allow_delegation=False,
        llm=rewriter_llm
    )
    
    # 4. Theme Synthesizer Agent - "Strategic Prophet"
    theme_synthesizer = Agent(
        role="Strategic Pattern Analyst",
        goal="Identify patterns across tickets and provide strategic recommendations for team focus",
        backstory="""You are a Strategic Pattern Analyst specializing in identifying trends and gaps in project work.
        
        YOUR ANALYTICAL APPROACH:
        You systematically analyze ticket patterns to identify strategic trends and opportunities.
        You look for connections between individual tasks and broader business objectives.
        
        YOUR PATTERN ANALYSIS:
        - STRATEGIC DISTRIBUTION: How work is allocated across different strategic areas
        - ALIGNMENT GAPS: Areas where strategic principles are under-represented
        - RESOURCE ALLOCATION: Whether effort matches strategic priorities
        - TREND IDENTIFICATION: Patterns in team focus and project direction
        
        YOUR ANALYTICAL FRAMEWORK:
        - COVERAGE ANALYSIS: Which strategic areas receive adequate attention
        - PRIORITY ALIGNMENT: Whether high-priority work aligns with strategy
        - CAPACITY ASSESSMENT: Whether strategic work is sustainable
        - OPPORTUNITY IDENTIFICATION: Areas for improved strategic focus
        
        YOUR RECOMMENDATIONS:
        Provide data-driven insights about strategic focus areas and recommend adjustments
        to better align team effort with business objectives.""",
        verbose=True,
        allow_delegation=False,
        llm=general_llm
    )
    
    # 5. Founder Voice Agent - "Strategic Storyteller"
    founder_voice = Agent(
        role="Strategic Executive Analyst",
        goal="Provide clear, professional strategic analysis with actionable recommendations",
        backstory="""You are a Strategic Executive Analyst focused on delivering clear, professional strategic insights.
        
        YOUR APPROACH:
        - Provide direct, factual analysis without emotional language
        - Focus on actionable recommendations based on data
        - Use clear business language appropriate for executive audiences
        - Quantify impacts with specific metrics where possible
        
        YOUR COMMUNICATION STYLE:
        - Lead with key findings and strategic implications
        - Present data-driven insights in a structured format
        - Provide concrete next steps and recommendations
        - Use professional, business-focused language
        - End with clear questions about strategic direction
        
        YOUR ANALYSIS FRAMEWORK:
        - Current state assessment with key metrics
        - Strategic risks and opportunities identified
        - Recommended actions with expected outcomes
        - Resource allocation suggestions
        - Success metrics for tracking progress""",
        verbose=True,
        allow_delegation=False,
        llm=general_llm
    )
    
    return ticket_ingestor, alignment_evaluator, rewrite_strategist, theme_synthesizer, founder_voice


def create_tasks(context_data: Dict[str, str], review_mode: ReviewMode, dry_run: bool = False):
    """Create tasks for the crew following exact pattern"""
    
    # Get agents
    ticket_ingestor, alignment_evaluator, rewrite_strategist, theme_synthesizer, founder_voice = create_agents()
    
    # Task 1: Strategic Data Extraction & Contextualization
    task1 = Task(
        description=f"""OBJECTIVE: Analyze Jira tickets to extract strategic insights and business context
        
        DATA TO ANALYZE:
        {context_data['tickets_data']}
        
        ANALYSIS REQUIREMENTS:
        
        1. TICKET DATA EXTRACTION - For each ticket, extract:
           - Core identifiers: Key, Summary, Description  
           - Workflow context: Status, Priority, Assignee, Sprint
           - Strategic indicators: Labels, Story Points, Dependencies
           - Timeline patterns: Created/Updated dates, progress indicators
        
        2. PATTERN IDENTIFICATION:
           - Identify recurring themes and topics across tickets
           - Assess alignment between stated priorities and actual work
           - Identify strategic business value indicators in descriptions
           - Highlight potential resource allocation concerns
        
        3. BUSINESS CONTEXT:
           - Categorize tickets by business value type
           - Identify relationships between different work items
           - Assess balance between maintenance and new development
           - Document team focus areas and capacity utilization
        
        DELIVERABLE: Structured analysis of tickets with strategic context and business value assessment.""",
        expected_output="Strategically-enriched dataset with tickets plus contextual insights about team patterns and hidden strategic signals",
        agent=ticket_ingestor
    )
    
    # Task 2: Strategic Alignment Evaluation
    task2 = Task(
        description=f"""OBJECTIVE: Evaluate strategic alignment of each ticket against company principles with clear scoring
        
        STRATEGIC PRINCIPLES:
        {context_data['principles_context']}
        
        EVALUATION METHODOLOGY:
        
        1. PRINCIPLE ALIGNMENT ANALYSIS:
           - For each ticket, assess connection to each strategic principle
           - Identify explicit keyword matches and terminology alignment
           - Evaluate implicit strategic value and business impact
           - Assess long-term strategic benefits and outcomes
           - Document principle conflicts or synergies
        
        2. SCORING CRITERIA:
           - Direct Impact: How directly does this advance strategic goals?
           - Strategic Value: What business outcomes will this enable?
           - Resource Efficiency: Is this the best use of available resources?
           - Vision Alignment: How well does this support overall strategy?
           - Implementation Feasibility: Can this be executed effectively?
        
        3. SCORING SCALE:
           - 90-100: Direct advancement of core strategic objectives
           - 80-89: Strong alignment with multiple strategic principles
           - 70-79: Clear support for strategic goals
           - 60-69: Some strategic value but indirect connection
           - 40-59: Limited strategic alignment or unclear benefit
           - 20-39: Minimal strategic value or misallocation concern
           - 0-19: No clear strategic alignment or potential negative impact
        
        4. RATIONALE DOCUMENTATION:
           - Provide clear 2-3 sentence explanation for each score
           - Explain specific reasons for alignment or misalignment
           - Connect work to measurable business outcomes
           - Identify opportunities for improved strategic focus
        
        DELIVERABLE: Structured strategic alignment scores with clear rationale and recommendations.
        
        STRICT CATEGORIES (use exact thresholds above):
        - core_value: directly advances strategy
        - strategic_enabler: clearly supports goals
        - drift: weak connection to principles  
        - distraction: no clear alignment
        
        For EACH ticket provide:
        - Ticket key
        - Alignment score (0-100)
        - Category (exact match to thresholds)
        - Matched principles (list)
        - Clear rationale (2-3 sentences)""",
        expected_output="Prophetic strategic evaluation revealing the hidden strategic DNA of each ticket, with precise scores, profound insights, and guidance toward strategic enlightenment",
        agent=alignment_evaluator,
        context=[task1]
    )
    
    # Task 3: Alchemical Strategic Transformation
    task3 = Task(
        description="""MISSION: Transform misaligned tickets into strategic gold through the art of reframing
        
        TARGET TICKETS: Focus on drift and distraction tickets (score <65) that need strategic realignment
        
        YOUR TRANSFORMATION METHODOLOGY:
        
        1. STRATEGIC ARCHAEOLOGY:
           - Dig deep to find the hidden strategic value in each ticket
           - Identify the closest resonating principle for authentic connection
           - Understand the teams original intent and preserve it
           - Discover compound benefits that are not immediately obvious
        
        2. ALCHEMICAL REFRAMING:
           - SUMMARY TRANSFORMATION: Rewrite to immediately signal strategic value
           - DESCRIPTION ENHANCEMENT: Weave in principle connections naturally
           - VALUE AMPLIFICATION: Show how this work creates strategic momentum
           - INSPIRATION INJECTION: Make the team excited about the strategic impact
        
        3. PRESERVATION PROTOCOL:
           - NEVER lose core functionality or requirements
           - NEVER force artificial connections that feel fake
           - ALWAYS maintain technical accuracy and feasibility
           - ALWAYS make the strategic value feel authentic and inspiring
        
        4. MAGICAL DELIVERABLES for each transformation:
           - Original ticket key and current summary
           - TRANSFORMED SUMMARY: Strategic value front and center
           - ENHANCED DESCRIPTION: Natural principle integration
           - STRATEGIC RATIONALE: Why this transformation matters
           - JIRA COMMENT: Strategic Alignment Enhancement plus inspiring explanation
        
        YOUR TRANSFORMATION PHILOSOPHY:
        Turn fix button color into enhance user experience consistency to build trust and reduce cognitive load
        Turn refactor database into strengthen system foundation for scalable strategic initiatives
        
        Make every developer feel like a strategic contributor, not just a code writer.""",
        expected_output="Masterful strategic transformations that preserve functionality while revealing profound strategic value, inspiring teams to see their work through a strategic lens",
        agent=rewrite_strategist,
        context=[task1, task2]
    )
    
    # Task 4: Prophetic Pattern Synthesis & Future Forecasting
    task4 = Task(
        description="""MISSION: Read the strategic tea leaves and predict the future from todays work patterns
        
        YOUR PATTERN PROPHECY PROTOCOL:
        
        1. STRATEGIC VITAL SIGNS ANALYSIS:
           - Calculate alignment health metrics with surgical precision
           - Identify velocity vectors - are we accelerating toward or away from our vision?
           - Measure principle coverage gaps that competitors could exploit
           - Assess team cognitive load and sustainable strategic momentum
        
        2. PATTERN REVELATION MATRIX:
           - OVER-INDEXING DETECTION: Which principles dominate (>40% of tickets)?
           - BLIND SPOT ILLUMINATION: Which principles are neglected (<10% coverage)?
           - DRIFT VELOCITY: How fast are we moving away from strategic alignment?
           - COMPOUND EFFECT FORECASTING: What outcomes will these patterns create in 3-6 months?
        
        3. FUTURE SCENARIO MODELING:
           - If current patterns continue, where will we be strategically in 6 months?
           - What strategic opportunities are we missing due to misaligned focus?
           - Which competitors could exploit our strategic blind spots?
           - What is the cost of strategic drift in real business terms?
        
        4. PROPHETIC INSIGHTS GENERATION:
           - Identify the TOP 3 strategic wins hiding in plain sight
           - Reveal the BOTTOM 3 strategic risks before they become crises
           - Generate 5-7 ACTIONABLE recommendations that feel prophetic
           - Create memorable frameworks that stick in team consciousness
        
        5. STRATEGIC INTELLIGENCE PACKAGE:
           - Executive dashboard with alignment velocity, not just current state
           - Strategic risk matrix with probability and impact
           - Opportunity cost analysis of current work patterns
           - Next-quarter strategic focus recommendations
        
        DELIVERABLE: Strategic prophecy that makes leaders feel like they have a crystal ball into their teams future, with actionable insights that prevent strategic disasters and reveal hidden opportunities.""",
        expected_output="Prophetic strategic intelligence report with future-focused insights, risk/opportunity matrices, and wisdom that transforms how teams think about their strategic destiny",
        agent=theme_synthesizer,
        context=[task1, task2, task3]
    )
    
    # Task 5: Strategic Storytelling & Executive Narrative (optional)
    task5 = None
    if os.getenv("USE_FOUNDER_VOICE", "false").lower() == "true":
        task5 = Task(
            description="""Generate a professional executive summary report.
            
            **Required Structure:**
            1. Executive Summary (key metrics and strategic health)
            2. Strategic Scorecard (alignment breakdown by category)
            3. Detailed Analysis (ticket-by-ticket findings)
            4. Recommendations (prioritized action items)
            5. Next Steps (concrete actions)
            
            **Tone Requirements:**
            - Professional and direct
            - Data-driven analysis
            - Clear and concise
            - No narratives or storytelling
            - Focus on actionable insights
            
            **Content Guidelines:**
            - Lead with key metrics and findings
            - Use specific numbers and percentages
            - Categorize tickets clearly
            - Provide concrete recommendations
            - Avoid dramatic language or metaphors""",
            expected_output="Professional executive summary report with clear metrics, analysis, and recommendations",
            agent=founder_voice,
            context=[task1, task2, task3, task4]
        )
    
    return [t for t in [task1, task2, task3, task4, task5] if t]


def update_jira_tickets(jira_client: JiraClient, results: Dict[str, Any], dry_run: bool = False):
    """Update Jira with Steve's strategic analysis"""
    alignments = results.get('alignments', [])
    rewrites = results.get('rewrites', [])
    
    if dry_run:
        logger.steve.info("🧪 DRY RUN - Would update Jira tickets with:")
        for alignment in alignments:
            logger.steve.info(f"  {alignment['ticket_key']}: Add comment with score {alignment['score']}/100")
        return
    
    if not jira_client:
        logger.steve.warning("⚠️ No Jira client available - skipping Jira updates")
        return
    
    logger.steve.info(f"🎯 Updating {len(alignments)} tickets in Jira...")
    
    for alignment in alignments:
        ticket_key = alignment['ticket_key']
        score = alignment['score']
        category = alignment['category']
        rationale = alignment['rationale']
        
        # Find corresponding rewrite if exists
        rewrite = next((r for r in rewrites if r['original_key'] == ticket_key), None)
        
        try:
            # Create comprehensive strategic analysis comment
            matched_principles = ', '.join(alignment.get('matched_principles', [])) or 'None'
            
            # Get score explanation - use distinctive language for each range
            if score >= 90:
                if matched_principles != 'None' and len(matched_principles.split(', ')) > 1:
                    score_explanation = f"Multiple strategic principles converge here — {matched_principles} — creating compound value. This is what mission-critical work looks like."
                elif 'Builder-First Value' in matched_principles:
                    score_explanation = "Direct hit on our highest-weighted principle. This ticket exemplifies builder empowerment with immediate, practical impact."
                elif 'AI Agent Excellence' in matched_principles:
                    score_explanation = "Pure strategic gold — advancing our AI agent capabilities exactly as our principles demand. Ship this yesterday."
                else:
                    score_explanation = "Textbook strategic alignment. Every element of this ticket reinforces our core mission. This is the work that matters."
            elif score >= 60:
                principle_count = len(matched_principles.split(', ')) if matched_principles != 'None' else 0
                if principle_count > 0:
                    score_explanation = f"Solid principle alignment ({matched_principles}) positions this as strategic infrastructure. Not flashy, but necessary."
                elif 'performance' in rationale.lower() or 'infrastructure' in rationale.lower():
                    score_explanation = "Foundation-building work that enables future strategic wins. The alignment is indirect but real — this greases the wheels."
                else:
                    score_explanation = "Strategic support work that amplifies core initiatives. Think of it as the drumbeat that keeps the band in rhythm."
            elif score >= 40:
                if matched_principles != 'None':
                    score_explanation = f"Weak signal on {matched_principles}. The strategic thread exists but it's thin — needs strengthening to avoid drift."
                else:
                    score_explanation = "Strategic alignment barely registers. This work has wandered from our north star and needs course correction."
            else:
                if score < 20:
                    score_explanation = "Complete strategic void. No principles touched, no keywords matched, no mission advanced. This is noise, not signal."
                else:
                    score_explanation = "Strategic blindness — this work exists in a parallel universe from our principles. The disconnect is total."
            
            # Infer ticket type from content
            ticket_text = (ticket_key + " " + rationale).lower()
            if any(word in ticket_text for word in ['ui', 'interface', 'design', 'ux', 'frontend', 'style', 'css', 'visual']):
                ticket_type = "UI/UX"
            elif any(word in ticket_text for word in ['agent', 'ai', 'automation', 'pipeline', 'orchestration', 'multi-agent']):
                ticket_type = "agent architecture"
            elif any(word in ticket_text for word in ['api', 'backend', 'database', 'infrastructure', 'infra', 'performance', 'integration']):
                ticket_type = "infrastructure"
            elif any(word in ticket_text for word in ['marketing', 'branding', 'content', 'campaign', 'brand']):
                ticket_type = "marketing"
            elif any(word in ticket_text for word in ['bug', 'fix', 'error', 'issue', 'problem', 'critical']):
                ticket_type = "bug fix"
            elif any(word in ticket_text for word in ['feature', 'enhancement', 'improvement', 'implement']):
                ticket_type = "feature"
            else:
                ticket_type = "development"
            
            # Expand rationale with strategic context - be specific and avoid repetition
            if score >= 90:
                # Core Value - be specific about HOW it advances mission
                if 'agent' in ticket_type.lower() or 'ai' in ticket_text:
                    expanded_rationale = f"{rationale} This {ticket_type} work operationalizes our multi-agent strategy in user-accessible form. It turns theoretical capability into shipped product — the clearest signal of mission execution."
                elif 'builder' in ticket_text or 'developer' in ticket_text:
                    expanded_rationale = f"{rationale} This directly empowers builders with {ticket_type} capabilities they can implement in 30-60 minutes. Every developer touched by this becomes a strategic force multiplier."
                elif 'integration' in ticket_text or 'api' in ticket_text:
                    expanded_rationale = f"{rationale} This {ticket_type} work creates compound value — each integration point becomes a new surface for builder innovation. The network effects will accelerate adoption."
                else:
                    expanded_rationale = f"{rationale} This {ticket_type} initiative transforms abstract strategy into concrete value. It's not just aligned — it's exactly what our principles describe."
            elif score >= 60:
                # Strategic Enabler - explain WHAT it enables specifically
                if 'infrastructure' in ticket_type.lower() or 'performance' in ticket_text:
                    expanded_rationale = f"{rationale} This {ticket_type} work lays critical groundwork by establishing the data flow and performance baseline needed for agent responsiveness. Without this, future AI features would feel sluggish."
                elif 'ui' in ticket_type.lower() or 'ux' in ticket_text:
                    expanded_rationale = f"{rationale} While not directly AI-focused, this {ticket_type} work reduces cognitive load for builders navigating complex agent configurations. Clear UI = faster implementation = more builders succeeding."
                elif 'bug' in ticket_type.lower():
                    expanded_rationale = f"{rationale} This {ticket_type} resolution maintains system trust — a prerequisite for builders to confidently deploy AI agents. Reliability enables experimentation."
                else:
                    expanded_rationale = f"{rationale} This {ticket_type} work unblocks future builder-first value delivery by removing friction in the development pipeline. It's the grease that keeps strategic initiatives moving."
            elif score >= 40:
                # Drift - be specific about what's missing
                if 'ui' in ticket_type.lower() or 'design' in ticket_text:
                    expanded_rationale = f"{rationale} This {ticket_type} work focuses on aesthetics without connecting to builder productivity or agent capabilities. The gap: no clear path from 'looks nice' to 'builds faster'."
                elif 'feature' in ticket_type.lower():
                    expanded_rationale = f"{rationale} This {ticket_type} adds functionality without considering builder workflows or AI integration points. It solves a problem, but not a strategic one."
                else:
                    expanded_rationale = f"{rationale} This {ticket_type} work operates in isolation from our core principles. It may have local value but lacks the multiplier effect of strategic alignment."
            else:
                # Distraction - be direct about opportunity cost
                if 'marketing' in ticket_type.lower() or 'brand' in ticket_text:
                    expanded_rationale = f"{rationale} This {ticket_type} work diverts energy from product excellence to surface-level concerns. Every hour here is an hour not spent on builder empowerment."
                elif 'cosmetic' in ticket_text or 'polish' in ticket_text:
                    expanded_rationale = f"{rationale} This {ticket_type} work represents pure opportunity cost — cosmetic improvements while core builder needs go unmet. The mismatch with priorities is stark."
                else:
                    expanded_rationale = f"{rationale} This {ticket_type} work actively pulls the team away from strategic objectives. It's not neutral — it's negative ROI when measured against our principles."
            
            # Determine strategic role based on score and type
            if score >= 90:
                if 'agent' in ticket_type.lower() or 'ai' in ticket_text:
                    strategic_role = "Core AI capability delivery"
                elif 'builder' in ticket_text or 'developer' in ticket_text:
                    strategic_role = "Direct builder empowerment"
                elif 'integration' in ticket_text:
                    strategic_role = "Strategic ecosystem expansion"
                else:
                    strategic_role = "Mission-critical advancement"
            elif score >= 60:
                if 'infrastructure' in ticket_type.lower():
                    strategic_role = "Unlocks builder capabilities in downstream sprint"
                elif 'ui' in ticket_type.lower():
                    strategic_role = "Reduces friction for builder adoption"
                elif 'bug' in ticket_type.lower():
                    strategic_role = "Maintains trust for builder confidence"
                else:
                    strategic_role = "Enables future strategic wins"
            elif score >= 40:
                strategic_role = "Needs reframing to unlock value"
            else:
                strategic_role = "No strategic value identified"
            
            # Format ticket type for display
            ticket_type_display = ticket_type.title()
            if 'infrastructure' in ticket_type.lower():
                ticket_type_display = "Platform Infra (non-user-facing)"
            elif 'ui' in ticket_type.lower() and score < 80:
                ticket_type_display = "UI/UX (cosmetic focus)"
            elif 'agent' in ticket_type.lower():
                ticket_type_display = "AI/Agent Architecture"
            elif 'bug' in ticket_type.lower():
                ticket_type_display = "Bug Fix/Reliability"
            elif 'feature' in ticket_type.lower():
                ticket_type_display = "Feature Addition"
            
            comment_text = f"""⸻

📦 *Ticket Type*: {ticket_type_display}
🧭 *Strategic Role*: {strategic_role}

⸻

🎯 *Strategic Alignment Summary*
*Score*: {score}/100 — {category.replace('_', ' ').title()}
*Matched Principles*: {matched_principles}
{score_explanation}

⸻

🧠 *Why This {"Aligns" if score >= 60 else "Doesn't Align"}*
{expanded_rationale}

⸻
"""

            
            # Add suggested reframe for low alignment tickets
            if score < 60 and rewrite:
                comment_text += f"""
🔁 *Suggested Reframe*

*New Title*: {rewrite['new_summary']}
*Reason*: {rewrite['jira_comment']}

⸻
"""
            
            # Add recommendation with detailed structure - be specific and actionable
            if score >= 90:
                # Core Value - give concrete next steps
                if 'agent' in ticket_type.lower() or 'ai' in ticket_text:
                    recommendation = """• ✅ *Action*: Fast-track to current sprint and assign senior engineers
• 💡 *Rationale*: This unlocks 3-5 downstream agent features. Ship within 2 weeks to maintain momentum
• 📊 *Impact*: Enables agentic experiences for ~80% of active builders"""
                elif 'integration' in ticket_text:
                    recommendation = """• ✅ *Action*: Prioritize immediately and create integration cookbook
• 💡 *Rationale*: Each integration multiplies builder possibilities. Document patterns for reuse
• 🎯 *Success Metric*: 10+ builders using this integration within first month"""
                else:
                    recommendation = """• ✅ *Action*: Make this the sprint's north star
• 💡 *Rationale*: Direct mission advancement deserves focused execution. Clear other blockers
• ⚡ *Velocity*: This single ticket can move our strategic score +5-10 points"""
            elif score >= 60:
                # Strategic Enabler - explain dependencies and add reframe hook
                if 'infrastructure' in ticket_type.lower():
                    recommendation = """• ✅ *Action*: Schedule for next sprint with clear success criteria
• 💡 *Rationale*: Future agent features depend on this foundation. Define performance benchmarks upfront
• 🔄 *Reframe Tip*: Add 'enables real-time agent response' to description for clearer strategic link"""
                elif 'ui' in ticket_type.lower():
                    recommendation = """• ✅ *Action*: Bundle with related builder experience improvements
• 💡 *Rationale*: UI clarity directly impacts builder adoption rates. Group for maximum impact
• 🔄 *Reframe Tip*: Emphasize how this reduces time-to-first-agent-deployment"""
                else:
                    recommendation = """• ✅ *Action*: Keep in roadmap but link to specific Core Value work
• 💡 *Rationale*: This enables future builder capabilities. Make dependencies explicit
• 🔄 *Reframe Tip*: Connect to specific agent/builder features this unblocks"""
            elif score >= 40:
                # Drift - specific reframing guidance
                recommendation = """• 🚧 *Action*: Pause work and reframe before proceeding
• 💡 *Rationale*: Current framing misses strategic value. 2 hours of reframing saves 20 hours of misaligned work"""
                if rewrite:
                    recommendation += f"\n• ✏️ *Suggested Reframe*: \"{rewrite['new_summary']}\""
                    recommendation += "\n• 📝 *Next Step*: Update ticket description with builder impact and AI integration points"
                else:
                    recommendation += "\n• ✏️ *Reframe Focus*: How does this help builders? What agent capabilities does it enable?"
                    recommendation += "\n• 💭 *Questions*: Can this integrate with our AI pipeline? Does it reduce builder friction?"
            else:
                # Distraction - clear deprioritization with data
                recommendation = """• 🚫 *Action*: Move to backlog immediately
• 💡 *Rationale*: Zero strategic alignment = negative ROI. Team capacity is finite
• 📊 *Opportunity Cost*: Every sprint on this delays 2-3 strategic initiatives"""
                if rewrite and score > 20:  # Only suggest reframe if there's some hope
                    recommendation += f"\n• ✏️ *Last Resort*: Radical reframe as \"{rewrite['new_summary']}\" or archive"
                else:
                    recommendation += "\n• 🗑️ *Recommendation*: Archive unless business case emerges"
            
            comment_text += f"""
🧭 *Recommendation*

{recommendation}

⸻

_Generated by STEVE — Strategic Ticket Evaluation & Vision Enforcer_

⸻"""
            
            # Update the ticket in Jira by adding comment directly
            jira_client.jira.add_comment(ticket_key, comment_text)
            
            # Also try to update custom fields if they exist
            try:
                issue = jira_client.jira.issue(ticket_key)
                
                # Get custom field IDs
                fields = jira_client.jira.fields()
                steve_score_field = None
                steve_category_field = None
                
                for field in fields:
                    if field['name'] == "Steve Alignment Score":
                        steve_score_field = field['id']
                    elif field['name'] == "Steve Category":
                        steve_category_field = field['id']
                
                # Update custom fields if they exist
                updates = {}
                if steve_score_field:
                    updates[steve_score_field] = score
                if steve_category_field:
                    updates[steve_category_field] = category.replace('_', ' ').title()
                
                if updates:
                    issue.update(fields=updates)
                    logger.steve.info(f"📊 Updated custom fields for {ticket_key}")
                    
            except Exception as field_error:
                logger.steve.warning(f"⚠️ Could not update custom fields for {ticket_key}: {field_error}")
            
            logger.steve.success(f"✅ Updated {ticket_key} with strategic analysis")
            
        except Exception as e:
            logger.steve.error(f"❌ Failed to update {ticket_key}: {e}")
    
    logger.steve.info(f"🎉 Jira updates complete! Check your tickets for strategic insights.")


def run_steve(review_mode: str = "execution", project_key: str = None, 
              test_mode: bool = False, dry_run: bool = False):
    """Main entry point for Steve analysis"""
    
    logger.steve.info(" Starting Steve - Strategic Alignment Guard")
    
    # Collect all context data
    review_mode_enum = ReviewMode(review_mode)
    context_data = collect_all_context(review_mode_enum, project_key, test_mode)
    
    # Initialize Jira client
    jira_client = JiraClient() if not test_mode else None
    
    # Create tasks with context
    tasks = create_tasks(context_data, review_mode_enum, dry_run)
    
    # Get agents for crew
    agents = list(create_agents())
    if not os.getenv("USE_FOUNDER_VOICE", "false").lower() == "true":
        agents = agents[:-1]  # Remove founder voice agent
    
    # Create and run crew
    crew = Crew(
        agents=agents,
        tasks=tasks,
        verbose=True
    )
    
    try:
        logger.steve.start_progress("Running strategic analysis...")
        result = crew.kickoff()
        logger.steve.stop_progress()
        
        # Process results with context data for detailed ticket analysis
        results = parse_crew_results(result, context_data)
        
        # Update Jira
        if not dry_run and not test_mode:
            update_jira_tickets(jira_client, results, dry_run)
        elif dry_run:
            update_jira_tickets(jira_client, results, dry_run)  # Show what would be updated
        
        # Display summary
        logger.steve.sprint_summary(results.get('summary', {}))
        
        # Save report
        save_report(results)
        
        logger.steve.success("Steve analysis complete!")
        
        return results
        
    except Exception as e:
        logger.steve.error(f"Error during analysis: {e}")
        raise


def calculate_ticket_alignment_scores(context_data: Dict[str, str]) -> List[Dict]:
    """Calculate detailed alignment scores for each ticket using the proven algorithm"""
    import yaml
    import re
    
    # Load principles
    with open("config/principles.yaml", "r") as f:
        principles_data = yaml.safe_load(f)
    
    # Parse tickets from context data
    tickets_text = context_data['tickets_data']
    ticket_pattern = r'(\d+)\.\s+TICKET:\s+(SCRUM-\d+)\s+Summary:\s+([^\n]+).*?Description:\s+([^\n]+(?:\n(?!\d+\.)[^\n]+)*)'
    tickets_matches = re.findall(ticket_pattern, tickets_text, re.DOTALL)
    
    alignments = []
    
    for match in tickets_matches:
        ticket_num, ticket_key, summary, description = match
        
        # Create ticket object
        ticket = {
            'key': ticket_key,
            'summary': summary.strip(),
            'description': description.strip()
        }
        
        # Calculate alignment score
        text = f"{ticket['summary']} {ticket['description']}".lower()
        
        max_score = 0
        matched_principles = []
        
        for principle in principles_data['principles']:
            score = 0
            weight = principle.get('weight', 1.0)
            
            # Check for keyword matches
            keyword_matches = 0
            for keyword in principle['keywords']:
                if keyword.lower() in text:
                    keyword_matches += 1
                    score += 25 * weight
            
            # Check description match
            if principle['description'].lower() in text:
                score += 15 * weight
            
            # High-value keyword bonus
            high_value_keywords = principle.get('high_value_keywords', [])
            for keyword in high_value_keywords:
                if keyword.lower() in text:
                    score += 10 * weight
            
            # Cap score at 100
            score = min(score, 100)
            
            if score > 0:
                matched_principles.append(principle['name'])
            
            max_score = max(max_score, score)
        
        # Determine category
        if max_score >= 80:
            category = 'core_value'
        elif max_score >= 60:
            category = 'strategic_enabler'
        elif max_score >= 40:
            category = 'drift'
        else:
            category = 'distraction'
        
        # Generate more specific rationale based on content
        summary_lower = ticket['summary'].lower()
        desc_lower = ticket['description'].lower()
        
        if max_score >= 80:
            if 'agent' in text or 'ai' in text or 'multi-agent' in text:
                rationale = "Directly implements AI agent capabilities that empower builders."
            elif 'integration' in text or 'api' in text:
                rationale = "Creates strategic integration points that multiply builder possibilities."
            elif 'builder' in text or 'developer' in text:
                rationale = "Explicitly targets builder productivity and empowerment."
            elif 'real-time' in text or 'automation' in text:
                rationale = "Delivers automation capabilities aligned with our AI-first vision."
            else:
                rationale = "Strongly aligns with strategic principles and directly advances core goals."
        elif max_score >= 60:
            if 'performance' in text or 'optimization' in text:
                rationale = "Strengthens platform performance to support AI workloads."
            elif 'infrastructure' in text or 'foundation' in text:
                rationale = "Builds essential infrastructure for future strategic features."
            elif 'bug' in text or 'fix' in text:
                rationale = "Maintains system reliability that builders depend on."
            elif 'ui' in text or 'ux' in text:
                rationale = "Improves builder experience through interface enhancements."
            else:
                rationale = "Supports strategic objectives with clear connection to principles."
        elif max_score >= 40:
            if 'ui' in text or 'design' in text:
                rationale = "UI work with unclear connection to builder productivity."
            elif 'feature' in text:
                rationale = "Adds functionality without clear strategic alignment."
            else:
                rationale = "Has some strategic value but connection to core principles is weak."
        else:
            if 'marketing' in text or 'brand' in text:
                rationale = "Marketing focus diverges from product excellence priorities."
            elif 'cosmetic' in text or 'style' in text:
                rationale = "Cosmetic changes with no builder or AI impact."
            else:
                rationale = "Limited strategic alignment. Consider deprioritizing or reframing."
        
        alignment = {
            'ticket_key': ticket_key,
            'score': round(max_score, 1),
            'category': category,
            'rationale': rationale,
            'matched_principles': matched_principles
        }
        alignments.append(alignment)
    
    return alignments


def parse_crew_results(crew_output, context_data: Dict[str, str] = None) -> Dict[str, Any]:
    """Parse CrewAI output and combine with detailed ticket analysis"""
    import re
    
    output_text = str(crew_output)
    
    # Get detailed ticket alignments using proven algorithm
    alignments = calculate_ticket_alignment_scores(context_data) if context_data else []
    
    # Enhanced parsing to capture more agent insights
    agent_insights = extract_agent_insights(output_text)
    
    # Enhance alignments with agent insights
    enhanced_alignments = enhance_alignments_with_agent_insights(alignments, agent_insights)
    
    # Initialize results structure
    results = {
        'tickets': [],
        'alignments': enhanced_alignments,
        'rewrites': [],
        'agent_insights': agent_insights,
        'summary': {
            'total_tickets': len(alignments),
            'average_alignment_score': 0,
            'drift_percentage': 0,
            'recommendations': [],
            'alignment_breakdown': {
                'core_value': 0,
                'strategic_enabler': 0,
                'drift': 0,
                'distraction': 0
            }
        },
        'raw_output': output_text,
        'executive_narrative': ''
    }
    
    # Calculate summary metrics from alignments
    if alignments:
        total_score = sum(a['score'] for a in alignments)
        results['summary']['average_alignment_score'] = round(total_score / len(alignments), 1)
        
        # Count categories
        for alignment in alignments:
            category = alignment['category']
            results['summary']['alignment_breakdown'][category] += 1
        
        # Calculate drift percentage (tickets scoring < 60)
        drift_count = len([a for a in alignments if a['score'] < 60])
        results['summary']['drift_percentage'] = round((drift_count / len(alignments)) * 100, 0)
    
    # Extract multiple patterns for rewrites/transformations
    rewrite_patterns = [
        r'(\d+)\.\s*TICKET:\s*(SCRUM-\d+).*?Transformed Summary:\s*([^\n]+).*?JIRA Comment:\s*"([^"]+)"',
        r'TICKET:\s*(SCRUM-\d+).*?Transformed Summary:\s*([^\n]+).*?JIRA Comment:\s*"([^"]+)"',
        r'(SCRUM-\d+).*?Original Summary:.*?Transformed Summary:\s*([^\n]+).*?Strategic Rationale:\s*([^\n]+)',
        r'(SCRUM-\d+).*?New Summary:\s*([^\n]+).*?Enhancement:\s*([^\n]+)'
    ]
    
    rewrites = []
    for pattern in rewrite_patterns:
        matches = re.findall(pattern, output_text, re.DOTALL)
        for match in matches:
            if len(match) == 4:  # Pattern with number prefix
                _, ticket_key, new_summary, comment = match
            elif len(match) == 3:  # Standard pattern
                ticket_key, new_summary, comment = match
            else:
                continue
                
            rewrite = {
                'original_key': ticket_key,
                'new_summary': new_summary.strip(),
                'jira_comment': comment.strip()
            }
            if rewrite not in rewrites:  # Avoid duplicates
                rewrites.append(rewrite)
    
    results['rewrites'] = rewrites
    
    # Extract recommendations from Strategic Prophet
    rec_patterns = [
        r'(?:Actionable Recommendations|CALL TO ACTION):.*?(\d+\.\s*[^\n]+(?:\n(?!\d+\.)[^\n]+)*)',
        r'(?:Strategic Recommendations|Top Recommendations):.*?(\d+\.\s*[^\n]+(?:\n(?!\d+\.)[^\n]+)*)',
        r'(?:Next Steps|Action Items):.*?(\d+\.\s*[^\n]+(?:\n(?!\d+\.)[^\n]+)*)'
    ]
    
    recommendations = []
    for pattern in rec_patterns:
        matches = re.findall(pattern, output_text, re.DOTALL)
        for match in matches:
            recommendations.append(match.strip())
    
    results['summary']['recommendations'] = recommendations
    
    # Extract executive narrative from Strategic Storyteller
    exec_patterns = [
        r'\*\*HOOK:\*\*.*?(?=\n\n|\Z)',
        r'\*HOOK:\*.*?(?=\n\n|\Z)',
        r'HOOK:.*?(?=\n\n|\Z)',
        r'CURRENT STATE:.*?(?=\n\n|\Z)',
        r'The Strategic.*?(?=\n\n|\Z)'
    ]
    
    for pattern in exec_patterns:
        exec_match = re.search(pattern, output_text, re.DOTALL)
        if exec_match:
            results['executive_narrative'] = exec_match.group(0)
            break
    
    return results


def extract_agent_insights(output_text: str) -> Dict[str, Any]:
    """Extract insights from each individual agent"""
    import re
    
    insights = {
        'data_detective': [],
        'strategic_oracle': [],
        'strategic_alchemist': [],
        'strategic_prophet': [],
        'strategic_storyteller': []
    }
    
    # Extract insights from Strategic Data Detective
    detective_patterns = [
        r'Strategic signals:.*?([^\n]+)',
        r'Key patterns:.*?([^\n]+)',
        r'Hidden insights:.*?([^\n]+)'
    ]
    
    for pattern in detective_patterns:
        matches = re.findall(pattern, output_text, re.IGNORECASE)
        insights['data_detective'].extend(matches)
    
    # Extract insights from Strategic Oracle
    oracle_patterns = [
        r'(SCRUM-\d+).*?score.*?(\d+\.?\d*)/100.*?([^\n]+)',
        r'Strategic assessment:.*?([^\n]+)',
        r'Vision alignment:.*?([^\n]+)'
    ]
    
    for pattern in oracle_patterns:
        matches = re.findall(pattern, output_text, re.IGNORECASE)
        insights['strategic_oracle'].extend([str(m) for m in matches])
    
    # Extract transformation insights from Strategic Alchemist
    alchemist_patterns = [
        r'Strategic transformation:.*?([^\n]+)',
        r'Reframing suggestion:.*?([^\n]+)',
        r'Enhanced value:.*?([^\n]+)'
    ]
    
    for pattern in alchemist_patterns:
        matches = re.findall(pattern, output_text, re.IGNORECASE)
        insights['strategic_alchemist'].extend(matches)
    
    # Extract patterns from Strategic Prophet
    prophet_patterns = [
        r'Future risk:.*?([^\n]+)',
        r'Strategic opportunity:.*?([^\n]+)',
        r'Pattern detected:.*?([^\n]+)',
        r'Blind spot:.*?([^\n]+)'
    ]
    
    for pattern in prophet_patterns:
        matches = re.findall(pattern, output_text, re.IGNORECASE)
        insights['strategic_prophet'].extend(matches)
    
    return insights


def enhance_alignments_with_agent_insights(alignments: List[Dict], agent_insights: Dict[str, Any]) -> List[Dict]:
    """Enhance ticket alignments with insights from agents"""
    enhanced = []
    
    for alignment in alignments:
        enhanced_alignment = alignment.copy()
        
        # Add agent-specific insights for this ticket
        ticket_key = alignment['ticket_key']
        
        # Look for ticket-specific insights from agents
        ticket_insights = []
        
        # Search for insights mentioning this ticket
        for agent, insights in agent_insights.items():
            for insight in insights:
                if ticket_key in str(insight):
                    ticket_insights.append(f"{agent.title()}: {insight}")
        
        enhanced_alignment['agent_insights'] = ticket_insights
        enhanced_alignment['strategic_depth'] = 'High' if len(ticket_insights) > 2 else 'Medium' if len(ticket_insights) > 0 else 'Standard'
        
        enhanced.append(enhanced_alignment)
    
    return enhanced


def save_report(results: Dict[str, Any]):
    """Save analysis report"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"steve_report_{timestamp}.md"
    
    with open(filename, "w") as f:
        f.write(f"# Steve Multi-Agent Analysis Report\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        # Executive Summary
        f.write(f"## Executive Summary\n\n")
        
        # Overview paragraph
        total_tickets = results['summary']['total_tickets']
        avg_score = results['summary']['average_alignment_score']
        drift_pct = results['summary']['drift_percentage']
        breakdown = results['summary']['alignment_breakdown']
        
        high_performers = breakdown['core_value']
        low_performers = breakdown['distraction'] + breakdown['drift']
        
        f.write(f"This analysis covers **{total_tickets} tickets** with an average strategic alignment of **{avg_score:.1f}/100**. ")
        
        if total_tickets > 0:
            f.write(f"Our strategic health shows **{drift_pct:.0f}% drift**, indicating significant misalignment with core principles. ")
            f.write(f"While **{high_performers} tickets ({(high_performers/total_tickets*100):.0f}%)** demonstrate strong strategic value, ")
            f.write(f"**{low_performers} tickets ({(low_performers/total_tickets*100):.0f}%)** require immediate realignment or deprioritization.\n\n")
        else:
            f.write(f"This analysis was performed in test mode with mock data. ")
            f.write(f"In a real analysis, this would show strategic health metrics and alignment percentages.\n\n")
        
        # Key insights
        f.write(f"### Key Strategic Insights\n")
        if avg_score >= 70:
            f.write(f"✅ **Strong Overall Alignment** - Team is generally focused on strategic priorities\n")
        elif avg_score >= 50:
            f.write(f"⚠️ **Moderate Strategic Focus** - Some drift detected, course correction recommended\n")
        else:
            f.write(f"🚨 **Significant Strategic Drift** - Immediate realignment required to avoid mission dilution\n")
            
        if breakdown['core_value'] > breakdown['distraction']:
            f.write(f"✅ **Core Value Dominance** - More high-value work than distractions\n")
        else:
            f.write(f"⚠️ **Distraction Risk** - Low-value work outnumbers strategic initiatives\n")
            
        f.write(f"📊 **Resource Allocation**: {breakdown['core_value']} high-impact, {breakdown['strategic_enabler']} supporting, {breakdown['drift'] + breakdown['distraction']} misaligned tickets\n\n")
        
        # Alignment Breakdown
        f.write(f"### Alignment Breakdown\n")
        for category, count in breakdown.items():
            percentage = (count / total_tickets * 100) if total_tickets > 0 else 0
            emoji = {'core_value': '🎯', 'strategic_enabler': '⚡', 'drift': '⚠️', 'distraction': '🚫'}.get(category, '📋')
            f.write(f"- {emoji} **{category.replace('_', ' ').title()}**: {count} tickets ({percentage:.0f}%)\n")
        f.write("\n")
        
        # Strategic Score Table
        f.write(f"## Strategic Alignment Scorecard\n\n")
        f.write(f"| Rank | Ticket | Score | Category | Strategic Focus |\n")
        f.write(f"|------|--------|-------|----------|----------------|\n")
        
        # Sort tickets by score (highest first)
        sorted_alignments = sorted(results['alignments'], key=lambda x: x['score'], reverse=True)
        
        for i, alignment in enumerate(sorted_alignments, 1):
            ticket_key = alignment['ticket_key']
            score = alignment['score']
            category = alignment['category']
            
            # Get category emoji and color
            if score >= 80:
                score_indicator = f"🟢 {score}"
                focus = "High Impact"
            elif score >= 60:
                score_indicator = f"🟡 {score}"
                focus = "Strategic Support"
            elif score >= 40:
                score_indicator = f"🟠 {score}"
                focus = "Needs Alignment"
            else:
                score_indicator = f"🔴 {score}"
                focus = "Requires Review"
            
            category_display = category.replace('_', ' ').title()
            
            f.write(f"| {i} | {ticket_key} | {score_indicator} | {category_display} | {focus} |\n")
        
        f.write(f"\n### Score Distribution\n")
        score_ranges = {
            'Excellent (80-100)': len([a for a in results['alignments'] if a['score'] >= 80]),
            'Good (60-79)': len([a for a in results['alignments'] if 60 <= a['score'] < 80]),
            'Fair (40-59)': len([a for a in results['alignments'] if 40 <= a['score'] < 60]),
            'Poor (0-39)': len([a for a in results['alignments'] if a['score'] < 40])
        }
        
        for range_name, count in score_ranges.items():
            pct = (count / total_tickets * 100) if total_tickets > 0 else 0
            f.write(f"- **{range_name}**: {count} tickets ({pct:.0f}%)\n")
        f.write("\n")
        
        # Detailed Ticket Analysis
        f.write(f"## Detailed Ticket Analysis\n")
        for alignment in sorted(results['alignments'], key=lambda x: x['score'], reverse=True):
            f.write(f"### {alignment['ticket_key']}: {alignment['score']}/100\n")
            f.write(f"- **Category**: {alignment['category']}\n")
            f.write(f"- *Rationale*: {alignment['rationale']}\n")
            f.write(f"- **Matched Principles**: {', '.join(alignment.get('matched_principles', []))}\n")
            f.write(f"- **Strategic Depth**: {alignment.get('strategic_depth', 'Standard')}\n")
            
            # Add agent insights if available
            agent_insights = alignment.get('agent_insights', [])
            if agent_insights:
                f.write(f"- **Agent Insights**:\n")
                for insight in agent_insights:
                    f.write(f"  - {insight}\n")
            f.write("\n")
        
        # Strategic Transformations
        if results['rewrites']:
            f.write(f"## Strategic Transformations\n")
            f.write(f"*For tickets that need realignment:*\n\n")
            for rewrite in results['rewrites']:
                f.write(f"### {rewrite['original_key']}\n")
                f.write(f"- **New Summary**: {rewrite['new_summary']}\n")
                f.write(f"- **Jira Comment**: {rewrite['jira_comment']}\n\n")
        
        # Recommendations
        if results['summary']['recommendations']:
            f.write(f"## Strategic Recommendations\n")
            for rec in results['summary']['recommendations']:
                f.write(f"{rec}\n\n")
        
        # Executive Narrative
        if 'executive_narrative' in results:
            f.write(f"## Executive Narrative\n")
            f.write(f"{results['executive_narrative']}\n\n")
        
        # Append raw output for debugging
        f.write(f"\n---\n## Raw Agent Output\n")
        f.write(f"<details>\n<summary>Click to expand full agent output</summary>\n\n")
        f.write(f"```\n{results.get('raw_output', 'No raw output captured')}\n```\n")
        f.write(f"</details>\n")
    
    logger.steve.info(f"📊 Full report saved to {filename}")


if __name__ == "__main__":
    import click
    from rich.console import Console
    from rich.panel import Panel
    from rich.text import Text
    
    console = Console()
    
    def display_startup_banner():
        """Display amazing startup banner"""
        banner = Text(
            "STEVE - MULTI-AGENT STRATEGIC INTELLIGENCE SYSTEM",
            style="bold cyan"
        )
        
        panel = Panel(
            banner,
            title="Strategic Ticket Evaluation & Vision Enforcer",
            subtitle="Powered by 5 AI Agents - CrewAI - OpenRouter",
            border_style="cyan",
            padding=(1, 2)
        )
        console.print(panel)
        
        console.print("""
[bold yellow]AGENT LINEUP:[/bold yellow]
[cyan]1. Strategic Data Detective[/cyan] - Extracts hidden patterns from Jira tickets
[cyan]2. Strategic Oracle[/cyan] - Provides prophetic alignment scoring (0-100) 
[cyan]3. Strategic Alchemist[/cyan] - Transforms misaligned tickets into strategic gold
[cyan]4. Strategic Prophet[/cyan] - Reveals future patterns and strategic risks
[cyan]5. Strategic Storyteller[/cyan] - Crafts compelling executive narratives

[bold green]Ready to reveal your teams strategic destiny![/bold green]
        """)
    
    @click.command()
    @click.option('--mode', default='execution', 
                  type=click.Choice(['execution', 'strategy', 'full_review']),
                  help='Analysis scope: execution (current sprint), strategy (epics), full_review (all tickets)')
    @click.option('--project', help='Jira project key (overrides env)')
    @click.option('--dry-run', is_flag=True, help='Analyze without updating Jira')
    @click.option('--test', is_flag=True, help='Use test mode with mock data')
    def main(mode, project, dry_run, test):
        """ STEVE Multi-Agent Strategic Intelligence System
        
        Unleash 5 AI agents to analyze your Jira tickets for strategic alignment.
        Each agent brings unique expertise to reveal hidden patterns and transform
        your backlog into a strategic advantage.
        """
        display_startup_banner()
        
        if dry_run:
            console.print("[yellow]DRY RUN MODE - No Jira updates will be made[/yellow]\n")
        
        if test:
            console.print("[blue]TEST MODE - Using mock data[/blue]\n")
            
        console.print(f"[bold]Analysis Mode:[/bold] {mode}")
        console.print(f"[bold]Project:[/bold] {project or os.getenv('JIRA_PROJECT_KEY', 'Not Set')}")
        console.print(f"[bold]Founder Voice:[/bold] {'Enabled' if os.getenv('USE_FOUNDER_VOICE', 'false').lower() == 'true' else 'Disabled'}")
        console.print()
        
        try:
            # Run the multi-agent analysis
            results = run_steve(
                review_mode=mode,
                project_key=project,
                test_mode=test,
                dry_run=dry_run
            )
            
            console.print("""
[bold green]STRATEGIC INTELLIGENCE COMPLETE![/bold green]

[bold cyan]What just happened?[/bold cyan]
- 5 AI agents analyzed your tickets with superhuman insight
- Strategic patterns revealed and future risks identified  
- Misaligned tickets transformed into strategic opportunities
- Executive narrative crafted for leadership communication

[bold yellow]Next Steps:[/bold yellow]
- Check your Jira tickets for strategic analysis comments
- Review the generated report for detailed insights
- Share the executive summary with your team
- Use insights to guide sprint planning and strategic decisions

[dim]"Are we building what matters?" - The question that drives strategic excellence[/dim]
""")
            
        except Exception as e:
            console.print(f"[red]Strategic analysis failed: {e}[/red]")
            console.print("[dim]Check your .env configuration and API keys[/dim]")
            raise
    
    main()
