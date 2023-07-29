import secrets
import string
from pymongo import MongoClient
from dotenv import dotenv_values
# Load the environment variables from .env file
def generate_license_key(length=16):
    characters = string.ascii_letters + string.digits
    license_key = ''.join(secrets.choice(characters) for _ in range(length))
    return license_key
if __name__ == "__main__":
    env_vars = dotenv_values()

    # Connect to MongoDB Atlas
    DB_URL = env_vars.get('DB_URL')
    DB_NAME = env_vars.get('DB_NAME')
    client = MongoClient(DB_URL)
    db = client[DB_NAME]
    collection = db["license_keys"]

    while True:
        # Generate a random license key and check if unique
        license_key = ""
        while True:
            license_key = generate_license_key()
            typ = 'light v1'
            query = {'license_key' : license_key}
            result = collection.find_one(query)
            if result is None:
                break
        # Store the license key in MongoDB
        data = {"license_key": license_key,"device_id": "", "type" : typ, "valid" : True}
        result = collection.insert_one(data)
        print(f"License key : {license_key}") 
        print("License key stored with document ID:", result.inserted_id)
        choice = input("Generate another key? y/n").lower();
        if choice != "y":
            break
        
