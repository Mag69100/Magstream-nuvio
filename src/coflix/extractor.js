const BASE_URL = 'https://coflix.rodeo';

function decodeBase64(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

async function extractStreams(tmdbId, mediaType) {

  const type =
    mediaType === 'movie'
      ? 'movies'
      : 'series';

  const url =
    `${BASE_URL}/wp-json/apiflix/v1/options/?post_type=${type}&sort=1&page=1`;

  const res = await fetch(url);

  const data = await res.json();

  if (!data.results?.length)
    return [];

  const content = data.results[0];

  const player =
    `${BASE_URL}/wp-json/apiflix/v1/playermovie?post_id=${content.uuid}`;

  const playerRes = await fetch(player);

  const playerJson = await playerRes.json();

  const streams = [];

  if (!playerJson.links?.online)
    return streams;

  for (const hoster of playerJson.links.online) {

    const page = await fetch(hoster.link);

    const html = await page.text();

    const matches =
      [...html.matchAll(/showVideo\('([^']+)/g)];

    for (const m of matches) {

      try {

        const decoded = decodeBase64(m[1]);

        streams.push({
          name: 'Coflix',
          title: 'VF',
          url: decoded,
          quality: 'HD'
        });

      } catch(e) {}
    }
  }

  return streams;
}

export {
  extractStreams
};
