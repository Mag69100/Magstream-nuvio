/**
 * WoW-Films Provider pour Nuvio
 * Adapté depuis GramFlix (CloudStream) par Mag69100
 * Source: https://wowfilms0326b.site
 */

var BASE_URL = 'https://wowfilms0326b.site';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

function getStreams(tmdbId, mediaType, season, episode) {
  console.log('[WoWFilms] Recherche ' + mediaType + ' ' + tmdbId);

  return fetch(BASE_URL + '/?s=' + tmdbId, {
    headers: { 'User-Agent': UA, 'Referer': BASE_URL, 'Accept-Language': 'fr-FR,fr;q=0.9' }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var links = [];
      var regex = /href="(https?:\/\/wowfilms0326b\.site\/[^"]+)"/gi;
      var match;
      while ((match = regex.exec(html)) !== null) {
        var l = match[1];
        if (l.length > BASE_URL.length + 5 && !l.includes('/page/')) links.push(l);
      }
      if (!links.length) return [];

      var targetUrl = links[0];
      if (mediaType === 'tv' && season && episode) {
        targetUrl += 'saison-' + season + '/episode-' + episode + '/';
      }

      return fetch(targetUrl, {
        headers: { 'User-Agent': UA, 'Referer': BASE_URL }
      })
        .then(function(r) { return r.text(); })
        .then(function(pageHtml) {
          var streams = [];
          var re = /(?:src|data-src)="(https?:\/\/[^"]+)"/gi;
          var m;
          while ((m = re.exec(pageHtml)) !== null) {
            var url = m[1];
            if ((url.includes('player') || url.includes('embed') || url.endsWith('.m3u8') || url.endsWith('.mp4'))
                && !url.includes('google') && !url.includes('facebook')) {
              streams.push({
                name: 'WoW-Films',
                title: 'VF',
                url: url,
                quality: url.includes('1080') ? '1080p' : 'HD',
                headers: { 'Referer': targetUrl, 'User-Agent': UA },
              });
            }
          }
          console.log('[WoWFilms] ' + streams.length + ' stream(s)');
          return streams;
        });
    })
    .catch(function(err) {
      console.error('[WoWFilms] Erreur:', err.message);
      return [];
    });
}

module.exports = { getStreams: getStreams };
