const dir = require('node-dir');
const fs = require('fs');

dir.promiseFiles('C:/Users/rjunior/Desktop/Santa Fe - ABR_2019/2020/01')
  .then((files) => {
    console.log(files);
    files.map((file) => console.log(fs.statSync(file).ctime, fs.statSync(file).atime, fs.statSync(file).birthtime));
  })
  .catch((e) => console.error(e));
