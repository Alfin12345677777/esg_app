// Gemini AI Service for ESG Analysis
const GEMINI_API_KEY = 'AIzaSyD3AYb2bH62nEm_NcF0Rtzi1r4HBhvN0tY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Generate ESG Score Explanation
 */
export const generateScoreExplanation = async (company) => {
  const prompt = `You are an ESG (Environmental, Social, Governance) analyst for South Korean construction companies. 

Analyze this company's ESG performance:
- Company: ${company.companyName}
- Overall ESG Score: ${company.overallScore}/100
- Environmental Score: ${company.e_score}/100  
- Social Score: ${company.s_score}/100
- Governance Score: ${company.g_score}/100
- SAPA Violations: ${company.sapaViolations}

Provide a concise analysis (150-200 words) explaining:
1. Why this company received these specific ESG scores
2. Key strengths and areas for improvement
3. How the SAPA violations (if any) impact the overall assessment
4. Industry context for South Korean construction sector

Keep the tone professional and suitable for investors.`;

  return await callGeminiAPI(prompt);
};

/**
 * Generate Peer Comparison Analysis
 */
export const generatePeerComparison = async (company, industryData) => {
  const industryAverage = Math.round(industryData.reduce((sum, c) => sum + c.overallScore, 0) / industryData.length);
  const topCompany = industryData[0]; // Assuming sorted by score
  const rank = industryData.findIndex(c => c.id === company.id) + 1;

  const prompt = `You are an ESG analyst comparing South Korean construction companies.

Target Company:
- ${company.companyName}: Overall Score ${company.overallScore} (E:${company.e_score}, S:${company.s_score}, G:${company.g_score})

Industry Context:
- Industry Average: ${industryAverage}
- Industry Leader: ${topCompany.companyName} with score ${topCompany.overallScore}
- Company Ranking: #${rank} out of ${industryData.length}

Provide a comparison analysis (150-200 words) covering:
1. How this company performs vs industry average and leaders
2. Specific ESG areas where it excels or lags behind peers
3. Competitive positioning in the Korean construction market
4. Key differentiators compared to top performers

Focus on actionable insights for investors.`;

  return await callGeminiAPI(prompt);
};

/**
 * Generate Investment Recommendation
 */
export const generateInvestmentRecommendation = async (company, industryData) => {
  const rank = industryData.findIndex(c => c.id === company.id) + 1;

  const prompt = `You are an investment advisor specializing in ESG-focused investments in South Korean construction.

Company Profile:
- ${company.companyName}
- ESG Score: ${company.overallScore}/100 (E:${company.e_score}, S:${company.s_score}, G:${company.g_score})
- SAPA Violations: ${company.sapaViolations}
- Industry Ranking: #${rank}

Provide an investment recommendation (150-200 words) including:
1. ESG investment thesis (Buy/Hold/Avoid with reasoning)
2. Key ESG risks and opportunities
3. Alignment with sustainable investment criteria
4. Regulatory compliance outlook in South Korea
5. Timeline for potential ESG improvements

Tailor advice for institutional investors focused on sustainable construction sector investments.`;

  return await callGeminiAPI(prompt);
};

/**
 * Core Gemini API call function
 */
const callGeminiAPI = async (prompt) => {
  try {
    console.log('🤖 Calling Gemini AI API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('✅ AI analysis generated successfully');
      return {
        success: true,
        analysis: aiResponse,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

  } catch (error) {
    console.error('❌ Gemini AI API Error:', error);
    return {
      success: false,
      error: error.message,
      analysis: 'Sorry, AI analysis is temporarily unavailable. Please try again later.'
    };
  }
};

/**
 * Test API connection
 */
export const testGeminiConnection = async () => {
  const testPrompt = "Hello, please respond with 'ESG AI Service is working correctly' if you can read this.";
  return await callGeminiAPI(testPrompt);
};

console.log('🤖 Gemini AI service initialized');