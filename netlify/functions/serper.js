exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: 'Method not allowed' 
    };
  }

  try {
    const { query } = JSON.parse(event.body);
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }

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
