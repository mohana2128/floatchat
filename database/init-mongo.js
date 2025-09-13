// MongoDB initialization script for FloatChat

// Switch to floatchat database
db = db.getSiblingDB('floatchat');

// Create collections and indexes

// Users collection
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });

// Queries collection for storing chat interactions
db.createCollection('queries');
db.queries.createIndex({ "timestamp": 1 });
db.queries.createIndex({ "user_id": 1 });
db.queries.createIndex({ "intent": 1 });
db.queries.createIndex({ "user_id": 1, "timestamp": -1 });

// Saved queries collection
db.createCollection('saved_queries');
db.saved_queries.createIndex({ "user_id": 1 });
db.saved_queries.createIndex({ "saved_at": -1 });

// Dashboards collection
db.createCollection('dashboards');
db.dashboards.createIndex({ "user_id": 1 });
db.dashboards.createIndex({ "created_at": -1 });

// Ocean data cache collection
db.createCollection('ocean_data_cache');
db.ocean_data_cache.createIndex({ "region": 1, "parameter": 1, "timestamp": -1 });
db.ocean_data_cache.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });

// Analytics collection
db.createCollection('analytics');
db.analytics.createIndex({ "date": 1 });
db.analytics.createIndex({ "metric_type": 1, "date": -1 });

// Insert sample data
db.users.insertOne({
    email: "demo@floatchat.com",
    name: "Demo User",
    created_at: new Date(),
    preferences: {
        default_region: "north_atlantic",
        favorite_parameters: ["temperature", "salinity"]
    }
});

// Insert sample queries
db.queries.insertMany([
    {
        message: "Show me temperature data for the North Atlantic",
        timestamp: new Date(),
        user_id: "demo@floatchat.com",
        intent: "plot",
        entities: {
            parameters: ["temperature"],
            locations: ["north atlantic"]
        },
        has_visualizations: true
    },
    {
        message: "What's the salinity trend in the Mediterranean?",
        timestamp: new Date(Date.now() - 3600000),
        user_id: "demo@floatchat.com",
        intent: "trend",
        entities: {
            parameters: ["salinity"],
            locations: ["mediterranean"]
        },
        has_visualizations: true
    },
    {
        message: "Show current data for the Gulf Stream",
        timestamp: new Date(Date.now() - 7200000),
        user_id: "demo@floatchat.com",
        intent: "plot",
        entities: {
            parameters: ["current"],
            locations: ["gulf stream"]
        },
        has_visualizations: false
    }
]);

// Insert sample dashboard
db.dashboards.insertOne({
    user_id: "demo@floatchat.com",
    name: "Ocean Temperature Monitoring",
    config: {
        widgets: [
            {
                type: "time_series",
                parameter: "temperature",
                region: "north_atlantic"
            },
            {
                type: "map",
                parameter: "temperature",
                region: "global"
            }
        ],
        layout: "grid",
        refresh_interval: 300
    },
    created_at: new Date(),
    updated_at: new Date()
});

// Insert sample analytics data
const now = new Date();
const dates = [];
for (let i = 0; i < 30; i++) {
    dates.push(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
}

db.analytics.insertMany(
    dates.map((date, index) => ({
        date: date,
        metric_type: "daily_queries",
        value: Math.floor(Math.random() * 50) + 10,
        metadata: {
            unique_users: Math.floor(Math.random() * 20) + 5,
            popular_intent: ["plot", "trend", "summary"][index % 3]
        }
    }))
);

print("MongoDB initialization completed successfully!");
print("Created collections: users, queries, saved_queries, dashboards, ocean_data_cache, analytics");
print("Created indexes for optimized querying");
print("Inserted sample data for demonstration");