import sqlite3
from contextlib import closing

DB_PATH = 'products.db'

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def refactor_database():
    with closing(get_db_connection()) as conn:
        cursor = conn.cursor()
        
        # 1. Create departments table
        print("Creating departments table...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')
        
        # 2. Extract unique department names from products
        print("Extracting unique departments...")
        cursor.execute('SELECT DISTINCT department FROM products WHERE department IS NOT NULL')
        departments = [row[0] for row in cursor.fetchall()]
        
        # 3. Populate departments table
        print("Populating departments table...")
        for dept in departments:
            cursor.execute('INSERT INTO departments (name) VALUES (?)', (dept,))
        
        # 4. Add department_id column to products
        print("Adding department_id column to products...")
        cursor.execute('ALTER TABLE products ADD COLUMN department_id INTEGER')
        
        # 5. Update products with department IDs
        print("Updating products with department IDs...")
        cursor.execute('''
            UPDATE products 
            SET department_id = (
                SELECT id 
                FROM departments 
                WHERE departments.name = products.department
            )
        ''')
        
        # 6. Create foreign key constraint
        print("Creating temporary table for restructuring...")
        cursor.execute('''
            CREATE TABLE products_new (
                id INTEGER PRIMARY KEY,
                cost REAL,
                category TEXT,
                name TEXT,
                brand TEXT,
                retail_price REAL,
                department_id INTEGER,
                sku TEXT,
                distribution_center_id INTEGER,
                FOREIGN KEY (department_id) REFERENCES departments(id)
            )
        ''')
        
        # 7. Copy data to new table
        print("Copying data to new table...")
        cursor.execute('''
            INSERT INTO products_new 
            SELECT id, cost, category, name, brand, retail_price, department_id, sku, distribution_center_id
            FROM products
        ''')
        
        # 8. Drop old table and rename new one
        print("Finalizing table restructure...")
        cursor.execute('DROP TABLE products')
        cursor.execute('ALTER TABLE products_new RENAME TO products')
        
        # Commit all changes
        conn.commit()
        print("Database refactoring completed successfully!")

if __name__ == '__main__':
    refactor_database()
