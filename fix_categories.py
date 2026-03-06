import psycopg2

MOMO_DB = "dbname=momo_db user=momo_user password=momo_pass_2026 host=localhost"

GUIDES = ['FELICIA_FAQ.md', 'FELICIA_FEATURES_GUIDE.md', 'FELICIA_CAPABILITIES.md', 'FELICIA_GAMIFICATION.md', 'FELICIA_PERSONALITY_MODES.md']

def fix():
    conn = psycopg2.connect(MOMO_DB)
    cur = conn.cursor()
    
    print("Adjusting Document Categories...")
    for g in GUIDES:
        cur.execute("UPDATE documents SET category = 'GUIDE' WHERE title = %s", (g,))
    
    conn.commit()
    print("Categories updated. SOP vs KB split active.")
    cur.close(); conn.close()

if __name__ == "__main__":
    fix()
