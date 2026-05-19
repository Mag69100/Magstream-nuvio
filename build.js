const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_DIR = path.join(__dirname, 'providers');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Transpile async/await for Hermes compatibility
const hermesTransformPlugin = {
  name: 'hermes-transform',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;
      // esbuild handles the transpilation via target option
    });
  }
};

async function buildProvider(providerName) {
  const entryPoint = path.join(SRC_DIR, providerName, 'index.js');
  if (!fs.existsSync(entryPoint)) {
    console.error(`[Build] Entry point not found: ${entryPoint}`);
    return;
  }

  const outFile = path.join(OUT_DIR, `${providerName}.js`);

  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      outfile: outFile,
      platform: 'node',
      target: ['es5'],
      format: 'cjs',
      minify: false,
      external: ['cheerio-without-node-native', 'crypto-js', 'axios'],
      plugins: [hermesTransformPlugin],
    });

    console.log(`[Build] ✅ ${providerName} → providers/${providerName}.js`);
  } catch (err) {
    console.error(`[Build] ❌ Error building ${providerName}:`, err.message);
  }
}

async function transpileSingleFile(filename) {
  const inputFile = filename
    ? path.join(OUT_DIR, filename)
    : null;

  const files = filename
    ? [inputFile]
    : fs.readdirSync(OUT_DIR).map(f => path.join(OUT_DIR, f)).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const tmpOut = file + '.tmp.js';
    try {
      await esbuild.build({
        entryPoints: [file],
        bundle: false,
        outfile: tmpOut,
        platform: 'node',
        target: ['es5'],
        format: 'cjs',
      });
      fs.renameSync(tmpOut, file);
      console.log(`[Transpile] ✅ ${path.basename(file)}`);
    } catch (err) {
      console.error(`[Transpile] ❌ ${path.basename(file)}:`, err.message);
      if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === '--transpile') {
    await transpileSingleFile(args[1]);
    return;
  }

  if (args.length > 0) {
    for (const name of args) {
      await buildProvider(name);
    }
    return;
  }

  // Build all providers in src/
  if (!fs.existsSync(SRC_DIR)) {
    console.log('[Build] No src/ directory found.');
    return;
  }

  const providers = fs.readdirSync(SRC_DIR).filter(f => {
    return fs.statSync(path.join(SRC_DIR, f)).isDirectory() && !f.startsWith('_');
  });

  if (providers.length === 0) {
    console.log('[Build] No providers found in src/');
    return;
  }

  for (const p of providers) {
    await buildProvider(p);
  }

  console.log('\n[Build] All done!');
}

main().catch(console.error);
