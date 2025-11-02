// PDF Report Generation Service
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

/**
 * Generate comprehensive ESG PDF report
 */
export const generateESGReport = async (company, analysisData = {}, newsData = {}) => {
  try {
    console.log('📄 Generating ESG PDF Report...');
    
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;

    // Add Korean font support (fallback to system fonts)
    doc.setFont('helvetica');

    // 1. Cover Page
    yPosition = addCoverPage(doc, company, yPosition);
    
    // 2. Executive Summary
    doc.addPage();
    yPosition = 20;
    yPosition = addExecutiveSummary(doc, company, yPosition);
    
    // 3. ESG Score Breakdown
    yPosition = addESGScoreBreakdown(doc, company, yPosition);
    
    // 4. AI Analysis Results (if available)
    if (analysisData && Object.keys(analysisData).length > 0) {
      doc.addPage();
      yPosition = 20;
      yPosition = addAIAnalysisSection(doc, analysisData, yPosition);
    }
    
    // 5. News Analysis (if available)
    if (newsData && newsData.articles && newsData.articles.length > 0) {
      doc.addPage();
      yPosition = 20;
      yPosition = addNewsAnalysisSection(doc, newsData, yPosition);
    }
    
    // 6. Risk Assessment
    doc.addPage();
    yPosition = 20;
    yPosition = addRiskAssessment(doc, company, yPosition);
    
    // 7. Investment Recommendation
    yPosition = addInvestmentRecommendation(doc, company, analysisData, yPosition);
    
    // 8. Footer on all pages
    addFooterToAllPages(doc, company);
    
    // Generate filename
    const timestamp = format(new Date(), 'yyyy-MM-dd');
    const filename = `${company.companyName}_ESG_Report_${timestamp}.pdf`;
    
    console.log('✅ PDF Report generated successfully');
    
    // Return PDF blob for download
    return {
      success: true,
      filename: filename,
      blob: doc.output('blob'),
      download: () => doc.save(filename)
    };
    
  } catch (error) {
    console.error('❌ Error generating PDF report:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Add cover page
 */
const addCoverPage = (doc, company, yPos) => {
  // Title
  doc.setFontSize(24);
  doc.setTextColor(44, 62, 80);
  doc.text('ESG Analysis Report', 105, yPos, { align: 'center' });
  
  yPos += 20;
  
  // Company name
  doc.setFontSize(20);
  doc.setTextColor(102, 126, 234);
  doc.text(company.companyName, 105, yPos, { align: 'center' });
  
  yPos += 30;
  
  // Overall score circle (simulated)
  const scoreColor = getScoreColor(company.overallScore);
  doc.setFillColor(...scoreColor);
  doc.circle(105, yPos + 15, 20, 'F');
  
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(company.overallScore.toString(), 105, yPos + 18, { align: 'center' });
  
  yPos += 40;
  
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text('Overall ESG Score', 105, yPos, { align: 'center' });
  
  yPos += 30;
  
  // Score breakdown
  doc.setFontSize(12);
  doc.text(`Environmental: ${company.e_score}/100`, 105, yPos, { align: 'center' });
  doc.text(`Social: ${company.s_score}/100`, 105, yPos + 8, { align: 'center' });
  doc.text(`Governance: ${company.g_score}/100`, 105, yPos + 16, { align: 'center' });
  
  yPos += 40;
  
  // Generation info
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 105, yPos, { align: 'center' });
  doc.text('Korea ESG Construction Analysis Platform', 105, yPos + 8, { align: 'center' });
  
  return yPos;
};

/**
 * Add executive summary
 */
const addExecutiveSummary = (doc, company, yPos) => {
  // Section title
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('Executive Summary', 20, yPos);
  
  yPos += 15;
  
  // Draw separator line
  doc.setDrawColor(224, 224, 224);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Company overview
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  
  const summaryText = [
    `${company.companyName} demonstrates an overall ESG score of ${company.overallScore}/100,`,
    `positioning the company among South Korean construction industry leaders.`,
    ``,
    `Key Performance Indicators:`,
    `• Environmental Score: ${company.e_score}/100 - ${getScoreDescription(company.e_score)}`,
    `• Social Score: ${company.s_score}/100 - ${getScoreDescription(company.s_score)}`,
    `• Governance Score: ${company.g_score}/100 - ${getScoreDescription(company.g_score)}`,
    ``,
    `SAPA Violations: ${company.sapaViolations} recorded incidents`,
    ``,
    `This report provides comprehensive analysis of the company's ESG performance,`,
    `including AI-powered insights and news sentiment analysis to support`,
    `investment decision-making processes.`
  ];
  
  summaryText.forEach((line, index) => {
    if (line.startsWith('•')) {
      doc.text(line, 25, yPos);
    } else {
      doc.text(line, 20, yPos);
    }
    yPos += 6;
  });
  
  return yPos + 10;
};

/**
 * Add ESG score breakdown with visual elements
 */
const addESGScoreBreakdown = (doc, company, yPos) => {
  // Section title
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('ESG Score Breakdown', 20, yPos);
  
  yPos += 15;
  
  // Draw separator line
  doc.setDrawColor(224, 224, 224);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;
  
  // Environmental Score
  yPos = addScoreCard(doc, 'Environmental (E)', company.e_score, 
    'Climate impact, resource management, waste reduction', 
    [40, 167, 69], yPos);
  
  yPos += 5;
  
  // Social Score
  yPos = addScoreCard(doc, 'Social (S)', company.s_score, 
    'Worker safety, community impact, labor practices', 
    [33, 162, 184], yPos);
  
  yPos += 5;
  
  // Governance Score
  yPos = addScoreCard(doc, 'Governance (G)', company.g_score, 
    'Board structure, ethics, transparency, compliance', 
    [111, 66, 193], yPos);
  
  return yPos + 10;
};

/**
 * Add individual score card
 */
const addScoreCard = (doc, title, score, description, color, yPos) => {
  // Card background
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(20, yPos, 170, 25, 2, 2, 'F');
  
  // Title
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text(title, 25, yPos + 8);
  
  // Score
  doc.setFontSize(14);
  doc.setTextColor(...color);
  doc.text(`${score}/100`, 160, yPos + 8);
  
  // Progress bar
  const barWidth = 100;
  const fillWidth = (score / 100) * barWidth;
  
  // Bar background
  doc.setFillColor(233, 236, 239);
  doc.roundedRect(25, yPos + 12, barWidth, 4, 1, 1, 'F');
  
  // Bar fill
  doc.setFillColor(...color);
  doc.roundedRect(25, yPos + 12, fillWidth, 4, 1, 1, 'F');
  
  // Description
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  doc.text(description, 25, yPos + 22);
  
  return yPos + 30;
};

/**
 * Add AI analysis results
 */
const addAIAnalysisSection = (doc, analysisData, yPos) => {
  // Section title
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('AI Analysis Results', 20, yPos);
  
  yPos += 15;
  
  // Draw separator line
  doc.setDrawColor(224, 224, 224);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;
  
  // Score Explanation
  if (analysisData.scoreExplanation) {
    yPos = addAnalysisCard(doc, 'Score Explanation', 
      analysisData.scoreExplanation.analysis, yPos);
  }
  
  // Peer Comparison
  if (analysisData.peerComparison) {
    yPos = addAnalysisCard(doc, 'Peer Comparison', 
      analysisData.peerComparison.analysis, yPos);
  }
  
  // Investment Recommendation
  if (analysisData.investmentRecommendation) {
    yPos = addAnalysisCard(doc, 'Investment Recommendation', 
      analysisData.investmentRecommendation.analysis, yPos);
  }
  
  return yPos;
};

/**
 * Add analysis card
 */
const addAnalysisCard = (doc, title, content, yPos) => {
  // Title
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text(title, 20, yPos);
  
  yPos += 10;
  
  // Content
  doc.setFontSize(10);
  doc.setTextColor(44, 62, 80);
  
  // Split content into lines to fit page width
  const lines = doc.splitTextToSize(content, 170);
  lines.forEach(line => {
    if (yPos > 270) { // Check if we need a new page
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 20, yPos);
    yPos += 5;
  });
  
  return yPos + 10;
};

/**
 * Add news analysis section
 */
const addNewsAnalysisSection = (doc, newsData, yPos) => {
  // Section title
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('News Sentiment Analysis', 20, yPos);
  
  yPos += 15;
  
  // Draw separator line
  doc.setDrawColor(224, 224, 224);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;
  
  // News summary
  const summary = newsData.articles ? getNewsSummary(newsData.articles) : null;
  
  if (summary) {
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text(`Total Articles Analyzed: ${summary.totalArticles}`, 20, yPos);
    yPos += 8;
    
    doc.text(`Average Sentiment: ${(summary.sentimentAverage * 100).toFixed(1)}%`, 20, yPos);
    yPos += 8;
    
    doc.text(`Recent Activity (7 days): ${summary.recentActivity} articles`, 20, yPos);
    yPos += 15;
  }
  
  // Recent articles
  if (newsData.articles && newsData.articles.length > 0) {
    doc.setFontSize(12);
    doc.text('Recent News Headlines:', 20, yPos);
    yPos += 10;
    
    newsData.articles.slice(0, 5).forEach(article => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);
      
      const title = doc.splitTextToSize(`• ${article.title}`, 170);
      title.forEach(line => {
        doc.text(line, 25, yPos);
        yPos += 5;
      });
      
      yPos += 3;
    });
  }
  
  return yPos + 10;
};

/**
 * Add risk assessment
 */
const addRiskAssessment = (doc, company, yPos) => {
  // Section title
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('Risk Assessment', 20, yPos);
  
  yPos += 15;
  
  // Draw separator line
  doc.setDrawColor(224, 224, 224);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;
  
  // Risk factors
  const riskFactors = [
    {
      category: 'Environmental Risk',
      level: company.e_score < 60 ? 'High' : company.e_score < 80 ? 'Medium' : 'Low',
      description: 'Climate change regulations and environmental compliance requirements'
    },
    {
      category: 'Social Risk',
      level: company.s_score < 60 ? 'High' : company.s_score < 80 ? 'Medium' : 'Low',
      description: 'Worker safety incidents and community relations challenges'
    },
    {
      category: 'Governance Risk',
      level: company.g_score < 60 ? 'High' : company.g_score < 80 ? 'Medium' : 'Low',
      description: 'Corporate governance and regulatory compliance issues'
    },
    {
      category: 'SAPA Compliance Risk',
      level: company.sapaViolations > 5 ? 'High' : company.sapaViolations > 2 ? 'Medium' : 'Low',
      description: `${company.sapaViolations} recorded safety violations requiring attention`
    }
  ];
  
  riskFactors.forEach(risk => {
    yPos = addRiskItem(doc, risk, yPos);
  });
  
  return yPos + 10;
};

/**
 * Add individual risk item
 */
const addRiskItem = (doc, risk, yPos) => {
  // Risk level color
  const levelColor = risk.level === 'High' ? [244, 67, 54] : 
                    risk.level === 'Medium' ? [255, 152, 0] : [76, 175, 80];
  
  // Category
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  doc.text(risk.category, 20, yPos);
  
  // Level
  doc.setTextColor(...levelColor);
  doc.text(risk.level, 100, yPos);
  
  yPos += 8;
  
  // Description
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125);
  const lines = doc.splitTextToSize(risk.description, 170);
  lines.forEach(line => {
    doc.text(line, 25, yPos);
    yPos += 5;
  });
  
  return yPos + 8;
};

/**
 * Add investment recommendation
 */
const addInvestmentRecommendation = (doc, company, analysisData, yPos) => {
  // Check if we need a new page
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }
  
  // Section title
  doc.setFontSize(16);
  doc.setTextColor(44, 62, 80);
  doc.text('Investment Recommendation', 20, yPos);
  
  yPos += 15;
  
  // Draw separator line
  doc.setDrawColor(224, 224, 224);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;
  
  // Overall recommendation
  const overallScore = company.overallScore;
  const recommendation = overallScore >= 80 ? 'BUY' : overallScore >= 60 ? 'HOLD' : 'CAUTION';
  const recColor = overallScore >= 80 ? [76, 175, 80] : overallScore >= 60 ? [255, 152, 0] : [244, 67, 54];
  
  doc.setFontSize(14);
  doc.setTextColor(...recColor);
  doc.text(`Recommendation: ${recommendation}`, 20, yPos);
  
  yPos += 15;
  
  // Recommendation rationale
  doc.setFontSize(11);
  doc.setTextColor(44, 62, 80);
  
  const rationale = [
    `Based on comprehensive ESG analysis, ${company.companyName} receives a`,
    `${recommendation} recommendation for ESG-focused investment portfolios.`,
    ``,
    `Key Investment Highlights:`,
    `• Overall ESG Score: ${overallScore}/100`,
    `• Industry positioning: ${getIndustryPositioning(overallScore)}`,
    `• Risk profile: ${company.sapaViolations > 3 ? 'Elevated' : 'Manageable'}`,
    ``,
    `This assessment is based on quantitative ESG metrics, regulatory compliance`,
    `records, and AI-powered analysis of recent market developments.`
  ];
  
  rationale.forEach(line => {
    if (line.startsWith('•')) {
      doc.text(line, 25, yPos);
    } else {
      doc.text(line, 20, yPos);
    }
    yPos += 6;
  });
  
  return yPos;
};

/**
 * Add footer to all pages
 */
const addFooterToAllPages = (doc, company) => {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 285, 190, 285);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.text(`${company.companyName} ESG Report`, 20, 292);
    doc.text(`Page ${i} of ${pageCount}`, 190, 292, { align: 'right' });
    doc.text('Generated by Korea ESG Platform', 105, 292, { align: 'center' });
  }
};

/**
 * Helper functions
 */
const getScoreColor = (score) => {
  if (score >= 80) return [76, 175, 80]; // green
  if (score >= 60) return [255, 152, 0]; // orange
  return [244, 67, 54]; // red
};

const getScoreDescription = (score) => {
  if (score >= 80) return 'Excellent performance';
  if (score >= 60) return 'Good performance';
  if (score >= 40) return 'Needs improvement';
  return 'Critical attention required';
};

const getIndustryPositioning = (score) => {
  if (score >= 80) return 'Industry leader';
  if (score >= 60) return 'Above average';
  if (score >= 40) return 'Below average';
  return 'Industry laggard';
};

// Helper function for news summary (simplified version)
const getNewsSummary = (articles) => {
  const totalArticles = articles.length;
  const sentimentSum = articles.reduce((sum, article) => sum + (article.sentiment || 0), 0);
  const sentimentAverage = sentimentSum / totalArticles;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentActivity = articles.filter(article => 
    new Date(article.publishedAt) > oneWeekAgo
  ).length;
  
  return {
    totalArticles,
    sentimentAverage,
    recentActivity
  };
};

console.log('📄 PDF service initialized');