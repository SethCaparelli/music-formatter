const REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

exports.REGEX = REGEX
exports.MUSIC_DIRECTORY = "/Users/seth/workspace/my-apps/music-formatter/src/test/resources/test-music-directory";
exports.WEB_URL_REGEX = new RegExp(REGEX);
exports.UNKNOWN_ARTIST = "Unknown Artist";
exports.UNKNOWN_ALBUM = "Unknown Album";
exports.VARIOUS_ARTISTS = "Various Artists";