exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: 'Method not allowed' 
    };
  }

  try {
    // Get the search query from the request
    const { query } = JSON.parse(event.body);
    
    // Get the API key from Netlify environment variables (kept secret)
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }

    // Call Serper API
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query }),
    });

    const data = await response.json();
    return { 
      statusCode: 200, 
      body: JSON.stringify(data) 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};