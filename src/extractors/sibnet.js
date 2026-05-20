/**
 * Extracteur Sibnet
 * Domaines: video.sibnet.ru
 *
 * Technique: Le lien MP4 est dans une variable JS "player.src"
 * Il faut suivre une redirection pour obtenir l'URL finale.
 */

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return url.includes('sibnet.ru');
}

function extractSibnet(playerUrl) {
  return fetch(playerUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': 'https://video.sibnet.ru/'
    }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Le lien est dans player.src([{src: "..."}])
      var srcMatch = html.match(/player\.src\(\[?\s*\{[^}]*src\s*:\s*["']([^"']+)["']/);
      if (!srcMatch) {
        // Fallback: chercher /v/ dans le HTML
        srcMatch = html.match(/["']\/v\/[^"']+\.mp4[^"']*["']/);
        if (srcMatch) {
          return {
            url: 'https://video.sibnet.ru' + srcMatch[0].replace(/["']/g, ''),
            headers: {
              'Referer': 'https://video.sibnet.ru/',
              'User-Agent': UA
            }
          };
        }
        return null;
      }

      var videoPath = srcMatch[1];
      var videoUrl = videoPath.startsWith('http') ? videoPath : 'https://video.sibnet.ru' + videoPath;

      // Sibnet redirige vers le vrai CDN - suivre la redirection
      return fetch(videoUrl, {
        headers: {
          'User-Agent': UA,
          'Referer': playerUrl
        },
        redirect: 'manual'
      })
        .then(function(r) {
          var location = r.headers.get('location');
          return {
            url: location || videoUrl,
            headers: {
              'User-Agent': UA,
              'Referer': 'https://video.sibnet.ru/'
            }
          };
        });
    });
}

module.exports = { canHandle: canHandle, extract: extractSibnet };
