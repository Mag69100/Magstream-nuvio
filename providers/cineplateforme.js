/**
 * CinePlateforme Provider pour Nuvio
 * Adapté depuis GramFlix (CloudStream) par Mag69100
 * Source: https://www.cineplateforme.cc
 */

var BASE_URL = 'https://www.cineplateforme.cc';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function getStreams(tmdbId, mediaType, season, episode) {
  console.log('[CinePlateforme] Recherche ' + mediaType + ' ' + tmdbId);

  var searchUrl = BASE_URL + '/?s=' + tmdbId;

  return fetch(searchUrl, {
    headers: {
      'User-Agent': UA,
      'Referer': BASE_URL,
      'Accept-Language': 'fr-FR,fr;q=0.9',
    }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var links = [];
      var regex = /href="(https?:\/\/www\.cineplateforme\.cc\/[^"]+)"/gi;
      var match;
      while ((match = regex.exec(html)) !== null) {
        var link = match[1];
        if (
          (mediaType === 'movie' && (link.includes('/film') || link.includes('/movie'))) ||
          (mediaType === 'tv' && (link.includes('/serie') || link.includes('/saison')))
        ) {
          links.push(link);
        }
      }

      if (!links.length) return [];

      var targetUrl = links[0];
      if (mediaType === 'tv' && season && episode) {
        targetUrl = targetUrl.replace(/\/$/, '') + '/saison-' + season + '/episode-' + episode + '/';
      }

      return fetch(targetUrl, {
        headers: { 'User-Agent': UA, 'Referer': searchUrl }
      })
        .then(function(r) { return r.text(); })
        .then(function(pageHtml) {
          var streams = [];
          var playerRegex = /(?:src|data-src)="(https?:\/\/[^"]{10,}(?:player|embed|stream)[^"]{5,})"/gi;
          var pm;
          while ((pm = playerRegex.exec(pageHtml)) !== null) {
            var url = pm[1];
            if (!url.includes('google') && !url.includes('facebook')) {
              streams.push({
                name: 'CinePlateforme',
                title: 'VF/VOSTFR',
                url: url,
                quality: 'HD',
                headers: { 'Referer': targetUrl, 'User-Agent': UA },
              });
            }
          }
          console.log('[CinePlateforme] ' + streams.length + ' stream(s)');
          return streams;
        });
    })
    .catch(function(err) {
      console.error('[CinePlateforme] Erreur:', err.message);
      return [];
    });
}

module.exports = { getStreams: getStreams };
