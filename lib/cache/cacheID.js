const path = require('path');
const {
    v4: uuidv4
} = require('uuid');
const {
    readJSON,
    saveJSON
} = require('../../bin/readWrite');

function getID(data) {
    var UUID = '';

    // load cache
    var cache = readJSON(path.join(__dirname, '../', '../', 'cache', 'cache.json'), true);

    // makes cache if it doesnt exist
    if (cache.success != true) {
        saveJSON(path.join(__dirname, '../', '../', 'cache', 'cache.json'), {
            "success": true,
            "recentImage": "0",
            "images": []
        }, true);
        cache = readJSON(path.join(__dirname, '../', '../', 'cache', 'cache.json'), true);
    }

    // loop through all images and check if we have a match based on name, episode and season
    cache.images.forEach((images) => {
        if (images.name == data.name) {
            switch (data.type) {
                case 'episode':
                    if (images.season == data.season && images.episode == data.episode) UUID = images.id;
                    break;
                case 'movie':
                    UUID = images.id;
                    break;
                case 'music':
                    UUID = images.id;
            }
        }
    });

    // assign UUID if its a new image
    if (UUID == '') UUID = uuidv4();

    return UUID;
}

module.exports = {
    getID
}