require('dotenv').config();
const lcl = require('cli-color'),
    {
        v4: uuidv4
    } = require('uuid'),
    downloadImages = require('../imgCanvas/middleware/downloadImages');

// get all media from tautulli and pass to imgCanvas //TODO Add image lookup in json file
async function plexImageRouter(tautulli) {
    if (process.env.TAUTULLI_NAME === tautulli.user) {
        console.log(tautulli);

        // console log new image card
        console.log(lcl.blue("[Info]"), `New image card for "${tautulli.media.name}"`);

        // try tmdb lookup
        const tmdbData = await require('./middleware/tmdb/tmdbLookup')(tautulli);
        if (tmdbData.success) {
            // if tmdb lookup successful, extract data
            switch (tautulli.media.type) {
                case 'movie':
                    // get movie data
                    var tmdbformatData = {
                        success: true,
                        title: tmdbData.data.title != '' ? tmdbData.data.title : tautulli.media.title,
                        tagline: tmdbData.data.tagline != '' ? tmdbData.data.tagline : tautulli.media.tagline,
                        images: {
                            poster: `https://image.tmdb.org/t/p/original${tmdbData.data.poster_path}`,
                            backdrop: `https://image.tmdb.org/t/p/original${tmdbData.data.backdrop_path}`
                        }
                    }
                    break;
                case 'episode':
                    // get episode data
                    var tmdbformatData = {
                        success: true,
                        title: tmdbData.data.name != '' ? tmdbData.data.name : tautulli.media.episode_name,
                        tagline: tmdbData.data["season/" + tautulli.media.season_number + "/episode/" + tautulli.media.episode_number].name !== '' ? `Season ${tautulli.media.season_number} Episode ${tautulli.media.episode_number} - ${tmdbData.data["season/" + tautulli.media.season_number + "/episode/" + tautulli.media.episode_number].name}` : `Season ${tautulli.media.season_number} Episode ${tautulli.media.episode_number} - ${tautulli.media.episode_name}`,
                        images: {
                            poster: `https://image.tmdb.org/t/p/original${tmdbData.data.poster_path}`,
                            backdrop: `https://image.tmdb.org/t/p/original${tmdbData.data["season/" + tautulli.media.season_number + "/episode/" + tautulli.media.episode_number].still_path}`,
                        }
                    }
                    break;
                default:
                    console.log(lcl.yellow("[Plex Image - Warn]"), "Unknown media type");
            }
        }

        // create image card data
        var imgData = {
            title: tautulli.media.title,
            tagline: tautulli.media.tagline,
            images: {
                poster: tautulli.media.poster_URL,
                backdrop: ''
            },
            positions: {
                poster: [550, 975, 500, 750]
            }
        }

        // add extra tmdb data to image card data
        if (tmdbformatData.success) {
            imgData.title = tmdbformatData.title;
            imgData.tagline = tmdbformatData.tagline;
            imgData.images = tmdbformatData.images;
        }

        // downloading images
        imgData.images.poster = await downloadImages(imgData.images.poster);
        if (imgData.images.backdrop != '') imgData.images.backdrop = await downloadImages(imgData.images.backdrop);

        // build image card
        var imageCard = await require('../imgCanvas/createImage')(imgData);



        return {
            success: true,
            "message": "Image Card Created"
        };
    } else {
        return {
            success: false,
            "code": 400,
            "message": "Invalid Tautulli User"
        };
    }
}

module.exports = plexImageRouter;