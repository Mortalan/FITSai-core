import json
import psycopg2

MOMO_DB = "dbname=momo_db user=momo_user password=momo_pass_2026 host=localhost"
CATALOG_PATH = "/home/felicia/felicia-mvp/felicia-docs/catalog.json"

def ingest():
    conn = psycopg2.connect(MOMO_DB)
    cur = conn.cursor()
    
    cur.execute("TRUNCATE documents CASCADE")
    with open(CATALOG_PATH) as f:
        catalog = json.load(f)
        
    print(f"Ingesting {len(catalog)} documents...")
    for doc in catalog:
        # Determine Category
        cat = "SOP"
        if any(x in doc['title'].upper() for x in ['PLANNER', 'DESIGN', 'SPEC', 'BROCHURE', 'GUIDE', 'MARKETING']):
            cat = "GOD_MODE"
            
        cur.execute("""
            INSERT INTO documents (title, description, category, created_by, created_at)
            VALUES (%s, %s, %s, 1, NOW())
            
        """, (doc['title'], doc['description'], cat))
        
    conn.commit()
    print("Ingestion complete. SOP vs System split active.")
    cur.close(); conn.close()

if __name__ == "__main__":
    ingest()
