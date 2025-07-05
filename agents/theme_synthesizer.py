from typing import List, Dict, Counter
import yaml
from collections import Counter
from crewai import Agent, Task

from ..core.schemas import (
    TicketSchema, AlignmentResult, AlignmentCategory, 
    SprintSummarySchema
)
from ..utils.logger import get_logger

logger = get_logger(__name__)


class ThemeSynthesizerAgent:
    def __init__(self):
        self._load_config()
        self._load_principles()
        self.agent = self._create_agent()
    
    def _load_config(self):
        with open("config/agents.yaml", "r") as f:
            config = yaml.safe_load(f)
            self.config = config["agents"]["theme_synthesizer"]
            self.global_config = config["global"]
    
    def _load_principles(self):
        with open("config/principles.yaml", "r") as f:
            principles_data = yaml.safe_load(f)
            self.principles = principles_data["principles"]
            self.principle_names = [p['name'] for p in self.principles]
    
    def _create_agent(self) -> Agent:
        """Create the theme synthesizer agent"""
        return Agent(
            role=self.config["role"],
            goal=self.config["goal"],
            backstory=self.config["backstory"],
            verbose=True,
            allow_delegation=False
        )
    
    def synthesize(self, tickets: List[TicketSchema], 
                  alignments: List[AlignmentResult]) -> SprintSummarySchema:
        """Synthesize patterns from alignment results"""
        # Calculate basic stats
        total_tickets = len(tickets)
        
        # Count by category
        category_counts = Counter(a.category for a in alignments)
        alignment_breakdown = {
            cat: category_counts.get(cat, 0) 
            for cat in AlignmentCategory
        }
        
        # Calculate average score
        avg_score = sum(a.alignment_score for a in alignments) / total_tickets if total_tickets > 0 else 0
        
        # Calculate drift percentage
        drift_count = (alignment_breakdown[AlignmentCategory.DRIFT] + 
                      alignment_breakdown[AlignmentCategory.DISTRACTION])
        drift_percentage = (drift_count / total_tickets * 100) if total_tickets > 0 else 0
        
        # Find over-indexed areas
        principle_counts = Counter()
        for alignment in alignments:
            for principle in alignment.matched_principles:
                principle_counts[principle] += 1
        
        over_indexed = self._find_over_indexed_areas(principle_counts, total_tickets)
        
        # Find neglected principles
        neglected = self._find_neglected_principles(principle_counts)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            alignment_breakdown, 
            drift_percentage,
            over_indexed,
            neglected
        )
        
        # Get top/bottom tickets
        sorted_alignments = sorted(alignments, key=lambda a: a.alignment_score, reverse=True)
        top_tickets = [
            {
                "key": a.ticket_key,
                "score": a.alignment_score,
                "category": a.category.value
            }
            for a in sorted_alignments[:5]
        ]
        
        bottom_tickets = [
            {
                "key": a.ticket_key,
                "score": a.alignment_score,
                "category": a.category.value
            }
            for a in sorted_alignments[-5:]
        ]
        
        summary = SprintSummarySchema(
            total_tickets=total_tickets,
            alignment_breakdown=alignment_breakdown,
            average_alignment_score=avg_score,
            drift_percentage=drift_percentage,
            over_indexed_areas=over_indexed,
            neglected_principles=neglected,
            recommendations=recommendations[:self.config["max_recommendations"]],
            top_aligned_tickets=top_tickets,
            bottom_aligned_tickets=bottom_tickets
        )
        
        logger.steve.sprint_summary(summary.dict())
        
        return summary
    
    def _find_over_indexed_areas(self, principle_counts: Counter, total: int) -> List[str]:
        """Find principles that are over-represented"""
        if total == 0:
            return []
        
        # A principle is over-indexed if it appears in >40% of tickets
        threshold = 0.4
        over_indexed = []
        
        for principle, count in principle_counts.most_common():
            if count / total > threshold:
                over_indexed.append(principle)
        
        return over_indexed
    
    def _find_neglected_principles(self, principle_counts: Counter) -> List[str]:
        """Find principles that are under-represented"""
        covered_principles = set(principle_counts.keys())
        all_principles = set(self.principle_names)
        
        neglected = list(all_principles - covered_principles)
        
        # Also include principles with very low coverage
        for principle in self.principle_names:
            if principle_counts[principle] < 2 and principle not in neglected:
                neglected.append(principle)
        
        return neglected
    
    def _generate_recommendations(self, breakdown: Dict, drift_pct: float,
                                over_indexed: List[str], 
                                neglected: List[str]) -> List[str]:
        """Generate strategic recommendations"""
        recommendations = []
        
        # High drift warning
        if drift_pct > 40:
            recommendations.append(
                f"⚠️ High drift detected ({drift_pct:.0f}%). Review sprint planning process."
            )
        
        # Too many distractions
        distraction_count = breakdown.get(AlignmentCategory.DISTRACTION, 0)
        if distraction_count > 3:
            recommendations.append(
                f"📵 {distraction_count} distraction tickets. Consider deprioritizing or removing."
            )
        
        # Neglected principles
        if neglected:
            recommendations.append(
                f"🎯 Focus needed on: {', '.join(neglected[:2])}"
            )
        
        # Over-indexing
        if over_indexed:
            recommendations.append(
                f"⚖️ Rebalance from {over_indexed[0]} to other strategic areas"
            )
        
        # Low alignment average
        if drift_pct < 20:
            recommendations.append(
                "✅ Strong strategic alignment. Keep up the focused execution!"
            )
        
        # Specific category insights
        enabler_count = breakdown.get(AlignmentCategory.STRATEGIC_ENABLER, 0)
        if enabler_count > breakdown.get(AlignmentCategory.CORE_VALUE, 0):
            recommendations.append(
                "🚀 Consider promoting key enablers to core value initiatives"
            )
        
        # Balance recommendation
        total = sum(breakdown.values())
        if total > 20:
            recommendations.append(
                "📊 Large sprint scope. Consider focusing on fewer, higher-impact items"
            )
        
        return recommendations
    
    def create_task(self, tickets: List[TicketSchema], 
                   alignments: List[AlignmentResult]) -> Task:
        """Create task for the agent"""
        return Task(
            description=f"""
            Analyze patterns across {len(tickets)} tickets and their alignment scores.
            
            Identify:
            1. Overall alignment statistics
            2. Over-indexed areas (too much focus)
            3. Neglected principles (blind spots)
            4. Strategic drift patterns
            
            Generate actionable recommendations (max {self.config['max_recommendations']}).
            """,
            expected_output="SprintSummarySchema with patterns and recommendations",
            agent=self.agent
        )
    
    def run(self, tickets: List[TicketSchema], 
           alignments: List[AlignmentResult]) -> SprintSummarySchema:
        """Execute the agent to synthesize themes"""
        logger.steve.start_progress("Detecting patterns and generating insights...")
        
        summary = self.synthesize(tickets, alignments)
        
        logger.steve.stop_progress()
        logger.steve.success("Theme synthesis complete")
        
        return summary