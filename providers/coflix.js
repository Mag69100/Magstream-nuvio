/**
 * coflix - Built from src/coflix/
 * Generated: 2026-05-19T17:07:40.665Z
 */
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/coflix/extractor.js
var BASE_URL = "https://coflix.dance";
function decodeBase64(str) {
  try {
    return atob(str);
  } catch (e) {
    return Buffer.from(str, "base64").toString("utf-8");
  }
}
function extractStreams(movieId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      let apiUrl;
      if (mediaType === "movie") {
        apiUrl = `${BASE_URL}/wp-json/apiflix/v1/playermovie?post_id=${movieId}`;
      } else {
        return [];
      }
      const res = yield fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": BASE_URL
        }
      });
      const json = yield res.json();
      if (!json.links || !json.links.online) {
        return [];
      }
      const streams = [];
      for (const host of json.links.online) {
        try {
          const pageRes = yield fetch(host.link, {
            headers: {
              "User-Agent": "Mozilla/5.0",
              "Referer": BASE_URL
            }
          });
          const html = yield pageRes.text();
          const matches = [...html.matchAll(/showVideo\('([^']+)/g)];
          for (const m of matches) {
            const decoded = decodeBase64(m[1]);
            streams.push({
              name: "CoFliX",
              title: host.lang || "VF",
              url: decoded,
              quality: "HD",
              headers: {
                Referer: BASE_URL,
                "User-Agent": "Mozilla/5.0"
              }
            });
          }
        } catch (e) {
          console.log("[CoFliX] host error", e.message);
        }
      }
      return streams;
    } catch (e) {
      console.log("[CoFliX] extractor error", e.message);
      return [];
    }
  });
}

// src/coflix/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log("[Coflix]", tmdbId);
    return yield extractStreams(tmdbId, mediaType);
  });
}
module.exports = { getStreams };
