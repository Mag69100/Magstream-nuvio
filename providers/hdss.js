/**
 * HDss Provider pour Nuvio
 * Adapté depuis GramFlix (CloudStream) par Mag69100
 * Source: https://hdss.now
 */

var BASE_URL = 'https://hdss.now';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function getStreams(tmdbId, mediaType, season, episode) {
  console.log('[HDss] Recherche ' + mediaType + ' ' + tmdbId);

  var searchUrl = BASE_URL + '/?s=' + tmdbId;

  return fetch(searchUrl, {
    headers: { 'User-Agent': UA, 'Referer': BASE_URL, 'Accept-Language': 'fr-FR,fr;q=0.9' }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var links = [];
      var regex = /href="(https?:\/\/hdss\.now\/[^"]+)"/gi;
      var match;
      while ((match = regex.exec(html)) !== null) {
        if (!match[1].includes('/page/')) links.push(match[1]);
      }

      if (!links.length) return [];

      var targetUrl = links[0];
      if (mediaType === 'tv' && season && episode) {
        targetUrl = targetUrl + 'saison-' + season + '/episode-' + episode + '/';
      }

      return fetch(targetUrl, {
        headers: { 'User-Agent': UA, 'Referer': searchUrl }
      })
        .then(function(r) { return r.text(); })
        .then(function(pageHtml) {
          var streams = [];

          var iframeRegex = /(?:src|data-src)="(https?:\/\/[^"]{15,})"/gi;
          var pm;
          while ((pm = iframeRegex.exec(pageHtml)) !== null) {
            var url = pm[1];
            if (!url.includes('google') && !url.includes('facebook') && !url.includes('disqus')) {
              if (url.includes('player') || url.includes('embed') || url.includes('stream') || url.includes('.m3u8') || url.includes('.mp4')) {
                streams.push({
                  name: 'HDss',
                  title: 'HD VF',
                  url: url,
                  quality: url.includes('1080') ? '1080p' : 'HD',
                  headers: { 'Referer': targetUrl, 'User-Agent': UA },
                });
              }
            }
          }

          console.log('[HDss] ' + streams.length + ' stream(s)');
          return streams;
        });
    })
    .catch(function(err) {
      console.error('[HDss] Erreur:', err.message);
      return [];
    });
}

module.exports = { getStreams: getStreams };
