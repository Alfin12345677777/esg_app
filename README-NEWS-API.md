# News API Integration Setup

Your ESG app is now configured to use real news data from News API (which provides Google News and other sources).

## 🔑 Getting Your API Key

1. **Visit News API**: Go to [https://newsapi.org/](https://newsapi.org/)
2. **Sign Up**: Create a free account
3. **Get API Key**: Copy your API key from the dashboard

## 🛠️ Setup Instructions

1. **Create Environment File**:
   ```bash
   cp .env.example .env
   ```

2. **Add Your API Key**:
   Open `.env` and replace `your_news_api_key_here` with your actual API key:
   ```
   REACT_APP_NEWS_API_KEY=your_actual_api_key_here
   ```

3. **Restart Your App**:
   ```bash
   npm start
   ```

## 📊 How It Works

- **With API Key**: Fetches real news from 80+ sources including Google News
- **Without API Key**: Falls back to mock data (current behavior)
- **Search Terms**: Searches for company-specific ESG and construction news
- **Smart Categorization**: Automatically categorizes articles as Environmental, Social, or Governance
- **Sentiment Analysis**: Analyzes article sentiment based on keywords

## 🎯 News Sources

The News API provides articles from:
- Google News
- Reuters
- BBC
- CNN
- TechCrunch
- And 80+ other sources

## 🔒 Security

- API key is stored in environment variables (never committed to git)
- `.env` file is automatically ignored by git
- Graceful fallback to mock data if API fails

## 💡 Features

- **Real-time News**: Fresh articles updated continuously
- **Company-specific**: Targeted searches for each construction company
- **ESG Focus**: Searches include ESG-related terms
- **Fallback System**: Always works, even without API key
- **Error Handling**: Robust error handling with automatic fallback

## 📝 Free Tier Limits

- **Requests**: 1,000 requests per day
- **Rate Limit**: Perfect for development and small-scale use
- **Sources**: Access to 80+ news sources

Start by getting your free API key and add it to the `.env` file!