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

# --- API Endpoints ---
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
        products = cursor.execute(
            f'SELECT * FROM {TABLE_NAME} LIMIT ? OFFSET ?',
            (per_page, offset)
        ).fetchall()
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
        product = cursor.execute(
            f'SELECT * FROM {TABLE_NAME} WHERE id = ?', (product_id,)
        ).fetchone()

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