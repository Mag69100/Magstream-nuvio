/**
 * Extracteur Vidmoly
 * Domaines: vidmoly.me, vidmoly.net, vidmoly.to
 *
 * Technique: Le lien m3u8 est dans une variable JS "file" ou "sources"
 */

var VIDMOLY_DOMAINS = ['vidmoly.me', 'vidmoly.net', 'vidmoly.to'];
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return VIDMOLY_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractVidmoly(playerUrl) {
  var embedUrl = playerUrl.includes('/e/') ? playerUrl : playerUrl.replace(/\/v\//, '/e/');

  return fetch(embedUrl, {
    headers: { 'User-Agent': UA, 'Referer': 'https://vidmoly.me/' }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Pattern: sources: [{ file: "..." }]
      var m3u8Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
      if (m3u8Match) {
        return {
          url: m3u8Match[1],
          quality: 'HLS',
          headers: {
            'Referer': embedUrl,
            'User-Agent': UA,
            'Origin': new URL(embedUrl).origin
          }
        };
      }

      // Lien MP4 direct
      var mp4Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/);
      if (mp4Match) {
        return {
          url: mp4Match[1],
          quality: 'MP4',
          headers: { 'Referer': embedUrl }
        };
      }

      // Sources array
      var sourcesMatch = html.match(/sources\s*:\s*\[([^\]]+)\]/);
      if (sourcesMatch) {
        var fileInSources = sourcesMatch[1].match(/"(https?:\/\/[^"]+)"/);
        if (fileInSources) {
          return {
            url: fileInSources[1],
            headers: { 'Referer': embedUrl }
          };
        }
      }

      return null;
    });
}

module.exports = { canHandle: canHandle, extract: extractVidmoly };
