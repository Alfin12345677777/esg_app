import React, { useState } from 'react';
import { importJSONData, sampleJSONStructure } from '../utils/dataImporter';
import { importCSVData } from '../utils/csvParser';
import './AdminPage.css';

const AdminPage = () => {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [csvData, setCsvData] = useState('');
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' or 'json'
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setCsvData(content);
        setActiveTab('csv');
      } else if (file.name.endsWith('.json') || file.type === 'application/json') {
        try {
          const data = JSON.parse(content);
          setJsonData(JSON.stringify(data, null, 2));
          setActiveTab('json');
        } catch (error) {
          alert('Invalid JSON file');
        }
      } else {
        alert('Please upload a CSV or JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setCsvData(content);
        setActiveTab('csv');
      } else if (file.name.endsWith('.json') || file.type === 'application/json') {
        try {
          const data = JSON.parse(content);
          setJsonData(JSON.stringify(data, null, 2));
          setActiveTab('json');
        } catch (error) {
          alert('Invalid JSON file');
        }
      } else {
        alert('Please upload a CSV or JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setResult(null);
      
      let importResult;
      
      if (activeTab === 'csv') {
        if (!csvData.trim()) {
          alert('Please upload a CSV file or paste CSV data');
          return;
        }
        importResult = await importCSVData(csvData);
      } else {
        if (!jsonData.trim()) {
          alert('Please upload a JSON file or paste JSON data');
          return;
        }
        
        const data = JSON.parse(jsonData);
        
        if (!Array.isArray(data)) {
          alert('JSON data must be an array of companies');
          return;
        }
        
        importResult = await importJSONData(data);
      }
      
      setResult(importResult);
      
    } catch (error) {
      alert(`Error parsing ${activeTab.toUpperCase()}: ` + error.message);
    } finally {
      setImporting(false);
    }
  };

  const loadSampleData = () => {
    setJsonData(JSON.stringify(sampleJSONStructure, null, 2));
  };

  const generateMockESGData = () => {
    const mockData = `Name,Score,Metric,Score,Description
Samsung Electronics,E,CO2 Emissions,125000,Total CO2 emissions in metric tons for fiscal year 2023
Samsung Electronics,E,Revenue,280000000,Total revenue in thousand USD for fiscal year 2023
Samsung Electronics,E,Energy Consumption,850000,Total energy consumption in MWh for fiscal year 2023
Samsung Electronics,Total E,E score,7.2,Calculated Environmental score based on carbon and energy efficiency
Samsung Electronics,G,Majority independent board,1.11,Board has 8 out of 12 independent directors as of 2023 AGM
Samsung Electronics,G,Separate CEO and Board Chair,0.56,Independent Chairman Kim Jong-hoon separate from CEO Jong-Hee Han
Samsung Electronics,G,ESG committee exists,0.28,Sustainability Management Committee established in 2019
Samsung Electronics,G,Gender diversity targets,0.28,Target of 30% female representation on board by 2025
Samsung Electronics,G,Board evaluations,0.28,Annual board effectiveness evaluations conducted by external consultant
Samsung Electronics,G,Independent audit committee,1.11,Audit Committee consists of 4 independent directors
Samsung Electronics,G,No audit failures,0.56,No material audit failures or restatements in past 3 years
Samsung Electronics,G,Risk management disclosures,0.33,Comprehensive risk management framework disclosed in annual report
Samsung Electronics,G,Equal voting rights,0.89,One share one vote structure maintained across all share classes
Samsung Electronics,G,No poison pills,0.56,No anti-takeover provisions beyond standard Korean corporate law
Samsung Electronics,G,Shareholder engagement,0.56,Regular investor meetings and shareholder communication programs
Samsung Electronics,G,Performance-linked pay,0.67,Executive compensation tied to ESG and financial KPIs
Samsung Electronics,G,Transparent compensation,0.44,Detailed executive compensation disclosure in proxy statement
Samsung Electronics,G,Say-on-pay voting,0.39,Advisory vote on executive compensation at annual shareholder meeting
Samsung Electronics,G,ESG reporting frameworks,0.67,Reports aligned with GRI Standards and TCFD recommendations
Samsung Electronics,G,Anti-corruption programs,0.67,Global compliance program with anti-corruption training and monitoring
Samsung Electronics,G,Whistleblower hotline,0.67,Anonymous reporting system with investigation procedures
Samsung Electronics,Total G score,G score,8.9,Calculated Governance score based on board structure and transparency
Samsung Electronics,S,No fatal incidents,1.4,Zero workplace fatalities reported in past 24 months across all facilities
Samsung Electronics,S,Safety certifications,1.0,ISO 45001 certified facilities and multiple safety awards from KOSHA
Samsung Electronics,S,Safety training,0.4,Average 12 hours annual safety training per employee as disclosed in sustainability report
Samsung Electronics,S,ISO 45001 certification,0.2,Global occupational health and safety management system certification
Samsung Electronics,S,No labor violations,1.0,No substantiated labor violations reported by regulatory bodies
Samsung Electronics,S,Labor welfare policy,0.8,Comprehensive labor policies published covering wages working hours and benefits
Samsung Electronics,S,Grievance system,0.5,Employee grievance system and works council representation in key markets
Samsung Electronics,S,Health wellness programs,0.7,On-site medical facilities and comprehensive employee wellness programs
Samsung Electronics,S,Diversity inclusion,0.7,Women comprise 35% of global workforce with diversity hiring initiatives
Samsung Electronics,S,Employee retention,0.6,Employee satisfaction surveys and retention metrics disclosed annually
Samsung Electronics,S,No community complaints,1.2,No substantiated community complaints regarding noise dust or traffic
Samsung Electronics,S,Community engagement,0.9,Local community advisory panels and regular stakeholder engagement meetings
Samsung Electronics,S,CSR projects,0.6,Samsung Dream Scholarship and other education-focused community investment programs
Samsung Electronics,Total S score,S score,8.0,Calculated Social score based on workplace safety and community impact
Hyundai Engineering,E,CO2 Emissions,95000,Total CO2 emissions in metric tons for fiscal year 2023
Hyundai Engineering,E,Revenue,15000000,Total revenue in thousand USD for fiscal year 2023
Hyundai Engineering,E,Energy Consumption,320000,Total energy consumption in MWh for fiscal year 2023
Hyundai Engineering,Total E,E score,6.1,Calculated Environmental score based on carbon and energy efficiency
Hyundai Engineering,G,Majority independent board,1.11,Board has 6 out of 9 independent directors as of 2023 AGM
Hyundai Engineering,G,Separate CEO and Board Chair,0.0,CEO and Chairman roles combined under single leadership
Hyundai Engineering,G,ESG committee exists,0.28,ESG Risk Management Committee established in 2021
Hyundai Engineering,G,Gender diversity targets,0.0,No specific gender diversity targets disclosed for board composition
Hyundai Engineering,G,Board evaluations,0.28,Annual board self-assessment process conducted internally
Hyundai Engineering,G,Independent audit committee,1.11,Audit Committee fully independent with financial expertise
Hyundai Engineering,G,No audit failures,0.56,Clean audit history with no material restatements
Hyundai Engineering,G,Risk management disclosures,0.33,Enterprise risk management framework documented and disclosed
Hyundai Engineering,G,Equal voting rights,0.89,Standard voting rights structure with no dual-class shares
Hyundai Engineering,G,No poison pills,0.56,No defensive measures beyond regulatory requirements
Hyundai Engineering,G,Shareholder engagement,0.28,Limited shareholder engagement beyond mandatory meetings
Hyundai Engineering,G,Performance-linked pay,0.67,Executive compensation includes performance-based components
Hyundai Engineering,G,Transparent compensation,0.22,Basic compensation disclosure with limited detail on incentive structure
Hyundai Engineering,G,Say-on-pay voting,0.0,No advisory vote on executive compensation currently implemented
Hyundai Engineering,G,ESG reporting frameworks,0.33,Basic ESG reporting with some alignment to international standards
Hyundai Engineering,G,Anti-corruption programs,0.67,Code of conduct and compliance training programs in place
Hyundai Engineering,G,Whistleblower hotline,0.33,Internal reporting channels available but limited external verification
Hyundai Engineering,Total G score,G score,6.2,Calculated Governance score based on board structure and transparency
Hyundai Engineering,S,No fatal incidents,0.0,One workplace fatality reported in construction division in past 18 months
Hyundai Engineering,S,Safety certifications,0.5,Some facilities ISO 45001 certified but not comprehensive across operations
Hyundai Engineering,S,Safety training,0.4,Safety training programs implemented with 10+ hours per employee annually
Hyundai Engineering,S,ISO 45001 certification,0.2,Partial certification coverage across major construction projects
Hyundai Engineering,S,No labor violations,1.0,No major labor violations reported by government agencies
Hyundai Engineering,S,Labor welfare policy,0.4,Basic labor policies disclosed but limited detail on implementation
Hyundai Engineering,S,Grievance system,0.5,Employee grievance procedures established with union representation
Hyundai Engineering,S,Health wellness programs,0.3,Basic occupational health services but limited wellness programs
Hyundai Engineering,S,Diversity inclusion,0.2,Limited diversity metrics disclosed with minimal inclusion initiatives
Hyundai Engineering,S,Employee retention,0.3,High turnover in construction sector with basic retention efforts
Hyundai Engineering,S,No community complaints,0.6,Some community concerns raised regarding construction noise and dust
Hyundai Engineering,S,Community engagement,0.6,Project-specific community liaison but limited systematic engagement
Hyundai Engineering,S,CSR projects,0.4,Local hiring initiatives and basic community support programs
Hyundai Engineering,Total S score,S score,4.5,Calculated Social score based on workplace safety and community impact
GS Engineering,E,CO2 Emissions,78000,Total CO2 emissions in metric tons for fiscal year 2023
GS Engineering,E,Revenue,12000000,Total revenue in thousand USD for fiscal year 2023
GS Engineering,E,Energy Consumption,280000,Total energy consumption in MWh for fiscal year 2023
GS Engineering,Total E,E score,5.8,Calculated Environmental score based on carbon and energy efficiency
GS Engineering,G,Majority independent board,1.11,Majority independent board with 7 out of 11 independent directors
GS Engineering,G,Separate CEO and Board Chair,0.56,Separate independent Chairman and CEO structure maintained
GS Engineering,G,ESG committee exists,0.0,No dedicated ESG committee at board level currently established
GS Engineering,G,Gender diversity targets,0.28,Gender diversity policy with targets for female representation
GS Engineering,G,Board evaluations,0.0,No formal board evaluation process currently implemented
GS Engineering,G,Independent audit committee,1.11,Fully independent audit committee with appropriate expertise
GS Engineering,G,No audit failures,0.56,Clean audit record with no material issues in recent years
GS Engineering,G,Risk management disclosures,0.33,Risk management framework disclosed but limited detail provided
GS Engineering,G,Equal voting rights,0.89,Equal voting rights maintained across all shareholders
GS Engineering,G,No poison pills,0.56,No anti-takeover defenses beyond standard provisions
GS Engineering,G,Shareholder engagement,0.56,Active investor relations program with regular communication
GS Engineering,G,Performance-linked pay,0.33,Limited performance linkage in executive compensation structure
GS Engineering,G,Transparent compensation,0.44,Standard compensation disclosure meeting regulatory requirements
GS Engineering,G,Say-on-pay voting,0.0,No say-on-pay mechanism currently in place for shareholders
GS Engineering,G,ESG reporting frameworks,0.67,ESG reporting aligned with multiple international frameworks
GS Engineering,G,Anti-corruption programs,0.67,Comprehensive ethics and compliance program implemented
GS Engineering,G,Whistleblower hotline,0.67,Anonymous reporting system with third-party management
GS Engineering,Total G score,G score,7.1,Calculated Governance score based on board structure and transparency
GS Engineering,S,No fatal incidents,1.4,No workplace fatalities in past 24 months with strong safety record
GS Engineering,S,Safety certifications,1.0,Multiple safety awards and ISO 45001 certification across facilities
GS Engineering,S,Safety training,0.4,Comprehensive safety training program exceeding 15 hours per employee
GS Engineering,S,ISO 45001 certification,0.2,Full ISO 45001 implementation across all major operations
GS Engineering,S,No labor violations,1.0,Clean record with no reported labor law violations
GS Engineering,S,Labor welfare policy,0.8,Well-developed labor policies with fair wage and benefit structures
GS Engineering,S,Grievance system,0.5,Employee representation through works council and grievance procedures
GS Engineering,S,Health wellness programs,0.7,Comprehensive employee health and wellness initiatives
GS Engineering,S,Diversity inclusion,0.7,Active diversity and inclusion programs with measurable targets
GS Engineering,S,Employee retention,0.6,Above-industry retention rates with employee development programs
GS Engineering,S,No community complaints,1.2,Strong community relations with no substantiated complaints
GS Engineering,S,Community engagement,0.9,Systematic community engagement with local stakeholder committees
GS Engineering,S,CSR projects,0.6,Local education and infrastructure support programs
GS Engineering,Total S score,S score,8.4,Calculated Social score based on workplace safety and community impact`;

    setCsvData(mockData);
    setActiveTab('csv');
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>🔧 Admin Panel</h1>
        <p>Import ESG company data into Firebase</p>
      </header>

      <div className="admin-container">
        {/* File Upload Section */}
        <div className="upload-section">
          <div className="tab-header">
            <button 
              className={`tab-button ${activeTab === 'csv' ? 'active' : ''}`}
              onClick={() => setActiveTab('csv')}
            >
              📊 CSV Upload
            </button>
            <button 
              className={`tab-button ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              📁 JSON Upload
            </button>
          </div>
          
          <div 
            className={`upload-area ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="upload-content">
              <p>📄 Drag and drop your {activeTab.toUpperCase()} file here</p>
              <p>or</p>
              <input 
                type="file" 
                accept={activeTab === 'csv' ? '.csv,text/csv' : '.json,application/json'}
                onChange={handleFileUpload}
                className="file-input"
              />
              <button onClick={() => document.querySelector('.file-input').click()}>
                Choose {activeTab.toUpperCase()} File
              </button>
            </div>
          </div>

          {activeTab === 'csv' && (
            <div className="sample-actions">
              <button onClick={generateMockESGData} className="sample-btn">
                🏢 Generate Mock ESG Data
              </button>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="sample-actions">
              <button onClick={loadSampleData} className="sample-btn">
                📋 Load Sample Data
              </button>
            </div>
          )}
        </div>

        {/* Data Editor */}
        <div className="data-editor-section">
          <h2>📝 {activeTab.toUpperCase()} Data</h2>
          
          {activeTab === 'csv' ? (
            <textarea
              className="csv-editor"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here or upload a file...\nSamsung format: Name,Score,Metric,Score,Description\nLegacy format: Name,Metric,Score,Description"
              rows={15}
            />
          ) : (
            <textarea
              className="json-editor"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste your JSON data here or upload a file..."
              rows={15}
            />
          )}
          
          <div className="editor-actions">
            <button 
              onClick={handleImport}
              disabled={importing || (activeTab === 'csv' ? !csvData.trim() : !jsonData.trim())}
              className="import-btn"
            >
              {importing ? '⏳ Importing...' : `🚀 Import ${activeTab.toUpperCase()} to Firebase`}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="results-section">
            <h2>📊 Import Results</h2>
            <div className={`result-summary ${result.success ? 'success' : 'error'}`}>
              {result.success ? (
                <div>
                  <p>✅ <strong>Import Successful!</strong></p>
                  <p>Total: {result.total} companies</p>
                  <p>Successful: {result.successful}</p>
                  <p>Failed: {result.failed}</p>
                </div>
              ) : (
                <div>
                  <p>❌ <strong>Import Failed</strong></p>
                  <p>Error: {result.error}</p>
                </div>
              )}
            </div>

            {result.results && (
              <div className="detailed-results">
                <h3>Detailed Results:</h3>
                <div className="results-list">
                  {result.results.map((res, index) => (
                    <div key={index} className={`result-item ${res.success ? 'success' : 'error'}`}>
                      <span className="status">{res.success ? '✅' : '❌'}</span>
                      <span className="company">{res.company}</span>
                      {res.error && <span className="error-msg">({res.error})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="instructions-section">
          <h2>📖 Instructions</h2>
          <div className="instructions">
            {activeTab === 'csv' ? (
              <>
                <div className="quick-start">
                  <h3>🚀 Quick Start</h3>
                  <p>Click "Generate Mock ESG Data" above to load sample data with realistic ESG scores for Samsung Electronics, Hyundai Engineering, and GS Engineering. This data follows the exact Samsung CSV format and includes detailed descriptions for each metric.</p>
                </div>
                
                <h3>Expected CSV Format (Samsung):</h3>
                <pre>{`Name,Score,Metric,Score,Description
Samsung C/T,E,emissions/Tons,93,-
Samsung C/T,E,Profit,43161.7,-
Samsung C/T,Total E,E score,6,-
Samsung C/T,G,Majority independent board,1,Samsung C&T's board has a majority...
Samsung C/T,S,No fatal incidents in last 24 mo,0,No fatal incident data available
Samsung C/T,Total G,G score,9,-
Samsung C/T,Total S,S score,4.4,-`}</pre>
                
                <h3>Legacy CSV Format (also supported):</h3>
                <pre>{`Name,Metric,Score,Description
Samsung C/T,emissions/Tons,93,-
Samsung C/T,Profit,43161.7,-
Samsung C/T,E score,6,-
Samsung C/T,Majority independent board,1,Samsung C&T's board has a majority of independent directors...
Samsung C/T,No fatal incidents in last 24 mo,0,No fatal incident data available`}</pre>
                
                <h3>Samsung CSV Requirements:</h3>
                <ul>
                  <li><strong>Name</strong>: Company name</li>
                  <li><strong>Score (Category)</strong>: E, G, S, Total E, Total G, or Total S</li>
                  <li><strong>Metric</strong>: Metric name</li>
                  <li><strong>Score (Value)</strong>: Numeric score value</li>
                  <li><strong>Description</strong>: Evidence, source info, and URLs</li>
                </ul>
                
                <h3>Legacy CSV Requirements:</h3>
                <ul>
                  <li><strong>Name</strong>: Company name</li>
                  <li><strong>Metric</strong>: Metric name (will be auto-categorized into E/S/G)</li>
                  <li><strong>Score</strong>: Numeric score value</li>
                  <li><strong>Description</strong>: Evidence, source info, and URLs</li>
                </ul>
                
                <h3>Features:</h3>
                <ul>
                  <li>🤖 Samsung format: Uses explicit E/G/S categories and total scores</li>
                  <li>🔄 Legacy format: Automatic categorization into Environmental, Social, Governance</li>
                  <li>📊 Supports both individual metric scores and total category scores</li>
                  <li>🔗 Source URL extraction from descriptions</li>
                  <li>📝 Evidence text parsing</li>
                  <li>🏢 Company category detection</li>
                </ul>
              </>
            ) : (
              <>
                <h3>Expected JSON Format (10-point scale):</h3>
            <pre>{`[
  {
    "companyName": "Samsung C&T",
    "overallScore": 8.5,
    "e_score": 8.8,
    "s_score": 9.0,
    "g_score": 8.0,
    "sapaViolations": 0,
    "category": "Commercial",
    "environmental": {
      "carbonScore": 4.5,
      "energyScore": 4.3,
      "total": 8.8
    },
    "social": {
      "workplaceSafety": {
        "noFatalIncidents": 1.4,
        "safetyCertifications": 1.0,
        "safetyTraining": 0.4,
        "iso45001Certification": 0.2,
        "total": 3.0
      },
      "laborPractices": {
        "noLaborViolations": 1.0,
        "laborWelfarePolicy": 0.8,
        "grievanceSystem": 0.5,
        "total": 2.3
      },
      "workerWellbeing": {
        "healthWellnessPrograms": 0.7,
        "diversityInclusion": 0.7,
        "employeeRetention": 0.6,
        "total": 2.0
      },
      "communityImpact": {
        "noCommunityComplaints": 1.2,
        "communityEngagement": 0.5,
        "csrProjects": 0.0,
        "total": 1.7
      },
      "total": 9.0
    },
    "governance": {
      "boardStructure": {
        "independentBoard": 1.0,
        "separateCeoChair": 0.5,
        "esgCommittee": 0.25,
        "diversityTargets": 0.25,
        "boardEvaluations": 0.0,
        "total": 2.0
      },
      "auditControls": {
        "independentAudit": 1.0,
        "noAuditFailures": 0.5,
        "riskManagement": 0.3,
        "total": 1.8
      },
      "shareholderRights": {
        "equalVotingRights": 0.8,
        "noPoisonPills": 0.5,
        "shareholderEngagement": 0.2,
        "total": 1.5
      },
      "executiveCompensation": {
        "performanceLinkedPay": 0.6,
        "transparentDisclosures": 0.4,
        "sayOnPay": 0.35,
        "total": 1.35
      },
      "transparencyEthics": {
        "esgDisclosures": 0.6,
        "antiCorruption": 0.6,
        "whistleblowerHotline": 0.15,
        "total": 1.35
      },
      "total": 8.0
    }
  }
]`}</pre>
                
                <h3>Steps:</h3>
                <ol>
                  <li>Prepare your JSON file with the above format</li>
                  <li>Upload the file or paste the JSON data</li>
                  <li>Click "Import to Firebase" to upload to Firestore</li>
                  <li>Check the results to ensure successful import</li>
                  <li>Go to the main app to see your data!</li>
                </ol>
              </>
            )}
            
            <h3>General Steps:</h3>
            <ol>
              <li>Choose CSV or JSON tab based on your data format</li>
              <li>Upload file or paste data in the editor</li>
              <li>Click Import to upload to Firebase</li>
              <li>Review results and check the main app</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;