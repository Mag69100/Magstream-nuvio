# Extracteurs GramFlix

Ce module contient les extracteurs de streams pour chaque player embarqué utilisé par les sites français.

## Extracteurs disponibles

| Extracteur | Domaines couverts | Technique |
|---|---|---|
| `doodstream.js` | doodstream.com, doods.pro, d0o0d.com, ds2play.com | `/pass_md5/` + token + timestamp |
| `streamtape.js` | streamtape.com, tapestream.net | Concaténation de deux chaînes JS |
| `sendvid.js` | sendvid.com | `<source src="...">` direct |
| `sibnet.js` | video.sibnet.ru | `player.src()` + suivi de redirection |
| `vidmoly.js` | vidmoly.me/net/to | Variable JS `"file":` |
| `filemoon.js` | filemoon.sx/in/to, lukefirst.lol | Regex sur JS eval obfusqué |
| `streamwish.js` | streamwish.to, streamhls.to, filelions.to | Variable JS `"file":` |
| `voe.js` | voe.sx et aliases | Variable JS `'hls':` (parfois base64) |
| `frembed.js` | frembed.best/work/bond | `"file":` ou API JSON |
| `generic.js` | mp4upload, uqload, mixdrop, vidoza, ok.ru... | Patterns JWPlayer/VideoJS génériques |

## Usage

```js
import { resolveStream, resolveStreams, extractAndResolve } from './index.js';

// Résoudre un seul player
const stream = await resolveStream('https://doodstream.com/e/abc123');
// → { url: 'https://...mp4?token=...', headers: { Referer: '...', User-Agent: '...' } }

// Résoudre plusieurs players
const streams = await resolveStreams(['https://streamtape.com/e/...', 'https://sendvid.com/...']);

// Extraire et résoudre tous les players d'une page HTML
const streams = await extractAndResolve(pageHtml, 'https://french-stream.pink/film/...', 'FrenchStream');
```

## Ajouter un extracteur

1. Créer `src/extractors/monplayer.js` :
```js
var DOMAINS = ['monplayer.com', 'monplayer.net'];

function canHandle(url) {
  return DOMAINS.some(d => url.includes(d));
}

function extract(playerUrl) {
  return fetch(playerUrl, { headers: { 'User-Agent': '...', 'Referer': '...' } })
    .then(r => r.text())
    .then(html => {
      const m = html.match(/"file":"([^"]+)"/);
      return m ? { url: m[1], headers: { 'Referer': playerUrl } } : null;
    });
}

module.exports = { canHandle, extract };
```

2. L'importer dans `index.js` et l'ajouter au tableau `EXTRACTORS`.

## Format de retour

Chaque extracteur retourne une Promise résolvant vers :
```js
{
  url: 'https://cdn.example.com/video.m3u8',   // URL directe du stream
  quality: 'HLS',                                // HLS, 1080p, 720p, MP4...
  headers: {                                     // Headers nécessaires à la lecture
    'Referer': 'https://player.example.com/',
    'User-Agent': 'Mozilla/5.0...'
  }
}
// ou null si l'extraction a échoué
```
