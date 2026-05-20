/**
 * Extracteur Frembed
 * Domaines: frembed.best, frembed.work, frembed.bond
 *
 * Frembed est un player utilisé spécifiquement par les sites français.
 * Il expose généralement un lien m3u8 via une API JSON.
 */

var FREMBED_DOMAINS = ['frembed.best', 'frembed.work', 'frembed.bond', 'frembed.fun', 'frembed.pro'];
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return FREMBED_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractFrembed(playerUrl) {
  // Extraire l'ID de la vidéo
  var idMatch = playerUrl.match(/\/(?:v|e|embed)\/([a-zA-Z0-9_-]+)/);
  var videoId = idMatch ? idMatch[1] : null;

  return fetch(playerUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': new URL(playerUrl).origin + '/'
    }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Frembed peut exposer un JSON d'API
      var apiMatch = html.match(/(?:api|sources?|stream)\s*[=:]\s*["']?(https?:\/\/[^"'\s]+)["']?/i);
      if (apiMatch) {
        return fetch(apiMatch[1], {
          headers: { 'Referer': playerUrl, 'User-Agent': UA }
        })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            var url = data.url || data.stream || data.file || (data.sources && data.sources[0] && data.sources[0].file);
            if (url) return { url: url, headers: { 'Referer': playerUrl } };
            return null;
          })
          .catch(function() { return null; });
      }

      // Chercher directement m3u8 ou mp4
      var m3u8Match = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
      if (m3u8Match) {
        return {
          url: m3u8Match[1],
          quality: 'HLS',
          headers: { 'Referer': playerUrl, 'User-Agent': UA }
        };
      }

      var mp4Match = html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/);
      if (mp4Match) {
        return {
          url: mp4Match[1],
          quality: 'MP4',
          headers: { 'Referer': playerUrl }
        };
      }

      // "file": "url"
      var fileMatch = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
      if (fileMatch) {
        return { url: fileMatch[1], headers: { 'Referer': playerUrl } };
      }

      return null;
    });
}

module.exports = { canHandle: canHandle, extract: extractFrembed };
