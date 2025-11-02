import React, { useState } from 'react';
import { generateESGReport } from '../services/pdfService';
import './PDFDownload.css';

const PDFDownload = ({ company, analysisData = {} }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  const handleDownloadReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('📄 Starting PDF generation...');
      
      const result = await generateESGReport(company, analysisData, null);
      
      if (result.success) {
        // Download the PDF
        result.download();
        setLastGenerated(new Date().toLocaleString());
        console.log('✅ PDF downloaded successfully');
      } else {
        setError(result.error || 'Failed to generate PDF report');
        console.error('❌ PDF generation failed:', result.error);
      }
    } catch (err) {
      console.error('❌ Error generating PDF:', err);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportSize = () => {
    let estimatedPages = 4; // Base pages
    
    // Add pages based on content
    if (analysisData && Object.keys(analysisData).length > 0) {
      estimatedPages += 1;
    }
    
    
    return {
      pages: estimatedPages,
      sizeKB: estimatedPages * 150 // Rough estimate
    };
  };

  const reportInfo = getReportSize();

  return (
    <div className="pdf-download-section">
      <div className="pdf-header">
        <div className="pdf-title">
          <h3>📊 Professional ESG Report</h3>
          <p>Comprehensive analysis report for investors and stakeholders</p>
        </div>
        <div className="pdf-info">
          <span className="pdf-pages">~{reportInfo.pages} pages</span>
          <span className="pdf-size">~{Math.round(reportInfo.sizeKB)}KB</span>
        </div>
      </div>

      <div className="pdf-features">
        <div className="feature-grid">
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span className="feature-text">ESG Score Analysis</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span className="feature-text">AI Insights</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚠️</span>
            <span className="feature-text">Risk Assessment</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💡</span>
            <span className="feature-text">Investment Recommendation</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span className="feature-text">Executive Summary</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="pdf-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      {lastGenerated && (
        <div className="pdf-success">
          <span className="success-icon">✅</span>
          <span className="success-text">
            Last generated: {lastGenerated}
          </span>
        </div>
      )}

      <div className="pdf-actions">
        <button
          className="pdf-download-btn"
          onClick={handleDownloadReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="loading-spinner"></span>
              Generating Report...
            </>
          ) : (
            <>
              <span className="download-icon">📄</span>
              Download ESG Report
            </>
          )}
        </button>

        <div className="pdf-note">
          <p>
            <strong>Report includes:</strong> Company overview, detailed ESG breakdown,
            AI-powered analysis, risk assessment, and investment recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFDownload;