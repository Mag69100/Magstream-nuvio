# GramFlix Nuvio Providers

Collection de providers de streaming **français** pour l'application **Nuvio**, adaptée depuis [GramFlix (CloudStream)](https://github.com/Mag69100/GramFlix).

## Providers disponibles

| Provider | Type | Langue | Statut |
|---|---|---|---|
| FrenchStream | Films & Séries | 🇫🇷 VF | ✅ |
| CoFliX | Films & Séries | 🇫🇷 VF/VOSTFR | ✅ |
| Flemmix | Films & Séries | 🇫🇷 VF | ✅ |
| DarkiWorld | Films & Séries | 🇫🇷 VF | ✅ |
| Anime-Sama | Séries (Anime) | 🇫🇷 VF/VOSTFR | ✅ |
| CinePlateforme | Films & Séries | 🇫🇷 VF | ✅ |
| HDss | Films & Séries | 🇫🇷 VF | ✅ |
| PapaDuStream | Films & Séries | 🇫🇷 VF | ✅ |
| WoW-Films | Films & Séries | 🇫🇷 VF | ✅ |
| Xalaflix | Films & Séries | 🇫🇷 VF | ✅ |

## Utilisation dans Nuvio

1. Ouvrir **Nuvio** > **Settings** > **Plugins**
2. Ajouter l'URL du manifest de ce repo :
   ```
   https://raw.githubusercontent.com/Mag69100/nuvio-providers/refs/heads/main/manifest.json
   ```
3. Actualiser et activer les providers souhaités

### Mode développeur (test local)

```bash
npm install
npm start
```

Puis dans Nuvio : **Settings > Developer > Plugin Tester**  
Entrer : `http://<votre-ip>:3000/manifest.json`

> ⚠️ Nécessite un **build de développement** de Nuvio (`npx expo run:android` ou `npx expo run:ios`)

## Structure du projet

```
gramflix-nuvio-providers/
├── src/                        # Sources multi-fichiers (async/await OK)
│   ├── _template/              # Template pour créer un nouveau provider
│   │   └── index.js
│   ├── frenchstream/
│   │   └── index.js
│   ├── coflix/
│   │   └── index.js
│   ├── flemmix/
│   │   └── index.js
│   ├── darkiworld/
│   │   └── index.js
│   └── animesama/
│       └── index.js
│
├── providers/                  # Fichiers compilés + providers single-file
│   ├── frenchstream.js         # Compilé depuis src/frenchstream/
│   ├── coflix.js
│   ├── flemmix.js
│   ├── darkiworld.js
│   ├── animesama.js
│   ├── cineplateforme.js       # Single-file (Promise chains)
│   ├── hdss.js
│   ├── papadustream.js
│   ├── wowfilms.js
│   └── xalaflix.js
│
├── manifest.json               # Registre des providers
├── build.js                    # Script de build (esbuild + transpilation Hermes)
├── server.js                   # Serveur local de test
└── package.json
```

## Développement

### Construire les providers depuis src/

```bash
# Compiler tous les providers src/
node build.js

# Compiler un provider spécifique
node build.js frenchstream

# Compiler plusieurs
node build.js coflix flemmix darkiworld
```

### Transpiler les providers single-file (si async/await utilisé)

```bash
# Transpiler un fichier
node build.js --transpile myprovider.js

# Transpiler tous les fichiers providers/
node build.js --transpile
```

### Ajouter un nouveau provider

1. Copier `src/_template/index.js` dans `src/<nom-provider>/index.js`
2. Adapter `BASE_URL`, les regex et la logique d'extraction
3. Compiler : `node build.js <nom-provider>`
4. Ajouter l'entrée dans `manifest.json`

### Format des streams retournés

```js
{
  name: "NomProvider",     // Identifiant du provider
  title: "1080p VF",       // Label affiché à l'utilisateur
  url: "https://...",      // URL directe (m3u8, mp4) ou player embarqué
  quality: "1080p",        // Qualité estimée
  size: "2.5 GB",          // Optionnel
  headers: {               // Headers pour la lecture
    "Referer": "https://source.com",
    "User-Agent": "Mozilla/5.0..."
  }
}
```

## Test

```js
// test-provider.js
const { getStreams } = require('./providers/frenchstream.js');

async function test() {
  // Oppenheimer (TMDB: 872585)
  const streams = await getStreams('872585', 'movie', null, null);
  console.log('Streams:', streams.length);
  streams.forEach(s => console.log(' -', s.title, s.url));
}

test();
```

```bash
node test-provider.js
```

## Licence

GPL-3.0 — Voir [LICENSE](LICENSE)

## Disclaimer

- Aucun contenu n'est hébergé par ce repository.
- Les providers récupèrent du contenu depuis des sites tiers.
- L'utilisation est sous la responsabilité de l'utilisateur.
