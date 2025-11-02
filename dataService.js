import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Collection name in Firestore
const COMPANIES_COLLECTION = 'companies';

/**
 * Get all companies from Firestore
 */
export const getAllCompanies = async () => {
  try {
    const q = query(collection(db, COMPANIES_COLLECTION), orderBy('overallScore', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const companies = [];
    querySnapshot.forEach((doc) => {
      companies.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('📊 Fetched companies from Firebase:', companies.length);
    return companies;
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    // Return mock data as fallback
    return getMockData();
  }
};

/**
 * Get a specific company by ID
 */
export const getCompanyById = async (companyId) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('📊 Fetched company from Firebase:', companyId);
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log('❌ Company not found:', companyId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching company:', error);
    // Return mock data as fallback
    const mockData = getMockData();
    return mockData.find(company => company.id === companyId) || null;
  }
};

/**
 * Search companies by name
 */
export const searchCompaniesByName = async (searchTerm) => {
  try {
    // Firestore doesn't support full-text search, so we'll get all companies and filter locally
    // In production, you might want to use Algolia or implement a more sophisticated search
    const companies = await getAllCompanies();
    
    const filteredCompanies = companies.filter(company =>
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('🔍 Search results for:', searchTerm, filteredCompanies.length);
    return filteredCompanies;
  } catch (error) {
    console.error('❌ Error searching companies:', error);
    return [];
  }
};

/**
 * Filter companies by category (if we add this field later)
 */
export const getCompaniesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, COMPANIES_COLLECTION),
      where('category', '==', category),
      orderBy('overallScore', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const companies = [];
    
    querySnapshot.forEach((doc) => {
      companies.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('📊 Fetched companies by category:', category, companies.length);
    return companies;
  } catch (error) {
    console.error('❌ Error fetching companies by category:', error);
    // Return filtered mock data as fallback
    const mockData = getMockData();
    return mockData.filter(company => company.category === category);
  }
};

/**
 * Add sample data to Firestore (utility function)
 */
export const initializeSampleData = async () => {
  try {
    const sampleData = getMockData();
    
    for (const company of sampleData) {
      const { id, ...companyData } = company;
      await addDoc(collection(db, COMPANIES_COLLECTION), {
        ...companyData,
        category: getRandomCategory(), // Add random category for demo
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }
    
    console.log('✅ Sample data initialized in Firebase');
    return true;
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    return false;
  }
};

/**
 * Update company data
 */
export const updateCompany = async (companyId, updateData) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(docRef, {
      ...updateData,
      lastUpdated: new Date().toISOString()
    });
    
    console.log('✅ Company updated:', companyId);
    return true;
  } catch (error) {
    console.error('❌ Error updating company:', error);
    return false;
  }
};

/**
 * Get detailed metrics for a company with sources and evidence
 */
export const getCompanyDetailedMetrics = async (companyId) => {
  try {
    const company = await getCompanyById(companyId);
    if (!company) return null;
    
    // Return detailed metrics if available (from new CSV structure)
    if (company.detailedMetrics) {
      return company.detailedMetrics;
    }
    
    // Fallback to legacy structure
    return {
      environmental: company.environmental || [],
      social: company.social || [],
      governance: company.governance || [],
      other: company.otherMetrics || []
    };
  } catch (error) {
    console.error('❌ Error fetching detailed metrics:', error);
    return null;
  }
};

/**
 * Get all metrics for a company in flat format
 */
export const getCompanyAllMetrics = async (companyId) => {
  try {
    const company = await getCompanyById(companyId);
    if (!company) return [];
    
    // Return all metrics if available (from new CSV structure)
    if (company.allMetrics) {
      return company.allMetrics;
    }
    
    // Fallback to empty array for legacy structure
    return [];
  } catch (error) {
    console.error('❌ Error fetching all metrics:', error);
    return [];
  }
};

/**
 * Search metrics across all companies
 */
export const searchMetrics = async (searchTerm, category = null) => {
  try {
    const companies = await getAllCompanies();
    const results = [];
    
    companies.forEach(company => {
      if (company.allMetrics) {
        const matchingMetrics = company.allMetrics.filter(metric => {
          const nameMatch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
          const categoryMatch = !category || metric.category === category;
          return nameMatch && categoryMatch;
        });
        
        matchingMetrics.forEach(metric => {
          results.push({
            ...metric,
            companyName: company.companyName,
            companyId: company.id
          });
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error searching metrics:', error);
    return [];
  }
};

/**
 * Mock data fallback
 */
const getMockData = () => [
  {
    id: 'samsung-ct',
    companyName: "Samsung C&T",
    overallScore: 8.5,
    e_score: 8.8,
    s_score: 9.0,
    g_score: 8.0,
    sapaViolations: 0,
    slug: "samsung-ct",
    category: "Commercial",
    lastUpdated: new Date().toISOString(),
    // Environmental Score Details
    environmental: {
      carbonScore: {
        score: 4.5,
        source: "",
        description: ""
      },
      energyScore: {
        score: 4.3,
        source: "",
        description: ""
      },
      total: 8.8
    },
    // Social Score Details
    social: {
      workplaceSafety: {
        noFatalIncidents: {
          score: 1.4,
          source: "",
          description: ""
        },
        safetyCertifications: {
          score: 1.0,
          source: "",
          description: ""
        },
        safetyTraining: {
          score: 0.4,
          source: "",
          description: ""
        },
        iso45001Certification: {
          score: 0.2,
          source: "",
          description: ""
        },
        total: 3.0
      },
      laborPractices: {
        noLaborViolations: 1.0,
        laborWelfarePolicy: 0.8,
        grievanceSystem: 0.5,
        total: 2.3
      },
      workerWellbeing: {
        healthWellnessPrograms: 0.7,
        diversityInclusion: 0.7,
        employeeRetention: 0.6,
        total: 2.0
      },
      communityImpact: {
        noCommunityComplaints: 1.2,
        communityEngagement: 0.5,
        csrProjects: 0.0,
        total: 1.7
      },
      total: 9.0
    },
    
    // Detailed metrics (new structure)
    detailedMetrics: {
      environmental: [
        {
          name: "Carbon Emissions",
          score: 4.5,
          category: "Environmental",
          source: "CDP Climate Report 2024",
          sourceUrl: "https://cdp.net/samsung-ct",
          evidence: "42% reduction in carbon intensity since 2019",
          description: "Scope 1, 2, 3 emissions measurement"
        },
        {
          name: "Energy Efficiency",
          score: 4.3,
          category: "Environmental", 
          source: "Annual Energy Report 2024",
          sourceUrl: "https://samsung.com/energy-report",
          evidence: "72% renewable energy usage, ISO 50001 certified",
          description: "Renewable energy percentage and efficiency metrics"
        }
      ],
      social: [
        {
          name: "No fatal incidents in last 24 mo",
          score: 1.4,
          category: "Social",
          source: "KOSHA Safety Report 2024",
          sourceUrl: "https://kosha.or.kr/samsung-ct",
          evidence: "365 days without fatal workplace incidents",
          description: "Zero tolerance fatal incident policy"
        },
        {
          name: "Safety certifications or awards",
          score: 1.0,
          category: "Social",
          source: "ISO 45001 Certificate",
          sourceUrl: "https://iso.org/certificate",
          evidence: "Certificate valid until 2026-12-15",
          description: "Valid ISO 45001:2018 certification"
        }
      ],
      governance: [
        {
          name: "Majority independent board",
          score: 1.0,
          category: "Governance",
          source: "Corporate Governance Report 2024",
          sourceUrl: "https://samsung.com/governance-report",
          evidence: "4 of 6 directors independent (67%)",
          description: "Independent directors ratio verification"
        }
      ],
      other: []
    },
    
    // All metrics in flat format
    allMetrics: [
      {
        name: "emissions/Tons",
        score: 93,
        category: "Environmental",
        source: "CDP Climate Report 2024",
        sourceUrl: "https://cdp.net/samsung-ct",
        evidence: "Verified emissions data from third-party assessment",
        description: "Direct operational emissions measurement"
      },
      {
        name: "Profit",
        score: 43161.7,
        category: "Other",
        source: "Annual Financial Report",
        sourceUrl: "https://samsung.com/financial-report",
        evidence: "Audited financial statements",
        description: "Annual profit in millions"
      },
      {
        name: "E score",
        score: 6,
        category: "Environmental",
        source: "Internal ESG Assessment",
        sourceUrl: "",
        evidence: "Aggregated environmental performance score",
        description: "Composite environmental score"
      }
    ],
    
    // Governance Score Details
    governance: {
      boardStructure: {
        independentBoard: 1.0,
        separateCeoChair: 0.5,
        esgCommittee: 0.25,
        diversityTargets: 0.25,
        boardEvaluations: 0.0,
        total: 2.0
      },
      auditControls: {
        independentAudit: 1.0,
        noAuditFailures: 0.5,
        riskManagement: 0.3,
        total: 1.8
      },
      shareholderRights: {
        equalVotingRights: 0.8,
        noPoisonPills: 0.5,
        shareholderEngagement: 0.2,
        total: 1.5
      },
      executiveCompensation: {
        performanceLinkedPay: 0.6,
        transparentDisclosures: 0.4,
        sayOnPay: 0.35,
        total: 1.35
      },
      transparencyEthics: {
        esgDisclosures: 0.6,
        antiCorruption: 0.6,
        whistleblowerHotline: 0.15,
        total: 1.35
      },
      total: 8.0
    }
  },
  {
    id: 'hyundai-ec',
    companyName: "Hyundai E&C",
    overallScore: 7.8,
    e_score: 8.2,
    s_score: 7.5,
    g_score: 7.9,
    sapaViolations: 1,
    slug: "hyundai-ec",
    category: "Infrastructure",
    lastUpdated: new Date().toISOString(),
    environmental: {
      carbonScore: {
        score: 4.2,
        source: "",
        description: ""
      },
      energyScore: {
        score: 4.0,
        source: "",
        description: ""
      },
      total: 8.2
    },
    social: {
      workplaceSafety: {
        noFatalIncidents: 1.4,
        safetyCertifications: 0.6,
        safetyTraining: 0.4,
        iso45001Certification: 0.2,
        total: 2.6
      },
      laborPractices: {
        noLaborViolations: 0.8,
        laborWelfarePolicy: 0.7,
        grievanceSystem: 0.5,
        total: 2.0
      },
      workerWellbeing: {
        healthWellnessPrograms: 0.5,
        diversityInclusion: 0.4,
        employeeRetention: 0.6,
        total: 1.5
      },
      communityImpact: {
        noCommunityComplaints: 0.8,
        communityEngagement: 0.6,
        csrProjects: 0.0,
        total: 1.4
      },
      total: 7.5
    },
    governance: {
      boardStructure: {
        independentBoard: 0.8,
        separateCeoChair: 0.5,
        esgCommittee: 0.25,
        diversityTargets: 0.2,
        boardEvaluations: 0.0,
        total: 1.75
      },
      auditControls: {
        independentAudit: 1.0,
        noAuditFailures: 0.2,
        riskManagement: 0.3,
        total: 1.5
      },
      shareholderRights: {
        equalVotingRights: 0.8,
        noPoisonPills: 0.5,
        shareholderEngagement: 0.0,
        total: 1.3
      },
      executiveCompensation: {
        performanceLinkedPay: 0.4,
        transparentDisclosures: 0.4,
        sayOnPay: 0.2,
        total: 1.0
      },
      transparencyEthics: {
        esgDisclosures: 0.6,
        antiCorruption: 0.6,
        whistleblowerHotline: 0.15,
        total: 1.35
      },
      total: 7.9
    }
  },
  {
    id: 'daewoo-ec',
    companyName: "Daewoo E&C",
    overallScore: 7.2,
    e_score: 7.0,
    s_score: 7.5,
    g_score: 7.1,
    sapaViolations: 0,
    slug: "daewoo-ec",
    category: "Residential",
    lastUpdated: new Date().toISOString(),
    environmental: {
      carbonScore: {
        score: 3.5,
        source: "",
        description: ""
      },
      energyScore: {
        score: 3.5,
        source: "",
        description: ""
      },
      total: 7.0
    },
    social: {
      workplaceSafety: {
        noFatalIncidents: 1.4,
        safetyCertifications: 1.0,
        safetyTraining: 0.4,
        iso45001Certification: 0.2,
        total: 3.0
      },
      laborPractices: {
        noLaborViolations: 1.0,
        laborWelfarePolicy: 0.5,
        grievanceSystem: 0.3,
        total: 1.8
      },
      workerWellbeing: {
        healthWellnessPrograms: 0.7,
        diversityInclusion: 0.4,
        employeeRetention: 0.3,
        total: 1.4
      },
      communityImpact: {
        noCommunityComplaints: 1.0,
        communityEngagement: 0.3,
        csrProjects: 0.0,
        total: 1.3
      },
      total: 7.5
    },
    governance: {
      boardStructure: {
        independentBoard: 0.6,
        separateCeoChair: 0.5,
        esgCommittee: 0.25,
        diversityTargets: 0.15,
        boardEvaluations: 0.0,
        total: 1.5
      },
      auditControls: {
        independentAudit: 1.0,
        noAuditFailures: 0.0,
        riskManagement: 0.3,
        total: 1.3
      },
      shareholderRights: {
        equalVotingRights: 0.8,
        noPoisonPills: 0.5,
        shareholderEngagement: 0.2,
        total: 1.5
      },
      executiveCompensation: {
        performanceLinkedPay: 0.6,
        transparentDisclosures: 0.4,
        sayOnPay: 0.35,
        total: 1.35
      },
      transparencyEthics: {
        esgDisclosures: 0.6,
        antiCorruption: 0.6,
        whistleblowerHotline: 0.25,
        total: 1.45
      },
      total: 7.1
    }
  },
  {
    id: 'gs-ec',
    companyName: "GS E&C",
    overallScore: 6.9,
    e_score: 6.5,
    s_score: 7.2,
    g_score: 7.0,
    sapaViolations: 2,
    slug: "gs-ec",
    category: "Commercial",
    lastUpdated: new Date().toISOString(),
    environmental: {
      carbonScore: {
        score: 3.2,
        source: "",
        description: ""
      },
      energyScore: {
        score: 3.3,
        source: "",
        description: ""
      },
      total: 6.5
    },
    social: {
      workplaceSafety: {
        noFatalIncidents: 1.0,
        safetyCertifications: 0.6,
        safetyTraining: 0.4,
        iso45001Certification: 0.2,
        total: 2.2
      },
      laborPractices: {
        noLaborViolations: 0.8,
        laborWelfarePolicy: 0.7,
        grievanceSystem: 0.5,
        total: 2.0
      },
      workerWellbeing: {
        healthWellnessPrograms: 0.6,
        diversityInclusion: 0.5,
        employeeRetention: 0.5,
        total: 1.6
      },
      communityImpact: {
        noCommunityComplaints: 0.8,
        communityEngagement: 0.6,
        csrProjects: 0.0,
        total: 1.4
      },
      total: 7.2
    },
    governance: {
      boardStructure: {
        independentBoard: 0.8,
        separateCeoChair: 0.5,
        esgCommittee: 0.25,
        diversityTargets: 0.2,
        boardEvaluations: 0.0,
        total: 1.75
      },
      auditControls: {
        independentAudit: 1.0,
        noAuditFailures: 0.0,
        riskManagement: 0.3,
        total: 1.3
      },
      shareholderRights: {
        equalVotingRights: 0.8,
        noPoisonPills: 0.5,
        shareholderEngagement: 0.0,
        total: 1.3
      },
      executiveCompensation: {
        performanceLinkedPay: 0.6,
        transparentDisclosures: 0.4,
        sayOnPay: 0.2,
        total: 1.2
      },
      transparencyEthics: {
        esgDisclosures: 0.6,
        antiCorruption: 0.6,
        whistleblowerHotline: 0.25,
        total: 1.45
      },
      total: 7.0
    }
  },
  {
    id: 'lotte-ec',
    companyName: "Lotte E&C",
    overallScore: 6.5,
    e_score: 6.0,
    s_score: 6.8,
    g_score: 6.7,
    sapaViolations: 1,
    slug: "lotte-ec",
    category: "Residential",
    lastUpdated: new Date().toISOString(),
    environmental: {
      carbonScore: {
        score: 3.0,
        source: "",
        description: ""
      },
      energyScore: {
        score: 3.0,
        source: "",
        description: ""
      },
      total: 6.0
    },
    social: {
      workplaceSafety: {
        noFatalIncidents: 1.0,
        safetyCertifications: 0.4,
        safetyTraining: 0.4,
        iso45001Certification: 0.2,
        total: 2.0
      },
      laborPractices: {
        noLaborViolations: 0.8,
        laborWelfarePolicy: 0.5,
        grievanceSystem: 0.5,
        total: 1.8
      },
      workerWellbeing: {
        healthWellnessPrograms: 0.7,
        diversityInclusion: 0.4,
        employeeRetention: 0.4,
        total: 1.5
      },
      communityImpact: {
        noCommunityComplaints: 1.2,
        communityEngagement: 0.3,
        csrProjects: 0.0,
        total: 1.5
      },
      total: 6.8
    },
    governance: {
      boardStructure: {
        independentBoard: 0.6,
        separateCeoChair: 0.5,
        esgCommittee: 0.25,
        diversityTargets: 0.15,
        boardEvaluations: 0.0,
        total: 1.5
      },
      auditControls: {
        independentAudit: 1.0,
        noAuditFailures: 0.0,
        riskManagement: 0.2,
        total: 1.2
      },
      shareholderRights: {
        equalVotingRights: 0.8,
        noPoisonPills: 0.5,
        shareholderEngagement: 0.0,
        total: 1.3
      },
      executiveCompensation: {
        performanceLinkedPay: 0.4,
        transparentDisclosures: 0.4,
        sayOnPay: 0.2,
        total: 1.0
      },
      transparencyEthics: {
        esgDisclosures: 0.6,
        antiCorruption: 0.6,
        whistleblowerHotline: 0.5,
        total: 1.7
      },
      total: 6.7
    }
  }
];

/**
 * Helper function to assign random categories
 */
const getRandomCategory = () => {
  const categories = ['Residential', 'Commercial', 'Infrastructure'];
  return categories[Math.floor(Math.random() * categories.length)];
};

/**
 * Get companies with enhanced search and filtering
 */
export const getFilteredCompanies = async (filters = {}) => {
  try {
    let companies = await getAllCompanies();
    
    // Apply search filter
    if (filters.search) {
      companies = companies.filter(company =>
        company.companyName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      companies = companies.filter(company => company.category === filters.category);
    }
    
    // Apply score range filter
    if (filters.minScore) {
      companies = companies.filter(company => company.overallScore >= filters.minScore);
    }
    
    if (filters.maxScore) {
      companies = companies.filter(company => company.overallScore <= filters.maxScore);
    }
    
    // Apply violations filter
    if (filters.hasViolations !== undefined) {
      companies = companies.filter(company => 
        filters.hasViolations ? company.sapaViolations > 0 : company.sapaViolations === 0
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      companies.sort((a, b) => {
        switch (filters.sortBy) {
          case 'score-desc':
            return b.overallScore - a.overallScore;
          case 'score-asc':
            return a.overallScore - b.overallScore;
          case 'name-asc':
            return a.companyName.localeCompare(b.companyName);
          case 'name-desc':
            return b.companyName.localeCompare(a.companyName);
          case 'violations-asc':
            return a.sapaViolations - b.sapaViolations;
          case 'violations-desc':
            return b.sapaViolations - a.sapaViolations;
          default:
            return b.overallScore - a.overallScore;
        }
      });
    }
    
    console.log('🔍 Filtered companies:', companies.length);
    return companies;
  } catch (error) {
    console.error('❌ Error filtering companies:', error);
    return getMockData();
  }
};

/**
 * Clear all existing data (use with caution!)
 */
export const clearAllData = async () => {
  console.warn('⚠️ This function would delete all company data!');
  // Implementation would require querying all documents and deleting them individually
  // Firestore doesn't have a native "delete collection" method
  return { success: false, message: 'Not implemented for safety' };
};

console.log('🔥 Data service initialized');