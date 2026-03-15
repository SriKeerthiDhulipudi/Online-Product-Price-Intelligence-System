import sqlite3

def inspect_db():
    conn = sqlite3.connect('backend/prices.db')
    cursor = conn.cursor()
    
    print("Table: search_history")
    cursor.execute("PRAGMA table_info(search_history)")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
        
    print("\nTable: notifications")
    cursor.execute("PRAGMA table_info(notifications)")
    columns = cursor.fetchall()
    for col in columns:
        print(col)
    
    conn.close()

if __name__ == "__main__":
    inspect_db()
