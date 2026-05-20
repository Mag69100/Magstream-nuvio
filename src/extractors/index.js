/**
 * Extracteurs GramFlix pour Nuvio
 * Orchestrateur principal - sélectionne et applique le bon extracteur
 * selon l'URL du player embarqué.
 *
 * Usage:
 *   import { resolveStream } from '../extractors/index.js';
 *   const stream = await resolveStream(playerUrl);
 */

import { canHandle as doodCan, extract as extractDood } from './doodstream.js';
import { canHandle as tapeCan, extract as extractStreamtape } from './streamtape.js';
import { canHandle as sendvidCan, extract as extractSendvid } from './sendvid.js';
import { canHandle as sibnetCan, extract as extractSibnet } from './sibnet.js';
import { canHandle as vidmolyCan, extract as extractVidmoly } from './vidmoly.js';
import { canHandle as filemoonCan, extract as extractFilemoon } from './filemoon.js';
import { canHandle as streamwishCan, extract as extractStreamwish } from './streamwish.js';
import { canHandle as voeCan, extract as extractVoe } from './voe.js';
import { canHandle as frembedCan, extract as extractFrembed } from './frembed.js';
import { canHandle as genericCan, extract as extractGeneric } from './generic.js';

var EXTRACTORS = [
  { name: 'Doodstream',  canHandle: doodCan,       extract: extractDood },
  { name: 'Streamtape',  canHandle: tapeCan,        extract: extractStreamtape },
  { name: 'Sendvid',     canHandle: sendvidCan,     extract: extractSendvid },
  { name: 'Sibnet',      canHandle: sibnetCan,      extract: extractSibnet },
  { name: 'Vidmoly',     canHandle: vidmolyCan,     extract: extractVidmoly },
  { name: 'Filemoon',    canHandle: filemoonCan,    extract: extractFilemoon },
  { name: 'Streamwish',  canHandle: streamwishCan,  extract: extractStreamwish },
  { name: 'VOE',         canHandle: voeCan,         extract: extractVoe },
  { name: 'Frembed',     canHandle: frembedCan,     extract: extractFrembed },
  { name: 'Generic',     canHandle: genericCan,     extract: extractGeneric },
];

/**
 * Résout un URL de player embarqué en lien de stream direct.
 * @param {string} playerUrl - URL du player (iframe src)
 * @param {string} providerName - Nom du provider parent (pour logs)
 * @returns {Promise<Object|null>} Objet stream ou null si non résolu
 */
async function resolveStream(playerUrl, providerName) {
  if (!playerUrl || !playerUrl.startsWith('http')) return null;

  for (var i = 0; i < EXTRACTORS.length; i++) {
    var extractor = EXTRACTORS[i];
    if (extractor.canHandle(playerUrl)) {
      console.log('[Extractor] ' + (providerName || '') + ' → ' + extractor.name + ' pour ' + playerUrl);
      try {
        var result = await extractor.extract(playerUrl);
        if (result && result.url) {
          return result;
        }
      } catch (err) {
        console.error('[Extractor] ' + extractor.name + ' erreur:', err.message);
      }
    }
  }

  console.log('[Extractor] Aucun extracteur trouvé pour:', playerUrl);
  return null;
}

/**
 * Résout plusieurs URLs de players en parallèle.
 * @param {string[]} playerUrls - Liste d'URLs de players
 * @param {string} providerName - Nom du provider
 * @returns {Promise<Object[]>} Liste de streams résolus
 */
async function resolveStreams(playerUrls, providerName) {
  var results = [];

  for (var i = 0; i < playerUrls.length; i++) {
    var stream = await resolveStream(playerUrls[i], providerName);
    if (stream) results.push(stream);
  }

  return results;
}

/**
 * Extrait tous les iframes/players d'une page HTML et les résout.
 * @param {string} html - Contenu HTML de la page
 * @param {string} pageUrl - URL de la page (pour le Referer)
 * @param {string} providerName - Nom du provider
 * @returns {Promise<Object[]>} Streams résolus
 */
async function extractAndResolve(html, pageUrl, providerName) {
  var playerUrls = [];

  // Collecter tous les iframes
  var iframeRegex = /(?:src|data-src)\s*=\s*["']([^"']+)["']/gi;
  var match;
  while ((match = iframeRegex.exec(html)) !== null) {
    var url = match[1];
    if (isLikelyPlayer(url)) {
      playerUrls.push(url);
    }
  }

  // Collecter les liens directs m3u8/mp4
  var directRegex = /"(?:file|src|source|url)"\s*:\s*"(https?:\/\/[^"]+\.(?:m3u8|mp4)[^"]*)"/gi;
  while ((match = directRegex.exec(html)) !== null) {
    var directUrl = match[1];
    playerUrls.push(directUrl);
  }

  // Dédupliquer
  playerUrls = playerUrls.filter(function(url, index, self) {
    return self.indexOf(url) === index;
  });

  console.log('[Extractor] ' + playerUrls.length + ' player(s) trouvé(s) sur la page');

  // Résoudre en parallèle (max 5 simultanés)
  var streams = [];
  for (var i = 0; i < playerUrls.length; i++) {
    var stream = await resolveStream(playerUrls[i], providerName);
    if (stream) {
      stream.sourceUrl = playerUrls[i];
      streams.push(stream);
    }
  }

  return streams;
}

function isLikelyPlayer(url) {
  if (!url.startsWith('http')) return false;
  var blocked = [
    'google.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'disqus.com', 'analytics', 'ads.', 'doubleclick', 'cloudflare.com',
    'googleapis.com', 'gstatic.com', 'gravatar.com'
  ];
  if (blocked.some(function(b) { return url.includes(b); })) return false;

  var players = [
    'player', 'embed', 'stream', 'watch', 'video', 'play',
    '.m3u8', '.mp4', 'dood', 'streamtape', 'sibnet', 'vidmoly',
    'filemoon', 'streamwish', 'voe.sx', 'frembed', 'sendvid',
    'mixdrop', 'uqload', 'upstream', 'ds2play', 'ok.ru', 'vk.com'
  ];
  return players.some(function(p) { return url.toLowerCase().includes(p); });
}

module.exports = { resolveStream, resolveStreams, extractAndResolve };
