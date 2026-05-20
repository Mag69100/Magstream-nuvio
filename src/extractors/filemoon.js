/**
 * Extracteur Filemoon
 * Domaines: filemoon.sx, filemoon.in, filemoon.to, lukefirst.lol
 *
 * Technique: Le HTML est obfusqué avec eval(). On dépaquette le JS
 * pour trouver le lien m3u8.
 */

var FILEMOON_DOMAINS = ['filemoon.sx', 'filemoon.in', 'filemoon.to', 'filemoon.nl', 'lukefirst.lol', 'moonmov.pro'];
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return FILEMOON_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractFilemoon(playerUrl) {
  var embedUrl = playerUrl.includes('/e/') ? playerUrl : playerUrl.replace(/\/(v|f)\//, '/e/');

  return fetch(embedUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': 'https://filemoon.sx/'
    }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Filemoon utilise un script eval(atob(...)) ou eval(p,a,c,k,e,d)
      // On cherche directement le m3u8 dans le HTML (parfois visible après déobfuscation partielle)
      var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
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

      // Chercher dans eval obfusqué: décoder les strings hex/octal
      var evalMatch = html.match(/eval\(function\(p,a,c,k,e,(?:r|d)\).*?\)\)/s);
      if (evalMatch) {
        // Tenter d'extraire le m3u8 via regex sur le code packé
        var packed = evalMatch[0];
        var urlMatch = packed.match(/['"](https?:[^'"]+\.m3u8[^'"]*)['"]/);
        if (urlMatch) {
          return {
            url: urlMatch[1],
            quality: 'HLS',
            headers: { 'Referer': embedUrl, 'User-Agent': UA }
          };
        }
      }

      // Fallback: chercher "sources" ou "file" directement
      var fileMatch = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
      if (fileMatch) {
        return {
          url: fileMatch[1],
          headers: { 'Referer': embedUrl, 'User-Agent': UA }
        };
      }

      return null;
    });
}

module.exports = { canHandle: canHandle, extract: extractFilemoon };
