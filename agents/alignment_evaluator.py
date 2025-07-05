from typing import List, Dict
import yaml
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from crewai import Agent, Task

from core.schemas import TicketSchema, AlignmentResult, AlignmentCategory
from utils.logger import get_logger

logger = get_logger(__name__)


class AlignmentEvaluatorAgent:
    def __init__(self):
        self._load_config()
        self._load_principles()
        self._prepare_vectorizer()
        self.agent = self._create_agent()
    
    def _load_config(self):
        with open("config/agents.yaml", "r") as f:
            config = yaml.safe_load(f)
            self.config = config["agents"]["alignment_evaluator"]
            self.global_config = config["global"]
    
    def _load_principles(self):
        with open("config/principles.yaml", "r") as f:
            principles_data = yaml.safe_load(f)
            self.principles = principles_data["principles"]
            self.thresholds = principles_data["thresholds"]
    
    def _prepare_vectorizer(self):
        """Prepare TF-IDF vectorizer with principle keywords"""
        # Create corpus from principles
        principle_texts = []
        self.principle_names = []
        self.principle_weights = []
        
        for principle in self.principles:
            # Combine description and keywords
            text = f"{principle['name']} {principle['description']} {' '.join(principle['keywords'])}"
            principle_texts.append(text)
            self.principle_names.append(principle['name'])
            self.principle_weights.append(principle.get('weight', 1.0))
        
        # Fit vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.principle_vectors = self.vectorizer.fit_transform(principle_texts)
    
    def _create_agent(self) -> Agent:
        """Create the alignment evaluator agent"""
        return Agent(
            role=self.config["role"],
            goal=self.config["goal"],
            backstory=self.config["backstory"],
            verbose=self.config.get("verbose", True),
            allow_delegation=False,
            temperature=self.config.get("temperature", 0.3)
        )
    
    def evaluate_ticket(self, ticket: TicketSchema) -> AlignmentResult:
        """Evaluate a single ticket's alignment"""
        # Combine ticket text
        ticket_text = f"{ticket.summary} {ticket.description}"
        
        # Vectorize ticket
        ticket_vector = self.vectorizer.transform([ticket_text])
        
        # Calculate similarities
        similarities = cosine_similarity(ticket_vector, self.principle_vectors)[0]
        
        # Apply weights
        weighted_similarities = similarities * np.array(self.principle_weights)
        
        # Calculate alignment score (0-100)
        alignment_score = float(np.max(weighted_similarities) * 100)
        
        # Determine category
        category = self._determine_category(alignment_score)
        
        # Find matched principles
        threshold = 0.3  # Minimum similarity to consider a match
        matched_indices = np.where(similarities > threshold)[0]
        matched_principles = [self.principle_names[i] for i in matched_indices]
        
        # Generate rationale
        rationale = self._generate_rationale(
            ticket.summary,
            alignment_score,
            matched_principles,
            category
        )
        
        result = AlignmentResult(
            ticket_key=ticket.key,
            alignment_score=alignment_score,
            category=category,
            rationale=rationale,
            matched_principles=matched_principles
        )
        
        logger.steve.ticket_analysis(ticket.key, result)
        
        return result
    
    def _determine_category(self, score: float) -> AlignmentCategory:
        """Determine category based on score and thresholds"""
        if score >= self.thresholds["core_value"]:
            return AlignmentCategory.CORE_VALUE
        elif score >= self.thresholds["strategic_enabler"]:
            return AlignmentCategory.STRATEGIC_ENABLER
        elif score >= self.thresholds["drift"]:
            return AlignmentCategory.DRIFT
        else:
            return AlignmentCategory.DISTRACTION
    
    def _generate_rationale(self, summary: str, score: float, 
                           matched_principles: List[str], 
                           category: AlignmentCategory) -> str:
        """Generate explanation for the alignment score"""
        if category == AlignmentCategory.CORE_VALUE:
            return f"This ticket strongly aligns with {', '.join(matched_principles[:2])} principles, directly advancing core strategic objectives."
        elif category == AlignmentCategory.STRATEGIC_ENABLER:
            return f"This work supports {matched_principles[0] if matched_principles else 'strategic goals'} and provides clear value toward our vision."
        elif category == AlignmentCategory.DRIFT:
            return f"While this ticket has some merit, it only weakly connects to our principles. Consider refocusing on {self.principle_names[0]}."
        else:
            return f"This ticket lacks clear alignment with strategic principles. It may distract from more important work."
    
    def create_task(self, tickets: List[TicketSchema]) -> Task:
        """Create task for the agent"""
        return Task(
            description=f"""
            Evaluate the strategic alignment of {len(tickets)} tickets.
            
            For each ticket:
            1. Compare against company principles
            2. Calculate alignment score (0-100)
            3. Categorize based on thresholds
            4. Provide clear rationale
            
            Be consistent and objective in scoring.
            """,
            expected_output="List of AlignmentResult objects",
            agent=self.agent
        )
    
    def run(self, tickets: List[TicketSchema]) -> List[AlignmentResult]:
        """Execute the agent to evaluate tickets"""
        logger.steve.start_progress(f"Evaluating {len(tickets)} tickets...")
        
        results = []
        for ticket in tickets:
            result = self.evaluate_ticket(ticket)
            results.append(result)
        
        logger.steve.stop_progress()
        logger.steve.success(f"Evaluated {len(results)} tickets")
        
        return results