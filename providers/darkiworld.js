var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/extractors/doodstream.js
var require_doodstream = __commonJS({
  "src/extractors/doodstream.js"(exports2, module2) {
    var DOOD_DOMAINS = [
      "doodstream.com",
      "doods.pro",
      "d0o0d.com",
      "ds2play.com",
      "dsvplay.com",
      "doodstream.co",
      "dood.watch",
      "dood.to",
      "dood.so",
      "dood.cx",
      "dood.la",
      "dood.ws"
    ];
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return DOOD_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractDood(playerUrl) {
      var videoUrl = playerUrl.replace("/d/", "/e/").replace("/f/", "/e/");
      return fetch(videoUrl, {
        headers: { "User-Agent": UA, "Referer": "https://doodstream.com/" }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var passMd5Match = html.match(/\/pass_md5\/[^'"]*/);
        if (!passMd5Match)
          return null;
        var passMd5Url = passMd5Match[0];
        var baseUrl = new URL(videoUrl).origin;
        return fetch(baseUrl + passMd5Url, {
          headers: {
            "User-Agent": UA,
            "Referer": videoUrl
          }
        }).then(function(r) {
          return r.text();
        }).then(function(token) {
          var randomMatch = html.match(/\?token=([^&'"]+)/);
          var tokenParam = randomMatch ? randomMatch[1] : "";
          var timestamp = Date.now();
          var streamUrl = token + makeRandom(10) + "?token=" + tokenParam + "&expiry=" + timestamp;
          return {
            url: streamUrl,
            headers: {
              "User-Agent": UA,
              "Referer": baseUrl + "/"
            }
          };
        });
      });
    }
    function makeRandom(length) {
      var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var result = "";
      for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    module2.exports = { canHandle, extract: extractDood };
  }
});

// src/extractors/streamtape.js
var require_streamtape = __commonJS({
  "src/extractors/streamtape.js"(exports2, module2) {
    var STREAMTAPE_DOMAINS = [
      "streamtape.com",
      "streamtape.to",
      "streamtape.net",
      "streamtape.xyz",
      "tapestream.net",
      "streamtap.com"
    ];
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return STREAMTAPE_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractStreamtape(playerUrl) {
      var videoUrl = playerUrl.replace("/e/", "/").replace("embed-", "");
      return fetch(videoUrl, {
        headers: { "User-Agent": UA, "Referer": "https://streamtape.com/" }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var linkMatch = html.match(/getElementById\(['"](id[^'"]+)['"]\)[^=]*=[^"']*["']([^"']+)["'][^+]*\+[^"']*["']([^"']+)["']/);
        if (!linkMatch) {
          var directMatch = html.match(/https:\/\/[^"']+\.streamtape\.com\/get_video[^"']*/);
          if (directMatch) {
            return {
              url: "https:" + directMatch[0].replace("https:", ""),
              headers: { "Referer": videoUrl }
            };
          }
          return null;
        }
        var part1 = linkMatch[2];
        var part2 = linkMatch[3];
        var streamUrl = "https:" + (part1 + part2).substring(part1.substring(4).length > 0 ? 4 : 0);
        return {
          url: streamUrl,
          headers: {
            "User-Agent": UA,
            "Referer": "https://streamtape.com/"
          }
        };
      });
    }
    module2.exports = { canHandle, extract: extractStreamtape };
  }
});

// src/extractors/sendvid.js
var require_sendvid = __commonJS({
  "src/extractors/sendvid.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return url.includes("sendvid.com");
    }
    function extractSendvid(playerUrl) {
      return fetch(playerUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://sendvid.com/"
        }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var sourceMatch = html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i);
        if (sourceMatch) {
          return {
            url: sourceMatch[1],
            headers: { "Referer": "https://sendvid.com/" }
          };
        }
        var jsMatch = html.match(/["']?source["']?\s*:\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i);
        if (jsMatch) {
          return {
            url: jsMatch[1],
            headers: { "Referer": "https://sendvid.com/" }
          };
        }
        var fileMatch = html.match(/"file"\s*:\s*"([^"]+)"/);
        if (fileMatch) {
          return {
            url: fileMatch[1],
            headers: { "Referer": playerUrl }
          };
        }
        return null;
      });
    }
    module2.exports = { canHandle, extract: extractSendvid };
  }
});

// src/extractors/sibnet.js
var require_sibnet = __commonJS({
  "src/extractors/sibnet.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return url.includes("sibnet.ru");
    }
    function extractSibnet(playerUrl) {
      return fetch(playerUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://video.sibnet.ru/"
        }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var srcMatch = html.match(/player\.src\(\[?\s*\{[^}]*src\s*:\s*["']([^"']+)["']/);
        if (!srcMatch) {
          srcMatch = html.match(/["']\/v\/[^"']+\.mp4[^"']*["']/);
          if (srcMatch) {
            return {
              url: "https://video.sibnet.ru" + srcMatch[0].replace(/["']/g, ""),
              headers: {
                "Referer": "https://video.sibnet.ru/",
                "User-Agent": UA
              }
            };
          }
          return null;
        }
        var videoPath = srcMatch[1];
        var videoUrl = videoPath.startsWith("http") ? videoPath : "https://video.sibnet.ru" + videoPath;
        return fetch(videoUrl, {
          headers: {
            "User-Agent": UA,
            "Referer": playerUrl
          },
          redirect: "manual"
        }).then(function(r) {
          var location = r.headers.get("location");
          return {
            url: location || videoUrl,
            headers: {
              "User-Agent": UA,
              "Referer": "https://video.sibnet.ru/"
            }
          };
        });
      });
    }
    module2.exports = { canHandle, extract: extractSibnet };
  }
});

// src/extractors/vidmoly.js
var require_vidmoly = __commonJS({
  "src/extractors/vidmoly.js"(exports2, module2) {
    var VIDMOLY_DOMAINS = ["vidmoly.me", "vidmoly.net", "vidmoly.to"];
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return VIDMOLY_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractVidmoly(playerUrl) {
      var embedUrl = playerUrl.includes("/e/") ? playerUrl : playerUrl.replace(/\/v\//, "/e/");
      return fetch(embedUrl, {
        headers: { "User-Agent": UA, "Referer": "https://vidmoly.me/" }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var m3u8Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
        if (m3u8Match) {
          return {
            url: m3u8Match[1],
            quality: "HLS",
            headers: {
              "Referer": embedUrl,
              "User-Agent": UA,
              "Origin": new URL(embedUrl).origin
            }
          };
        }
        var mp4Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/);
        if (mp4Match) {
          return {
            url: mp4Match[1],
            quality: "MP4",
            headers: { "Referer": embedUrl }
          };
        }
        var sourcesMatch = html.match(/sources\s*:\s*\[([^\]]+)\]/);
        if (sourcesMatch) {
          var fileInSources = sourcesMatch[1].match(/"(https?:\/\/[^"]+)"/);
          if (fileInSources) {
            return {
              url: fileInSources[1],
              headers: { "Referer": embedUrl }
            };
          }
        }
        return null;
      });
    }
    module2.exports = { canHandle, extract: extractVidmoly };
  }
});

// src/extractors/filemoon.js
var require_filemoon = __commonJS({
  "src/extractors/filemoon.js"(exports2, module2) {
    var FILEMOON_DOMAINS = ["filemoon.sx", "filemoon.in", "filemoon.to", "filemoon.nl", "lukefirst.lol", "moonmov.pro"];
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return FILEMOON_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractFilemoon(playerUrl) {
      var embedUrl = playerUrl.includes("/e/") ? playerUrl : playerUrl.replace(/\/(v|f)\//, "/e/");
      return fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://filemoon.sx/"
        }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var m3u8Match = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
        if (m3u8Match) {
          return {
            url: m3u8Match[1],
            quality: "HLS",
            headers: {
              "Referer": embedUrl,
              "User-Agent": UA,
              "Origin": new URL(embedUrl).origin
            }
          };
        }
        var evalMatch = html.match(new RegExp("eval\\(function\\(p,a,c,k,e,(?:r|d)\\).*?\\)\\)", "s"));
        if (evalMatch) {
          var packed = evalMatch[0];
          var urlMatch = packed.match(/['"](https?:[^'"]+\.m3u8[^'"]*)['"]/);
          if (urlMatch) {
            return {
              url: urlMatch[1],
              quality: "HLS",
              headers: { "Referer": embedUrl, "User-Agent": UA }
            };
          }
        }
        var fileMatch = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
        if (fileMatch) {
          return {
            url: fileMatch[1],
            headers: { "Referer": embedUrl, "User-Agent": UA }
          };
        }
        return null;
      });
    }
    module2.exports = { canHandle, extract: extractFilemoon };
  }
});

// src/extractors/streamwish.js
var require_streamwish = __commonJS({
  "src/extractors/streamwish.js"(exports2, module2) {
    var STREAMWISH_DOMAINS = [
      "streamwish.to",
      "streamwish.com",
      "streamwish.net",
      "streamhls.to",
      "filelions.to",
      "filelions.live",
      "dintezuvio.com",
      "wishembed.net",
      "awish.me"
    ];
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return STREAMWISH_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractStreamwish(playerUrl) {
      var embedUrl = playerUrl.includes("/e/") ? playerUrl : playerUrl.replace(/\/(v|f)\//, "/e/");
      return fetch(embedUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": new URL(embedUrl).origin + "/"
        }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var m3u8Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.m3u8[^"]*)"/);
        if (m3u8Match) {
          return buildResult(m3u8Match[1], embedUrl, "HLS");
        }
        var mp4Match = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+\.mp4[^"]*)"/);
        if (mp4Match) {
          return buildResult(mp4Match[1], embedUrl, "MP4");
        }
        var sourcesMatch = html.match(/sources\s*:\s*\[\s*\{[^}]*"file"\s*:\s*"([^"]+)"/);
        if (sourcesMatch) {
          return buildResult(sourcesMatch[1], embedUrl, "HLS");
        }
        var directMatch = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
        if (directMatch) {
          return buildResult(directMatch[1], embedUrl, "HLS");
        }
        return null;
      });
    }
    function buildResult(url, referer, format) {
      return {
        url,
        quality: format === "HLS" ? "HLS" : "MP4",
        headers: {
          "Referer": referer,
          "User-Agent": UA,
          "Origin": new URL(referer).origin
        }
      };
    }
    module2.exports = { canHandle, extract: extractStreamwish };
  }
});

// src/extractors/voe.js
var require_voe = __commonJS({
  "src/extractors/voe.js"(exports2, module2) {
    var VOE_DOMAINS = [
      "voe.sx",
      "ralphysuccessfull.org",
      "christopheruntilpoint.com",
      "voe.sx",
      "voe.to",
      "eggyeasilydone.com",
      "toughtagtruck.com"
    ];
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return VOE_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractVoe(playerUrl) {
      return fetch(playerUrl, {
        headers: { "User-Agent": UA, "Referer": "https://voe.sx/" }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var hlsMatch = html.match(/'hls'\s*:\s*'([^']+)'/);
        if (!hlsMatch)
          hlsMatch = html.match(/"hls"\s*:\s*"([^"]+)"/);
        if (hlsMatch) {
          var url = hlsMatch[1];
          if (!url.startsWith("http")) {
            try {
              url = atob(url);
            } catch (e) {
            }
          }
          return { url, quality: "HLS", headers: { "Referer": "https://voe.sx/" } };
        }
        var mp4Match = html.match(/'mp4'\s*:\s*'([^']+)'/);
        if (!mp4Match)
          mp4Match = html.match(/"mp4"\s*:\s*"([^"]+\.mp4[^"]*)"/);
        if (mp4Match) {
          return { url: mp4Match[1], quality: "MP4", headers: { "Referer": "https://voe.sx/" } };
        }
        var directHls = html.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
        if (directHls) {
          return { url: directHls[1], quality: "HLS", headers: { "Referer": playerUrl } };
        }
        return null;
      });
    }
    module2.exports = { canHandle, extract: extractVoe };
  }
});

// src/extractors/frembed.js
var require_frembed = __commonJS({
  "src/extractors/frembed.js"(exports2, module2) {
    var FREMBED_DOMAINS = ["frembed.best", "frembed.work", "frembed.bond", "frembed.fun", "frembed.pro"];
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    function canHandle(url) {
      return FREMBED_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractFrembed(playerUrl) {
      var idMatch = playerUrl.match(/\/(?:v|e|embed)\/([a-zA-Z0-9_-]+)/);
      var videoId = idMatch ? idMatch[1] : null;
      return fetch(playerUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": new URL(playerUrl).origin + "/"
        }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var apiMatch = html.match(/(?:api|sources?|stream)\s*[=:]\s*["']?(https?:\/\/[^"'\s]+)["']?/i);
        if (apiMatch) {
          return fetch(apiMatch[1], {
            headers: { "Referer": playerUrl, "User-Agent": UA }
          }).then(function(r) {
            return r.json();
          }).then(function(data) {
            var url = data.url || data.stream || data.file || data.sources && data.sources[0] && data.sources[0].file;
            if (url)
              return { url, headers: { "Referer": playerUrl } };
            return null;
          }).catch(function() {
            return null;
          });
        }
        var m3u8Match = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
        if (m3u8Match) {
          return {
            url: m3u8Match[1],
            quality: "HLS",
            headers: { "Referer": playerUrl, "User-Agent": UA }
          };
        }
        var mp4Match = html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/);
        if (mp4Match) {
          return {
            url: mp4Match[1],
            quality: "MP4",
            headers: { "Referer": playerUrl }
          };
        }
        var fileMatch = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
        if (fileMatch) {
          return { url: fileMatch[1], headers: { "Referer": playerUrl } };
        }
        return null;
      });
    }
    module2.exports = { canHandle, extract: extractFrembed };
  }
});

// src/extractors/generic.js
var require_generic = __commonJS({
  "src/extractors/generic.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    var GENERIC_DOMAINS = [
      "mp4upload.com",
      "uqload.io",
      "uqload.cx",
      "uqload.co",
      "mixdrop.co",
      "mixdrop.club",
      "mixdrop.bz",
      "vidoza.net",
      "upstream.to",
      "ds2play.com",
      "netu.tv",
      "younetu.org",
      "ok.ru",
      "vk.com",
      "dailymotion.com",
      "streamhls.to",
      "mjedge.net",
      "bigwarp.io",
      "autruche.space"
    ];
    function canHandle(url) {
      return GENERIC_DOMAINS.some(function(d) {
        return url.includes(d);
      });
    }
    function extractGeneric(playerUrl) {
      var origin = "";
      try {
        origin = new URL(playerUrl).origin;
      } catch (e) {
      }
      return fetch(playerUrl, {
        headers: {
          "User-Agent": UA,
          "Referer": origin + "/"
        }
      }).then(function(r) {
        return r.text();
      }).then(function(html) {
        var jwMatch = html.match(/sources\s*:\s*\[\s*\{[^}]*["']?file["']?\s*:\s*["']([^"']+)["']/);
        if (jwMatch)
          return buildStream(jwMatch[1], playerUrl);
        var fileMatch = html.match(/"file"\s*:\s*"(https?:\/\/[^"]+)"/);
        if (fileMatch)
          return buildStream(fileMatch[1], playerUrl);
        var srcMatch = html.match(/player\.src\(\[\s*\{[^}]*src\s*:\s*["']([^"']+)["']/);
        if (srcMatch)
          return buildStream(srcMatch[1], playerUrl);
        var sourceMatch = html.match(/<source[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i);
        if (sourceMatch)
          return buildStream(sourceMatch[1], playerUrl);
        var attrMatch = html.match(/setAttribute\(['"]src["'],\s*["']([^"']+)["']\)/);
        if (attrMatch)
          return buildStream(attrMatch[1], playerUrl);
        var m3u8Direct = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);
        if (m3u8Direct)
          return buildStream(m3u8Direct[1], playerUrl);
        var mp4Direct = html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/);
        if (mp4Direct)
          return buildStream(mp4Direct[1], playerUrl);
        if (playerUrl.includes("ok.ru")) {
          var okMatch = html.match(/"url"\s*:\s*"(https?:[^"]+\.(?:m3u8|mp4)[^"]*)"[^}]*"name"\s*:\s*"([^"]+)"/);
          if (okMatch)
            return buildStream(decodeURIComponent(okMatch[1].replace(/\\/g, "")), playerUrl);
        }
        if (playerUrl.includes("dailymotion.com")) {
          var dmId = playerUrl.match(/\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/);
          if (dmId) {
            return fetch("https://www.dailymotion.com/player/metadata/video/" + dmId[1], {
              headers: { "User-Agent": UA }
            }).then(function(r) {
              return r.json();
            }).then(function(data) {
              var qualities = data.qualities || {};
              var best = qualities["1080"] || qualities["720"] || qualities["480"] || qualities["auto"];
              if (best && best[0])
                return buildStream(best[0].url, playerUrl);
              return null;
            }).catch(function() {
              return null;
            });
          }
        }
        return null;
      });
    }
    function buildStream(url, referer) {
      if (!url || !url.startsWith("http"))
        return null;
      var quality = url.includes(".m3u8") ? "HLS" : url.includes("1080") ? "1080p" : url.includes("720") ? "720p" : "HD";
      return {
        url,
        quality,
        headers: {
          "Referer": referer,
          "User-Agent": UA
        }
      };
    }
    module2.exports = { canHandle, extract: extractGeneric };
  }
});

// src/extractors/index.js
var require_extractors = __commonJS({
  "src/extractors/index.js"(exports2, module2) {
    var import_doodstream = __toESM(require_doodstream());
    var import_streamtape = __toESM(require_streamtape());
    var import_sendvid = __toESM(require_sendvid());
    var import_sibnet = __toESM(require_sibnet());
    var import_vidmoly = __toESM(require_vidmoly());
    var import_filemoon = __toESM(require_filemoon());
    var import_streamwish = __toESM(require_streamwish());
    var import_voe = __toESM(require_voe());
    var import_frembed = __toESM(require_frembed());
    var import_generic = __toESM(require_generic());
    var EXTRACTORS = [
      { name: "Doodstream", canHandle: import_doodstream.canHandle, extract: import_doodstream.extract },
      { name: "Streamtape", canHandle: import_streamtape.canHandle, extract: import_streamtape.extract },
      { name: "Sendvid", canHandle: import_sendvid.canHandle, extract: import_sendvid.extract },
      { name: "Sibnet", canHandle: import_sibnet.canHandle, extract: import_sibnet.extract },
      { name: "Vidmoly", canHandle: import_vidmoly.canHandle, extract: import_vidmoly.extract },
      { name: "Filemoon", canHandle: import_filemoon.canHandle, extract: import_filemoon.extract },
      { name: "Streamwish", canHandle: import_streamwish.canHandle, extract: import_streamwish.extract },
      { name: "VOE", canHandle: import_voe.canHandle, extract: import_voe.extract },
      { name: "Frembed", canHandle: import_frembed.canHandle, extract: import_frembed.extract },
      { name: "Generic", canHandle: import_generic.canHandle, extract: import_generic.extract }
    ];
    async function resolveStream(playerUrl, providerName) {
      if (!playerUrl || !playerUrl.startsWith("http"))
        return null;
      for (var i = 0; i < EXTRACTORS.length; i++) {
        var extractor = EXTRACTORS[i];
        if (extractor.canHandle(playerUrl)) {
          console.log("[Extractor] " + (providerName || "") + " \u2192 " + extractor.name + " pour " + playerUrl);
          try {
            var result = await extractor.extract(playerUrl);
            if (result && result.url) {
              return result;
            }
          } catch (err) {
            console.error("[Extractor] " + extractor.name + " erreur:", err.message);
          }
        }
      }
      console.log("[Extractor] Aucun extracteur trouv\xE9 pour:", playerUrl);
      return null;
    }
    async function resolveStreams(playerUrls, providerName) {
      var results = [];
      for (var i = 0; i < playerUrls.length; i++) {
        var stream = await resolveStream(playerUrls[i], providerName);
        if (stream)
          results.push(stream);
      }
      return results;
    }
    async function extractAndResolve2(html, pageUrl, providerName) {
      var playerUrls = [];
      var iframeRegex = /(?:src|data-src)\s*=\s*["']([^"']+)["']/gi;
      var match;
      while ((match = iframeRegex.exec(html)) !== null) {
        var url = match[1];
        if (isLikelyPlayer(url)) {
          playerUrls.push(url);
        }
      }
      var directRegex = /"(?:file|src|source|url)"\s*:\s*"(https?:\/\/[^"]+\.(?:m3u8|mp4)[^"]*)"/gi;
      while ((match = directRegex.exec(html)) !== null) {
        var directUrl = match[1];
        playerUrls.push(directUrl);
      }
      playerUrls = playerUrls.filter(function(url2, index, self) {
        return self.indexOf(url2) === index;
      });
      console.log("[Extractor] " + playerUrls.length + " player(s) trouv\xE9(s) sur la page");
      var streams = [];
      for (var i = 0; i < playerUrls.length; i++) {
        var stream = await resolveStream(playerUrls[i], providerName);
        if (stream) {
          stream.sourceUrl = playerUrls[i];
          streams.push(stream);
        }
      }
      return streams;
    }
    function isLikelyPlayer(url) {
      if (!url.startsWith("http"))
        return false;
      var blocked = [
        "google.com",
        "facebook.com",
        "twitter.com",
        "instagram.com",
        "disqus.com",
        "analytics",
        "ads.",
        "doubleclick",
        "cloudflare.com",
        "googleapis.com",
        "gstatic.com",
        "gravatar.com"
      ];
      if (blocked.some(function(b) {
        return url.includes(b);
      }))
        return false;
      var players = [
        "player",
        "embed",
        "stream",
        "watch",
        "video",
        "play",
        ".m3u8",
        ".mp4",
        "dood",
        "streamtape",
        "sibnet",
        "vidmoly",
        "filemoon",
        "streamwish",
        "voe.sx",
        "frembed",
        "sendvid",
        "mixdrop",
        "uqload",
        "upstream",
        "ds2play",
        "ok.ru",
        "vk.com"
      ];
      return players.some(function(p) {
        return url.toLowerCase().includes(p);
      });
    }
    module2.exports = { resolveStream, resolveStreams, extractAndResolve: extractAndResolve2 };
  }
});

// src/darkiworld/index.js
var import_extractors = __toESM(require_extractors());
var BASE_URL = "https://darkiworld2026.com";
var PROVIDER_NAME = "DarkiWorld";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Referer": BASE_URL,
  "Accept-Language": "fr-FR,fr;q=0.9"
};
async function searchContent(tmdbId, mediaType) {
  const res = await fetch(`${BASE_URL}/?s=${tmdbId}`, { headers: HEADERS });
  const html = await res.text();
  const links = [];
  const regex = /href="(https?:\/\/darkiworld2026\.com\/[^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const l = match[1];
    if (!l.includes("/page/") && !l.includes("?s=") && l.length > BASE_URL.length + 5) {
      links.push(l);
    }
  }
  return links;
}
async function getPageHtml(pageUrl, season, episode) {
  let url = pageUrl;
  if (season && episode) {
    url = `${pageUrl.replace(/\/$/, "")}/saison-${season}/episode-${episode}/`;
  }
  const res = await fetch(url, { headers: HEADERS });
  return { html: await res.text(), url };
}
async function getStreams(tmdbId, mediaType, season, episode) {
  console.log(`[${PROVIDER_NAME}] Recherche ${mediaType} tmdbId=${tmdbId} S${season}E${episode}`);
  try {
    const links = await searchContent(tmdbId, mediaType);
    if (!links.length) {
      console.log(`[${PROVIDER_NAME}] Aucun r\xE9sultat`);
      return [];
    }
    const { html, url } = await getPageHtml(links[0], season, episode);
    const resolved = await (0, import_extractors.extractAndResolve)(html, url, PROVIDER_NAME);
    const streams = resolved.map((r) => ({
      name: PROVIDER_NAME,
      title: `${r.quality || "HD"} VF`,
      url: r.url,
      quality: r.quality || "HD",
      headers: r.headers || { "Referer": url }
    }));
    console.log(`[${PROVIDER_NAME}] ${streams.length} stream(s)`);
    return streams;
  } catch (err) {
    console.error(`[${PROVIDER_NAME}] Erreur:`, err.message);
    return [];
  }
}
module.exports = { getStreams };
