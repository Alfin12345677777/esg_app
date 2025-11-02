// import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { getCompanyById, getAllCompanies, getCompanyAllMetrics } from '../services/dataService';
// import { generateScoreExplanation, generatePeerComparison, generateInvestmentRecommendation } from '../services/aiService';
// import PDFDownload from '../components/PDFDownload';
// import './CompanyDetailsPage.css';

// const CompanyDetailsPage = () => {
//   const { id } = useParams();
//   const [company, setCompany] = useState(null);
//   const [rank, setRank] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [industryData, setIndustryData] = useState([]);
  
//   // AI Analysis states
//   const [aiAnalysis, setAiAnalysis] = useState({
//     scoreExplanation: null,
//     peerComparison: null,
//     investmentRecommendation: null
//   });
//   const [aiLoading, setAiLoading] = useState({
//     scoreExplanation: false,
//     peerComparison: false,
//     investmentRecommendation: false
//   });

//   // Read More dropdown states
//   const [expandedMetrics, setExpandedMetrics] = useState(new Set());
//   const [allMetrics, setAllMetrics] = useState([]);

//   // Toggle metric description
//   const toggleMetricDescription = (metricKey) => {
//     const newExpanded = new Set(expandedMetrics);
//     if (newExpanded.has(metricKey)) {
//       newExpanded.delete(metricKey);
//     } else {
//       newExpanded.add(metricKey);
//     }
//     setExpandedMetrics(newExpanded);
//   };

//   // Get metric details from CSV data
//   const getMetricDetails = (metricName) => {
//     if (!allMetrics.length) return null;
    
//     // Try exact match first
//     let metric = allMetrics.find(m => m.name.toLowerCase() === metricName.toLowerCase());
    
//     // Try partial match if exact not found
//     if (!metric) {
//       metric = allMetrics.find(m => 
//         m.name.toLowerCase().includes(metricName.toLowerCase()) ||
//         metricName.toLowerCase().includes(m.name.toLowerCase())
//       );
//     }
    
//     return metric;
//   };

//   // Render metric description with source and evidence
//   const renderMetricDescription = (metricName) => {
//     const metricDetails = getMetricDetails(metricName);
    
//     if (!metricDetails) {
//       return (
//         <div className="metric-description">
//           <p>No detailed source information available for this metric.</p>
//         </div>
//       );
//     }
    
//     return (
//       <div className="metric-description">
//         {metricDetails.evidence && (
//           <div className="evidence-section">
//             <strong>📊 Evidence:</strong>
//             <p>{metricDetails.evidence}</p>
//           </div>
//         )}
        
//         {metricDetails.source && (
//           <div className="source-section">
//             <strong>📝 Source:</strong>
//             <p>
//               {metricDetails.sourceUrl ? (
//                 <a href={metricDetails.sourceUrl} target="_blank" rel="noopener noreferrer">
//                   {metricDetails.source} 🔗
//                 </a>
//               ) : (
//                 metricDetails.source
//               )}
//             </p>
//           </div>
//         )}
        
//         {metricDetails.description && (
//           <div className="description-section">
//             <strong>🔍 Methodology:</strong>
//             <p>{metricDetails.description}</p>
//           </div>
//         )}
        
//         <div className="metric-metadata">
//           <small>Score: {metricDetails.score} | Category: {metricDetails.category}</small>
//         </div>
//       </div>
//     );
//   };

//   useEffect(() => {
//     loadCompanyData();
//   }, [id]);

//   const loadCompanyData = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Load company data and all companies to calculate rank
//       const [companyData, allCompanies] = await Promise.all([
//         getCompanyById(id),
//         getAllCompanies()
//       ]);

//       if (!companyData) {
//         setError('Company not found');
//         return;
//       }

//       setCompany(companyData);
//       setIndustryData(allCompanies);
      
//       // Load detailed metrics
//       const metrics = await getCompanyAllMetrics(id);
//       setAllMetrics(metrics || []);
      
//       // Calculate ranking
//       const companyRank = allCompanies.findIndex(c => c.id === id) + 1;
//       setRank(companyRank);
      
//     } catch (err) {
//       console.error('Error loading company data:', err);
//       setError('Failed to load company data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // AI Analysis Functions
//   const handleScoreExplanation = async () => {
//     if (aiAnalysis.scoreExplanation) {
//       // Already have analysis, clear it
//       setAiAnalysis(prev => ({ ...prev, scoreExplanation: null }));
//       return;
//     }

//     setAiLoading(prev => ({ ...prev, scoreExplanation: true }));
//     try {
//       const result = await generateScoreExplanation(company);
//       setAiAnalysis(prev => ({ ...prev, scoreExplanation: result }));
//     } catch (error) {
//       console.error('Error generating score explanation:', error);
//     } finally {
//       setAiLoading(prev => ({ ...prev, scoreExplanation: false }));
//     }
//   };

//   const handlePeerComparison = async () => {
//     if (aiAnalysis.peerComparison) {
//       setAiAnalysis(prev => ({ ...prev, peerComparison: null }));
//       return;
//     }

//     setAiLoading(prev => ({ ...prev, peerComparison: true }));
//     try {
//       const result = await generatePeerComparison(company, industryData);
//       setAiAnalysis(prev => ({ ...prev, peerComparison: result }));
//     } catch (error) {
//       console.error('Error generating peer comparison:', error);
//     } finally {
//       setAiLoading(prev => ({ ...prev, peerComparison: false }));
//     }
//   };

//   const handleInvestmentRecommendation = async () => {
//     if (aiAnalysis.investmentRecommendation) {
//       setAiAnalysis(prev => ({ ...prev, investmentRecommendation: null }));
//       return;
//     }

//     setAiLoading(prev => ({ ...prev, investmentRecommendation: true }));
//     try {
//       const result = await generateInvestmentRecommendation(company, industryData);
//       setAiAnalysis(prev => ({ ...prev, investmentRecommendation: result }));
//     } catch (error) {
//       console.error('Error generating investment recommendation:', error);
//     } finally {
//       setAiLoading(prev => ({ ...prev, investmentRecommendation: false }));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="company-details-page">
//         <div className="loading">Loading company details...</div>
//       </div>
//     );
//   }

//   if (error || !company) {
//     return (
//       <div className="company-details-page">
//         <div className="error">
//           {error || 'Company not found. Please go back to the leaderboard.'}
//         </div>
//       </div>
//     );
//   }

//   const getScoreColor = (score) => {
//     if (score >= 8.0) return '#4CAF50'; // green
//     if (score >= 6.0) return '#FF9800'; // orange
//     return '#f44336'; // red
//   };

//   return (
//     <div className="company-details-page">
//       <header className="company-header">
//         <div className="company-info">
//           <h1>{company.companyName}</h1>
//           <div className="overall-score">
//             <div 
//               className="score-circle"
//               style={{ backgroundColor: getScoreColor(company.overallScore) }}
//             >
//               {company.overallScore}
//             </div>
//             <div className="score-label">
//               <h2>Overall ESG Score</h2>
//               <p>Industry Ranking: #{rank}</p>
//             </div>
//           </div>
//         </div>
        
//         {company.sapaViolations > 0 && (
//           <div className="violations-alert">
//             <span className="alert-icon">⚠️</span>
//             <div>
//               <strong>SAPA Violations: {company.sapaViolations}</strong>
//               <p>Safety and Prevention Act violations recorded</p>
//             </div>
//           </div>
//         )}
//       </header>

//       <div className="esg-breakdown">
//         <h2>ESG Score Breakdown</h2>
//         <div className="score-grid">
//           <div className="score-card environmental">
//             <div className="score-header">
//               <h3>Environmental</h3>
//               <div className="score-value">{company.e_score}</div>
//             </div>
//             <div className="score-bar">
//               <div 
//                 className="score-fill" 
//                 style={{ 
//                   width: `${(company.e_score / 10) * 100}%`,
//                   backgroundColor: getScoreColor(company.e_score)
//                 }}
//               ></div>
//             </div>
//             <p>Climate impact, resource management, waste reduction</p>
//           </div>

//           <div className="score-card social">
//             <div className="score-header">
//               <h3>Social</h3>
//               <div className="score-value">{company.s_score}</div>
//             </div>
//             <div className="score-bar">
//               <div 
//                 className="score-fill" 
//                 style={{ 
//                   width: `${(company.s_score / 10) * 100}%`,
//                   backgroundColor: getScoreColor(company.s_score)
//                 }}
//               ></div>
//             </div>
//             <p>Worker safety, community impact, labor practices</p>
//           </div>

//           <div className="score-card governance">
//             <div className="score-header">
//               <h3>Governance</h3>
//               <div className="score-value">{company.g_score}</div>
//             </div>
//             <div className="score-bar">
//               <div 
//                 className="score-fill" 
//                 style={{ 
//                   width: `${(company.g_score / 10) * 100}%`,
//                   backgroundColor: getScoreColor(company.g_score)
//                 }}
//               ></div>
//             </div>
//             <p>Board structure, ethics, transparency, compliance</p>
//           </div>
//         </div>
//       </div>

//       {/* Financial Metrics Section - New from CSV */}
//       {company.allMetrics && company.allMetrics.length > 0 && (
//         <div className="financial-metrics-section">
//           <h2>💰 Key Performance Indicators</h2>
//           <div className="financial-grid">
//             {company.allMetrics.filter(m => m.name === 'Profit').map((metric, index) => (
//               <div key={index} className="financial-card">
//                 <h3>Annual Profit</h3>
//                 <div className="financial-value">
//                   ${(metric.score / 1000000).toFixed(1)}M
//                 </div>
//               </div>
//             ))}
//             {company.allMetrics.filter(m => m.name.includes('emissions')).map((metric, index) => (
//               <div key={index} className="financial-card">
//                 <h3>Emissions</h3>
//                 <div className="financial-value">
//                   {metric.score.toLocaleString()} Tons CO₂
//                 </div>
//               </div>
//             ))}
//             {company.allMetrics.filter(m => m.name.includes('score')).slice(0, 2).map((metric, index) => (
//               <div key={index} className="financial-card">
//                 <h3>{metric.name}</h3>
//                 <div className="financial-value">
//                   {metric.score}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Detailed Metrics Section - New CSV Structure */}
//       {(company.detailedMetrics && Object.keys(company.detailedMetrics).length > 0) && (
//         <div className="detailed-metrics-section">
//           <h2>📊 Detailed ESG Metrics</h2>
          
//           <div className="metrics-tabs">
//             {company.detailedMetrics.environmental?.length > 0 && (
//               <div className="metrics-category environmental">
//                 <h3>🌱 Environmental Metrics</h3>
//                 <div className="metrics-list">
//                   {company.detailedMetrics.environmental.map((metric, index) => (
//                     <div key={index} className="metric-item">
//                       <div className="metric-header">
//                         <span className="metric-name">{metric.name}</span>
//                         <span className="metric-score">{metric.score}</span>
//                       </div>
//                       {metric.evidence && (
//                         <div className="metric-evidence">
//                           <strong>Evidence:</strong> {metric.evidence}
//                         </div>
//                       )}
//                       {metric.source && (
//                         <div className="metric-source">
//                           <strong>Source:</strong>
//                           {metric.sourceUrl ? (
//                             <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
//                               {metric.source} 🔗
//                             </a>
//                           ) : (
//                             <span>{metric.source}</span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {company.detailedMetrics.social?.length > 0 && (
//               <div className="metrics-category social">
//                 <h3>👥 Social Metrics</h3>
//                 <div className="metrics-list">
//                   {company.detailedMetrics.social.map((metric, index) => (
//                     <div key={index} className="metric-item">
//                       <div className="metric-header">
//                         <span className="metric-name">{metric.name}</span>
//                         <span className="metric-score">{metric.score}</span>
//                       </div>
//                       {metric.evidence && (
//                         <div className="metric-evidence">
//                           <strong>Evidence:</strong> {metric.evidence}
//                         </div>
//                       )}
//                       {metric.source && (
//                         <div className="metric-source">
//                           <strong>Source:</strong>
//                           {metric.sourceUrl ? (
//                             <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
//                               {metric.source} 🔗
//                             </a>
//                           ) : (
//                             <span>{metric.source}</span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {company.detailedMetrics.governance?.length > 0 && (
//               <div className="metrics-category governance">
//                 <h3>🏛️ Governance Metrics</h3>
//                 <div className="metrics-list">
//                   {company.detailedMetrics.governance.map((metric, index) => (
//                     <div key={index} className="metric-item">
//                       <div className="metric-header">
//                         <span className="metric-name">{metric.name}</span>
//                         <span className="metric-score">{metric.score}</span>
//                       </div>
//                       {metric.evidence && (
//                         <div className="metric-evidence">
//                           <strong>Evidence:</strong> {metric.evidence}
//                         </div>
//                       )}
//                       {metric.source && (
//                         <div className="metric-source">
//                           <strong>Source:</strong>
//                           {metric.sourceUrl ? (
//                             <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
//                               {metric.source} 🔗
//                             </a>
//                           ) : (
//                             <span>{metric.source}</span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* All Metrics Section - Searchable Table */}
//       {company.allMetrics && company.allMetrics.length > 0 && (
//         <div className="all-metrics-section">
//           <h2>📋 All Metrics Data</h2>
//           <div className="metrics-table">
//             <div className="table-header">
//               <span>Metric Name</span>
//               <span>Score</span>
//               <span>Category</span>
//               <span>Source</span>
//             </div>
//             {company.allMetrics.map((metric, index) => (
//               <div key={index} className="table-row">
//                 <span className="metric-name">{metric.name}</span>
//                 <span className="metric-score">{metric.score}</span>
//                 <span className={`metric-category ${metric.category?.toLowerCase()}`}>
//                   {metric.category}
//                 </span>
//                 <span className="metric-source">
//                   {metric.sourceUrl ? (
//                     <a href={metric.sourceUrl} target="_blank" rel="noopener noreferrer">
//                       View Source 🔗
//                     </a>
//                   ) : (
//                     metric.source || 'N/A'
//                   )}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Legacy ESG Formula Section - Only show if old structure exists */}
//       {false && (company.environmental || company.social || company.governance) && (
//         <div className="esg-formula-section">
//           <h2>📋 ESG Scoring Formula (Legacy)</h2>
          
//           <div className="formula-grid">
//             <div className="formula-card environmental">
//             <div className="formula-header">
//               <h3>Environmental (E) Formula</h3>
//               <div className="formula-equations">
//                 <p><strong>Carbon Score</strong> = Total CO₂ Emissions / Revenue</p>
//                 <p><strong>Energy Score</strong> = Total Energy Consumption / Revenue</p>
//                 <p><strong>E Score</strong> = 0.5 × Carbon Score + 0.5 × Energy Score</p>
//               </div>
//             </div>
//             {company.environmental && (
//               <div className="score-breakdown">
//                 <div className="breakdown-subitem">
//                   <div className="metric-content">
//                     <span>• Carbon Score:</span>
//                     <div className="metric-score-actions">
//                       <span>{company.environmental.carbonScore.score || company.environmental.carbonScore}/5.0</span>
//                       <button 
//                         className="read-more-btn"
//                         onClick={() => toggleMetricDescription('environmental-carbonScore')}
//                       >
//                         {expandedMetrics.has('environmental-carbonScore') ? '−' : '+'}
//                       </button>
//                     </div>
//                   </div>
//                   {expandedMetrics.has('environmental-carbonScore') && renderMetricDescription('carbon')}
//                 </div>
//                 <div className="breakdown-subitem">
//                   <div className="metric-content">
//                     <span>• Energy Score:</span>
//                     <div className="metric-score-actions">
//                       <span>{company.environmental.energyScore.score || company.environmental.energyScore}/5.0</span>
//                       <button 
//                         className="read-more-btn"
//                         onClick={() => toggleMetricDescription('environmental-energyScore')}
//                       >
//                         {expandedMetrics.has('environmental-energyScore') ? '−' : '+'}
//                       </button>
//                     </div>
//                   </div>
//                   {expandedMetrics.has('environmental-energyScore') && renderMetricDescription('energy')}
//                 </div>
//                 <div className="breakdown-total">
//                   <span>Total E Score:</span>
//                   <span>{company.environmental.total}/10.0</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="formula-card social">
//             <div className="formula-header">
//               <h3>Social (S) Formula</h3>
//               <div className="formula-equations">
//                 <p><strong>1. Workplace Safety & Incidents (0–3.0)</strong></p>
//                 <ul>
//                   <li>+1.4: No fatal incidents in last 24 mo</li>
//                   <li>+1.0: Safety certifications or awards</li>
//                   <li>+0.4: Regular safety training (≥8h per worker/year)</li>
//                   <li>+0.2: ISO 45001 or equivalent certification</li>
//                 </ul>
                
//                 <p><strong>2. Labor Practices & Compliance (0–2.3)</strong></p>
//                 <ul>
//                   <li>+1.0: No reported illegal labor violations</li>
//                   <li>+0.8: Public labor/welfare policy disclosed</li>
//                   <li>+0.5: Worker grievance or union engagement system</li>
//                 </ul>
                
//                 <p><strong>3. Worker Well-Being & Inclusion (0–2.0)</strong></p>
//                 <ul>
//                   <li>+0.7: Health & wellness programs</li>
//                   <li>+0.7: Diversity & inclusion in workforce</li>
//                   <li>+0.6: Employee retention/satisfaction metrics</li>
//                 </ul>
                
//                 <p><strong>4. Community Impact & Engagement (0–2.7)</strong></p>
//                 <ul>
//                   <li>+1.2: No substantiated community complaints in past 12 mo</li>
//                   <li>+0.9: Community engagement programs disclosed</li>
//                   <li>+0.6: CSR/local development projects</li>
//                 </ul>
//               </div>
//             </div>
//             {company.social && (
//               <div className="score-breakdown">
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Workplace Safety & Incidents:</span>
//                     <span>{company.social.workplaceSafety.total}/3.0</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• No fatal incidents (24mo):</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.workplaceSafety.noFatalIncidents.score || company.social.workplaceSafety.noFatalIncidents}/1.4</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-noFatalIncidents')}
//                         >
//                           {expandedMetrics.has('social-noFatalIncidents') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-noFatalIncidents') && renderMetricDescription('no fatal incidents')}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Safety certifications:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.workplaceSafety.safetyCertifications.score || company.social.workplaceSafety.safetyCertifications}/1.0</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-safetyCertifications')}
//                         >
//                           {expandedMetrics.has('social-safetyCertifications') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-safetyCertifications') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Safety training (≥8h/year):</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.workplaceSafety.safetyTraining.score || company.social.workplaceSafety.safetyTraining}/0.4</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-safetyTraining')}
//                         >
//                           {expandedMetrics.has('social-safetyTraining') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-safetyTraining') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• ISO 45001 certification:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.workplaceSafety.iso45001Certification}/0.2</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-iso45001')}
//                         >
//                           {expandedMetrics.has('social-iso45001') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-iso45001') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Labor Practices & Compliance:</span>
//                     <span>{company.social.laborPractices.total}/2.3</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• No labor violations:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.laborPractices.noLaborViolations}/1.0</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-noLaborViolations')}
//                         >
//                           {expandedMetrics.has('social-noLaborViolations') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-noLaborViolations') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Labor/welfare policy:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.laborPractices.laborWelfarePolicy.score || company.social.laborPractices.laborWelfarePolicy}/0.8</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-laborWelfarePolicy')}
//                         >
//                           {expandedMetrics.has('social-laborWelfarePolicy') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-laborWelfarePolicy') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Grievance system:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.laborPractices.grievanceSystem.score || company.social.laborPractices.grievanceSystem}/0.5</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-grievanceSystem')}
//                         >
//                           {expandedMetrics.has('social-grievanceSystem') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-grievanceSystem') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Worker Well-Being & Inclusion:</span>
//                     <span>{company.social.workerWellbeing.total}/2.0</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Health & wellness programs:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.workerWellbeing.healthWellnessPrograms.score || company.social.workerWellbeing.healthWellnessPrograms}/0.7</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-healthWellness')}
//                         >
//                           {expandedMetrics.has('social-healthWellness') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-healthWellness') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Diversity & inclusion:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.workerWellbeing.diversityInclusion.score || company.social.workerWellbeing.diversityInclusion}/0.7</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-diversityInclusion')}
//                         >
//                           {expandedMetrics.has('social-diversityInclusion') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-diversityInclusion') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Employee retention metrics:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.workerWellbeing.employeeRetention.score || company.social.workerWellbeing.employeeRetention}/0.6</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-employeeRetention')}
//                         >
//                           {expandedMetrics.has('social-employeeRetention') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-employeeRetention') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Community Impact & Engagement:</span>
//                     <span>{company.social.communityImpact.total}/2.7</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• No community complaints (12mo):</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.communityImpact.noCommunityComplaints.score || company.social.communityImpact.noCommunityComplaints}/1.2</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-noCommunityComplaints')}
//                         >
//                           {expandedMetrics.has('social-noCommunityComplaints') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-noCommunityComplaints') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Community engagement programs:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.communityImpact.communityEngagement.score || company.social.communityImpact.communityEngagement}/0.9</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-communityEngagement')}
//                         >
//                           {expandedMetrics.has('social-communityEngagement') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-communityEngagement') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• CSR/local development projects:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.social.communityImpact.csrProjects.score || company.social.communityImpact.csrProjects}/0.6</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('social-csrProjects')}
//                         >
//                           {expandedMetrics.has('social-csrProjects') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('social-csrProjects') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-total">
//                   <span>Total S Score:</span>
//                   <span>{company.social.total}/10.0</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="formula-card governance">
//             <div className="formula-header">
//               <h3>Governance (G) Formula</h3>
//               <div className="formula-equations">
//                 <p><strong>1. Board Structure (0–2.25)</strong></p>
//                 <ul>
//                   <li>+1.0: Majority independent board</li>
//                   <li>+0.5: Separate CEO and Board Chair</li>
//                   <li>+0.25: ESG or sustainability committee exists</li>
//                   <li>+0.25: Gender/diversity targets disclosed</li>
//                   <li>+0.25: Regular board evaluations & term limits</li>
//                 </ul>
                
//                 <p><strong>2. Audit & Controls (0–1.8)</strong></p>
//                 <ul>
//                   <li>+1.0: Independent audit committee</li>
//                   <li>+0.5: No recent audit failures or restatements</li>
//                   <li>+0.3: Active risk management disclosures</li>
//                 </ul>
                
//                 <p><strong>3. Shareholder Rights (0–1.8)</strong></p>
//                 <ul>
//                   <li>+0.8: Equal voting rights (1 share = 1 vote)</li>
//                   <li>+0.5: No poison pills or strong anti-takeover provisions</li>
//                   <li>+0.5: Formal shareholder engagement policies</li>
//                 </ul>
                
//                 <p><strong>4. Executive Compensation (0–1.35)</strong></p>
//                 <ul>
//                   <li>+0.6: Pay linked to performance (KPIs clearly disclosed)</li>
//                   <li>+0.4: Transparent disclosures in annual report</li>
//                   <li>+0.35: Say-on-pay voting or shareholder feedback mechanisms</li>
//                 </ul>
                
//                 <p><strong>5. Transparency & Ethics (0–1.8)</strong></p>
//                 <ul>
//                   <li>+0.6: ESG disclosures aligned with global frameworks</li>
//                   <li>+0.6: Anti-corruption or compliance programs in place</li>
//                   <li>+0.6: Internal whistleblower / ethics hotline + clean record</li>
//                 </ul>
//               </div>
//             </div>
//             {company.governance && (
//               <div className="score-breakdown">
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Board Structure:</span>
//                     <span>{company.governance.boardStructure.total}/2.25</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Majority independent board:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.boardStructure.independentBoard.score || company.governance.boardStructure.independentBoard}/1.0</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-independentBoard')}
//                         >
//                           {expandedMetrics.has('governance-independentBoard') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-independentBoard') && renderMetricDescription('majority independent board')}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Separate CEO and Board Chair:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.boardStructure.separateCeoChair.score || company.governance.boardStructure.separateCeoChair}/0.5</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-separateCeoChair')}
//                         >
//                           {expandedMetrics.has('governance-separateCeoChair') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-separateCeoChair') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• ESG/sustainability committee:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.boardStructure.esgCommittee.score || company.governance.boardStructure.esgCommittee}/0.25</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-esgCommittee')}
//                         >
//                           {expandedMetrics.has('governance-esgCommittee') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-esgCommittee') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Gender/diversity targets:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.boardStructure.diversityTargets.score || company.governance.boardStructure.diversityTargets}/0.25</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-diversityTargets')}
//                         >
//                           {expandedMetrics.has('governance-diversityTargets') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-diversityTargets') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Board evaluations & term limits:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.boardStructure.boardEvaluations.score || company.governance.boardStructure.boardEvaluations}/0.25</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-boardEvaluations')}
//                         >
//                           {expandedMetrics.has('governance-boardEvaluations') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-boardEvaluations') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Audit & Controls:</span>
//                     <span>{company.governance.auditControls.total}/1.8</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Independent audit committee:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.auditControls.independentAudit.score || company.governance.auditControls.independentAudit}/1.0</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-independentAudit')}
//                         >
//                           {expandedMetrics.has('governance-independentAudit') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-independentAudit') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• No audit failures/restatements:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.auditControls.noAuditFailures.score || company.governance.auditControls.noAuditFailures}/0.5</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-noAuditFailures')}
//                         >
//                           {expandedMetrics.has('governance-noAuditFailures') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-noAuditFailures') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Risk management disclosures:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.auditControls.riskManagement.score || company.governance.auditControls.riskManagement}/0.3</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-riskManagement')}
//                         >
//                           {expandedMetrics.has('governance-riskManagement') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-riskManagement') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Shareholder Rights:</span>
//                     <span>{company.governance.shareholderRights.total}/1.8</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Equal voting rights (1 share = 1 vote):</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.shareholderRights.equalVotingRights.score || company.governance.shareholderRights.equalVotingRights}/0.8</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-equalVotingRights')}
//                         >
//                           {expandedMetrics.has('governance-equalVotingRights') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-equalVotingRights') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• No poison pills/anti-takeover:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.shareholderRights.noPoisonPills.score || company.governance.shareholderRights.noPoisonPills}/0.5</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-noPoisonPills')}
//                         >
//                           {expandedMetrics.has('governance-noPoisonPills') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-noPoisonPills') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Shareholder engagement policies:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.shareholderRights.shareholderEngagement.score || company.governance.shareholderRights.shareholderEngagement}/0.5</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-shareholderEngagement')}
//                         >
//                           {expandedMetrics.has('governance-shareholderEngagement') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-shareholderEngagement') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Executive Compensation:</span>
//                     <span>{company.governance.executiveCompensation.total}/1.35</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Pay linked to performance:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.executiveCompensation.performanceLinkedPay.score || company.governance.executiveCompensation.performanceLinkedPay}/0.6</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-performanceLinkedPay')}
//                         >
//                           {expandedMetrics.has('governance-performanceLinkedPay') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-performanceLinkedPay') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Transparent disclosures:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.executiveCompensation.transparentDisclosures.score || company.governance.executiveCompensation.transparentDisclosures}/0.4</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-transparentDisclosures')}
//                         >
//                           {expandedMetrics.has('governance-transparentDisclosures') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-transparentDisclosures') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Say-on-pay voting:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.executiveCompensation.sayOnPay.score || company.governance.executiveCompensation.sayOnPay}/0.35</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-sayOnPay')}
//                         >
//                           {expandedMetrics.has('governance-sayOnPay') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-sayOnPay') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-category">
//                   <div className="breakdown-item category-header">
//                     <span>Transparency & Ethics:</span>
//                     <span>{company.governance.transparencyEthics.total}/1.8</span>
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• ESG disclosures (global frameworks):</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.transparencyEthics.esgDisclosures.score || company.governance.transparencyEthics.esgDisclosures}/0.6</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-esgDisclosures')}
//                         >
//                           {expandedMetrics.has('governance-esgDisclosures') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-esgDisclosures') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Anti-corruption programs:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.transparencyEthics.antiCorruption.score || company.governance.transparencyEthics.antiCorruption}/0.6</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-antiCorruption')}
//                         >
//                           {expandedMetrics.has('governance-antiCorruption') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-antiCorruption') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                   <div className="breakdown-subitem">
//                     <div className="metric-content">
//                       <span>• Whistleblower hotline + clean record:</span>
//                       <div className="metric-score-actions">
//                         <span>{company.governance.transparencyEthics.whistleblowerHotline.score || company.governance.transparencyEthics.whistleblowerHotline}/0.6</span>
//                         <button 
//                           className="read-more-btn"
//                           onClick={() => toggleMetricDescription('governance-whistleblowerHotline')}
//                         >
//                           {expandedMetrics.has('governance-whistleblowerHotline') ? '−' : '+'}
//                         </button>
//                       </div>
//                     </div>
//                     {expandedMetrics.has('governance-whistleblowerHotline') && (
//                       <div className="metric-description">
//                         <p>Source and detailed explanation will be loaded here from the data source.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="breakdown-total">
//                   <span>Total G Score:</span>
//                   <span>{company.governance.total}/10.0</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {false && (<div className="ai-analysis-section">
//         <h2>🤖 AI Analysis</h2>
//         <div className="analysis-grid">
//           <div className="analysis-card">
//             <div className="analysis-card-header">
//               <div>
//                 <h3>🔍 Score Explanation</h3>
//                 <p>Why does {company.companyName} have this ESG score?</p>
//               </div>
//               <button 
//                 className="analysis-btn"
//                 onClick={handleScoreExplanation}
//                 disabled={aiLoading.scoreExplanation}
//               >
//                 {aiLoading.scoreExplanation ? '⏳ Analyzing...' : 
//                  aiAnalysis.scoreExplanation ? '📝 Hide Analysis' : '🤖 Generate Analysis'}
//               </button>
//             </div>
            
//             {aiAnalysis.scoreExplanation && (
//               <div className="ai-response">
//                 <div className={`response-content ${aiAnalysis.scoreExplanation.success ? 'success' : 'error'}`}>
//                   <p>{aiAnalysis.scoreExplanation.analysis}</p>
//                   {aiAnalysis.scoreExplanation.timestamp && (
//                     <small className="timestamp">
//                       Generated: {new Date(aiAnalysis.scoreExplanation.timestamp).toLocaleString()}
//                     </small>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="analysis-card">
//             <div className="analysis-card-header">
//               <div>
//                 <h3>📊 Peer Comparison</h3>
//                 <p>How does this company compare to industry leaders?</p>
//               </div>
//               <button 
//                 className="analysis-btn"
//                 onClick={handlePeerComparison}
//                 disabled={aiLoading.peerComparison}
//               >
//                 {aiLoading.peerComparison ? '⏳ Analyzing...' : 
//                  aiAnalysis.peerComparison ? '📝 Hide Analysis' : '🤖 Compare with Peers'}
//               </button>
//             </div>
            
//             {aiAnalysis.peerComparison && (
//               <div className="ai-response">
//                 <div className={`response-content ${aiAnalysis.peerComparison.success ? 'success' : 'error'}`}>
//                   <p>{aiAnalysis.peerComparison.analysis}</p>
//                   {aiAnalysis.peerComparison.timestamp && (
//                     <small className="timestamp">
//                       Generated: {new Date(aiAnalysis.peerComparison.timestamp).toLocaleString()}
//                     </small>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="analysis-card">
//             <div className="analysis-card-header">
//               <div>
//                 <h3>💡 Investment Recommendation</h3>
//                 <p>Should investors consider this company based on ESG metrics?</p>
//               </div>
//               <button 
//                 className="analysis-btn"
//                 onClick={handleInvestmentRecommendation}
//                 disabled={aiLoading.investmentRecommendation}
//               >
//                 {aiLoading.investmentRecommendation ? '⏳ Analyzing...' : 
//                  aiAnalysis.investmentRecommendation ? '📝 Hide Analysis' : '🤖 Get Recommendation'}
//               </button>
//             </div>
            
//             {aiAnalysis.investmentRecommendation && (
//               <div className="ai-response">
//                 <div className={`response-content ${aiAnalysis.investmentRecommendation.success ? 'success' : 'error'}`}>
//                   <p>{aiAnalysis.investmentRecommendation.analysis}</p>
//                   {aiAnalysis.investmentRecommendation.timestamp && (
//                     <small className="timestamp">
//                       Generated: {new Date(aiAnalysis.investmentRecommendation.timestamp).toLocaleString()}
//                     </small>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* PDF Download Section */}
//       <PDFDownload 
//         company={company} 
//         analysisData={aiAnalysis}
//       />
//     </div>
//   );
// };

