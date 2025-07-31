import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DepartmentsListPage from './pages/DepartmentsListPage';
import DepartmentPage from './pages/DepartmentPage';

function App() {
  return (
    // This main div sets the global styles for the entire application.
    <div className="bg-gray-50 font-sans antialiased">
      <Router>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/departments" element={<DepartmentsListPage />} />
          <Route path="/departments/:id" element={<DepartmentPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
