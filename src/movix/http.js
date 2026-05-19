const UA = 'Mozilla/5.0';

function fetchText(url, referer) {
  return fetch(url, {
    headers: {
      'User-Agent': UA,
      'Referer': referer || url
    }
  }).then(r => r.text());
}

module.exports = {
  fetchText,
  UA
};
