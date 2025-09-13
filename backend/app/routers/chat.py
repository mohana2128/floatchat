from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import ChatMessage, ChatResponse
from app.services.nlp_service import nlp_service
from app.services.data_service import data_service
from app.database.mongodb import get_database
from typing import Dict
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(message: ChatMessage, db=Depends(get_database)):
    """Main chat endpoint for processing user queries"""
    try:
        # Extract intent and entities from the message
        intent = nlp_service.extract_intent(message.message)
        entities = nlp_service.extract_entities(message.message)
        
        logger.info(f"Processing query - Intent: {intent}, Entities: {entities}")
        
        # Determine what type of data analysis is needed
        analysis_type = 'summary'
        viz_type = 'time_series'
        
        if intent == 'plot':
            if 'depth' in entities.get('parameters', []):
                viz_type = 'depth_profile'
            elif entities.get('locations'):
                viz_type = 'map'
        elif intent == 'anomaly':
            analysis_type = 'anomaly'
        elif intent == 'trend':
            analysis_type = 'trend'
        
        # Fetch and process ocean data
        async with data_service as ds:
            raw_data = await ds.fetch_argo_data({
                'parameters': entities.get('parameters', ['temperature']),
                'locations': entities.get('locations', []),
                'time_periods': entities.get('time_periods', []),
            })
            
            # Analyze the data
            analyzed_data = ds.analyze_data(raw_data, analysis_type)
            
            # Create visualizations
            visualizations = ds.create_visualizations(analyzed_data, viz_type)
        
        # Generate response message
        response_message = generate_response_message(intent, entities, analyzed_data)
        
        # Generate suggestions
        suggestions = nlp_service.generate_suggestions(message.message, intent, entities)
        
        # Save query to database
        await save_query_to_db(db, message, {
            'intent': intent,
            'entities': entities,
            'data': analyzed_data,
            'visualizations': visualizations
        })
        
        return ChatResponse(
            message=response_message,
            data=analyzed_data,
            visualizations=visualizations,
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(status_code=500, detail="Error processing your request")

def generate_response_message(intent: str, entities: Dict, data: Dict) -> str:
    """Generate a natural language response based on the analysis"""
    
    parameters = entities.get('parameters', ['ocean'])
    locations = entities.get('locations', ['the specified region'])
    
    if intent == 'plot' or intent == 'query':
        if 'statistics' in data:
            stats = data['statistics']
            return f"Here's the {parameters[0]} analysis for {locations[0]}. " \
                   f"The average temperature is {stats['mean_temperature']:.1f}°C with " \
                   f"{stats['data_points']} data points analyzed."
        else:
            return f"I've prepared a visualization showing {parameters[0]} data for {locations[0]}."
    
    elif intent == 'anomaly':
        if 'anomalies' in data:
            anomaly_count = data['anomalies']['count']
            return f"I found {anomaly_count} temperature anomalies in the data. " \
                   f"These unusual values are highlighted in the visualization."
        else:
            return "No significant anomalies detected in the current dataset."
    
    elif intent == 'trend':
        if 'trend_analysis' in data:
            trend = data['trend_analysis']
            return f"The temperature trend is {trend['trend_description']} " \
                   f"with {trend['confidence']} confidence."
        else:
            return "I've analyzed the temporal trends in your data."
    
    elif intent == 'summarize':
        if 'summary' in data:
            summary = data['summary']
            temp_stats = summary.get('temperature', {})
            return f"Summary: Temperature ranges from {temp_stats.get('min', 0):.1f}°C to " \
                   f"{temp_stats.get('max', 0):.1f}°C with a mean of {temp_stats.get('mean', 0):.1f}°C."
        else:
            return "Here's a comprehensive analysis of the ocean data."
    
    return "I've processed your request and prepared the analysis."

async def save_query_to_db(db, message: ChatMessage, result: Dict):
    """Save the query and results to the database"""
    try:
        query_doc = {
            'message': message.message,
            'timestamp': message.timestamp,
            'user_id': message.user_id or 'anonymous',
            'intent': result['intent'],
            'entities': result['entities'],
            'has_visualizations': len(result['visualizations']) > 0
        }
        await db.queries.insert_one(query_doc)
    except Exception as e:
        logger.error(f"Error saving query to database: {e}")