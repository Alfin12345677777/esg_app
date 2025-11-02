import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCompanies } from '../services/dataService';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const allCompanies = await getAllCompanies();
      // Add ranking
      const rankedCompanies = allCompanies.map((company, index) => ({
        ...company,
        rank: index + 1
      }));
      setCompanies(rankedCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter companies based on selected filter
  const getFilteredCompanies = () => {
    switch (filter) {
      case 'top10':
        return companies.slice(0, 10);
      case 'top25':
        return companies.slice(0, 25);
      default:
        return companies;
    }
  };

  const sampleCompanies = getFilteredCompanies();

  const getScoreColor = (score) => {
    if (score >= 8.0) return '#4CAF50'; // green
    if (score >= 6.0) return '#FF9800'; // orange
    return '#f44336'; // red
  };

  const getRankBadge = (rank) => {
    const badges = {
      1: '🥇',
      2: '🥈', 
      3: '🥉'
    };
    return badges[rank] || `#${rank}`;
  };

  const handleViewDetails = (company) => {
    navigate(`/company/${company.id}`);
  };

  return (
    <div className="leaderboard-page">
      <header className="page-header">
        <h1>ESG Construction Company Leaderboard</h1>
        <p>Top-performing South Korean construction companies by ESG score</p>
      </header>

      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h2>Company Rankings</h2>
          <div className="filters">
            <select 
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Companies</option>
              <option value="top10">Top 10</option>
              <option value="top25">Top 25</option>
            </select>
          </div>
        </div>

        <div className="leaderboard-table">
          <div className="table-header">
            <div className="col-rank">Rank</div>
            <div className="col-company">Company</div>
            <div className="col-score">ESG Score</div>
            <div className="col-violations">SAPA Violations</div>
            <div className="col-action">Action</div>
          </div>

          {loading ? (
            <div className="loading">Loading companies...</div>
          ) : sampleCompanies.length === 0 ? (
            <div className="no-results">No companies found.</div>
          ) : (
            sampleCompanies.map((company) => (
            <div key={company.id} className="table-row">
              <div className="col-rank">
                <span className="rank-badge">{getRankBadge(company.rank)}</span>
              </div>
              <div className="col-company">
                <div className="company-info">
                  <h3>{company.companyName}</h3>
                  <div className="sub-scores">
                    E: {company.e_score} | S: {company.s_score} | G: {company.g_score}
                  </div>
                </div>
              </div>
              <div className="col-score">
                <div 
                  className="score-badge"
                  style={{ backgroundColor: getScoreColor(company.overallScore) }}
                >
                  {company.overallScore}
                </div>
              </div>
              <div className="col-violations">
                {company.sapaViolations > 0 ? (
                  <span className="violations-badge">
                    ⚠️ {company.sapaViolations}
                  </span>
                ) : (
                  <span className="no-violations">✅ 0</span>
                )}
              </div>
              <div className="col-action">
                <button 
                  className="view-details-btn"
                  onClick={() => handleViewDetails(company)}
                >
                  View Details
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;