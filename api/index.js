// api/index.js
import express from 'express';
import pinterestScraper from 'pinterest-scraper-api';

const app = express();

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Pinterest Search API' });
});

// Main Search Endpoint
app.get('/api/search', async (req, res) => {
  const { query, limit } = req.query;

  // Validate input
  if (!query) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      error: 'Missing required parameter: ?query=your_search_term'
    });
  }

  // Set a default limit if not provided, cap it to prevent abuse
  const resultLimit = Math.min(parseInt(limit) || 20, 50);

  try {
    // Call the scraper
    const images = await pinterestScraper.searchPinterest(query, resultLimit);

    // Return a structured response similar to the OmegaTech format
    res.json({
      statusCode: 200,
      success: true,
      source: 'Pinterest-Scraper',
      data: {
        query: query,
        total: images.length,
        results: images.map(img => ({
          id: img.id,
          title: img.title || 'Untitled Pin',
          imageUrl: img.imageUrl,        // Direct link for downloading/displaying
          originalUrl: img.originalUrl,  // Link to the Pinterest page
          author: img.author,
          dimensions: `${img.width}x${img.height}`
        }))
      }
    });
  } catch (error) {
    // Handle scraper failures gracefully
    console.error('Pinterest scrape failed:', error.message);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: 'Failed to fetch data from Pinterest. The scraper might be rate-limited or the upstream service is down.'
    });
  }
});

// Export the app for Vercel
export default app;
