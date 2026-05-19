async function getStreams(tmdbId, mediaType, season, episode) {

    console.log("Magstream Coflix loaded")

    return [
        {
            name: "Coflix",
            title: "Test Stream",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            quality: "1080p",
            type: "hls"
        }
    ]
}
