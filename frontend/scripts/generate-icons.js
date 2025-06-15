const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Convert logo.svg to logo192.png and logo512.png
sharp(path.join(publicDir, 'logo.svg'))
    .resize(192, 192)
    .toFile(path.join(publicDir, 'logo192.png'))
    .then(() => {
        console.log('Generated logo192.png');
        return sharp(path.join(publicDir, 'logo.svg'))
            .resize(512, 512)
            .toFile(path.join(publicDir, 'logo512.png'));
    })
    .then(() => {
        console.log('Generated logo512.png');
    })
    .catch(err => {
        console.error('Error generating PNG files:', err);
    });

// Convert favicon.svg to favicon.ico
sharp(path.join(publicDir, 'favicon.svg'))
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'))
    .then(() => {
        console.log('Generated favicon.ico');
    })
    .catch(err => {
        console.error('Error generating favicon:', err);
    });