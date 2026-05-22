exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { keywords, includeMetrics = true } = JSON.parse(event.body);
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'SERPER_API_KEY not configured' })
      };
    }

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid keywords array' })
      };
    }

    const results = await Promise.all(
      keywords.map(keyword => analyzeKeyword(keyword, apiKey))
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: results,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function analyzeKeyword(keyword, apiKey) {
  try {
    const searchResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: keyword,
        num: 10
      }),
    });

    const data = await searchResponse.json();

    const serpResults = data.organic || [];
    const searchVolume = data.searchParameters?.totalResults || 0;
    const adResultCount = (data.ads || []).length;

    const difficulty = calculateKeywordDifficulty(serpResults, searchVolume, adResultCount);
    const trafficPotential = calculateTrafficPotential(searchVolume, difficulty);
    const cpc = estimateCPC(keyword, adResultCount > 0);

    return {
      keyword,
      searchVolume: formatNumber(searchVolume),
      difficulty: difficulty.score,
      difficultyLabel: difficulty.label,
      trafficPotential: trafficPotential,
      estimatedCPC: cpc,
      competitionLevel: calculateCompetition(serpResults),
      serpResults: serpResults.slice(0, 10).map((result, idx) => ({
        position: idx + 1,
        title: result.title,
        url: result.link,
        domain: new URL(result.link).hostname,
        description: result.snippet
      })),
      topResult: serpResults[0]?.title || '',
      resultCount: serpResults.length,
      paidAds: adResultCount,
      hasFeatureSnippet: !!data.answerBox || !!data.knowledgeGraph
    };
  } catch (error) {
    return {
      keyword,
      error: error.message,
      searchVolume: 0,
      difficulty: 0,
      trafficPotential: 0
    };
  }
}

function calculateKeywordDifficulty(serpResults, searchVolume, adCount) {
  let score = 0;

  // High domain authority result at top (estimate based on domain reputation)
  if (serpResults.length > 0) {
    const topDomain = serpResults[0]?.link || '';
    if (topDomain.includes('.edu') || topDomain.includes('.gov')) score += 20;
    if (topDomain.includes('wikipedia') || topDomain.includes('amazon')) score += 15;
  }

  // Paid results indicate commercial intent
  if (adCount > 2) score += 20;
  else if (adCount > 0) score += 10;

  // Search volume indicator
  if (searchVolume > 100000) score += 25;
  else if (searchVolume > 10000) score += 15;
  else if (searchVolume > 1000) score += 8;

  // Competition from SERP result count
  if (serpResults.length > 5) score += 15;

  // Cap at 100
  score = Math.min(score, 100);

  let label = 'Low';
  if (score >= 70) label = 'High';
  else if (score >= 40) label = 'Medium';

  return { score, label };
}

function calculateTrafficPotential(searchVolume, difficulty) {
  // Basic traffic potential: high volume + low difficulty = best
  const volumeFactor = Math.log(searchVolume + 1) * 10;
  const difficultyReduction = (100 - difficulty.score) / 10;

  const potential = Math.round(volumeFactor * difficultyReduction);
  return Math.min(potential, 1000);
}

function estimateCPC(keyword, hasAds) {
  if (!hasAds) return '$0.50–$1.00';

  // Simple CPC estimation based on keyword type
  const highCPCTerms = ['insurance', 'loan', 'credit', 'casino', 'bet', 'forex', 'crypto'];
  const mediumCPCTerms = ['software', 'hosting', 'vps', 'seo'];

  const lowerKeyword = keyword.toLowerCase();

  if (highCPCTerms.some(term => lowerKeyword.includes(term))) {
    return '$5.00–$15.00';
  }
  if (mediumCPCTerms.some(term => lowerKeyword.includes(term))) {
    return '$2.00–$5.00';
  }
  return '$0.50–$3.00';
}

function calculateCompetition(serpResults) {
  if (serpResults.length === 0) return 'None';
  if (serpResults.length < 3) return 'Low';
  if (serpResults.length < 7) return 'Medium';
  return 'High';
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
