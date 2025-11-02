// News Service for fetching and analyzing company-related news
import axios from 'axios';

// News API Configuration
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY || 'demo-key';

// Use backend proxy for News API to avoid CORS issues
const USE_BACKEND_PROXY = true;

// Company name mappings for better search results (kept for News API fallback)
const COMPANY_SEARCH_TERMS = {
  'samsung-ct': 'Samsung C&T construction ESG',
  'hyundai-ec': 'Hyundai Engineering Construction ESG',
  'daewoo-ec': 'Daewoo Engineering Construction ESG',
  'gs-ec': 'GS Engineering Construction ESG',
  'lotte-ec': 'Lotte Engineering Construction ESG'
};

// Mock news data for development (since we need API keys for real news APIs)
const MOCK_NEWS_DATA = {
  'samsung-ct': [
    {
      id: 1,
      title: 'Samsung C&T Strengthens ESG Management Through Eco-Friendly Construction Technology',
      description: 'Samsung C&T is strengthening its ESG management by developing eco-friendly construction technologies for carbon neutrality.',
      url: 'https://example.com/news1',
      publishedAt: '2024-08-20T10:00:00Z',
      source: { name: 'Chosun Ilbo' },
      sentiment: 0.8,
      category: 'environmental'
    },
    {
      id: 2,
      title: 'Samsung C&T Implements Zero Accident Campaign at Construction Sites',
      description: 'Samsung C&T is implementing a zero accident campaign to prevent workplace accidents and investing in worker safety.',
      url: 'https://example.com/news2',
      publishedAt: '2024-08-19T14:30:00Z',
      source: { name: 'JoongAng Ilbo' },
      sentiment: 0.6,
      category: 'social'
    },
    {
      id: 3,
      title: 'Samsung C&T Enhances Shareholder Value Through Transparent Governance',
      description: 'Samsung C&T is enhancing shareholder value and pursuing sustainable growth through transparent governance structures.',
      url: 'https://example.com/news3',
      publishedAt: '2024-08-18T09:15:00Z',
      source: { name: 'Korea Economic Daily' },
      sentiment: 0.7,
      category: 'governance'
    }
  ],
  'hyundai-ec': [
    {
      id: 4,
      title: 'Safety Accident Occurs at Hyundai E&C Construction Site',
      description: 'A safety accident occurred at a major Hyundai E&C construction site, injuring two workers.',
      url: 'https://example.com/news4',
      publishedAt: '2024-08-21T16:45:00Z',
      source: { name: 'Yonhap News' },
      sentiment: -0.6,
      category: 'social'
    },
    {
      id: 5,
      title: 'Hyundai E&C Practices Environmental Management with Green Building Certification',
      description: 'Hyundai E&C is practicing environmental management by completing eco-friendly buildings with green building certification.',
      url: 'https://example.com/news5',
      publishedAt: '2024-08-20T11:20:00Z',
      source: { name: 'Maeil Business' },
      sentiment: 0.5,
      category: 'environmental'
    },
    {
      id: 6,
      title: 'Hyundai E&C Leads Industry with Smart Construction Technology',
      description: 'Hyundai E&C is leading the construction industry by introducing smart construction technology utilizing AI and IoT.',
      url: 'https://example.com/news6',
      publishedAt: '2024-08-17T13:15:00Z',
      source: { name: 'Kyunghyang Shinmun' },
      sentiment: 0.7,
      category: 'governance'
    }
  ],
  'daewoo-ec': [
    {
      id: 7,
      title: 'Daewoo E&C Leaps to Global Construction Company with Overseas Projects',
      description: 'Daewoo E&C is growing into a global construction company by securing major infrastructure projects in the Middle East and Southeast Asia.',
      url: 'https://example.com/news7',
      publishedAt: '2024-08-22T09:30:00Z',
      source: { name: 'Seoul Economic Daily' },
      sentiment: 0.6,
      category: 'governance'
    },
    {
      id: 8,
      title: 'Daewoo E&C Minimizes Environmental Impact with Eco-Friendly Construction Methods',
      description: 'Daewoo E&C is leading in minimizing environmental impact by developing new eco-friendly construction methods.',
      url: 'https://example.com/news8',
      publishedAt: '2024-08-16T11:45:00Z',
      source: { name: 'Edaily' },
      sentiment: 0.8,
      category: 'environmental'
    }
  ],
  'gs-ec': [
    {
      id: 9,
      title: 'GS E&C Introduces Worker Welfare Improvement Program at Construction Sites',
      description: 'GS E&C is attracting industry attention by introducing a comprehensive program to improve welfare for construction site workers.',
      url: 'https://example.com/news9',
      publishedAt: '2024-08-21T14:20:00Z',
      source: { name: 'Financial News' },
      sentiment: 0.7,
      category: 'social'
    },
    {
      id: 10,
      title: 'GS E&C Construction Temporarily Suspended Due to Safety Accident',
      description: 'A project has been temporarily suspended due to a safety accident that occurred at a GS E&C construction site.',
      url: 'https://example.com/news10',
      publishedAt: '2024-08-15T16:30:00Z',
      source: { name: 'Newsis' },
      sentiment: -0.8,
      category: 'social'
    }
  ],
  'lotte-ec': [
    {
      id: 11,
      title: 'Lotte E&C Creates Future Cities with Innovative Residential Complex Development',
      description: 'Lotte E&C is contributing to future city development by creating innovative residential complexes with smart technology and eco-friendly design.',
      url: 'https://example.com/news11',
      publishedAt: '2024-08-19T10:15:00Z',
      source: { name: 'Money Today' },
      sentiment: 0.6,
      category: 'environmental'
    },
    {
      id: 12,
      title: 'Lotte E&C Improves Shareholder Trust Through Transparent Management',
      description: 'Lotte E&C has significantly improved shareholder trust through transparent management policies and active information disclosure.',
      url: 'https://example.com/news12',
      publishedAt: '2024-08-14T15:45:00Z',
      source: { name: 'Business Watch' },
      sentiment: 0.5,
      category: 'governance'
    }
  ]
};

/**
 * Fetch news articles for a specific company using backend proxy or News API
 */
export const fetchCompanyNews = async (companyId, timeRange = '1M') => {
  try {
    console.log(`📰 Fetching news for company: ${companyId}`);
    
    // Use backend proxy if available
    if (USE_BACKEND_PROXY) {
      console.log('📰 Using backend proxy for News API (CORS bypass)');
      
      try {
        // Try to call backend proxy endpoint
        const proxyResponse = await axios.get(`http://localhost:3001/api/news/${companyId}`, {
          params: {
            timeRange: timeRange
          },
          timeout: 10000 // 10 second timeout
        });
        
        if (proxyResponse.data && proxyResponse.data.success) {
          console.log(`📰 Backend proxy returned ${proxyResponse.data.articles?.length || 0} articles`);
          return proxyResponse.data;
        }
        
        console.log('📰 Backend proxy failed or returned no data, falling back to mock data');
      } catch (proxyError) {
        console.log('📰 Backend proxy not available:', proxyError.message);
        console.log('📰 This is expected in development. Falling back to mock data.');
      }
    }
    
    // Direct News API call (will likely fail due to CORS, but kept for reference)
    console.log(`📰 Trying direct News API call. API Key exists: ${!!NEWS_API_KEY && NEWS_API_KEY !== 'demo-key'}`);
    
    // Check if we have a valid API key
    if (!NEWS_API_KEY || NEWS_API_KEY === 'demo-key') {
      console.log('📰 No API key found, using mock data');
      return fetchMockNews(companyId, timeRange);
    }
    
    // Get search term for the company
    const searchTerm = COMPANY_SEARCH_TERMS[companyId] || `${companyId} construction ESG`;
    
    // Calculate date range
    const toDate = new Date();
    const fromDate = new Date();
    if (timeRange === '1W') fromDate.setDate(fromDate.getDate() - 7);
    else if (timeRange === '1M') fromDate.setMonth(fromDate.getMonth() - 1);
    else if (timeRange === '3M') fromDate.setMonth(fromDate.getMonth() - 3);
    else fromDate.setMonth(fromDate.getMonth() - 1); // default 1 month
    
    // Fetch from News API (will likely fail due to CORS)
    console.log(`📰 Making direct API request for: ${searchTerm}`);
    const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
      params: {
        q: searchTerm,
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
        sortBy: 'publishedAt',
        pageSize: 20,
        language: 'en'
      },
      headers: {
        'X-API-Key': NEWS_API_KEY
      }
    });
    
    console.log(`📰 API Response status: ${response.data.status}`);
    
    if (response.data.status !== 'ok') {
      throw new Error(`News API error: ${response.data.message}`);
    }
    
    // Transform News API response to our format
    const articles = response.data.articles.map((article, index) => ({
      id: index + 1,
      title: article.title,
      description: article.description || article.content?.substring(0, 200) + '...',
      url: article.url,
      publishedAt: article.publishedAt,
      source: { name: article.source.name },
      sentiment: calculateSentiment(article.title + ' ' + (article.description || '')),
      category: categorizeArticle(article.title + ' ' + (article.description || ''))
    })).filter(article => article.title && article.title !== '[Removed]');
    
    return {
      success: true,
      articles: articles,
      totalCount: articles.length,
      timeRange: timeRange,
      lastUpdated: new Date().toISOString(),
      source: 'News API (Direct)'
    };
    
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    console.log('📰 Error details:', error.message);
    
    // Check if it's a CORS error
    if (error.message.includes('CORS') || error.code === 'ERR_BLOCKED_BY_RESPONSE') {
      console.log('📰 CORS error detected - News API blocks direct browser requests');
      console.log('📰 Backend proxy is recommended for production. Using mock data for now.');
    }
    
    // Fallback to mock data on error
    console.log('📰 Falling back to mock data due to API error');
    return fetchMockNews(companyId, timeRange);
  }
};

/**
 * Real news API integration (commented out for demo)
 */
/*
const NAVER_NEWS_API = 'https://openapi.naver.com/v1/search/news.json';
const NAVER_CLIENT_ID = 'your-naver-client-id';
const NAVER_CLIENT_SECRET = 'your-naver-client-secret';

export const fetchRealNews = async (companyName, count = 20) => {
  try {
    const response = await axios.get(NAVER_NEWS_API, {
      params: {
        query: `${companyName} 건설`,
        display: count,
        start: 1,
        sort: 'date'
      },
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
      }
    });

    return response.data.items.map(item => ({
      title: item.title.replace(/<[^>]*>/g, ''), // Remove HTML tags
      description: item.description.replace(/<[^>]*>/g, ''),
      url: item.link,
      publishedAt: item.pubDate,
      source: { name: 'Naver News' }
    }));
  } catch (error) {
    console.error('Error fetching real news:', error);
    throw error;
  }
};
*/

/**
 * Get news summary statistics
 */
export const getNewsSummary = (articles) => {
  if (!articles || articles.length === 0) {
    return {
      totalArticles: 0,
      sentimentAverage: 0,
      categoryBreakdown: {},
      recentActivity: 0
    };
  }

  const totalArticles = articles.length;
  const sentimentSum = articles.reduce((sum, article) => sum + (article.sentiment || 0), 0);
  const sentimentAverage = sentimentSum / totalArticles;

  const categoryBreakdown = articles.reduce((breakdown, article) => {
    const category = article.category || 'general';
    breakdown[category] = (breakdown[category] || 0) + 1;
    return breakdown;
  }, {});

  // Count articles from last 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentActivity = articles.filter(article => 
    new Date(article.publishedAt) > oneWeekAgo
  ).length;

  return {
    totalArticles,
    sentimentAverage: Math.round(sentimentAverage * 100) / 100,
    categoryBreakdown,
    recentActivity
  };
};

/**
 * Get sentiment label based on score
 */
export const getSentimentLabel = (score) => {
  if (score > 0.3) return { label: 'Positive', color: '#4CAF50', icon: '😊' };
  if (score < -0.3) return { label: 'Negative', color: '#f44336', icon: '😟' };
  return { label: 'Neutral', color: '#FF9800', icon: '😐' };
};

/**
 * Get ESG category in English
 */
export const getESGCategoryKorean = (category) => {
  const categories = {
    environmental: 'Environmental (E)',
    social: 'Social (S)',
    governance: 'Governance (G)',
    general: 'General'
  };
  return categories[category] || 'General';
};

/**
 * Generate generic construction industry news for companies without specific news data
 */
const getGenericConstructionNews = () => {
  return [
    {
      id: Date.now() + 1,
      title: 'Construction Industry Strengthens Sustainability with ESG Management',
      description: 'Major domestic construction companies are pursuing sustainable growth through environmental, social, and governance (ESG) management.',
      url: 'https://example.com/generic-news1',
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      source: { name: 'Construction Economy' },
      sentiment: 0.5,
      category: 'governance'
    },
    {
      id: Date.now() + 2,
      title: 'Construction Site Safety Management Strengthened, Industry-Wide Safety Culture Spreads',
      description: 'The construction industry is actively introducing systematic safety management systems to prevent safety accidents.',
      url: 'https://example.com/generic-news2',
      publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      source: { name: 'Safety News' },
      sentiment: 0.6,
      category: 'social'
    },
    {
      id: Date.now() + 3,
      title: 'Eco-Friendly Construction Technology Adoption Accelerates Carbon Neutral Goals',
      description: 'The construction industry is contributing to achieving carbon neutral goals through the use of eco-friendly building technologies and materials.',
      url: 'https://example.com/generic-news3',
      publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      source: { name: 'Green Building' },
      sentiment: 0.7,
      category: 'environmental'
    }
  ];
};

/**
 * Fallback to mock data when API is not available
 */
const fetchMockNews = async (companyId, timeRange) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  let newsData = MOCK_NEWS_DATA[companyId] || [];
  
  // If no specific news data exists for this company, provide generic construction industry news
  if (newsData.length === 0) {
    newsData = getGenericConstructionNews();
  }
  
  return {
    success: true,
    articles: newsData,
    totalCount: newsData.length,
    timeRange: timeRange,
    lastUpdated: new Date().toISOString(),
    source: 'Mock Data'
  };
};

/**
 * Simple sentiment analysis based on keywords
 */
const calculateSentiment = (text) => {
  const positiveWords = ['success', 'growth', 'improvement', 'innovation', 'achievement', 'efficient', 'sustainable', 'green', 'safe', 'award', 'positive', 'benefit', 'advance', 'excel'];
  const negativeWords = ['accident', 'violation', 'penalty', 'failure', 'loss', 'decline', 'problem', 'issue', 'concern', 'risk', 'negative', 'damage', 'crisis', 'controversy'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.1;
  });
  
  // Normalize score to -1 to 1 range
  return Math.max(-1, Math.min(1, score));
};

/**
 * Categorize article based on content
 */
const categorizeArticle = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('environment') || lowerText.includes('green') || lowerText.includes('carbon') || lowerText.includes('sustainable') || lowerText.includes('renewable')) {
    return 'environmental';
  }
  
  if (lowerText.includes('worker') || lowerText.includes('safety') || lowerText.includes('social') || lowerText.includes('community') || lowerText.includes('welfare') || lowerText.includes('employment')) {
    return 'social';
  }
  
  if (lowerText.includes('governance') || lowerText.includes('management') || lowerText.includes('shareholder') || lowerText.includes('transparent') || lowerText.includes('compliance') || lowerText.includes('board')) {
    return 'governance';
  }
  
  return 'general';
};

console.log(`📰 News service initialized - Backend Proxy: ${USE_BACKEND_PROXY ? 'ENABLED' : 'DISABLED'}`);