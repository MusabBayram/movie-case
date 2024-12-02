import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Ana sayfa */}
        <Route path="/" element={<HomePage />} />
        {/* Film detay sayfası */}
        <Route path="/details/:id" element={<DetailsPage />} />
      </Routes>
    </Router>
  );
};

export default App;