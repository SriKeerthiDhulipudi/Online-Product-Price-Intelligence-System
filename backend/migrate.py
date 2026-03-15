from database import engine, Base
from models import User, Product, Price, SearchHistory, PriceAlert, Notification

print("Creating all tables in the database...")
Base.metadata.create_all(bind=engine)
print("Done!")
