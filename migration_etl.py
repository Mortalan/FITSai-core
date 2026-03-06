import psycopg2
import json
from datetime import datetime

# DB Connections
LEGACY_DB = "dbname=felicia user=felicia_user password=QHEENKM1QiAVl6+NAUDjPpsT2TFr9KRsZidqU63Tz2A= host=localhost"
MOMO_DB = "dbname=momo_db user=momo_user password=momo_pass_2026 host=localhost"

def migrate():
    leg_conn = psycopg2.connect(LEGACY_DB)
    momo_conn = psycopg2.connect(MOMO_DB)
    leg_cur = leg_conn.cursor()
    momo_cur = momo_conn.cursor()

    print("Starting ETL Migration (Phase 10)...")

    # 1. Departments
    print("Syncing Departments...")
    leg_cur.execute("SELECT id, name FROM departments")
    for row in leg_cur.fetchall():
        momo_cur.execute("INSERT INTO departments (id, name) VALUES (%s, %s) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name", row)

    # 2. Users (Superset Migration)
    print("Syncing User Identity & RPG State...")
    leg_cur.execute("""
        SELECT id, email, name, hashed_password, department_id, role, 
               xp_total, character_level, character_class, stats, titles, equipped_title,
               login_streak, last_login, special_effects, avatar_customization, 
               unlocked_colors, unlocked_backgrounds, created_at
        FROM users
    """)
    for row in leg_cur.fetchall():
        data = list(row)
        data[5] = True if data[5] == 'admin' else False
        for i in [9, 10, 14, 15, 16, 17]:
            if data[i] is not None: data[i] = json.dumps(data[i])
        
        momo_cur.execute("""
            INSERT INTO users (
                id, email, name, hashed_password, department_id, is_superuser,
                xp_total, character_level, character_class, stats, titles, equipped_title,
                login_streak, last_login, special_effects, avatar_customization, 
                unlocked_colors, unlocked_backgrounds, created_at, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true)
            ON CONFLICT (id) DO UPDATE SET 
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                xp_total = EXCLUDED.xp_total,
                character_level = EXCLUDED.character_level,
                stats = EXCLUDED.stats,
                avatar_customization = EXCLUDED.avatar_customization
        """, data)

    # 3. Documents
    print("Syncing Documentation (SOPs)...")
    leg_cur.execute("SELECT id, filename, uploaded_by, department_id, uploaded_at FROM documents")
    for row in leg_cur.fetchall():
        momo_cur.execute("""
            INSERT INTO documents (id, title, created_by, department_id, category, created_at)
            VALUES (%s, %s, %s, %s, 'SOP', %s)
            ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
        """, row)

    momo_conn.commit()
    print("Migration Success. Production Alignment 100%.")

    leg_cur.close(); momo_cur.close()
    leg_conn.close(); momo_conn.close()

if __name__ == "__main__":
    migrate()
