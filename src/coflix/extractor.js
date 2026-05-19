const BASE_URL = 'https://coflix.dance';

function decodeBase64(str) {
  try {
    return atob(str);
  } catch {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
}

export async function extractStreams(movieId, mediaType, season, episode) {
  try {
    let apiUrl;

    if (mediaType === 'movie') {
      apiUrl = `${BASE_URL}/wp-json/apiflix/v1/playermovie?post_id=${movieId}`;
    } else {
      return [];
    }

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': BASE_URL
      }
    });

    const json = await res.json();

    if (!json.links || !json.links.online) {
      return [];
    }

    const streams = [];

    for (const host of json.links.online) {
      try {
        const pageRes = await fetch(host.link, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Referer': BASE_URL
          }
        });

        const html = await pageRes.text();

        const matches = [...html.matchAll(/showVideo\('([^']+)/g)];

        for (const m of matches) {
          const decoded = decodeBase64(m[1]);

          streams.push({
            name: 'CoFliX',
            title: host.lang || 'VF',
            url: decoded,
            quality: 'HD',
            headers: {
              Referer: BASE_URL,
              'User-Agent': 'Mozilla/5.0'
            }
          });
        }
      } catch (e) {
        console.log('[CoFliX] host error', e.message);
      }
    }

    return streams;

  } catch (e) {
    console.log('[CoFliX] extractor error', e.message);
    return [];
  }
}
