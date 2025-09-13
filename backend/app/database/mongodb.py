from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    database = None

mongodb = MongoDB()

async def get_database():
    return mongodb.database

async def connect_to_mongo():
    try:
        mongodb.client = AsyncIOMotorClient(settings.mongodb_url)
        mongodb.database = mongodb.client[settings.mongodb_db_name]
        
        # Test the connection
        await mongodb.client.admin.command('ismaster')
        logger.info("Connected to MongoDB successfully")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    if mongodb.client:
        mongodb.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    try:
        # Create indexes for better performance
        await mongodb.database.queries.create_index("timestamp")
        await mongodb.database.queries.create_index("user_id")
        await mongodb.database.dashboards.create_index("user_id")
        await mongodb.database.users.create_index("email", unique=True)
        await mongodb.database.users.create_index("is_active")
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")