import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DepartmentsListPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      // Ensure that we have an array, even if the API response is unexpected.
      setDepartments(data.departments || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            onClick={fetchDepartments}
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
        <header className="text-center mb-12">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-500 transition-colors mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Back to Home
            </Link>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Shop by Department</h1>
          <p className="text-lg text-gray-600 mt-2">Browse our curated departments to find exactly what you need.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((department) => (
            <Link
              to={`/departments/${department.id}`}
              key={department.id}
              className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">{department.name}</h2>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-blue-600 font-medium">{department.product_count} Products</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsListPage;
