import _ from "lodash";
import ABCSong from "./song";
import songs, { tempo, transposition, tuning } from "./../abc/songs.js";
let abcFiles = require.context("./../abc/", true, /\.abc$/);
abcFiles = _.clone(abcFiles?.keys().filter(filename => !filename.includes("disabled-")));

export function getAbc(file) {
  if (!abcFiles.includes(file)) return;
  const _file = file.replace("./","");
  console.log(`requiring ${_file}`);
  const abc = require(`./../abc/${_file}`);
  abcFiles = _.without(abcFiles, file);
  return abc;
}

const _jsonSongs = [];
const _abcSongs = [];

songs.map( song => {
  let abc = "";
  if (_.startsWith(song?.abc,"X:")) {
    abc = song?.abc;
  } 
  else {
    abc = getAbc(`./${song.abc}.abc`);
  }
  if (abc) _jsonSongs.push({
    ...song,
    abc
  });
});

abcFiles.map( file => {
  let abc = getAbc(file);
  if (abc) {
    const song = new ABCSong({abc});
    song.load();
    _abcSongs.push(song);
  }
});



//apply defaults
export default _.concat(_abcSongs, _jsonSongs)?.map( song => {
  song.tempo ??= tempo;
  song.transposition ??= transposition;
  song.tuning ??= tuning;
  return song;
});
