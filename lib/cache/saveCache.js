const path = require('path');
const lcl = require('cli-color');
const {
    writeFileSync
} = require('fs');
const {
    readJSON,
    saveJSON
} = require('../../bin/readWrite');
const config = readJSON(path.join(__dirname, '../', '../', 'config', 'config.json'), true);
const {
    uploadCloudinary
} = require('../../bin/thirdparty/cloudinary');


async function saveCache(data, image) {
    // write image to disk
    console.log(lcl.blue('[Info]'), `Saving 'image-${data.id}.png' to disk`);
    await writeFileSync(path.join(__dirname, '../', '../', 'static', 'images', `image-${data.id}.png`), image);
    console.log(lcl.green('[Success]'), `Saved 'image-${data.id}.png' to disk`);

    if (config.thirdparty.useThirdparty == true) {
        // upload image to third party
        var thirdparty = await uploadCloudinary(path.join(__dirname, '../', '../', 'static', 'images', `image-${data.id}.png`), data.id);

        if (thirdparty.status != false) {
            data.URL.image = thirdparty.data.secure_url;
        }
    }

    // load cache
    console.log(lcl.blue('[Info]'), `Saving '${data.id}' to cache`);
    var cache = readJSON(path.join(__dirname, '../', '../', 'cache', 'cache.json'), true);

    // save data to cache.json
    cache.images.push(data);
    cache.recentImage = data.id;
    saveJSON(path.join(__dirname, '../', '../', 'cache', 'cache.json'), cache, true);


}

async function updateCache(data) {
    console.log(lcl.blue('[Info]'), `Updating cache (${data.id})`);
    // load cache
    var cache = readJSON(path.join(__dirname, '../', '../', 'cache', 'cache.json'), true);

    // save data to cache.json
    cache.recentImage = data.id;
    saveJSON(path.join(__dirname, '../', '../', 'cache', 'cache.json'), cache, true);

    console.log(lcl.green("[Success]"), `Updated cache (${data.id})`);
}

module.exports = {
    saveCache,
    updateCache
}