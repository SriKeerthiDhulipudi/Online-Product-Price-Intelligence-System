import json
import redis
import logging
from typing import Optional, Any

logger = logging.getLogger(__name__)

# Initialize Redis Connection
try:
    # Uses Service Name 'redis' from docker-compose, or localhost string
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    logger.info("Successfully connected to Redis Check.")
    REDIS_AVAILABLE = True
except Exception as e:
    logger.warning(f"Redis is not available: {e}. Falling back to un-cached API calls.")
    REDIS_AVAILABLE = False

CACHE_EXPIRY = 3600 # 1 hour cache duration

def set_cache(key: str, value: Any) -> bool:
    """Stores a value in Redis with a 1-hour expiration."""
    if not REDIS_AVAILABLE:
        return False
    try:
        redis_client.setex(key, CACHE_EXPIRY, json.dumps(value))
        return True
    except Exception as e:
        logger.error(f"Error setting cache: {e}")
        return False

def get_cache(key: str) -> Optional[Any]:
    """Retrieves a value from Redis if it exists."""
    if not REDIS_AVAILABLE:
        return None
    try:
        data = redis_client.get(key)
        if data:
            logger.info(f"Cache HIT for key: {key}")
            return json.loads(data)
        logger.info(f"Cache MISS for key: {key}")
        return None
    except Exception as e:
        logger.error(f"Error getting cache: {e}")
        return None
