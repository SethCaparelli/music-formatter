const { readdir } = require("fs");
const { join, normalize } = require("path");
const {
    MUSIC_DIRECTORY,
    WEB_URL_REGEX,
    UNKNOWN_ARTIST
} = require("./constants");
const {Track} = require("./classes/track");

main = (state) =>{
    console.log(state);
    // Loop through all the files in the music directory

    readdir(normalize(MUSIC_DIRECTORY), (err, artists) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        // Loop through all artists
        artists.forEach(artist => {
            const isArtistMalformed = WEB_URL_REGEX.test(artist);
            const isArtistUnknown = artist === UNKNOWN_ARTIST;
            if ((isArtistMalformed || isArtistUnknown) && !artist.startsWith(".")){
                const albumDirectory = join(MUSIC_DIRECTORY, artist);

                readdir(normalize(albumDirectory), (err, albums) => {
                    if (err) {
                        throw err;
                    }

                    // Loop through all albums
                    albums.forEach(album => {
                        if (!album.startsWith(".")) {
                            const songDirectory = join(MUSIC_DIRECTORY, artist, album);

                            readdir(normalize(songDirectory), (err, names) => {
                                if (err) {
                                    throw err;
                                }
                                names.forEach(name => {
                                    if (!name.startsWith(".")) {
                                        const track = new Track(
                                            MUSIC_DIRECTORY,
                                            artist,
                                            album,
                                            name
                                        );
                                        track.modifySong();
                                    }
                                });
                            });
                        }
                    })
                });
            }
        })
    });
};

main();