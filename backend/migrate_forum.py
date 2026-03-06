import sqlite3

# Connect to database
conn = sqlite3.connect('opengov.db')
cursor = conn.cursor()

try:
    # Add sector_id column to forum_posts if it doesn't exist
    cursor.execute("ALTER TABLE forum_posts ADD COLUMN sector_id INTEGER")
    print("Added sector_id column to forum_posts")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("sector_id column already exists")
    else:
        print(f"Error: {e}")

conn.commit()
conn.close()
print("Migration complete!")
