/**
 * DarkiWorld Provider pour Nuvio
 * Adapté depuis GramFlix (CloudStream) par Mag69100
 * Source: https://darkiworld2026.com
 * Note: DarkiWorld a son propre extracteur "BlackInk" dans GramFlix
 */

import { extractAndResolve } from '../extractors/index.js';

const BASE_URL = 'https://darkiworld2026.com';
const PROVIDER_NAME = 'DarkiWorld';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Referer': BASE_URL,
  'Accept-Language': 'fr-FR,fr;q=0.9',
};

async function searchContent(tmdbId, mediaType) {
  // DarkiWorld: recherche via URL directe ou AJAX
  const res = await fetch(`${BASE_URL}/?s=${tmdbId}`, { headers: HEADERS });
  const html = await res.text();
  const links = [];
  const regex = /href="(https?:\/\/darkiworld2026\.com\/[^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const l = match[1];
    if (!l.includes('/page/') && !l.includes('?s=') && l.length > BASE_URL.length + 5) {
      links.push(l);
    }
  }
  return links;
}

async function getPageHtml(pageUrl, season, episode) {
  let url = pageUrl;
  if (season && episode) {
    // DarkiWorld structure: /serie-name/saison-N/episode-N/
    url = `${pageUrl.replace(/\/$/, '')}/saison-${season}/episode-${episode}/`;
  }
  const res = await fetch(url, { headers: HEADERS });
  return { html: await res.text(), url };
}

async function getStreams(tmdbId, mediaType, season, episode) {
  console.log(`[${PROVIDER_NAME}] Recherche ${mediaType} tmdbId=${tmdbId} S${season}E${episode}`);
  try {
    const links = await searchContent(tmdbId, mediaType);
    if (!links.length) { console.log(`[${PROVIDER_NAME}] Aucun résultat`); return []; }
    const { html, url } = await getPageHtml(links[0], season, episode);
    const resolved = await extractAndResolve(html, url, PROVIDER_NAME);
    const streams = resolved.map(r => ({
      name: PROVIDER_NAME,
      title: `${r.quality || 'HD'} VF`,
      url: r.url,
      quality: r.quality || 'HD',
      headers: r.headers || { 'Referer': url },
    }));
    console.log(`[${PROVIDER_NAME}] ${streams.length} stream(s)`);
    return streams;
  } catch (err) {
    console.error(`[${PROVIDER_NAME}] Erreur:`, err.message);
    return [];
  }
}

module.exports = { getStreams };
