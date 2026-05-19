module.exports.getStreams = async function (tmdbId, mediaType, season, episode) {

    console.log("Coflix Nuvio loaded")

    const base = "https://coflix.wales/wp-json/apiflix/v1"

    try {

        // -------------------------
        // MOVIE
        // -------------------------
        if (mediaType === "movie") {

            const res = await fetch(`${base}/movies/${tmdbId}`)
            const data = await res.json()

            if (!data) return []

            return parseLinks(data)
        }

        // -------------------------
        // TV SERIES
        // -------------------------
        if (mediaType === "tv") {

            const res = await fetch(`${base}/series/${tmdbId}/${season}`)
            const data = await res.json()

            if (!data || !data.episodes) return []

            const ep = data.episodes.find(e => Number(e.number) === Number(episode))

            if (!ep) return []

            return parseLinks(ep)
        }

    } catch (e) {
        console.log("Coflix error:", e)
    }

    return []
}


// -------------------------
// EXTRACT STREAMS
// -------------------------
function parseLinks(data) {

    const streams = []

    if (!data || !data.links) return streams

    for (const link of data.links) {

        streams.push({
            name: "Coflix",
            title: "1080p Stream",
            url: link,
            quality: "1080p",
            type: "hls",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://coflix.wales/"
            }
        })
    }

    return streams
}
