import pandas as pd
import sqlite3
import sys

csv_file_path = 'data\products.csv'
db_file_path = 'products.db'
table_name = 'products'

conn = None
try:
    print(f"Reading CSV from '{csv_file_path}'...")
    df = pd.read_csv(csv_file_path)
    
    print(f"Connecting to database '{db_file_path}'...")
    conn = sqlite3.connect(db_file_path)
    
    print(f"Writing data to table '{table_name}'...")
    df.to_sql(table_name, conn, if_exists='replace', index=False)
    print(f"Data loaded. Ready for queries.\n")

    print("--- Enter a SQL query or type 'quit' to exit ---")
    while True:
        query = input("SQL> ")
        if query.strip().lower() == 'quit':
            break
        
        if not query.strip():
            continue

        try:
            result_df = pd.read_sql_query(query, conn)
            if not result_df.empty:
                print(result_df.to_string())
            else:
                print("Query executed successfully, but returned no results.")
        except Exception as e:
            print(f"Query Error: {e}", file=sys.stderr)

except FileNotFoundError:
    print(f"ERROR: The file '{csv_file_path}' was not found.", file=sys.stderr)
except Exception as e:
    print(f"An error occurred: {e}", file=sys.stderr)
finally:
    if conn:
        conn.close()
        print("\nDatabase connection closed. Goodbye!")