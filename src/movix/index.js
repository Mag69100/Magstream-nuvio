const { resolveStream } = require('./extractor');

function getStreams(tmdbId, mediaType, season, episode) {

  console.log('[Movix] TMDB:', tmdbId);

  // TEST SIMPLE
  const testUrls = [
    'https://uqload.net/embed-xxxx.html',
    'https://dood.pm/e/xxxx'
  ];

  return Promise.all(
    testUrls.map(url => resolveStream(url))
  )
  .then(results => {
    return results
      .filter(r => r)
      .map(r => ({
        name: 'Movix',
        title: 'Resolved',
        url: r.url,
        quality: 'HD',
        headers: r.headers
      }));
  });
}

module.exports = {
  getStreams
};
