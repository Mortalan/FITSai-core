import psycopg2
import json
from datetime import datetime

LEGACY_DB = "dbname=felicia user=felicia_user password=QHEENKM1QiAVl6+NAUDjPpsT2TFr9KRsZidqU63Tz2A= host=localhost"
MOMO_DB = "dbname=momo_db user=momo_user password=momo_pass_2026 host=localhost"

def migrate():
    leg_conn = psycopg2.connect(LEGACY_DB)
    momo_conn = psycopg2.connect(MOMO_DB)
    leg_cur = leg_conn.cursor()
    momo_cur = momo_conn.cursor()

    print("Starting Safe History ETL (Definitive Recovery)...")
    momo_cur.execute("TRUNCATE conversations CASCADE")

    # 1. Recover every single legacy row as a thread to ensure NO missing data
    leg_cur.execute("SELECT user_id, project_id, conversation_title, question, answer, created_at FROM conversations")
    
    count = 0
    for row in leg_cur.fetchall():
        user_id, project_id, title, q, a, created = row
        msgs = [{"role": "user", "content": q}, {"role": "assistant", "content": a}]
        
        safe_title = title if title else (q[:40] if q else "Legacy History")
        
        momo_cur.execute("""
            INSERT INTO conversations (user_id, project_id, title, messages, created_at, updated_at) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, project_id, safe_title, json.dumps(msgs), created, created))
        count += 1

    # 2. Optimization: Add index for user history lookup
    print("Optimizing DB Performance...")
    momo_cur.execute("CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)")

    momo_conn.commit()
    print(f"Migration Complete. {count} threads recovered and optimized.")

    leg_cur.close(); momo_cur.close(); leg_conn.close(); momo_conn.close()

if __name__ == "__main__":
    migrate()
