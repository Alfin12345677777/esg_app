import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCompanyById } from '../services/dataService';
import './NewCompanyDetail.css';

const NewCompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('environmental');

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

  if (loading) {
    return (
      <div className="new-company-detail loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="new-company-detail error">
        <div className="error-content">
          <h2>❌ Error</h2>
          <p>{error || 'Company not found'}</p>
        </div>
      </div>
    );
  }

  const renderEnvironmentalSection = () => (
    <div className="formula-section environmental-section">
      <h2>🌿 Environmental (E) Scoring Formula</h2>
      
      <div className="formula-card">
        <h3>Carbon Score Formula</h3>
        <div className="formula-display">
          <code>Carbon Score = Total CO₂ Emissions / Revenue</code>
        </div>
        <p className="formula-description">
          Measures the company's carbon efficiency relative to its revenue generation.
        </p>
      </div>

      <div className="formula-card">
        <h3>Energy Score Formula</h3>
        <div className="formula-display">
          <code>Energy Score = Total Energy Consumption / Revenue or Production</code>
        </div>
        <p className="formula-description">
          Evaluates energy efficiency in relation to business output.
        </p>
      </div>

      <div className="formula-card final-score">
        <h3>Final E Score</h3>
        <div className="formula-display">
          <code>E Score = 0.5 × Carbon Score + 0.5 × Energy Score</code>
        </div>
        <div className="current-score">
          <span className="score-label">Current E Score:</span>
          <span className="score-value environmental">{company.e_score || 'N/A'}</span>
        </div>
      </div>
    </div>
  );

  const renderSocialSection = () => (
    <div className="formula-section social-section">
      <h2>👥 Social (S) Scoring Formula</h2>
      
      <div className="scoring-category">
        <h3>1. Workplace Safety & Incidents (0–3.0)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+1.4:</span>
            <span className="description">No fatal incidents in last 24 mo (verified via government/news reports)</span>
          </div>
          <div className="scoring-item">
            <span className="points">+1.0:</span>
            <span className="description">Safety certifications or awards (e.g., MOEL "Safe Workplace")</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.4:</span>
            <span className="description">Regular safety training (≥8h per worker/year disclosed)</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.2:</span>
            <span className="description">ISO 45001 or equivalent safety management certification</span>
          </div>
        </div>
      </div>

      <div className="scoring-category">
        <h3>2. Labor Practices & Compliance (0–2.3)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+1.0:</span>
            <span className="description">No reported illegal labor violations (e.g., wage theft, illegal subcontracting)</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.8:</span>
            <span className="description">Public labor/welfare policy disclosed (fair wages, working hours compliance)</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.5:</span>
            <span className="description">Worker grievance or union engagement system reported</span>
          </div>
        </div>
      </div>

      <div className="scoring-category">
        <h3>3. Worker Well-Being & Inclusion (0–2.0)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+0.7:</span>
            <span className="description">Health & wellness programs (heat stress prevention, medical checks)</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.7:</span>
            <span className="description">Diversity & inclusion in workforce (women, minority hiring initiatives)</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.6:</span>
            <span className="description">Employee retention/satisfaction metrics reported</span>
          </div>
        </div>
      </div>

      <div className="scoring-category">
        <h3>4. Community Impact & Engagement (0–2.7)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+1.2:</span>
            <span className="description">No substantiated community complaints (noise, dust, traffic) in past 12 mo</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.9:</span>
            <span className="description">Community engagement programs (town halls, liaison officers) disclosed</span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.6:</span>
            <span className="description">CSR/local development projects linked to construction operations</span>
          </div>
        </div>
      </div>

      <div className="total-score-card">
        <div className="current-score">
          <span className="score-label">Current S Score (Total):</span>
          <span className="score-value social">{company.s_score || 'N/A'}</span>
          <span className="max-score">/ 10.0</span>
        </div>
      </div>
    </div>
  );

  const renderGovernanceSection = () => (
    <div className="formula-section governance-section">
      <h2>🏛️ Governance (G) Scoring Formula (Out of 10)</h2>
      
      <div className="scoring-category">
        <h3>1. Board Structure (0–2.5)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+1.11:</span>
            <span className="description">Majority independent board <span className="from">(from 1.0)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.56:</span>
            <span className="description">Separate CEO and Board Chair <span className="from">(from 0.5)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.28:</span>
            <span className="description">ESG or sustainability committee exists <span className="from">(from 0.25)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.28:</span>
            <span className="description">Gender/diversity targets disclosed <span className="from">(from 0.25)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.28:</span>
            <span className="description">Regular board evaluations & term limits <span className="from">(from 0.25)</span></span>
          </div>
        </div>
      </div>

      <div className="scoring-category">
        <h3>2. Audit & Controls (0–2.0)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+1.11:</span>
            <span className="description">Independent audit committee <span className="from">(from 1.0)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.56:</span>
            <span className="description">No recent audit failures or restatements <span className="from">(from 0.5)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.33:</span>
            <span className="description">Active risk management disclosures <span className="from">(from 0.3)</span></span>
          </div>
        </div>
      </div>

      <div className="scoring-category">
        <h3>3. Shareholder Rights (0–2.0)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+0.89:</span>
            <span className="description">Equal voting rights (1 share = 1 vote) <span className="from">(from 0.8)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.56:</span>
            <span className="description">No poison pills or strong anti-takeover provisions <span className="from">(from 0.5)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.56:</span>
            <span className="description">Formal shareholder engagement policies <span className="from">(from 0.5)</span></span>
          </div>
        </div>
      </div>

      <div className="scoring-category">
        <h3>4. Executive Compensation (0–1.5)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+0.67:</span>
            <span className="description">Pay linked to performance (KPIs clearly disclosed) <span className="from">(from 0.6)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.44:</span>
            <span className="description">Transparent disclosures in annual report <span className="from">(from 0.4)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.39:</span>
            <span className="description">Say-on-pay voting or shareholder feedback mechanisms <span className="from">(from 0.35)</span></span>
          </div>
        </div>
      </div>

      <div className="scoring-category">
        <h3>5. Transparency & Ethics (0–2.0)</h3>
        <div className="scoring-items">
          <div className="scoring-item">
            <span className="points">+0.67:</span>
            <span className="description">ESG disclosures aligned with global frameworks (TCFD, GRI) <span className="from">(from 0.6)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.67:</span>
            <span className="description">Anti-corruption or compliance programs in place <span className="from">(from 0.6)</span></span>
          </div>
          <div className="scoring-item">
            <span className="points">+0.67:</span>
            <span className="description">Internal whistleblower / ethics hotline + FTC/KCGS clean record <span className="from">(from 0.6)</span></span>
          </div>
        </div>
      </div>

      <div className="total-score-card">
        <div className="current-score">
          <span className="score-label">Current G Score (Total):</span>
          <span className="score-value governance">{company.g_score || 'N/A'}</span>
          <span className="max-score">/ 10.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="new-company-detail">
      {/* Header */}
      <header className="company-header">
        <div className="company-info">
          <h1>{company.companyName}</h1>
          <div className="company-meta">
            <span className="category">{company.category || 'N/A'}</span>
            <span className="overall-score">
              Overall Score: <span className="score-value">{company.overallScore || 'N/A'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="formula-navigation">
        <button 
          className={`nav-tab environmental ${activeTab === 'environmental' ? 'active' : ''}`}
          onClick={() => setActiveTab('environmental')}
        >
          🌿 Environmental
        </button>
        <button 
          className={`nav-tab social ${activeTab === 'social' ? 'active' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          👥 Social
        </button>
        <button 
          className={`nav-tab governance ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          🏛️ Governance
        </button>
      </div>

      {/* Formula Content */}
      <div className="formula-content">
        {activeTab === 'environmental' && renderEnvironmentalSection()}
        {activeTab === 'social' && renderSocialSection()}
        {activeTab === 'governance' && renderGovernanceSection()}
      </div>

      {/* ESG Summary */}
      <div className="esg-summary">
        <h2>ESG Score Summary</h2>
        <div className="score-grid">
          <div className="score-item environmental">
            <span className="score-letter">E</span>
            <span className="score-number">{company.e_score || 'N/A'}</span>
          </div>
          <div className="score-item social">
            <span className="score-letter">S</span>
            <span className="score-number">{company.s_score || 'N/A'}</span>
          </div>
          <div className="score-item governance">
            <span className="score-letter">G</span>
            <span className="score-number">{company.g_score || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCompanyDetail;