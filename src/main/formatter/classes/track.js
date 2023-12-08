const {
    rename,
    unlink,
    mkdir,
    rmdir
} = require("fs");
const { join, normalize, parse } = require("path");
const {
    REGEX,
    WEB_URL_REGEX,
    UNKNOWN_ARTIST,
    UNKNOWN_ALBUM
} = require("../constants");

class Track {
    constructor(
        musicDirectory,
        oldArtist,
        oldAlbum,
        oldName
    ) {
        this.musicDirectory = musicDirectory;
        this.oldArtist = oldArtist;
        this.oldAlbum = oldAlbum;
        this.oldName = oldName;
        this.oldPath = join(musicDirectory, oldArtist, oldAlbum, oldName)
        this.oldPathObject = parse(this.oldPath);
        this.isAlbumMalformed = WEB_URL_REGEX.test(oldAlbum);
        this.isArtistMalformed = WEB_URL_REGEX.test(oldArtist);
        this.newArtist = this.isArtistMalformed ? UNKNOWN_ARTIST: oldArtist;
        this.newAlbum = this.isAlbumMalformed ? UNKNOWN_ALBUM : oldAlbum;
        this.newName = this.determineName()
        this.newPath = join(this.musicDirectory, this.newArtist, this.newAlbum, this.newName);
    }

    determineName() {
        const cleansedName = this.oldPathObject.name.replace(REGEX, "").trim();
        const parsedName = cleansedName.split("-");

        if (parsedName.length > 1 && !parsedName[0][0] == ".") {
            this.artist = parsedName[0].trim();
            return parsedName[1].trim()
        } else {
            return this.oldName
        }
    };


    format() {
        if (!isNaN(this.newName)){
            unlink(join(this.musicDirectory, this.oldArtist, this.oldAlbum, this.oldName), err => {
                if (err) {
                    console.log(err)
                }
                console.log("Deleted duplicate song: ", this.oldName)
            });
        } else {
            this.buildNewPath();
        }
    }

    buildNewPath() {
        mkdir(join(this.musicDirectory, this.newArtist, this.newAlbum), {recursive: true}, err => {
            if (err) {
                console.error(err);
            }

            rename(normalize(this.oldPath), normalize(this.newPath), err => {
                if (err) {
                    console.error(err);
                }

                if (this.isArtistMalformed) {
                    const artistDir = join(this.musicDirectory, this.oldArtist);
                    rmdir(normalize(artistDir), {recursive: true}, err => {
                        if (err) {
                            console.error(err)
                        }
                    });
                }

                console.log(`SUCCESS: Song ${this.oldPath} has been reformatted to ${this.newPath}`);
            });
        });

    }

}

module.exports.Track = Track;