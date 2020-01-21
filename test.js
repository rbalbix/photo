const dir = require('node-dir');

// const files = dir.files('C:/Users/rjunior/Desktop/Santa Fe - ABR_2019', { sync: true });

async function readFolder(path) {
//   dir.paths(path, (err, paths) => {
//     if (err) throw err;
//     // console.log('subdirs:\n', paths.files);
//     // return paths.files;
//     // console.log('subdirs:\n', paths.dirs);
//   });

  dir.promiseFiles(path)
    .then((files) => {
      console.log(files);
    })
    .catch((e) => console.error(e));
}


// console.log(files);

async function start() {
  const files = await readFolder('C:/Users/rjunior/Desktop/Santa Fe - ABR_2019');

  console.log(files);
}

start();
