const path = require('path');
const fs = require('fs');

console.log('[Cache buster] working...');
let atlas = path.resolve(__dirname, '../../dist/assets/images/atlas.json');
let rawData = fs.readFileSync(atlas);
let parsed = JSON.parse(rawData);

let version = Date.now();

parsed.textures.forEach((texture) => {
    texture.image += `?v=${version}`;
});

let output = JSON.stringify(parsed);
fs.writeFileSync(atlas, output);
console.log('[Cache buster] finished.');
