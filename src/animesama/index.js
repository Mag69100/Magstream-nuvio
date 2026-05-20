/**
 * Anime-Sama Provider pour Nuvio
 * Adapté depuis GramFlix (CloudStream) par Mag69100
 * Source: https://anime-sama.to
 */

import { resolveStream } from '../extractors/index.js';

const BASE_URL = 'https://anime-sama.to';
const PROVIDER_NAME = 'AnimeSama';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Referer': BASE_URL,
  'Accept-Language': 'fr-FR,fr;q=0.9',
};

async function getAnimeName(tmdbId) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?language=fr-FR`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    return data.name || data.original_name || String(tmdbId);
  } catch {
    return String(tmdbId);
  }
}

async function searchAnime(query) {
  const res = await fetch(`${BASE_URL}/?s=${encodeURIComponent(query)}`, { headers: HEADERS });
  const html = await res.text();
  const links = [];
  const regex = /href="(https?:\/\/anime-sama\.to\/catalogue\/[^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (!links.includes(match[1])) links.push(match[1]);
  }
  return links;
}

async function getEpisodePlayers(animeUrl, season, episode) {
  // Anime-Sama: /catalogue/<slug>/saison<N>/ep<N>/
  const epUrl = season && episode
    ? `${animeUrl.replace(/\/$/, '')}/saison${season}/ep${episode}/`
    : animeUrl;

  const res = await fetch(epUrl, { headers: HEADERS });
  const html = await res.text();

  const playerUrls = [];

  // Players connus utilisés par Anime-Sama
  const knownPlayers = ['sendvid', 'sibnet', 'myvi', 'vidmoly', 'doodstream',
    'streamtape', 'voe.sx', 'filemoon', 'streamwish', 'upstream'];

  const regex = /(?:src|data-src)="(https?:\/\/[^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (knownPlayers.some(p => url.includes(p))) {
      playerUrls.push(url);
    }
  }

  return { playerUrls, epUrl };
}

async function getStreams(tmdbId, mediaType, season, episode) {
  console.log(`[${PROVIDER_NAME}] Recherche ${mediaType} tmdbId=${tmdbId} S${season}E${episode}`);

  if (mediaType !== 'tv') return [];

  try {
    const name = await getAnimeName(tmdbId);
    const animeLinks = await searchAnime(name);
    if (!animeLinks.length) { console.log(`[${PROVIDER_NAME}] Aucun anime trouvé pour: ${name}`); return []; }

    const { playerUrls, epUrl } = await getEpisodePlayers(animeLinks[0], season, episode);
    console.log(`[${PROVIDER_NAME}] ${playerUrls.length} player(s) trouvé(s)`);

    const streams = [];
    for (const playerUrl of playerUrls) {
      const resolved = await resolveStream(playerUrl, PROVIDER_NAME);
      if (resolved && resolved.url) {
        const lang = playerUrl.includes('vostfr') ? 'VOSTFR' : 'VF';
        streams.push({
          name: PROVIDER_NAME,
          title: `${resolved.quality || 'HD'} ${lang}`,
          url: resolved.url,
          quality: resolved.quality || 'HD',
          headers: resolved.headers || { 'Referer': epUrl },
        });
      }
    }

    console.log(`[${PROVIDER_NAME}] ${streams.length} stream(s) résolus`);
    return streams;
  } catch (err) {
    console.error(`[${PROVIDER_NAME}] Erreur:`, err.message);
    return [];
  }
}

module.exports = { getStreams };
