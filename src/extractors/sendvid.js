/**
 * Extracteur Sendvid
 * Domaines: sendvid.com
 *
 * Technique: Le lien source est directement dans la balise <source>
 * ou dans une variable JS "source".
 */

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return url.includes('sendvid.com');
}

function extractSendvid(playerUrl) {
  return fetch(playerUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': 'https://sendvid.com/'
    }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Chercher la source directe dans <source>
      var sourceMatch = html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i);
      if (sourceMatch) {
        return {
          url: sourceMatch[1],
          headers: { 'Referer': 'https://sendvid.com/' }
        };
      }

      // Chercher dans les variables JS
      var jsMatch = html.match(/["']?source["']?\s*:\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i);
      if (jsMatch) {
        return {
          url: jsMatch[1],
          headers: { 'Referer': 'https://sendvid.com/' }
        };
      }

      // Pattern "file": "url"
      var fileMatch = html.match(/"file"\s*:\s*"([^"]+)"/);
      if (fileMatch) {
        return {
          url: fileMatch[1],
          headers: { 'Referer': playerUrl }
        };
      }

      return null;
    });
}

module.exports = { canHandle: canHandle, extract: extractSendvid };
