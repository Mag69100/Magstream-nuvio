const esbuild = require('esbuild');
const fs = require('fs');

async function buildProvider(name) {

  const entry = `src/${name}/index.js`;
  const outfile = `providers/${name}.js`;

  if (!fs.existsSync(entry)) {
    console.log('Provider not found:', name);
    return;
  }

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile,
    format: 'cjs',
    platform: 'browser',
    minify: false
  });

  console.log('Built:', outfile);
}

const provider = process.argv[2];

if (!provider) {
  console.log('Usage: node build.js provider');
  process.exit(1);
}

buildProvider(provider);
