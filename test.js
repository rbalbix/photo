const dir = require('node-dir');

const files = dir.files('C:/Users/rjunior/Desktop/Santa Fe - ABR_2019', { sync: true });
console.log(files);
