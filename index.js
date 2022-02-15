import { rename, readdir, unlink } from "fs";
import { join, normalize, parse } from "path";
import {
    MUSIC_DIRECTORY,
    REGEX,
    WEB_URL_REGEX,
    UNKNOWN_ARTIST,
    UNKNOWN_ALBUM,
    VARIOUS_ARTISTS
} from "./constants.js";


const buildNewPath = (songPath, artist, song) => {
    const newPath = join(MUSIC_DIRECTORY, artist, UNKNOWN_ALBUM, song);
    const normalizedPath = normalize(newPath);
    songPath.replace(/(s+)(\&+)/g, "\ ");

    rename(songPath, normalizedPath, err => {
        if (err) {
            throw err;
        }

        // fs.unlink(albumDirectory, err => {
        //     if (err) {
        //         throw err;
        //     }
        // })

        console.log(`Song ${songPath} has been reformatted to ${newPath}`);
    });
}

function formatSongs() {
    // Loop through all the files in the temp directory

    readdir(normalize(MUSIC_DIRECTORY), (err, artists) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        artists.forEach(artist => {
            if (!artist.startsWith(".")){
                const isArtistUnknown = WEB_URL_REGEX.test(artist) || artist == UNKNOWN_ARTIST || artist == VARIOUS_ARTISTS;
                artist = isArtistUnknown ? UNKNOWN_ARTIST : artist;
                const albumDirectory = join(MUSIC_DIRECTORY, artist);

                readdir(normalize(albumDirectory), (err, albums) => {
                    if (err) {
                        throw err;
                    }

                    albums.forEach(album => {
                        if (!album.startsWith(".")) {
                            const songDirectory = join(MUSIC_DIRECTORY, artist, album);

                            readdir(normalize(songDirectory), (err, songs) => {
                                if (err) {
                                    throw err;
                                }
                                songs.forEach(song => {
                                    if (!song.startsWith(".")) {
                                        const songPath = join(MUSIC_DIRECTORY, artist, album, song);
                                        const songObject = parse(songPath);

                                        const cleansedSong = songObject.name.replace(REGEX, "").trim();
                                        const parsedSong = cleansedSong.split("-");

                                        if (parsedSong.length > 1) {

                                            const newArtist = parsedSong[0][0] == "." ? UNKNOWN_ARTIST : parsedSong[0].trim();

                                            const newSong = parsedSong[1] ? parsedSong[1].trim() : song;

                                            if (!isNaN(newSong)){
                                                unlink(join(MUSIC_DIRECTORY, artist, album, song), (err) => {
                                                    if (err) {
                                                        console.log(err)
                                                    }

                                                    console.log("Deleted duplicate song: ", song)

                                                });
                                            } else {
                                                buildNewPath(songPath, newArtist, newSong + songObject.ext);
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    })
                });
            }
        })
    });
}

formatSongs();