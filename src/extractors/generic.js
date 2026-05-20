/**
 * Extracteur générique - Players JWPlayer / VideoJS
 * Couvre: mp4upload, uqload, mixdrop, vidoza, voe, upstream, etc.
 * Utilisé en fallback quand aucun extracteur spécifique ne correspond.
 *
 * Technique: Ces players exposent leurs sources dans des patterns JS communs.
 */

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

// Domaines gérés par cet extracteur générique
var GENERIC_DOMAINS = [
  'mp4upload.com', 'uqload.io', 'uqload.cx', 'uqload.co',
  'mixdrop.co', 'mixdrop.club', 'mixdrop.bz',
  'vidoza.net', 'upstream.to',
  'ds2play.com', 'netu.tv', 'younetu.org',
  'ok.ru',
  'vk.com',
  'dailymotion.com',
  'streamhls.to',
  'mjedge.net', 'bigwarp.io',
  'autruche.space'
];

function canHandle(url) {
  return GENERIC_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractGeneric(playerUrl) {
  var origin = '';
  try { origin = new URL(playerUrl).origin; } catch(e) {}

  return fetch(playerUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': origin + '/'
    }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // === Patterns communs JWPlayer ===

      // 1. sources: [{file: "..."}]
      var jwMatch = html.match(/sources\s*:\s*\[\s*\{[^}]*["']?file["']?\s*:\s*["']([^"']+)["']/);
      if (jwMatch) return buildStream(jwMatch[1], playerUrl);

      // 2. "file": "url" simple
      var fileMatch = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
      if (fileMatch) return buildStream(fileMatch[1], playerUrl);

      // 3. player.src([{src: "..."}]) (Sibnet-like)
      var srcMatch = html.match(/player\.src\(\[\s*\{[^}]*src\s*:\s*["']([^"']+)["']/);
      if (srcMatch) return buildStream(srcMatch[1], playerUrl);

      // 4. <source src="..." type="video/mp4">
      var sourceMatch = html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i);
      if (sourceMatch) return buildStream(sourceMatch[1], playerUrl);

      // 5. video.setAttribute('src', '...')
      var attrMatch = html.match(/setAttribute\(['"]src["'],\s*["']([^"']+)["']\)/);
      if (attrMatch) return buildStream(attrMatch[1], playerUrl);

      // 6. URL m3u8 directe dans le HTML
      var m3u8Direct = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
      if (m3u8Direct) return buildStream(m3u8Direct[1], playerUrl);

      // 7. URL mp4 directe
      var mp4Direct = html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/);
      if (mp4Direct) return buildStream(mp4Direct[1], playerUrl);

      // === Spécifique OK.ru ===
      if (playerUrl.includes('ok.ru')) {
        var okMatch = html.match(/"url"\s*:\s*"(https?:[^"]+\.(?:m3u8|mp4)[^"]*)"[^}]*"name"\s*:\s*"([^"]+)"/);
        if (okMatch) return buildStream(decodeURIComponent(okMatch[1].replace(/\\/g, '')), playerUrl);
      }

      // === Spécifique Dailymotion ===
      if (playerUrl.includes('dailymotion.com')) {
        var dmId = playerUrl.match(/\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/);
        if (dmId) {
          return fetch('https://www.dailymotion.com/player/metadata/video/' + dmId[1], {
            headers: { 'User-Agent': UA }
          })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              var qualities = data.qualities || {};
              var best = qualities['1080'] || qualities['720'] || qualities['480'] || qualities['auto'];
              if (best && best[0]) return buildStream(best[0].url, playerUrl);
              return null;
            })
            .catch(function() { return null; });
        }
      }

      return null;
    });
}

function buildStream(url, referer) {
  if (!url || !url.startsWith('http')) return null;
  var quality = url.includes('.m3u8') ? 'HLS' : (url.includes('1080') ? '1080p' : url.includes('720') ? '720p' : 'HD');
  return {
    url: url,
    quality: quality,
    headers: {
      'Referer': referer,
      'User-Agent': UA
    }
  };
}

module.exports = { canHandle: canHandle, extract: extractGeneric };
