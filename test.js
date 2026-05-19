/**
 * Script de test rapide pour vérifier les providers
 * Usage: node test.js [nom-provider] [tmdb-id] [type] [saison] [episode]
 *
 * Exemples:
 *   node test.js frenchstream 872585 movie
 *   node test.js coflix 1396 tv 1 1
 *   node test.js animesama 31964 tv 1 1
 */

const path = require('path');

const args = process.argv.slice(2);
const providerName = args[0] || 'cineplateforme';
const tmdbId = args[1] || '872585';  // Oppenheimer par défaut
const mediaType = args[2] || 'movie';
const season = args[3] ? parseInt(args[3]) : null;
const episode = args[4] ? parseInt(args[4]) : null;

const providerPath = path.join(__dirname, 'providers', `${providerName}.js`);

console.log(`\n🎬 Test provider: ${providerName}`);
console.log(`   TMDB: ${tmdbId} | Type: ${mediaType} | S${season}E${episode}\n`);

try {
  const { getStreams } = require(providerPath);

  getStreams(tmdbId, mediaType, season, episode)
    .then(streams => {
      console.log(`\n✅ ${streams.length} stream(s) trouvé(s):\n`);
      streams.forEach((s, i) => {
        console.log(`[${i + 1}] ${s.name} - ${s.title}`);
        console.log(`    Qualité: ${s.quality}`);
        console.log(`    URL: ${s.url}`);
        if (s.headers) console.log(`    Headers: ${JSON.stringify(s.headers)}`);
        console.log('');
      });

      if (streams.length === 0) {
        console.log('ℹ️  Aucun stream trouvé. Possibles raisons:');
        console.log('   - Le site a changé de structure HTML');
        console.log('   - Le contenu n\'est pas disponible sur ce provider');
        console.log('   - Vérifier les regex dans le provider');
      }
    })
    .catch(err => {
      console.error('❌ Erreur:', err.message);
    });

} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error(`❌ Provider "${providerName}" non trouvé dans providers/`);
    console.error('   Compilez-le d\'abord: node build.js ' + providerName);
  } else {
    console.error('❌ Erreur:', err.message);
  }
}
