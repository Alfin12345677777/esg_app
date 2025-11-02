import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilteredCompanies } from '../services/dataService';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score-desc');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    hasViolations: undefined
  });

  // Load companies on component mount and when filters change
  useEffect(() => {
    loadCompanies();
  }, [searchTerm, selectedCategory, sortBy, filters]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const filterParams = {
        search: searchTerm,
        category: selectedCategory,
        sortBy: sortBy,
        ...filters
      };
      
      const results = await getFilteredCompanies(filterParams);
      setCompanies(results);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleAdvancedFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === '' ? undefined : value
    }));
  };

  const handleViewCompany = (company) => {
    navigate(`/company/${company.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('score-desc');
    setFilters({
      minScore: '',
      maxScore: '',
      hasViolations: undefined
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#f44336';
  };

  return (
    <div className="search-page">
      <header className="page-header">
        <h1>Search Companies</h1>
        <p>Find construction companies by name, category, and ESG performance</p>
      </header>
      
      <div className="search-container">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-input-group">
            <input 
              type="text" 
              placeholder="Search company name..." 
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          </div>
          
          <select className="sort-select" value={sortBy} onChange={handleSortChange}>
            <option value="score-desc">Highest Score First</option>
            <option value="score-asc">Lowest Score First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="violations-asc">Fewest Violations</option>
            <option value="violations-desc">Most Violations</option>
          </select>
        </div>
        
        {/* Category Filters */}
        <div className="filters-section">
          <div className="filter-header">
            <h3>Category</h3>
            <button 
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
            </button>
          </div>
          
          <div className="filter-buttons">
            {['all', 'Residential', 'Commercial', 'Infrastructure'].map(category => (
              <button 
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
          
          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="advanced-filters">
              <div className="score-range">
                <label>Score Range:</label>
                <input 
                  type="number" 
                  placeholder="Min" 
                  min="0" 
                  max="100"
                  value={filters.minScore}
                  onChange={(e) => handleAdvancedFilterChange('minScore', e.target.value)}
                />
                <span>to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  min="0" 
                  max="100"
                  value={filters.maxScore}
                  onChange={(e) => handleAdvancedFilterChange('maxScore', e.target.value)}
                />
              </div>
              
              <div className="violations-filter">
                <label>SAPA Violations:</label>
                <select 
                  value={filters.hasViolations === undefined ? '' : filters.hasViolations}
                  onChange={(e) => handleAdvancedFilterChange('hasViolations', 
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )}
                >
                  <option value="">All Companies</option>
                  <option value="false">No Violations</option>
                  <option value="true">Has Violations</option>
                </select>
              </div>
              
              <button className="clear-filters" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Results Section */}
        <div className="results-section">
          <div className="results-header">
            <h3>Search Results ({companies.length} companies found)</h3>
          </div>
          
          {loading ? (
            <div className="loading">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="no-results">
              <p>No companies found matching your criteria.</p>
              <button onClick={clearFilters}>Clear filters to see all companies</button>
            </div>
          ) : (
            <div className="companies-grid">
              {companies.map((company) => (
                <div key={company.id} className="company-card">
                  <div className="card-header">
                    <h4>{company.companyName}</h4>
                    <div 
                      className="score-badge"
                      style={{ backgroundColor: getScoreColor(company.overallScore) }}
                    >
                      {company.overallScore}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <div className="esg-scores">
                      <div className="score-item">
                        <span className="score-label">E</span>
                        <span className="score-value">{company.e_score}</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">S</span>
                        <span className="score-value">{company.s_score}</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">G</span>
                        <span className="score-value">{company.g_score}</span>
                      </div>
                    </div>
                    
                    <div className="card-meta">
                      <span className="category">{company.category || 'General'}</span>
                      {company.sapaViolations > 0 && (
                        <span className="violations">⚠️ {company.sapaViolations} violations</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewCompany(company)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;