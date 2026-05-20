/**
 * Extracteur Doodstream / DoodsPro / Ds2play
 * Domaines: doodstream.com, doods.pro, d0o0d.com, ds2play.com, dsvplay.com
 *
 * Technique: Dood génère un lien temporaire via une page /pass_md5/
 * en réconcaténant un token + un paramètre aléatoire + timestamp.
 */

var DOOD_DOMAINS = [
  'doodstream.com', 'doods.pro', 'd0o0d.com', 'ds2play.com',
  'dsvplay.com', 'doodstream.co', 'dood.watch', 'dood.to',
  'dood.so', 'dood.cx', 'dood.la', 'dood.ws'
];

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return DOOD_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractDood(playerUrl) {
  // Normaliser l'URL vers /e/ ou /d/
  var videoUrl = playerUrl
    .replace('/d/', '/e/')
    .replace('/f/', '/e/');

  return fetch(videoUrl, {
    headers: { 'User-Agent': UA, 'Referer': 'https://doodstream.com/' }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Récupérer le chemin /pass_md5/
      var passMd5Match = html.match(/\/pass_md5\/[^'"]*/);
      if (!passMd5Match) return null;

      var passMd5Url = passMd5Match[0];
      var baseUrl = new URL(videoUrl).origin;

      return fetch(baseUrl + passMd5Url, {
        headers: {
          'User-Agent': UA,
          'Referer': videoUrl
        }
      })
        .then(function(r) { return r.text(); })
        .then(function(token) {
          // Extraire le paramètre aléatoire depuis le JS
          var randomMatch = html.match(/\?token=([^&'"]+)/);
          var tokenParam = randomMatch ? randomMatch[1] : '';

          // Générer le lien final avec timestamp
          var timestamp = Date.now();
          var streamUrl = token + makeRandom(10) + '?token=' + tokenParam + '&expiry=' + timestamp;

          return {
            url: streamUrl,
            headers: {
              'User-Agent': UA,
              'Referer': baseUrl + '/'
            }
          };
        });
    });
}

function makeRandom(length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = { canHandle: canHandle, extract: extractDood };
