/**
 * _template Provider pour Nuvio
 * Copiez ce fichier dans src/<nom-provider>/index.js
 * et adaptez-le à votre source.
 *
 * Pour builder: node build.js <nom-provider>
 */

// import { someHelper } from './helpers.js'; // Si multi-fichiers

const BASE_URL = 'https://example.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Referer': BASE_URL,
  'Accept-Language': 'fr-FR,fr;q=0.9',
};

/**
 * Recherche le contenu par TMDB ID
 * @returns {Promise<string[]>} Liste d'URLs de pages
 */
async function searchContent(tmdbId, mediaType) {
  const res = await fetch(`${BASE_URL}/?s=${tmdbId}`, { headers: HEADERS });
  const html = await res.text();

  const links = [];
  const regex = /href="(https?:\/\/example\.com\/[^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }

  return links;
}

/**
 * Extrait les streams depuis une page
 * @returns {Promise<Object[]>} Liste d'objets stream
 */
async function extractStreams(pageUrl, season, episode) {
  // Adapter l'URL pour les séries
  if (season && episode) {
    pageUrl = `${pageUrl}saison-${season}/episode-${episode}/`;
  }

  const res = await fetch(pageUrl, { headers: HEADERS });
  const html = await res.text();

  const streams = [];

  // Adapter le regex selon le site
  const regex = /(?:src|data-src)="(https?:\/\/[^"]*(?:player|embed|stream)[^"]*)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (!url.includes('google') && !url.includes('facebook')) {
      streams.push({
        name: 'ProviderName',        // Nom du provider
        title: 'VF',                 // Label affiché (VF, VOSTFR, 1080p, etc.)
        url: url,                    // URL du stream ou du player
        quality: 'HD',               // Qualité estimée
        headers: {
          'Referer': pageUrl,
          'User-Agent': HEADERS['User-Agent'],
        },
      });
    }
  }

  return streams;
}

/**
 * Point d'entrée Nuvio - NE PAS RENOMMER
 * @param {string} tmdbId - ID TMDB (ex: "872585")
 * @param {string} mediaType - "movie" ou "tv"
 * @param {number|null} season - Numéro de saison
 * @param {number|null} episode - Numéro d'épisode
 * @returns {Promise<Object[]>} Tableau de streams
 */
async function getStreams(tmdbId, mediaType, season, episode) {
  console.log(`[ProviderName] Recherche ${mediaType} ${tmdbId}`);

  try {
    const links = await searchContent(tmdbId, mediaType);
    if (!links.length) {
      console.log('[ProviderName] Aucun résultat');
      return [];
    }

    const streams = await extractStreams(links[0], season, episode);
    console.log(`[ProviderName] ${streams.length} stream(s) trouvé(s)`);
    return streams;
  } catch (err) {
    console.error('[ProviderName] Erreur:', err.message);
    return [];
  }
}

module.exports = { getStreams };
