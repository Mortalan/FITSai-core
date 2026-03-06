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

    print("Starting Comprehensive ETL Migration (Full History)...")

    # 1. Projects
    print("Syncing Projects...")
    leg_cur.execute("SELECT id, title, department_id, created_by, created_at FROM projects")
    for row in leg_cur.fetchall():
        momo_cur.execute("""
            INSERT INTO projects (id, title, department_id, created_by, created_at, updated_at, description) 
            VALUES (%s, %s, %s, %s, %s, %s, 'Legacy project migrated from Felicia') 
            ON CONFLICT (id) DO NOTHING""", (row[0], row[1], row[2], row[3], row[4], row[4]))

    # 2. Project Members
    print("Syncing Project Members...")
    leg_cur.execute("SELECT project_id, user_id, role, joined_at FROM project_members")
    for row in leg_cur.fetchall():
        momo_cur.execute("INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING", row)

    # 3. User Achievements
    print("Syncing Historical Achievements...")
    leg_cur.execute("SELECT user_id, achievement_id, unlocked_at FROM user_achievements")
    for row in leg_cur.fetchall():
        momo_cur.execute("INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING", row)

    # 4. Suggestions
    print("Syncing User Feedback & Suggestions...")
    leg_cur.execute("SELECT id, user_id, description, status, admin_response, created_at FROM suggestions")
    for row in leg_cur.fetchall():
        momo_cur.execute("""
            INSERT INTO suggestions (id, user_id, content, status, admin_response, created_at) 
            VALUES (%s, %s, %s, %s, %s, %s) 
            ON CONFLICT (id) DO NOTHING""", row)

    # 5. Reminders
    print("Syncing Task Reminders...")
    leg_cur.execute("SELECT id, user_id, title, message, remind_at, status, created_at FROM reminders")
    for row in leg_cur.fetchall():
        full_msg = f"{row[2]}: {row[3]}" if row[3] else row[2]
        is_completed = (row[5] == 'completed' or row[5] == 'dismissed')
        momo_cur.execute("""
            INSERT INTO reminders (id, user_id, message, due_at, is_completed, created_at, category) 
            VALUES (%s, %s, %s, %s, %s, %s, 'migrated') 
            ON CONFLICT (id) DO NOTHING""", (row[0], row[1], full_msg, row[4], is_completed, row[6]))

    # 6. API Usage
    print("Syncing Global API Usage history...")
    leg_cur.execute("SELECT id, user_id, model, tokens_input, tokens_output, cost_total, created_at FROM api_usage")
    for row in leg_cur.fetchall():
        momo_cur.execute("""
            INSERT INTO api_usage (id, user_id, model_name, prompt_tokens, completion_tokens, cost, timestamp) 
            VALUES (%s, %s, %s, %s, %s, %s, %s) 
            ON CONFLICT (id) DO NOTHING""", row)

    # 7. Conversations (Aggregating QA Pairs into Momo Sessions)
    print("Syncing 1,200+ Interactions into Momo Chat Sessions...")
    leg_cur.execute("SELECT id, user_id, project_id, conversation_title, question, answer, created_at FROM conversations")
    for row in leg_cur.fetchall():
        # id, user_id, project_id, title, question, answer, created_at
        msgs = [
            {"role": "user", "content": row[4]},
            {"role": "assistant", "content": row[5]}
        ]
        title = row[3] if row[3] else row[4][:40]
        momo_cur.execute("""
            INSERT INTO conversations (id, user_id, project_id, title, messages, created_at, updated_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING
        """, (row[0], row[1], row[2], title, json.dumps(msgs), row[6], row[6]))

    momo_conn.commit()
    print("Full History Sync Complete. Production Void is closed.")

    leg_cur.close(); momo_cur.close()
    leg_conn.close(); momo_conn.close()

if __name__ == "__main__":
    migrate()
