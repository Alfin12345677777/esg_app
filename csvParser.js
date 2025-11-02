import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Parse CSV text into array of objects
 * Handles the final_result.csv format with Name,Metric,Score,Description columns
 */
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const expectedHeaders = ['Name', 'Metric', 'Score', 'Description'];
  
  // Validate headers
  const hasRequiredHeaders = expectedHeaders.every(header => 
    headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
  );
  
  if (!hasRequiredHeaders) {
    throw new Error(`CSV must have headers: ${expectedHeaders.join(', ')}`);
  }

  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= 3) { // At least Name, Metric, Score
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }
  }

  return data;
};

/**
 * Parse a single CSV line, handling commas within quotes
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

/**
 * Transform parsed CSV data to company objects suitable for Firebase
 * Groups metrics by company and categorizes them into E, S, G
 */
export const transformCSVToCompanies = (csvData) => {
  const companies = {};
  
  csvData.forEach(row => {
    const companyName = row.Name || row.name;
    const metric = row.Metric || row.metric;
    const score = parseFloat(row.Score || row.score) || 0;
    const description = row.Description || row.description || '';
    const category = row.Category; // Samsung format has explicit category
    
    if (!companyName || !metric) return;

    // Initialize company if not exists
    if (!companies[companyName]) {
      companies[companyName] = {
        companyName,
        metrics: [],
        environmentalMetrics: [],
        socialMetrics: [],
        governanceMetrics: [],
        otherMetrics: [],
        totalScores: {} // For Samsung format total scores
      };
    }

    // Handle Samsung format total scores (Total E score, Total G score, Total S score)
    if (category && category.toLowerCase().includes('total')) {
      if (category.toLowerCase().includes('total e') || 
          (category.toLowerCase().includes('total') && metric.toLowerCase().includes('e score'))) {
        companies[companyName].totalScores.eScore = score;
      } else if (category.toLowerCase().includes('total g') || 
                 (category.toLowerCase().includes('total') && metric.toLowerCase().includes('g score'))) {
        companies[companyName].totalScores.gScore = score;
      } else if (category.toLowerCase().includes('total s') || 
                 (category.toLowerCase().includes('total') && metric.toLowerCase().includes('s score'))) {
        companies[companyName].totalScores.sScore = score;
      }
    }

    // Determine category for metric
    let metricCategory;
    if (category) {
      // Samsung format - use explicit category
      if (category.toLowerCase() === 'e' || category.toLowerCase().includes('total e')) {
        metricCategory = 'Environmental';
      } else if (category.toLowerCase() === 's' || category.toLowerCase().includes('total s')) {
        metricCategory = 'Social';
      } else if (category.toLowerCase() === 'g' || category.toLowerCase().includes('total g')) {
        metricCategory = 'Governance';
      } else {
        metricCategory = 'Other';
      }
    } else {
      // Legacy format - categorize by metric name
      metricCategory = categorizeMetric(metric);
    }

    // Create metric object with source information (ensure no undefined values)
    const metricObj = {
      name: metric || 'Unknown Metric',
      score: isNaN(score) ? 0 : score,
      description: description || '',
      source: extractSource(description) || '',
      sourceUrl: extractSourceUrl(description) || '',
      evidence: extractEvidence(description) || '',
      category: metricCategory || 'Other',
      originalCategory: category || ''
    };

    // Add to appropriate category
    companies[companyName].metrics.push(metricObj);
    
    if (metricCategory === 'Environmental') {
      companies[companyName].environmentalMetrics.push(metricObj);
    } else if (metricCategory === 'Social') {
      companies[companyName].socialMetrics.push(metricObj);
    } else if (metricCategory === 'Governance') {
      companies[companyName].governanceMetrics.push(metricObj);
    } else {
      companies[companyName].otherMetrics.push(metricObj);
    }
  });

  // Convert to array and calculate scores
  return Object.values(companies).map(company => {
    const processedCompany = calculateCompanyScores(company);
    return processedCompany;
  });
};

/**
 * Categorize metrics into Environmental, Social, or Governance
 */
const categorizeMetric = (metric) => {
  const metricLower = metric.toLowerCase();
  
  // Environmental indicators
  const envKeywords = [
    'emissions', 'carbon', 'energy', 'environmental', 'climate', 
    'renewable', 'sustainability', 'e score', 'pollution', 'waste'
  ];
  
  // Social indicators  
  const socialKeywords = [
    'fatal', 'safety', 'labor', 'worker', 'employee', 'community',
    'training', 'health', 'wellness', 'diversity', 'inclusion',
    'grievance', 'union', 'retention', 'complaints', 'engagement',
    'csr', 'social', 's score', 'human rights', 'workplace'
  ];
  
  // Governance indicators
  const govKeywords = [
    'board', 'director', 'independent', 'audit', 'governance',
    'shareholder', 'executive', 'compensation', 'pay', 'voting',
    'ethics', 'corruption', 'compliance', 'whistleblower',
    'transparency', 'disclosure', 'g score', 'committee'
  ];

  if (envKeywords.some(keyword => metricLower.includes(keyword))) {
    return 'Environmental';
  } else if (socialKeywords.some(keyword => metricLower.includes(keyword))) {
    return 'Social';
  } else if (govKeywords.some(keyword => metricLower.includes(keyword))) {
    return 'Governance';
  }
  
  return 'Other';
};

/**
 * Extract source from description field
 */
const extractSource = (description) => {
  if (!description) return '';
  
  // Look for source patterns like "Source: ..." or document names
  const sourcePatterns = [
    /source:\s*([^,\n]+)/i,
    /([^,\n]*report[^,\n]*)/i,
    /([^,\n]*audit[^,\n]*)/i,
    /([^,\n]*certification[^,\n]*)/i
  ];
  
  for (const pattern of sourcePatterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return description.split('.')[0] || description.substring(0, 100);
};

/**
 * Extract source URL from description field
 */
const extractSourceUrl = (description) => {
  if (!description) return '';
  
  // Look for URLs in the description
  const urlPattern = /(https?:\/\/[^\s,]+)/g;
  const matches = description.match(urlPattern);
  
  return matches ? matches[0] : '';
};

/**
 * Extract evidence from description (remove URLs and source info)
 */
const extractEvidence = (description) => {
  if (!description) return '';
  
  // Remove URLs
  let evidence = description.replace(/(https?:\/\/[^\s,]+)/g, '');
  
  // Remove common prefixes
  evidence = evidence.replace(/^(source:\s*[^,\n]+,?\s*)/i, '');
  
  return evidence.trim();
};

/**
 * Calculate aggregated scores for each ESG category
 * Prioritizes Samsung format total scores if available
 */
const calculateCompanyScores = (company) => {
  const calculateCategoryScore = (metrics) => {
    if (metrics.length === 0) return 0;
    const totalScore = metrics.reduce((sum, metric) => sum + (metric.score || 0), 0);
    return Math.round((totalScore / metrics.length) * 10) / 10; // Round to 1 decimal
  };

  // Use Samsung total scores if available, otherwise calculate from individual metrics
  let eScore, sScore, gScore;
  
  if (company.totalScores && Object.keys(company.totalScores).length > 0) {
    // Samsung format - use provided total scores (these are actual totals, not averages)
    eScore = company.totalScores.eScore !== undefined ? company.totalScores.eScore : calculateCategoryScore(company.environmentalMetrics);
    sScore = company.totalScores.sScore !== undefined ? company.totalScores.sScore : calculateTotalScore(company.socialMetrics);
    gScore = company.totalScores.gScore !== undefined ? company.totalScores.gScore : calculateTotalScore(company.governanceMetrics);
  } else {
    // Legacy format - calculate from individual metrics
    eScore = calculateCategoryScore(company.environmentalMetrics);
    sScore = calculateCategoryScore(company.socialMetrics);
    gScore = calculateCategoryScore(company.governanceMetrics);
  }

  const overallScore = Math.round(((eScore + sScore + gScore) / 3) * 10) / 10;

  // Get profit and emissions for calculations
  const profitMetric = company.metrics.find(m => m.name.toLowerCase().includes('profit') && !m.name.toLowerCase().includes('/'));
  const emissionsMetric = company.metrics.find(m => m.name.toLowerCase().includes('emissions'));
  
  // Calculate total possible scores for Samsung format
  const calculateTotalScore = (metrics) => {
    return metrics.reduce((sum, metric) => sum + (metric.score || 0), 0);
  };

  const eTotalScore = calculateTotalScore(company.environmentalMetrics);
  const sTotalScore = calculateTotalScore(company.socialMetrics);
  const gTotalScore = calculateTotalScore(company.governanceMetrics);
  
  // Helper function to ensure no undefined values
  const sanitizeValue = (value) => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number' && isNaN(value)) return 0;
    return value;
  };
  
  return {
    companyName: company.companyName || 'Unknown Company',
    slug: (company.companyName || 'unknown-company').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    overallScore: sanitizeValue(overallScore),
    e_score: sanitizeValue(eScore),
    s_score: sanitizeValue(sScore),  
    g_score: sanitizeValue(gScore),
    
    // Samsung format specific scores
    e_total_score: sanitizeValue(eTotalScore),
    s_total_score: sanitizeValue(sTotalScore),
    g_total_score: sanitizeValue(gTotalScore),
    
    category: determineCompanyCategory(company.companyName) || 'Other',
    sapaViolations: 0,
    
    // Financial metrics
    profit: profitMetric ? sanitizeValue(profitMetric.score) : 0,
    emissions: emissionsMetric ? sanitizeValue(emissionsMetric.score) : 0,
    
    // Detailed metrics with source information (ensure no undefined values)
    detailedMetrics: {
      environmental: company.environmentalMetrics.map(m => ({
        ...m,
        score: sanitizeValue(m.score),
        name: m.name || 'Unknown Metric',
        description: m.description || '',
        source: m.source || '',
        sourceUrl: m.sourceUrl || '',
        evidence: m.evidence || '',
        category: m.category || 'Other',
        originalCategory: m.originalCategory || ''
      })),
      social: company.socialMetrics.map(m => ({
        ...m,
        score: sanitizeValue(m.score),
        name: m.name || 'Unknown Metric',
        description: m.description || '',
        source: m.source || '',
        sourceUrl: m.sourceUrl || '',
        evidence: m.evidence || '',
        category: m.category || 'Other',
        originalCategory: m.originalCategory || ''
      })),
      governance: company.governanceMetrics.map(m => ({
        ...m,
        score: sanitizeValue(m.score),
        name: m.name || 'Unknown Metric',
        description: m.description || '',
        source: m.source || '',
        sourceUrl: m.sourceUrl || '',
        evidence: m.evidence || '',
        category: m.category || 'Other',
        originalCategory: m.originalCategory || ''
      })),
      other: company.otherMetrics.map(m => ({
        ...m,
        score: sanitizeValue(m.score),
        name: m.name || 'Unknown Metric',
        description: m.description || '',
        source: m.source || '',
        sourceUrl: m.sourceUrl || '',
        evidence: m.evidence || '',
        category: m.category || 'Other',
        originalCategory: m.originalCategory || ''
      }))
    },
    
    // All raw metrics (sanitized)
    allMetrics: company.metrics.map(m => ({
      ...m,
      score: sanitizeValue(m.score),
      name: m.name || 'Unknown Metric',
      description: m.description || '',
      source: m.source || '',
      sourceUrl: m.sourceUrl || '',
      evidence: m.evidence || '',
      category: m.category || 'Other',
      originalCategory: m.originalCategory || ''
    })),
    
    // Metadata
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    dataSource: 'CSV Import'
  };
};

/**
 * Determine company category based on name patterns
 */
const determineCompanyCategory = (companyName) => {
  const name = companyName.toLowerCase();
  
  if (name.includes('construction') || name.includes('engineering') || name.includes('e&c') || name.includes('ec')) {
    return 'Construction';
  } else if (name.includes('residential') || name.includes('housing')) {
    return 'Residential';
  } else if (name.includes('commercial') || name.includes('office')) {
    return 'Commercial';  
  } else if (name.includes('infrastructure') || name.includes('civil')) {
    return 'Infrastructure';
  } else if (name.includes('energy') || name.includes('power') || name.includes('utility')) {
    return 'Energy';
  }
  
  return 'Other';
};

/**
 * Import CSV data to Firestore
 */
export const importCSVData = async (csvText) => {
  try {
    console.log('🚀 Starting CSV import...');
    
    // Parse and transform CSV data
    const csvData = parseCSV(csvText);
    console.log('📊 Parsed CSV rows:', csvData.length);
    
    const companies = transformCSVToCompanies(csvData);
    console.log('🏢 Processed companies:', companies.length);
    
    const results = [];
    
    // Import each company to Firestore
    for (const company of companies) {
      try {
        // Use setDoc to create with custom ID (slug)
        await setDoc(doc(db, 'companies', company.slug), company);
        
        console.log('✅ Imported:', company.companyName);
        results.push({ success: true, company: company.companyName, id: company.slug });
        
      } catch (error) {
        console.error('❌ Failed to import:', company.companyName, error);
        results.push({ success: false, company: company.companyName, error: error.message });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`🎉 CSV Import complete: ${successful} successful, ${failed} failed`);
    
    return {
      success: true,
      total: companies.length,
      successful,
      failed,
      results,
      companies // Return processed companies for debugging
    };
    
  } catch (error) {
    console.error('💥 CSV Import failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

console.log('📁 CSV Parser utility loaded');