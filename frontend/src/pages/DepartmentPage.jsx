import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const DepartmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchDepartmentProducts();
    // When the component mounts or ID changes, scroll to the top.
    window.scrollTo(0, 0);
  }, [id, page]);

  const fetchDepartmentProducts = async () => {
    try {
      setLoading(true);
      // We only need one API call, since this endpoint returns both department and product data.
      const response = await fetch(`http://localhost:3000/api/departments/${id}/products?page=${page}&per_page=15`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const data = await response.json();

      // Correctly set the department and products from the nested API response
      setDepartment(data.department);
      setProducts(data.products);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show a full-page loader only on the initial page load.
  if (loading && page === 1) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchDepartmentProducts}
            className="mt-6 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <nav className="mb-8">
          <Link 
            to="/departments"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Departments
          </Link>
        </nav>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">{department?.name}</h1>
          <p className="text-lg text-gray-600 mt-2">{department?.product_count} Products Found</p>
        </header>

        {/* Display message if no products are found */}
        {products.length === 0 && !loading && (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold text-gray-700">No Products Found</h2>
                <p className="text-gray-500 mt-2">There are no products in this department yet.</p>
            </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link 
              to={`/product/${product.id}`}
              key={product.id}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="p-6 flex-grow">
                <h2 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors truncate">{product.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{product.description || "No description available."}</p>
              </div>
              <div className="p-6 bg-gray-50 flex justify-between items-center">
                <p className="text-blue-600 font-bold text-xl">${product.retail_price}</p>
                <span className="text-sm text-gray-500 font-medium">{product.brand}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Hide pagination if there are no products or only one page */}
        {products.length > 0 && (
            <div className="mt-12 flex justify-center items-center gap-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Previous
                </button>

                <span className="text-sm text-gray-700">Page {page}</span>

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={products.length < 15 || loading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentPage;