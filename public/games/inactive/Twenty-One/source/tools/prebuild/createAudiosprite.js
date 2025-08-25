const audiosprite = require('audiosprite-ffmpeg');
const path = require('path');
const glob = require('glob');
const fs = require('fs');

async function go() {
    console.log('[Create audiosprite] working...');

    let folders = ['sound', 'music'];
    let formats = ['.ogg', '.m4a', '.mp3', '.ac3'];

    for (let i = 0; i < folders.length; i++) {
        let folder = folders[i];
        let from = path.join(__dirname, `../../assets/source/audio/${folder}/*.ogg`);
        let output = path.join(__dirname, `../../assets/live/audio/${folder}`);

        let files = [];
        let opts = { output };

        glob.sync(from).forEach((file) => {
            files.push(file);
        });

        if (files.length === 0) continue;

        let spritemap = await generate(files, opts).catch((err) => console.log(err));

        let resources = [];
        formats.forEach((format) => resources.push(`${folder}${format}`));
        spritemap.resources = resources;

        fs.writeFileSync(`${output}.json`, JSON.stringify(spritemap));
    }

    console.log('[Create audiosprite] finished.');
}

function generate(files, opts) {
    return new Promise((resolve, reject) => {
        audiosprite(files, opts, (err, obj) => {
            if (err) return reject(err);
            resolve(obj);
        });
    });
}

go();
