const {
    rename,
    readdir,
    unlink,
    mkdir,
    rmdir
} = require("fs");
const { join, normalize, parse } = require("path");
const {
    MUSIC_DIRECTORY,
    REGEX,
    WEB_URL_REGEX,
    UNKNOWN_ARTIST,
    UNKNOWN_ALBUM
} = require("./constants.js");

const modifySong = (song, artist, album, isArtistMalformed) => {
    if (!song.startsWith(".")) {
        const oldPath = join(MUSIC_DIRECTORY, artist, album, song);
        const oldPathObject = parse(oldPath);

        const cleansedSong = oldPathObject.name.replace(REGEX, "").trim();
        const parsedSong = cleansedSong.split("-");

        if (parsedSong.length > 1) {

            const newArtist = parsedSong[0][0] == "." || isArtistMalformed ? UNKNOWN_ARTIST : parsedSong[0].trim();

            const newSong = parsedSong[1] ? parsedSong[1].trim() : song;

            if (!isNaN(newSong)){
                unlink(join(MUSIC_DIRECTORY, artist, album, song), (err) => {
                    if (err) {
                        console.log(err)
                    }

                    console.log("Deleted duplicate song: ", song)

                });
            } else {
                buildNewPath(oldPath, newArtist, newSong + oldPathObject.ext, artist, album, false);
            }
        } if (isArtistMalformed) {
            buildNewPath(oldPath, UNKNOWN_ARTIST, song, artist, album, true);
        }
    }
}


const buildNewPath = (oldPath, newArtist, song, oldArtist, oldAlbum, isArtistMalformed) => {
    const isAlbumMalformed = WEB_URL_REGEX.test(oldAlbum);
    const newAlbum = isAlbumMalformed ? UNKNOWN_ALBUM : oldAlbum;
    const newPath = join(MUSIC_DIRECTORY, newArtist, newAlbum, song);

    mkdir(join(MUSIC_DIRECTORY, newArtist, newAlbum), {recursive: true}, err => {
        if (err) {
            console.error(err);
        }

        rename(normalize(oldPath), normalize(newPath), err => {
            if (err) {
                console.error(err);
            }

            if (isArtistMalformed) {
                const artistDir = join(MUSIC_DIRECTORY, oldArtist);
                rmdir(normalize(artistDir), {recursive: true}, err => {
                    if (err) {
                        console.error(err)
                    }
                });
            }

            console.log(`SUCCESS: Song ${oldPath} has been reformatted to ${newPath}`);
        });
    });

}

const main = (state) =>{
    console.log(state);
    // Loop through all the files in the music directory

    readdir(normalize(MUSIC_DIRECTORY), (err, artists) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        // Loop through all artists
        artists.forEach(artist => {
            const isArtistUnknown = artist === UNKNOWN_ARTIST;
            const isArtistMalformed = WEB_URL_REGEX.test(artist);
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

                            readdir(normalize(songDirectory), (err, songs) => {
                                if (err) {
                                    throw err;
                                }
                                songs.forEach(song => {
                                    modifySong(song, artist, album, isArtistMalformed);
                                });
                            });
                        }
                    })
                });
            }
        })
    });
};