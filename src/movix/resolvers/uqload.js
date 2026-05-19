const { fetchText, UA } = require('../http');

function resolveUqload(url) {
  return fetchText(url, url)
    .then(html => {
      const match = html.match(/sources:\s*\[\s*\{file:\s*"([^"]+)"/i);

      if (!match) return null;

      return {
        url: match[1],
        headers: {
          'User-Agent': UA,
          'Referer': url
        }
      };
    })
    .catch(() => null);
}

module.exports = {
  resolveUqload
};
