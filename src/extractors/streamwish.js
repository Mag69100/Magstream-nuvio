/**
 * Extracteur Streamwish / StreamHLS / FileLions
 * Domaines: streamwish.to, streamwish.com, streamhls.to, filelions.to, dintezuvio.com
 *
 * Technique: Lien m3u8 dans une variable JS "sources" ou "file"
 * Parfois protégé par un token dans l'URL.
 */

var STREAMWISH_DOMAINS = [
  'streamwish.to', 'streamwish.com', 'streamwish.net',
  'streamhls.to', 'filelions.to', 'filelions.live',
  'dintezuvio.com', 'wishembed.net', 'awish.me'
];
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return STREAMWISH_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractStreamwish(playerUrl) {
  var embedUrl = playerUrl.includes('/e/') ? playerUrl : playerUrl.replace(/\/(v|f)\//, '/e/');

  return fetch(embedUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': new URL(embedUrl).origin + '/'
    }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Pattern principal: jwplayer().setup({sources: [{file: "..."}]})
      var m3u8Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
      if (m3u8Match) {
        return buildResult(m3u8Match[1], embedUrl, 'HLS');
      }

      // Lien mp4
      var mp4Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/);
      if (mp4Match) {
        return buildResult(mp4Match[1], embedUrl, 'MP4');
      }

      // Pattern sources array
      var sourcesMatch = html.match(/sources\s*:\s*\[\s*\{[^}]*"file"\s*:\s*"([^"]+)"/);
      if (sourcesMatch) {
        return buildResult(sourcesMatch[1], embedUrl, 'HLS');
      }

      // URL directe dans le HTML
      var directMatch = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
      if (directMatch) {
        return buildResult(directMatch[1], embedUrl, 'HLS');
      }

      return null;
    });
}

function buildResult(url, referer, format) {
  return {
    url: url,
    quality: format === 'HLS' ? 'HLS' : 'MP4',
    headers: {
      'Referer': referer,
      'User-Agent': UA,
      'Origin': new URL(referer).origin
    }
  };
}

module.exports = { canHandle: canHandle, extract: extractStreamwish };
