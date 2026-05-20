var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/movix/http.js
var require_http = __commonJS({
  "src/movix/http.js"(exports2, module2) {
    var UA = "Mozilla/5.0";
    function fetchText(url, referer) {
      return fetch(url, {
        headers: {
          "User-Agent": UA,
          "Referer": referer || url
        }
      }).then((r) => r.text());
    }
    module2.exports = {
      fetchText,
      UA
    };
  }
});

// src/movix/resolvers/uqload.js
var require_uqload = __commonJS({
  "src/movix/resolvers/uqload.js"(exports2, module2) {
    var { fetchText, UA } = require_http();
    function resolveUqload(url) {
      return fetchText(url, url).then((html) => {
        const match = html.match(/sources:\s*\[\s*\{file:\s*"([^"]+)"/i);
        if (!match)
          return null;
        return {
          url: match[1],
          headers: {
            "User-Agent": UA,
            "Referer": url
          }
        };
      }).catch(() => null);
    }
    module2.exports = {
      resolveUqload
    };
  }
});

// src/movix/resolvers/doodstream.js
var require_doodstream = __commonJS({
  "src/movix/resolvers/doodstream.js"(exports2, module2) {
    var { fetchText, UA } = require_http();
    function resolveDood(url) {
      return fetchText(url, url).then((html) => {
        const match = html.match(/['"]\/pass_md5([^'"]+)['"]/);
        if (!match)
          return null;
        return fetch("https://dood.pm" + match[1], {
          headers: {
            "User-Agent": UA,
            "Referer": url
          }
        }).then((r) => r.text()).then((part) => {
          const finalUrl = part + "123456789?token=abcd";
          return {
            url: finalUrl,
            headers: {
              "User-Agent": UA,
              "Referer": url
            }
          };
        });
      }).catch(() => null);
    }
    module2.exports = {
      resolveDood
    };
  }
});

// src/movix/extractor.js
var require_extractor = __commonJS({
  "src/movix/extractor.js"(exports2, module2) {
    var { resolveUqload } = require_uqload();
    var { resolveDood } = require_doodstream();
    function resolveStream2(url) {
      if (url.includes("uqload"))
        return resolveUqload(url);
      if (url.includes("dood"))
        return resolveDood(url);
      return Promise.resolve(null);
    }
    module2.exports = {
      resolveStream: resolveStream2
    };
  }
});

// src/movix/index.js
var { resolveStream } = require_extractor();
function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[Movix] TMDB:", tmdbId);
  const testUrls = [
    "https://uqload.net/embed-xxxx.html",
    "https://dood.pm/e/xxxx"
  ];
  return Promise.all(
    testUrls.map((url) => resolveStream(url))
  ).then((results) => {
    return results.filter((r) => r).map((r) => ({
      name: "Movix",
      title: "Resolved",
      url: r.url,
      quality: "HD",
      headers: r.headers
    }));
  });
}
module.exports = {
  getStreams
};
