/**
 * HDss Provider pour Nuvio
 * Adapté depuis GramFlix (CloudStream) par Mag69100
 * Source: https://hdss.now
 */

'use strict';

var BASE_URL = 'https://hdss.now';
var PROVIDER_NAME = 'HDss';
var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

// ─── Extracteurs intégrés ────────────────────────────────────────────────────

var EXTRACTORS = [
  {
    name: 'Doodstream',
    domains: ['doodstream.com','doods.pro','d0o0d.com','ds2play.com','dsvplay.com','dood.watch','dood.to'],
    extract: extractDood
  },
  {
    name: 'Streamtape',
    domains: ['streamtape.com','streamtape.to','streamtape.net','tapestream.net'],
    extract: extractStreamtape
  },
  {
    name: 'Sendvid',
    domains: ['sendvid.com'],
    extract: extractSendvid
  },
  {
    name: 'Sibnet',
    domains: ['sibnet.ru'],
    extract: extractSibnet
  },
  {
    name: 'Vidmoly',
    domains: ['vidmoly.me','vidmoly.net','vidmoly.to'],
    extract: extractVidmoly
  },
  {
    name: 'Filemoon',
    domains: ['filemoon.sx','filemoon.in','filemoon.to','lukefirst.lol'],
    extract: extractFilemoon
  },
  {
    name: 'Streamwish',
    domains: ['streamwish.to','streamwish.com','streamhls.to','filelions.to','dintezuvio.com'],
    extract: extractStreamwish
  },
  {
    name: 'VOE',
    domains: ['voe.sx','ralphysuccessfull.org','christopheruntilpoint.com'],
    extract: extractVoe
  },
  {
    name: 'Frembed',
    domains: ['frembed.best','frembed.work','frembed.bond','frembed.fun'],
    extract: extractFrembed
  },
  {
    name: 'Generic',
    domains: ['mp4upload.com','uqload.io','uqload.cx','mixdrop.co','vidoza.net','upstream.to','ok.ru','vk.com','dailymotion.com','netu.tv'],
    extract: extractGeneric
  }
];

function getExtractor(url) {
  for (var i = 0; i < EXTRACTORS.length; i++) {
    var ext = EXTRACTORS[i];
    for (var j = 0; j < ext.domains.length; j++) {
      if (url.includes(ext.domains[j])) return ext;
    }
  }
  return null;
}

function extractDood(url) {
  var videoUrl = url.replace('/d/', '/e/').replace('/f/', '/e/');
  return fetch(videoUrl, { headers: { 'User-Agent': UA, 'Referer': 'https://doodstream.com/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var passMd5 = html.match(/\/pass_md5\/[^'"]*/);
      if (!passMd5) return null;
      var baseUrl = videoUrl.split('/').slice(0, 3).join('/');
      return fetch(baseUrl + passMd5[0], { headers: { 'User-Agent': UA, 'Referer': videoUrl } })
        .then(function(r) { return r.text(); })
        .then(function(token) {
          var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          var rand = ''; for (var i=0;i<10;i++) rand+=chars[Math.floor(Math.random()*chars.length)];
          return { url: token + rand + '?token=&expiry=' + Date.now(), headers: { 'User-Agent': UA, 'Referer': baseUrl + '/' } };
        });
    });
}

function extractStreamtape(url) {
  return fetch(url, { headers: { 'User-Agent': UA, 'Referer': 'https://streamtape.com/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/(?:innerHTML|outerHTML)\s*=\s*["']([^"']+)["'][^+]*\+[^"']*["']([^"']+)["']/);
      if (m) return { url: 'https:' + (m[1] + m[2]).substring(4), headers: { 'Referer': url } };
      var direct = html.match(/https:\/\/[^"']+\.streamtape\.com\/get_video[^"']*/);
      if (direct) return { url: direct[0], headers: { 'Referer': url } };
      return null;
    });
}

function extractSendvid(url) {
  return fetch(url, { headers: { 'User-Agent': UA, 'Referer': 'https://sendvid.com/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i)
           || html.match(/"file"\s*:\s*"([^"]+)"/);
      return m ? { url: m[1], headers: { 'Referer': 'https://sendvid.com/' } } : null;
    });
}

function extractSibnet(url) {
  return fetch(url, { headers: { 'User-Agent': UA, 'Referer': 'https://video.sibnet.ru/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/player\.src\(\[?\s*\{[^}]*src\s*:\s*["']([^"']+)["']/);
      if (!m) return null;
      var videoUrl = m[1].startsWith('http') ? m[1] : 'https://video.sibnet.ru' + m[1];
      return fetch(videoUrl, { headers: { 'User-Agent': UA, 'Referer': url }, redirect: 'manual' })
        .then(function(r) {
          var loc = r.headers.get('location');
          return { url: loc || videoUrl, headers: { 'User-Agent': UA, 'Referer': 'https://video.sibnet.ru/' } };
        });
    });
}

function extractVidmoly(url) {
  var embedUrl = url.includes('/e/') ? url : url.replace(/\/v\//, '/e/');
  return fetch(embedUrl, { headers: { 'User-Agent': UA, 'Referer': 'https://vidmoly.me/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)"/)
           || html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/);
      return m ? { url: m[1], quality: 'HLS', headers: { 'Referer': embedUrl, 'User-Agent': UA } } : null;
    });
}

function extractFilemoon(url) {
  var embedUrl = url.includes('/e/') ? url : url.replace(/\/(v|f)\//, '/e/');
  return fetch(embedUrl, { headers: { 'User-Agent': UA, 'Referer': 'https://filemoon.sx/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/)
           || html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
      return m ? { url: m[1], quality: 'HLS', headers: { 'Referer': embedUrl, 'User-Agent': UA } } : null;
    });
}

function extractStreamwish(url) {
  var embedUrl = url.includes('/e/') ? url : url.replace(/\/(v|f)\//, '/e/');
  return fetch(embedUrl, { headers: { 'User-Agent': UA, 'Referer': embedUrl.split('/').slice(0,3).join('/') + '/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)"/)
           || html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/)
           || html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
      return m ? { url: m[1], quality: 'HLS', headers: { 'Referer': embedUrl, 'User-Agent': UA } } : null;
    });
}

function extractVoe(url) {
  return fetch(url, { headers: { 'User-Agent': UA, 'Referer': 'https://voe.sx/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/'hls'\s*:\s*'([^']+)'/) || html.match(/"hls"\s*:\s*"([^"]+)"/);
      if (m) {
        var u = m[1];
        if (!u.startsWith('http')) { try { u = atob(u); } catch(e){} }
        return { url: u, quality: 'HLS', headers: { 'Referer': 'https://voe.sx/' } };
      }
      var mp4 = html.match(/'mp4'\s*:\s*'([^']+)'/);
      return mp4 ? { url: mp4[1], quality: 'MP4', headers: { 'Referer': 'https://voe.sx/' } } : null;
    });
}

function extractFrembed(url) {
  return fetch(url, { headers: { 'User-Agent': UA, 'Referer': url.split('/').slice(0,3).join('/') + '/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/)
           || html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/)
           || html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
      return m ? { url: m[1], headers: { 'Referer': url, 'User-Agent': UA } } : null;
    });
}

function extractGeneric(url) {
  return fetch(url, { headers: { 'User-Agent': UA, 'Referer': url.split('/').slice(0,3).join('/') + '/' } })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var m = html.match(/sources\s*:\s*\[\s*\{[^}]*["']?file["']?\s*:\s*["']([^"']+)["']/)
           || html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)/)
           || html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i)
           || html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/)
           || html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/);
      return m ? { url: m[1], headers: { 'Referer': url, 'User-Agent': UA } } : null;
    });
}

// ─── Résolution d'un player embarqué ────────────────────────────────────────

function resolvePlayer(playerUrl) {
  var ext = getExtractor(playerUrl);
  if (!ext) return Promise.resolve(null);
  return ext.extract(playerUrl)
    .then(function(result) {
      if (result && result.url) {
        console.log('[' + PROVIDER_NAME + '] Résolu via ' + ext.name + ': ' + result.url);
        return result;
      }
      return null;
    })
    .catch(function(err) {
      console.error('[' + PROVIDER_NAME + '] ' + ext.name + ' erreur:', err.message);
      return null;
    });
}

function collectPlayers(html) {
  var urls = [];
  var re = /(?:src|data-src)\s*=\s*["']([^"']+)["']/gi;
  var m;
  var BLOCKED = ['google.com','facebook.com','disqus.com','cloudflare.com','analytics','ads.','gstatic'];
  var PLAYER_HINTS = ['player','embed','stream','watch','.m3u8','.mp4',
    'dood','streamtape','sibnet','vidmoly','filemoon','streamwish',
    'voe.sx','frembed','sendvid','mixdrop','uqload','upstream','ds2play','ok.ru','vk.com'];
  while ((m = re.exec(html)) !== null) {
    var url = m[1];
    if (!url.startsWith('http')) continue;
    if (BLOCKED.some(function(b) { return url.includes(b); })) continue;
    if (PLAYER_HINTS.some(function(h) { return url.toLowerCase().includes(h); })) {
      if (!urls.includes(url)) urls.push(url);
    }
  }
  // Liens directs m3u8/mp4 dans le JS
  var re2 = /"(?:file|src|source|url)"\s*:\s*"(https?:\/\/[^"]+\.(?:m3u8|mp4)[^"]*)"/gi;
  while ((m = re2.exec(html)) !== null) {
    if (!urls.includes(m[1])) urls.push(m[1]);
  }
  return urls;
}

// ─── Recherche de contenu ────────────────────────────────────────────────────

function searchAndFetch(tmdbId, mediaType, season, episode) {
  return fetch(BASE_URL + '/?s=' + tmdbId, {
    headers: { 'User-Agent': UA, 'Referer': BASE_URL, 'Accept-Language': 'fr-FR,fr;q=0.9' }
  })
    .then(function(r) { return r.text(); })
    .then(function(html) {
      var links = [];
      var re = /href="(https?:\/\/hdss.now\/[^"]+)"/gi;
      var m;
      while ((m = re.exec(html)) !== null) {
        var l = m[1];
        if (!l.includes('/page/') && !l.includes('?s=') && l.length > BASE_URL.length + 5) links.push(l);
      }
      if (!links.length) return [];
      var targetUrl = links[0];
      if (mediaType === 'tv' && season && episode) {
        targetUrl = targetUrl.replace(/\/$/, '') + '/saison-' + season + '/episode-' + episode + '/';
      }
      return fetch(targetUrl, { headers: { 'User-Agent': UA, 'Referer': BASE_URL } })
        .then(function(r) { return r.text(); })
        .then(function(pageHtml) { return { html: pageHtml, url: targetUrl }; });
    });
}

// ─── Point d'entrée Nuvio ────────────────────────────────────────────────────

function getStreams(tmdbId, mediaType, season, episode) {
  console.log('[' + PROVIDER_NAME + '] Recherche ' + mediaType + ' tmdbId=' + tmdbId + ' S' + season + 'E' + episode);

  return searchAndFetch(tmdbId, mediaType, season, episode)
    .then(function(result) {
      if (!result || !result.html) return [];
      var playerUrls = collectPlayers(result.html);
      console.log('[' + PROVIDER_NAME + '] ' + playerUrls.length + ' player(s) détecté(s)');

      // Résoudre séquentiellement
      var streams = [];
      var chain = Promise.resolve();
      playerUrls.forEach(function(pUrl) {
        chain = chain.then(function() {
          return resolvePlayer(pUrl).then(function(resolved) {
            if (resolved && resolved.url) {
              streams.push({
                name: PROVIDER_NAME,
                title: (resolved.quality || 'HD') + ' VF',
                url: resolved.url,
                quality: resolved.quality || 'HD',
                headers: resolved.headers || { 'Referer': result.url, 'User-Agent': UA },
              });
            }
          });
        });
      });

      return chain.then(function() {
        console.log('[' + PROVIDER_NAME + '] ' + streams.length + ' stream(s) résolus');
        return streams;
      });
    })
    .catch(function(err) {
      console.error('[' + PROVIDER_NAME + '] Erreur:', err.message);
      return [];
    });
}

module.exports = { getStreams: getStreams };
