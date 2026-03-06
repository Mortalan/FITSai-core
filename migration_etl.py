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

    print("Syncing Missing Monthly Champions...")
    leg_cur.execute("SELECT id, user_id, month, year, xp_earned, character_class, character_level, rewards_granted, created_at FROM monthly_champions")
    for row in leg_cur.fetchall():
        data = list(row)
        data[7] = json.dumps(data[7])
        momo_cur.execute("""
            INSERT INTO monthly_champions (id, user_id, month, year, xp_earned, character_class, character_level, rewards_granted, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING""", data)

    momo_conn.commit()
    print("Final Sync Complete.")
    leg_cur.close(); momo_cur.close(); leg_conn.close(); momo_conn.close()

if __name__ == "__main__":
    migrate()
