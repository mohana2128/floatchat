from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from app.services.data_service import data_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/floats")
async def get_float_data(
    lat_min: Optional[float] = Query(None, description="Minimum latitude"),
    lat_max: Optional[float] = Query(None, description="Maximum latitude"),
    lon_min: Optional[float] = Query(None, description="Minimum longitude"),
    lon_max: Optional[float] = Query(None, description="Maximum longitude"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    parameters: Optional[List[str]] = Query(None, description="Parameters to fetch")
):
    """Get ARGO float data with filtering options"""
    try:
        # Build query parameters
        query_params = {}
        
        if lat_min is not None and lat_max is not None:
            query_params['latitude_range'] = [lat_min, lat_max]
            
        if lon_min is not None and lon_max is not None:
            query_params['longitude_range'] = [lon_min, lon_max]
            
        if start_date and end_date:
            query_params['time_range'] = [start_date, end_date]
            
        if parameters:
            query_params['parameters'] = parameters
        
        # Fetch data
        async with data_service as ds:
            data = await ds.fetch_argo_data(query_params)
            
        return {
            'data': data,
            'query_params': query_params,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching float data: {e}")
        raise HTTPException(status_code=500, detail="Error fetching float data")

@router.get("/analysis/{analysis_type}")
async def get_data_analysis(
    analysis_type: str,
    region: Optional[str] = Query(None, description="Ocean region"),
    parameter: Optional[str] = Query('temperature', description="Parameter to analyze"),
    time_period: Optional[str] = Query('30d', description="Time period")
):
    """Get specific data analysis"""
    try:
        # Validate analysis type
        valid_types = ['trend', 'anomaly', 'summary', 'comparison']
        if analysis_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid analysis type. Must be one of: {valid_types}")
        
        # Build parameters
        params = {
            'region': region or 'global',
            'parameter': parameter,
            'time_period': time_period
        }
        
        # Fetch and analyze data
        async with data_service as ds:
            raw_data = await ds.fetch_argo_data(params)
            analyzed_data = ds.analyze_data(raw_data, analysis_type)
            
        return {
            'analysis_type': analysis_type,
            'parameters': params,
            'results': analyzed_data,
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing data analysis: {e}")
        raise HTTPException(status_code=500, detail="Error performing data analysis")

@router.get("/visualizations/{viz_type}")
async def get_visualization_data(
    viz_type: str,
    region: Optional[str] = Query(None),
    parameter: Optional[str] = Query('temperature'),
    format: Optional[str] = Query('json', description="Output format")
):
    """Get data formatted for specific visualization types"""
    try:
        valid_types = ['time_series', 'depth_profile', 'map', 'heatmap']
        if viz_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid visualization type. Must be one of: {valid_types}")
        
        # Fetch data
        async with data_service as ds:
            data = await ds.fetch_argo_data({
                'region': region,
                'parameter': parameter
            })
            
            # Create visualization
            visualizations = ds.create_visualizations(data, viz_type)
            
        return {
            'visualization_type': viz_type,
            'data': visualizations[0] if visualizations else None,
            'metadata': {
                'region': region,
                'parameter': parameter,
                'generated_at': datetime.utcnow().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating visualization: {e}")
        raise HTTPException(status_code=500, detail="Error generating visualization")

@router.get("/export")
async def export_data(
    format: str = Query('csv', description="Export format (csv, json, netcdf)"),
    region: Optional[str] = Query(None),
    parameters: Optional[List[str]] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Export data in various formats"""
    try:
        if format not in ['csv', 'json', 'netcdf']:
            raise HTTPException(status_code=400, detail="Invalid format. Must be csv, json, or netcdf")
        
        # Fetch data
        async with data_service as ds:
            data = await ds.fetch_argo_data({
                'region': region,
                'parameters': parameters or ['temperature'],
                'start_date': start_date,
                'end_date': end_date
            })
        
        # For this demo, return the data structure
        # In production, this would format and return the actual file
        return {
            'format': format,
            'data': data,
            'export_info': {
                'records': len(data.get('time_series', {}).get('dates', [])),
                'parameters': parameters or ['temperature'],
                'region': region or 'global',
                'generated_at': datetime.utcnow().isoformat()
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting data: {e}")
        raise HTTPException(status_code=500, detail="Error exporting data")