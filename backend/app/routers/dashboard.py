from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.database.mongodb import get_database
from datetime import datetime, timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_dashboard_data(db=Depends(get_database)):
    """Get dashboard statistics and recent activity"""
    try:
        # Get query statistics
        total_queries = await db.queries.count_documents({})
        
        # Get recent queries
        recent_queries_cursor = db.queries.find({}).sort("timestamp", -1).limit(10)
        recent_queries = await recent_queries_cursor.to_list(length=10)
        
        # Calculate time-based statistics
        now = datetime.utcnow()
        last_week = now - timedelta(days=7)
        
        queries_this_week = await db.queries.count_documents({
            'timestamp': {'$gte': last_week}
        })
        
        # Mock statistics for demonstration
        dashboard_data = {
            'stats': {
                'total_queries': total_queries,
                'queries_this_week': queries_this_week,
                'active_floats': 3847,
                'avg_temperature': 18.2,
                'data_points': 2100000,
                'trend': 1.2
            },
            'recent_queries': [
                {
                    'message': query.get('message', 'Unknown query'),
                    'timestamp': query.get('timestamp', now).isoformat(),
                    'intent': query.get('intent', 'query')
                }
                for query in recent_queries
            ],
            'popular_parameters': [
                {'name': 'Temperature', 'count': 125},
                {'name': 'Salinity', 'count': 89},
                {'name': 'Depth Profile', 'count': 67},
                {'name': 'Currents', 'count': 45}
            ],
            'popular_regions': [
                {'name': 'North Atlantic', 'count': 87},
                {'name': 'Pacific Ocean', 'count': 65},
                {'name': 'Mediterranean', 'count': 43},
                {'name': 'Arctic Ocean', 'count': 23}
            ]
        }
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {e}")
        raise HTTPException(status_code=500, detail="Error loading dashboard data")

@router.post("/save-query")
async def save_query(query_data: dict, db=Depends(get_database)):
    """Save a query for later reference"""
    try:
        query_doc = {
            **query_data,
            'saved_at': datetime.utcnow()
        }
        result = await db.saved_queries.insert_one(query_doc)
        return {"id": str(result.inserted_id), "message": "Query saved successfully"}
        
    except Exception as e:
        logger.error(f"Error saving query: {e}")
        raise HTTPException(status_code=500, detail="Error saving query")

@router.get("/saved-queries")
async def get_saved_queries(user_id: str = "anonymous", db=Depends(get_database)):
    """Get user's saved queries"""
    try:
        cursor = db.saved_queries.find({'user_id': user_id}).sort("saved_at", -1)
        saved_queries = await cursor.to_list(length=50)
        
        return {
            'queries': [
                {
                    'id': str(query['_id']),
                    'query': query.get('query', ''),
                    'timestamp': query.get('saved_at', datetime.utcnow()).isoformat()
                }
                for query in saved_queries
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching saved queries: {e}")
        raise HTTPException(status_code=500, detail="Error loading saved queries")

@router.get("/analytics")
async def get_analytics(db=Depends(get_database)):
    """Get analytics data for the dashboard"""
    try:
        # Query analytics from the database
        pipeline = [
            {
                '$group': {
                    '_id': '$intent',
                    'count': {'$sum': 1}
                }
            }
        ]
        
        intent_stats_cursor = db.queries.aggregate(pipeline)
        intent_stats = await intent_stats_cursor.to_list(length=None)
        
        # Time-based query analytics
        time_pipeline = [
            {
                '$match': {
                    'timestamp': {
                        '$gte': datetime.utcnow() - timedelta(days=30)
                    }
                }
            },
            {
                '$group': {
                    '_id': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': '$timestamp'
                        }
                    },
                    'count': {'$sum': 1}
                }
            },
            {
                '$sort': {'_id': 1}
            }
        ]
        
        time_stats_cursor = db.queries.aggregate(time_pipeline)
        time_stats = await time_stats_cursor.to_list(length=None)
        
        return {
            'intent_distribution': intent_stats,
            'query_timeline': time_stats,
            'total_users': await db.queries.distinct('user_id'),
            'most_active_hours': list(range(9, 17))  # Mock data
        }
        
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Error loading analytics")