// NLP Service for sentiment analysis and ESG topic classification
import Sentiment from 'sentiment';
import { generateScoreExplanation } from './aiService';

// Initialize sentiment analyzer
const sentiment = new Sentiment();

// ESG Keywords in Korean and English
const ESG_KEYWORDS = {
  environmental: {
    positive: ['친환경', '녹색건축', '에너지효율', '탄소중립', '지속가능', '재생에너지', '환경보호', 'LEED', '그린빌딩'],
    negative: ['환경오염', '탄소배출', '대기오염', '수질오염', '환경파괴', '오염물질', '환경위반'],
    weight: 1.2
  },
  social: {
    positive: ['안전관리', '근로자복지', '사회공헌', '지역사회', '일자리창출', '근로환경개선', '사회적책임'],
    negative: ['안전사고', '산업재해', '근로자피해', 'SAPA위반', '안전불감증', '노동분쟁', '인권침해'],
    weight: 1.0
  },
  governance: {
    positive: ['투명경영', '윤리경영', '컴플라이언스', '거버넌스', '준법', '투명성', '책임경영'],
    negative: ['부정부패', '비리', '불법', '위법', '부실시공', '회계부정', '배임', '횡령'],
    weight: 1.1
  }
};

/**
 * Analyze sentiment of text using multiple methods
 */
export const analyzeSentiment = async (text) => {
  try {
    // Basic sentiment analysis
    const basicSentiment = sentiment.analyze(text);
    
    // Korean-specific sentiment analysis
    const koreanSentiment = analyzeKoreanSentiment(text);
    
    // ESG-specific sentiment
    const esgSentiment = analyzeESGSentiment(text);
    
    // Combined score (weighted average)
    const combinedScore = (
      basicSentiment.comparative * 0.3 + 
      koreanSentiment * 0.4 + 
      esgSentiment.overall * 0.3
    );
    
    return {
      overall: Math.max(-1, Math.min(1, combinedScore)), // Normalize to [-1, 1]
      basic: basicSentiment.comparative,
      korean: koreanSentiment,
      esg: esgSentiment,
      confidence: calculateConfidence(text, combinedScore)
    };
    
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      overall: 0,
      basic: 0,
      korean: 0,
      esg: { environmental: 0, social: 0, governance: 0, overall: 0 },
      confidence: 0
    };
  }
};

/**
 * Korean-specific sentiment analysis
 */
const analyzeKoreanSentiment = (text) => {
  const positiveWords = ['좋', '우수', '성공', '개선', '향상', '증가', '발전', '혁신', '효과', '성과'];
  const negativeWords = ['나쁘', '문제', '실패', '악화', '감소', '하락', '피해', '손실', '위험', '우려'];
  
  let score = 0;
  const words = text.split(/\s+/);
  
  words.forEach(word => {
    positiveWords.forEach(positive => {
      if (word.includes(positive)) score += 0.1;
    });
    negativeWords.forEach(negative => {
      if (word.includes(negative)) score -= 0.1;
    });
  });
  
  return Math.max(-1, Math.min(1, score));
};

/**
 * ESG-specific sentiment analysis
 */
const analyzeESGSentiment = (text) => {
  const esgScores = {
    environmental: 0,
    social: 0,
    governance: 0
  };
  
  Object.keys(ESG_KEYWORDS).forEach(category => {
    const keywords = ESG_KEYWORDS[category];
    let categoryScore = 0;
    
    keywords.positive.forEach(keyword => {
      if (text.includes(keyword)) {
        categoryScore += 0.15 * keywords.weight;
      }
    });
    
    keywords.negative.forEach(keyword => {
      if (text.includes(keyword)) {
        categoryScore -= 0.2 * keywords.weight;
      }
    });
    
    esgScores[category] = Math.max(-1, Math.min(1, categoryScore));
  });
  
  const overall = (esgScores.environmental + esgScores.social + esgScores.governance) / 3;
  
  return {
    ...esgScores,
    overall: overall
  };
};

/**
 * Calculate confidence score based on text characteristics
 */
const calculateConfidence = (text, score) => {
  const textLength = text.length;
  const wordCount = text.split(/\s+/).length;
  
  let confidence = 0.5; // Base confidence
  
  // Longer texts generally give more reliable sentiment
  if (textLength > 100) confidence += 0.2;
  if (wordCount > 20) confidence += 0.1;
  
  // Strong sentiment scores indicate higher confidence
  if (Math.abs(score) > 0.5) confidence += 0.2;
  
  return Math.min(1, confidence);
};

/**
 * Classify news articles by ESG categories
 */
export const classifyESGTopics = (articles) => {
  return articles.map(article => {
    const text = `${article.title} ${article.description}`;
    const esgScores = analyzeESGSentiment(text);
    
    // Determine primary category
    const categories = Object.keys(esgScores).filter(key => key !== 'overall');
    const primaryCategory = categories.reduce((max, category) => 
      Math.abs(esgScores[category]) > Math.abs(esgScores[max]) ? category : max
    );
    
    return {
      ...article,
      esgClassification: {
        primary: primaryCategory,
        scores: esgScores,
        confidence: calculateConfidence(text, esgScores.overall)
      }
    };
  });
};

/**
 * Detect risks and opportunities in news articles
 */
export const detectRisksOpportunities = (articles) => {
  const risks = [];
  const opportunities = [];
  
  articles.forEach(article => {
    const sentiment = article.sentiment || 0;
    const text = `${article.title} ${article.description}`;
    
    // Risk detection
    const riskKeywords = [
      '사고', '위반', '문제', '피해', '손실', '위험', '우려', '부정', '불법', 
      '안전사고', '산업재해', '환경오염', 'SAPA위반'
    ];
    
    // Opportunity detection
    const opportunityKeywords = [
      '성장', '확장', '개선', '혁신', '투자', '개발', '성공', '수주', 
      '친환경', '사회공헌', '투명경영', '품질향상'
    ];
    
    const hasRiskKeywords = riskKeywords.some(keyword => text.includes(keyword));
    const hasOpportunityKeywords = opportunityKeywords.some(keyword => text.includes(keyword));
    
    if (hasRiskKeywords || sentiment < -0.3) {
      risks.push({
        article: article,
        riskLevel: sentiment < -0.5 ? 'high' : 'medium',
        keywords: riskKeywords.filter(keyword => text.includes(keyword))
      });
    }
    
    if (hasOpportunityKeywords || sentiment > 0.3) {
      opportunities.push({
        article: article,
        opportunityLevel: sentiment > 0.5 ? 'high' : 'medium',
        keywords: opportunityKeywords.filter(keyword => text.includes(keyword))
      });
    }
  });
  
  return { risks, opportunities };
};

/**
 * Generate comprehensive news analysis using AI
 */
export const generateNewsAnalysis = async (company, newsData) => {
  try {
    const { articles } = newsData;
    if (!articles || articles.length === 0) {
      return {
        success: false,
        analysis: 'No recent news articles found for analysis.',
        summary: null
      };
    }
    
    // Prepare news summary for AI analysis
    const newsSummary = articles.slice(0, 5).map(article => 
      `- ${article.title}: ${article.description}`
    ).join('\n');
    
    const prompt = `You are analyzing recent news coverage for ${company.companyName}, a South Korean construction company.

Recent News Articles:
${newsSummary}

Current ESG Scores:
- Environmental: ${company.e_score}/100
- Social: ${company.s_score}/100  
- Governance: ${company.g_score}/100
- Overall: ${company.overallScore}/100

Provide a news analysis (150-200 words) covering:
1. Overall news sentiment and its potential impact on ESG perception
2. Key ESG-related developments or concerns mentioned in the news
3. How recent news might affect the company's ESG scores
4. Recommendations for stakeholders based on news trends

Keep the analysis professional and suitable for investors.`;

    const aiResult = await generateScoreExplanation({ 
      ...company, 
      newsContext: newsSummary 
    });
    
    return {
      success: true,
      analysis: aiResult.analysis,
      sentiment: calculateOverallSentiment(articles),
      summary: {
        totalArticles: articles.length,
        timeframe: 'Last 30 days',
        keyTopics: extractKeyTopics(articles)
      }
    };
    
  } catch (error) {
    console.error('Error generating news analysis:', error);
    return {
      success: false,
      error: error.message,
      analysis: 'Unable to generate news analysis at this time.'
    };
  }
};

/**
 * Calculate overall sentiment from articles
 */
const calculateOverallSentiment = (articles) => {
  if (!articles || articles.length === 0) return 0;
  
  const totalSentiment = articles.reduce((sum, article) => sum + (article.sentiment || 0), 0);
  return totalSentiment / articles.length;
};

/**
 * Extract key topics from articles
 */
const extractKeyTopics = (articles) => {
  const topicCounts = {};
  
  articles.forEach(article => {
    const category = article.category || 'general';
    topicCounts[category] = (topicCounts[category] || 0) + 1;
  });
  
  return Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic, count]) => ({ topic, count }));
};

console.log('🧠 NLP service initialized');