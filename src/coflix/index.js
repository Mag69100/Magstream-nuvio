import { extractStreams } from './extractor.js';

async function getStreams(tmdbId, mediaType, season, episode) {

  console.log('[Coflix]', tmdbId);

  return await extractStreams(tmdbId, mediaType);

}

module.exports = { getStreams };
