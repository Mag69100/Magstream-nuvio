const { resolveUqload } = require('./resolvers/uqload');
const { resolveDood } = require('./resolvers/doodstream');

function resolveStream(url) {

  if (url.includes('uqload'))
    return resolveUqload(url);

  if (url.includes('dood'))
    return resolveDood(url);

  return Promise.resolve(null);
}

module.exports = {
  resolveStream
};
