import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Import JSON data to Firestore
 * This utility will upload your JSON data to the companies collection
 */
export const importJSONData = async (jsonData) => {
  try {
    console.log('🚀 Starting data import...', jsonData.length, 'companies');
    
    const results = [];
    
    for (const company of jsonData) {
      try {
        // Create a document ID from the company name (slug format)
        const docId = company.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        // Add metadata
        const companyData = {
          ...company,
          slug: docId,
          category: company.category || getRandomCategory(),
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          importedAt: new Date().toISOString()
        };
        
        // Use setDoc to create with custom ID
        await setDoc(doc(db, 'companies', docId), companyData);
        
        console.log('✅ Imported:', company.companyName);
        results.push({ success: true, company: company.companyName, id: docId });
        
      } catch (error) {
        console.error('❌ Failed to import:', company.companyName, error);
        results.push({ success: false, company: company.companyName, error: error.message });
      }
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`🎉 Import complete: ${successful} successful, ${failed} failed`);
    
    return {
      success: true,
      total: jsonData.length,
      successful,
      failed,
      results
    };
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Helper function to assign random categories for demo
 */
const getRandomCategory = () => {
  const categories = ['Residential', 'Commercial', 'Infrastructure'];
  return categories[Math.floor(Math.random() * categories.length)];
};

/**
 * Sample JSON data structure for reference
 */
export const sampleJSONStructure = [
  {
    "companyName": "Samsung C&T",
    "overallScore": 8.5,
    "e_score": 8.8,
    "s_score": 9.0,
    "g_score": 8.0,
    "sapaViolations": 0,
    "category": "Commercial",
    "environmental": {
      "carbonScore": {
        "score": 4.5,
        "source": "",
        "description": ""
      },
      "energyScore": {
        "score": 4.3,
        "source": "",
        "description": ""
      },
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
  },
  {
    "companyName": "Hyundai E&C", 
    "overallScore": 7.8,
    "e_score": 8.2,
    "s_score": 7.5,
    "g_score": 7.9,
    "sapaViolations": 1,
    "category": "Infrastructure",
    "environmental": {
      "carbonScore": {
        "score": 4.2,
        "source": "",
        "description": ""
      },
      "energyScore": {
        "score": 4.0,
        "source": "",
        "description": ""
      },
      "total": 8.2
    },
    "social": {
      "workplaceSafety": {
        "noFatalIncidents": 1.4,
        "safetyCertifications": 0.6,
        "safetyTraining": 0.4,
        "iso45001Certification": 0.2,
        "total": 2.6
      },
      "laborPractices": {
        "noLaborViolations": 0.8,
        "laborWelfarePolicy": 0.7,
        "grievanceSystem": 0.5,
        "total": 2.0
      },
      "workerWellbeing": {
        "healthWellnessPrograms": 0.5,
        "diversityInclusion": 0.4,
        "employeeRetention": 0.6,
        "total": 1.5
      },
      "communityImpact": {
        "noCommunityComplaints": 0.8,
        "communityEngagement": 0.6,
        "csrProjects": 0.0,
        "total": 1.4
      },
      "total": 7.5
    },
    "governance": {
      "boardStructure": {
        "independentBoard": 0.8,
        "separateCeoChair": 0.5,
        "esgCommittee": 0.25,
        "diversityTargets": 0.2,
        "boardEvaluations": 0.0,
        "total": 1.75
      },
      "auditControls": {
        "independentAudit": 1.0,
        "noAuditFailures": 0.2,
        "riskManagement": 0.3,
        "total": 1.5
      },
      "shareholderRights": {
        "equalVotingRights": 0.8,
        "noPoisonPills": 0.5,
        "shareholderEngagement": 0.0,
        "total": 1.3
      },
      "executiveCompensation": {
        "performanceLinkedPay": 0.4,
        "transparentDisclosures": 0.4,
        "sayOnPay": 0.2,
        "total": 1.0
      },
      "transparencyEthics": {
        "esgDisclosures": 0.6,
        "antiCorruption": 0.6,
        "whistleblowerHotline": 0.15,
        "total": 1.35
      },
      "total": 7.9
    }
  },
  {
    "companyName": "Daewoo E&C",
    "overallScore": 7.2,
    "e_score": 7.0,
    "s_score": 7.5,
    "g_score": 7.1,
    "sapaViolations": 0,
    "category": "Residential",
    "environmental": {
      "carbonScore": {
        "score": 3.5,
        "source": "",
        "description": ""
      },
      "energyScore": {
        "score": 3.5,
        "source": "",
        "description": ""
      },
      "total": 7.0
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
        "laborWelfarePolicy": 0.5,
        "grievanceSystem": 0.3,
        "total": 1.8
      },
      "workerWellbeing": {
        "healthWellnessPrograms": 0.7,
        "diversityInclusion": 0.4,
        "employeeRetention": 0.3,
        "total": 1.4
      },
      "communityImpact": {
        "noCommunityComplaints": 1.0,
        "communityEngagement": 0.3,
        "csrProjects": 0.0,
        "total": 1.3
      },
      "total": 7.5
    },
    "governance": {
      "boardStructure": {
        "independentBoard": 0.6,
        "separateCeoChair": 0.5,
        "esgCommittee": 0.25,
        "diversityTargets": 0.15,
        "boardEvaluations": 0.0,
        "total": 1.5
      },
      "auditControls": {
        "independentAudit": 1.0,
        "noAuditFailures": 0.0,
        "riskManagement": 0.3,
        "total": 1.3
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
        "whistleblowerHotline": 0.25,
        "total": 1.45
      },
      "total": 7.1
    }
  }
];

/**
 * Clear all existing data (use with caution!)
 */
export const clearAllData = async () => {
  console.warn('⚠️ This will delete all company data!');
  // Implementation would go here if needed
  // Note: Firestore doesn't have a native "delete collection" method
  // You'd need to query all documents and delete them individually
};

console.log('📊 Data importer utility loaded');