/**
 * Extracteur Streamtape / TapeStream
 * Domaines: streamtape.com, streamtape.to, streamtape.net, tapestream.net
 *
 * Technique: Le lien est construit en concaténant deux parties
 * trouvées dans le JS de la page (obscurcissement basique).
 */

var STREAMTAPE_DOMAINS = [
  'streamtape.com', 'streamtape.to', 'streamtape.net',
  'streamtape.xyz', 'tapestream.net', 'streamtap.com'
];

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return STREAMTAPE_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractStreamtape(playerUrl) {
  var videoUrl = playerUrl.replace('/e/', '/').replace('embed-', '');

  return fetch(videoUrl, {
    headers: { 'User-Agent': UA, 'Referer': 'https://streamtape.com/' }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // Streamtape construit le lien en deux parties dans le JS
      // Pattern: document.getElementById('ideoooolink').innerHTML = "...".substring(4) + "..."
      var linkMatch = html.match(/getElementById\(['"](id[^'"]+)['"]\)[^=]*=[^"']*["']([^"']+)["'][^+]*\+[^"']*["']([^"']+)["']/);

      if (!linkMatch) {
        // Fallback: chercher un lien direct
        var directMatch = html.match(/https:\/\/[^"']+\.streamtape\.com\/get_video[^"']*/);
        if (directMatch) {
          return {
            url: 'https:' + directMatch[0].replace('https:', ''),
            headers: { 'Referer': videoUrl }
          };
        }
        return null;
      }

      var part1 = linkMatch[2];
      var part2 = linkMatch[3];
      // Retirer le substring(4) appliqué par Streamtape
      var streamUrl = 'https:' + (part1 + part2).substring(part1.substring(4).length > 0 ? 4 : 0);

      return {
        url: streamUrl,
        headers: {
          'User-Agent': UA,
          'Referer': 'https://streamtape.com/'
        }
      };
    });
}

module.exports = { canHandle: canHandle, extract: extractStreamtape };
