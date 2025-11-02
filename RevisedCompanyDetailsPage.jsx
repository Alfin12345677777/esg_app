import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCompanyById } from '../services/dataService';
import './RevisedCompanyDetailsPage.css';

const RevisedCompanyDetailsPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMetrics, setExpandedMetrics] = useState(new Set());

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const companyData = await getCompanyById(id);
        
        if (!companyData) {
          throw new Error('Company not found');
        }
        
        setCompany(companyData);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id]);

  const toggleMetricDescription = (metricKey) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metricKey)) {
      newExpanded.delete(metricKey);
    } else {
      newExpanded.add(metricKey);
    }
    setExpandedMetrics(newExpanded);
  };

  const getScoreColor = (score, maxScore = 10) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'moderate';
    return 'poor';
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return 'N/A';
    return typeof score === 'number' ? score.toFixed(1) : score;
  };

  if (loading) {
    return (
      <div className="revised-company-details loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="revised-company-details error">
        <div className="error-content">
          <h2>❌ Error</h2>
          <p>{error || 'Company not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="revised-company-details">
      {/* Header Section */}
      <header className="company-header">
        <div className="company-info">
          <h1>{company.companyName}</h1>
          <div className="company-meta">
            <span className="category">{company.category || 'N/A'}</span>
            <span className="overall-score">
              Overall Score: <span className={getScoreColor(company.overallScore)}>{formatScore(company.overallScore)}</span>
            </span>
          </div>
        </div>
      </header>

      {/* ESG Scores Overview */}
      <section className="esg-scores-overview">
        <h2>ESG Scores Overview</h2>
        <div className="scores-grid">
          {/* Environmental Score */}
          <div className="score-card environmental">
            <div className="score-header">
              <h3>🌿 Environmental</h3>
              <div className="score-values">
                <div className="main-score">
                  <span className="label">E Score:</span>
                  <span className={`value ${getScoreColor(company.e_score)}`}>
                    {formatScore(company.e_score)}
                  </span>
                </div>
                {company.e_total_score !== undefined && (
                  <div className="total-score">
                    <span className="label">Total:</span>
                    <span className="value">{formatScore(company.e_total_score)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill environmental" 
                style={{ width: `${Math.min((company.e_score / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Governance Score */}
          <div className="score-card governance">
            <div className="score-header">
              <h3>🏛️ Governance</h3>
              <div className="score-values">
                <div className="main-score">
                  <span className="label">G Score:</span>
                  <span className={`value ${getScoreColor(company.g_score)}`}>
                    {formatScore(company.g_score)}
                  </span>
                </div>
                {company.g_total_score !== undefined && (
                  <div className="total-score">
                    <span className="label">Total:</span>
                    <span className="value">{formatScore(company.g_total_score)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill governance" 
                style={{ width: `${Math.min((company.g_score / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Social Score */}
          <div className="score-card social">
            <div className="score-header">
              <h3>👥 Social</h3>
              <div className="score-values">
                <div className="main-score">
                  <span className="label">S Score:</span>
                  <span className={`value ${getScoreColor(company.s_score)}`}>
                    {formatScore(company.s_score)}
                  </span>
                </div>
                {company.s_total_score !== undefined && (
                  <div className="total-score">
                    <span className="label">Total:</span>
                    <span className="value">{formatScore(company.s_total_score)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="score-bar">
              <div 
                className="score-fill social" 
                style={{ width: `${Math.min((company.s_score / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Metrics */}
      <section className="detailed-metrics">
        <h2>Detailed Metrics</h2>
        
        {/* Environmental Metrics */}
        {company.detailedMetrics?.environmental?.length > 0 && (
          <div className="metrics-section environmental-metrics">
            <h3>🌿 Environmental Metrics</h3>
            <div className="metrics-list">
              {company.detailedMetrics.environmental.map((metric, index) => (
                <div key={`env-${index}`} className="metric-item">
                  <div className="metric-header" onClick={() => toggleMetricDescription(`env-${index}`)}>
                    <span className="metric-name">{metric.name}</span>
                    <div className="metric-score-container">
                      <span className={`metric-score ${getScoreColor(metric.score)}`}>
                        {formatScore(metric.score)}
                      </span>
                      <span className="expand-icon">
                        {expandedMetrics.has(`env-${index}`) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  {expandedMetrics.has(`env-${index}`) && (
                    <div className="metric-details">
                      {metric.description && (
                        <p className="metric-description">{metric.description}</p>
                      )}
                      {metric.evidence && (
                        <p className="metric-evidence"><strong>Evidence:</strong> {metric.evidence}</p>
                      )}
                      {metric.sourceUrl && (
                        <p className="metric-source">
                          <strong>Source:</strong> 
                          <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {metric.source || metric.sourceUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Governance Metrics */}
        {company.detailedMetrics?.governance?.length > 0 && (
          <div className="metrics-section governance-metrics">
            <h3>🏛️ Governance Metrics</h3>
            <div className="metrics-list">
              {company.detailedMetrics.governance.map((metric, index) => (
                <div key={`gov-${index}`} className="metric-item">
                  <div className="metric-header" onClick={() => toggleMetricDescription(`gov-${index}`)}>
                    <span className="metric-name">{metric.name}</span>
                    <div className="metric-score-container">
                      <span className={`metric-score ${getScoreColor(metric.score)}`}>
                        {formatScore(metric.score)}
                      </span>
                      <span className="expand-icon">
                        {expandedMetrics.has(`gov-${index}`) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  {expandedMetrics.has(`gov-${index}`) && (
                    <div className="metric-details">
                      {metric.description && (
                        <p className="metric-description">{metric.description}</p>
                      )}
                      {metric.evidence && (
                        <p className="metric-evidence"><strong>Evidence:</strong> {metric.evidence}</p>
                      )}
                      {metric.sourceUrl && (
                        <p className="metric-source">
                          <strong>Source:</strong> 
                          <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {metric.source || metric.sourceUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Metrics */}
        {company.detailedMetrics?.social?.length > 0 && (
          <div className="metrics-section social-metrics">
            <h3>👥 Social Metrics</h3>
            <div className="metrics-list">
              {company.detailedMetrics.social.map((metric, index) => (
                <div key={`soc-${index}`} className="metric-item">
                  <div className="metric-header" onClick={() => toggleMetricDescription(`soc-${index}`)}>
                    <span className="metric-name">{metric.name}</span>
                    <div className="metric-score-container">
                      <span className={`metric-score ${getScoreColor(metric.score)}`}>
                        {formatScore(metric.score)}
                      </span>
                      <span className="expand-icon">
                        {expandedMetrics.has(`soc-${index}`) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  {expandedMetrics.has(`soc-${index}`) && (
                    <div className="metric-details">
                      {metric.description && (
                        <p className="metric-description">{metric.description}</p>
                      )}
                      {metric.evidence && (
                        <p className="metric-evidence"><strong>Evidence:</strong> {metric.evidence}</p>
                      )}
                      {metric.sourceUrl && (
                        <p className="metric-source">
                          <strong>Source:</strong> 
                          <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {metric.source || metric.sourceUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Metrics */}
        {company.detailedMetrics?.other?.length > 0 && (
          <div className="metrics-section other-metrics">
            <h3>📊 Other Metrics</h3>
            <div className="metrics-list">
              {company.detailedMetrics.other.map((metric, index) => (
                <div key={`other-${index}`} className="metric-item">
                  <div className="metric-header" onClick={() => toggleMetricDescription(`other-${index}`)}>
                    <span className="metric-name">{metric.name}</span>
                    <div className="metric-score-container">
                      <span className={`metric-score ${getScoreColor(metric.score)}`}>
                        {formatScore(metric.score)}
                      </span>
                      <span className="expand-icon">
                        {expandedMetrics.has(`other-${index}`) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  {expandedMetrics.has(`other-${index}`) && (
                    <div className="metric-details">
                      {metric.description && (
                        <p className="metric-description">{metric.description}</p>
                      )}
                      {metric.evidence && (
                        <p className="metric-evidence"><strong>Evidence:</strong> {metric.evidence}</p>
                      )}
                      {metric.sourceUrl && (
                        <p className="metric-source">
                          <strong>Source:</strong> 
                          <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {metric.source || metric.sourceUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Additional Info */}
      {(company.profit || company.emissions) && (
        <section className="additional-info">
          <h2>Additional Information</h2>
          <div className="info-grid">
            {company.profit && (
              <div className="info-item">
                <span className="info-label">Profit:</span>
                <span className="info-value">{company.profit.toLocaleString()}</span>
              </div>
            )}
            {company.emissions && (
              <div className="info-item">
                <span className="info-label">Emissions:</span>
                <span className="info-value">{company.emissions.toLocaleString()} tons</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default RevisedCompanyDetailsPage;