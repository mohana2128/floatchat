from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification
import re
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        try:
            # Initialize NER model for entity extraction
            self.ner_tokenizer = AutoTokenizer.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")
            self.ner_model = AutoModelForTokenClassification.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")
            self.ner_pipeline = pipeline("ner", model=self.ner_model, tokenizer=self.ner_tokenizer, aggregation_strategy="simple")
            
            # Initialize sentiment analysis for query understanding
            self.sentiment_pipeline = pipeline("sentiment-analysis")
            
            logger.info("NLP models loaded successfully")
        except Exception as e:
            logger.error(f"Error initializing NLP models: {e}")
            self.ner_pipeline = None
            self.sentiment_pipeline = None

    def extract_intent(self, query: str) -> str:
        """Extract the main intent from a user query"""
        query_lower = query.lower()
        
        # Intent keywords mapping
        intent_patterns = {
            'plot': ['plot', 'graph', 'chart', 'visualize', 'show', 'display'],
            'summarize': ['summary', 'summarize', 'overview', 'describe', 'tell me about'],
            'anomaly': ['anomaly', 'unusual', 'abnormal', 'outlier', 'strange'],
            'trend': ['trend', 'change', 'over time', 'temporal', 'evolution'],
            'compare': ['compare', 'difference', 'versus', 'vs', 'between'],
            'forecast': ['predict', 'forecast', 'future', 'projection']
        }
        
        for intent, keywords in intent_patterns.items():
            if any(keyword in query_lower for keyword in keywords):
                return intent
                
        return 'query'  # Default intent

    def extract_entities(self, query: str) -> Dict[str, List[str]]:
        """Extract entities like parameters, locations, time periods"""
        entities = {
            'parameters': [],
            'locations': [],
            'time_periods': [],
            'depths': [],
            'regions': []
        }
        
        query_lower = query.lower()
        
        # Parameter detection
        parameter_patterns = {
            'temperature': ['temperature', 'temp', 'thermal'],
            'salinity': ['salinity', 'salt', 'psu'],
            'depth': ['depth', 'pressure', 'vertical'],
            'current': ['current', 'velocity', 'flow']
        }
        
        for param, keywords in parameter_patterns.items():
            if any(keyword in query_lower for keyword in keywords):
                entities['parameters'].append(param)
        
        # Location detection
        location_patterns = [
            'atlantic', 'pacific', 'indian', 'arctic', 'southern',
            'north atlantic', 'south pacific', 'mediterranean',
            'gulf stream', 'california current', 'agulhas current'
        ]
        
        for location in location_patterns:
            if location in query_lower:
                entities['locations'].append(location)
        
        # Time period detection
        time_patterns = [
            'last month', 'past year', 'recent', 'today',
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december',
            '2023', '2024'
        ]
        
        for time_pattern in time_patterns:
            if time_pattern in query_lower:
                entities['time_periods'].append(time_pattern)
        
        # Use NER pipeline if available
        if self.ner_pipeline:
            try:
                ner_results = self.ner_pipeline(query)
                for entity in ner_results:
                    if entity['entity_group'] == 'LOC':
                        entities['locations'].append(entity['word'])
            except Exception as e:
                logger.warning(f"NER pipeline error: {e}")
        
        return entities

    def parse_time_range(self, time_entities: List[str]) -> Optional[Tuple[datetime, datetime]]:
        """Parse time entities into datetime range"""
        now = datetime.utcnow()
        
        for time_entity in time_entities:
            if 'last month' in time_entity:
                end_date = now
                start_date = now - timedelta(days=30)
                return (start_date, end_date)
            elif 'past year' in time_entity:
                end_date = now
                start_date = now - timedelta(days=365)
                return (start_date, end_date)
            elif 'recent' in time_entity:
                end_date = now
                start_date = now - timedelta(days=7)
                return (start_date, end_date)
        
        return None

    def generate_suggestions(self, query: str, intent: str, entities: Dict) -> List[str]:
        """Generate follow-up query suggestions"""
        suggestions = []
        
        if intent == 'plot':
            suggestions = [
                "Show me the depth profile for this data",
                "Compare with historical averages",
                "Display anomalies in this region"
            ]
        elif intent == 'summarize':
            suggestions = [
                "Create a visualization for this data",
                "Show trends over time",
                "Detect any unusual patterns"
            ]
        elif 'temperature' in entities.get('parameters', []):
            suggestions = [
                "Show salinity data for the same region",
                "Compare with seasonal averages",
                "Display temperature depth profile"
            ]
        
        return suggestions

nlp_service = NLPService()