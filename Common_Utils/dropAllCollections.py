from pymongo import MongoClient
from dotenv import dotenv_values

# Get DB secrets
env_vals = dotenv_values()
DB_URL = env_vals.get('DB_URL')
DB_NAME = env_vals.get('DB_NAME')
# Connect to MongoDB
client = MongoClient(DB_URL)
db = client[DB_NAME]

# Get the list of collection names
collection_names = db.list_collection_names()

# Drop each collection
for collection_name in collection_names:
    db[collection_name].drop()

print("All collections dropped.")