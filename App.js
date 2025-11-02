import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import LeaderboardPage from './pages/LeaderboardPage';
import SearchPage from './pages/SearchPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import RevisedCompanyDetailsPage from './pages/RevisedCompanyDetailsPage';
import NewCompanyDetail from './pages/NewCompanyDetail';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<LeaderboardPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/company/:id" element={<NewCompanyDetail />} />
            <Route path="/company-revised/:id" element={<RevisedCompanyDetailsPage />} />
            <Route path="/company-old/:id" element={<CompanyDetailsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
