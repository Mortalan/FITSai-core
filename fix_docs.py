import psycopg2
import os

MOMO_DB = "dbname=momo_db user=momo_user password=momo_pass_2026 host=localhost"

def fix():
    conn = psycopg2.connect(MOMO_DB)
    cur = conn.cursor()
    
    # 1. Clear existing docs to re-import correctly
    cur.execute("TRUNCATE TABLE documents CASCADE")
    
    # 2. Re-import from legacy table with correct categories
    legacy_conn = psycopg2.connect("dbname=felicia user=felicia_user password=QHEENKM1QiAVl6+NAUDjPpsT2TFr9KRsZidqU63Tz2A= host=localhost")
    leg_cur = legacy_conn.cursor()
    
    leg_cur.execute("SELECT id, filename, uploaded_by, department_id, uploaded_at FROM documents")
    for row in leg_cur.fetchall():
        filename = row[1]
        category = 'SOP'
        if any(x in filename.upper() for x in ['FAQ', 'GUIDE', 'CAPABILITIES', 'MODES']):
            category = 'GUIDE'
            
        cur.execute("""
            INSERT INTO documents (id, title, created_by, department_id, category, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (row[0], row[1], row[2], row[3], category, row[4]))
        
    conn.commit()
    print("Documents re-categorized and synced.")
    cur.close(); conn.close(); leg_cur.close(); legacy_conn.close()

if __name__ == "__main__":
    fix()
