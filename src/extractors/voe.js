/**
 * Extracteur VOE.sx
 * Domaines: voe.sx et ses alias (ralphysuccessfull.org, etc.)
 *
 * Technique: Le lien HLS est dans une variable JS "hls" ou dans
 * un objet window.voe ou directement dans "sources".
 */

var VOE_DOMAINS = [
  'voe.sx', 'ralphysuccessfull.org', 'christopheruntilpoint.com',
  'voe.sx', 'voe.to', 'eggyeasilydone.com', 'toughtagtruck.com'
];
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function canHandle(url) {
  return VOE_DOMAINS.some(function(d) { return url.includes(d); });
}

function extractVoe(playerUrl) {
  return fetch(playerUrl, {
    headers: { 'User-Agent': UA, 'Referer': 'https://voe.sx/' }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      // VOE stocke le lien HLS dans window.voe = { hls: "...", mp4: "..." }
      var hlsMatch = html.match(/'hls'\s*:\s*'([^']+)'/);
      if (!hlsMatch) hlsMatch = html.match(/"hls"\s*:\s*"([^"]+)"/);

      if (hlsMatch) {
        var url = hlsMatch[1];
        // VOE utilise parfois du base64
        if (!url.startsWith('http')) {
          try { url = atob(url); } catch(e) {}
        }
        return { url: url, quality: 'HLS', headers: { 'Referer': 'https://voe.sx/' } };
      }

      // MP4 fallback
      var mp4Match = html.match(/'mp4'\s*:\s*'([^']+)'/);
      if (!mp4Match) mp4Match = html.match(/"mp4"\s*:\s*"([^"]+\.mp4[^"]*)"/);
      if (mp4Match) {
        return { url: mp4Match[1], quality: 'MP4', headers: { 'Referer': 'https://voe.sx/' } };
      }

      // Lien direct HLS dans le HTML
      var directHls = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
      if (directHls) {
        return { url: directHls[1], quality: 'HLS', headers: { 'Referer': playerUrl } };
      }

      return null;
    });
}

module.exports = { canHandle: canHandle, extract: extractVoe };
