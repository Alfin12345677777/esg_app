import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">
            <h2>GreenDex</h2>
            <span>ESG Construction Analytics</span>
          </Link>
        </div>

        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Leaderboard
          </Link>
          <Link 
            to="/search" 
            className={`nav-link ${isActive('/search') ? 'active' : ''}`}
          >
            Search Companies
          </Link>
        </div>

        <div className="nav-meta">
          <span className="update-info">Last updated: Today</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;