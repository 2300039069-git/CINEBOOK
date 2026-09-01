import psycopg2
import urllib.parse

password = urllib.parse.quote_plus('KancharlaDhanush@2003')

uris = [
    f'postgresql://postgres.jyptmaprxztaxjoapbjs:{password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres',
    f'postgresql://postgres.jyptmaprxztaxjoapbjs:{password}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
    f'postgresql://postgres:{password}@db.jyptmaprxztaxjoapbjs.supabase.co:5432/postgres',
]

connected = False
for uri in uris:
    host_part = uri.split('@')[1]
    print(f"Attempting connection to Supabase host: {host_part}...")
    try:
        conn = psycopg2.connect(uri, connect_timeout=8)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        ver = cur.fetchone()[0]
        print("\n>>> SUCCESSFULLY CONNECTED TO SUPABASE POSTGRESQL! <<<")
        print("Version:", ver)
        
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
        tables = [r[0] for r in cur.fetchall()]
        print("Existing Tables in Supabase public schema:", tables)
        
        conn.close()
        connected = True
        break
    except Exception as e:
        print(f"Error connecting to {host_part}: {e}\n")

if not connected:
    print("Could not connect with tested URIs.")
