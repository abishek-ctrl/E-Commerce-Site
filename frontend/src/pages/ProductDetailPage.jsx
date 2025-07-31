import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">{product.name}</h1>
            <p className="text-gray-500 mb-6">Category: {product.category}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">Description</h2>
                  <p className="text-gray-600 leading-relaxed mt-3">{product.description || "No description available."}</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <p className="text-lg font-semibold text-blue-800">Price</p>
                    <p className="text-4xl text-blue-600 font-bold my-2">${product.retail_price}</p>
                    <p className="text-sm text-gray-500">Free shipping on orders over $50</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Product Details</h2>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand</span>
                    <span className="font-medium text-gray-800">{product.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department</span>
                    <span className="font-medium text-gray-800">{product.department_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU</span>
                    <span className="font-mono text-sm text-gray-800 bg-gray-200 px-2 py-1 rounded">{product.sku}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
