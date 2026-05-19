const { fetchText, UA } = require('../http');

function resolveDood(url) {
  return fetchText(url, url)
    .then(html => {
      const match = html.match(/['"]\/pass_md5([^'"]+)['"]/);

      if (!match) return null;

      return fetch('https://dood.pm' + match[1], {
        headers: {
          'User-Agent': UA,
          'Referer': url
        }
      })
      .then(r => r.text())
      .then(part => {
        const finalUrl =
          part + '123456789?token=abcd';

        return {
          url: finalUrl,
          headers: {
            'User-Agent': UA,
            'Referer': url
          }
        };
      });
    })
    .catch(() => null);
}

module.exports = {
  resolveDood
};
