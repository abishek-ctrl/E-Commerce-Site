import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS # Import the CORS library

# --- Configuration ---
DB_PATH = 'products.db'
TABLE_NAME = 'products'

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

# --- Enable CORS ---
CORS(app)

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error:
        return None

# --- Department Endpoints ---
@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Gets a list of all departments with their product counts."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Could not connect to the database.'}), 500

    try:
        cursor = conn.cursor()
        departments = cursor.execute('''
            SELECT 
                d.id,
                d.name,
                COUNT(p.id) as product_count
            FROM departments d
            LEFT JOIN products p ON d.id = p.department_id
            GROUP BY d.id, d.name
            ORDER BY d.name
        ''').fetchall()
        
        department_list = {
            "departments": [dict(row) for row in departments]
        }
        return jsonify(department_list)
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database query failed: {e}'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/departments/<int:department_id>', methods=['GET'])
def get_department(department_id):
    """Gets details of a specific department."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Could not connect to the database.'}), 500

    try:
        cursor = conn.cursor()
        department = cursor.execute('''
            SELECT 
                d.id,
                d.name,
                COUNT(p.id) as product_count
            FROM departments d
            LEFT JOIN products p ON d.id = p.department_id
            WHERE d.id = ?
            GROUP BY d.id, d.name
        ''', (department_id,)).fetchone()

        if department is None:
            return jsonify({'error': 'Department not found'}), 404
        
        return jsonify(dict(department))
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database query failed: {e}'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/departments/<int:department_id>/products', methods=['GET'])
def get_department_products(department_id):
    """Gets all products in a specific department."""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        if page < 1 or per_page < 1:
            raise ValueError
    except ValueError:
        return jsonify({'error': 'Invalid page or per_page parameters. Must be positive integers.'}), 400

    offset = (page - 1) * per_page
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Could not connect to the database.'}), 500

    try:
        cursor = conn.cursor()
        
        # First check if department exists
        department = cursor.execute(
            'SELECT id, name FROM departments WHERE id = ?', 
            (department_id,)
        ).fetchone()
        
        if department is None:
            return jsonify({'error': 'Department not found'}), 404

        # Get products for the department
        products = cursor.execute('''
            SELECT 
                p.id,
                p.name,
                p.cost,
                p.category,
                p.brand,
                p.retail_price,
                p.sku,
                p.distribution_center_id,
                d.name as department_name
            FROM products p
            JOIN departments d ON p.department_id = d.id
            WHERE p.department_id = ?
            LIMIT ? OFFSET ?
        ''', (department_id, per_page, offset)).fetchall()
        
        # Get total count for pagination
        total_count = cursor.execute(
            'SELECT COUNT(*) FROM products WHERE department_id = ?',
            (department_id,)
        ).fetchone()[0]

        response = {
            "department": dict(department),
            "products": [dict(row) for row in products],
            "pagination": {
                "total": total_count,
                "page": page,
                "per_page": per_page,
                "total_pages": (total_count + per_page - 1) // per_page
            }
        }
        
        return jsonify(response)
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database query failed: {e}'}), 500
    finally:
        if conn:
            conn.close()

# --- Product Endpoints ---
@app.route('/api/products', methods=['GET'])
def get_products():
    """Gets a paginated list of all products."""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        if page < 1 or per_page < 1:
            raise ValueError
    except ValueError:
        return jsonify({'error': 'Invalid page or per_page parameters. Must be positive integers.'}), 400

    offset = (page - 1) * per_page
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Could not connect to the database.'}), 500

    try:
        cursor = conn.cursor()
        products = cursor.execute('''
            SELECT 
                p.id,
                p.cost,
                p.category,
                p.name,
                p.brand,
                p.retail_price,
                d.name as department_name,
                p.sku,
                p.distribution_center_id
            FROM products p 
            LEFT JOIN departments d ON p.department_id = d.id 
            LIMIT ? OFFSET ?
        ''', (per_page, offset)).fetchall()
        product_list = [dict(row) for row in products]
        return jsonify(product_list)
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database query failed: {e}'}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Gets a single product by its unique ID."""
    conn = get_db_connection()
    if conn is None:
        return jsonify({'error': 'Could not connect to the database.'}), 500

    try:
        cursor = conn.cursor()
        product = cursor.execute('''
            SELECT 
                p.id,
                p.cost,
                p.category,
                p.name,
                p.brand,
                p.retail_price,
                d.name as department_name,
                p.sku,
                p.distribution_center_id
            FROM products p 
            LEFT JOIN departments d ON p.department_id = d.id 
            WHERE p.id = ?
        ''', (product_id,)).fetchone()

        if product is None:
            return jsonify({'error': 'Product not found'}), 404
        else:
            return jsonify(dict(product))
    except sqlite3.OperationalError as e:
        return jsonify({'error': f'Database query failed: {e}'}), 500
    finally:
        if conn:
            conn.close()

# --- Main Execution ---
if __name__ == '__main__':
    app.run(debug=True, port=3000)