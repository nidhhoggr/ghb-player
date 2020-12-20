import _ from "lodash";
import ABCSong from "./song";
import songs, { tempo, transposition, tuning } from "./../abc/songs.js";
let abcFiles = require.context("./../abc/", true, /\.abc$/);
abcFiles = _.clone(abcFiles?.keys());

export function getAbc(file) {
  file = file.replace("./","");
  console.log(`requiring ${file}`);
  const abc = require(`./../abc/${file}`);
  abcFiles = _.without(abcFiles, file);
  return abc;
}

const _songs = [];

abcFiles.map( file => {
  let abc = getAbc(file);
  if (abc) {
    const song = new ABCSong({abc});
    song.load();
    _songs.push(song);
  }
});

songs.map( song => {
  let abc = "";
  if (_.startsWith(song?.abc,"X:")) {
    abc = song?.abc;
  } 
  else {
    abc = getAbc(`./${song.abc}.abc`);
  }
  _songs.push({
    ...song,
    abc
  });
});

//apply defaults
export default _songs.map( song => {
  if (!song.tempo) song.tempo = tempo;
  if (!song.transposition) song.transposition = transposition;
  if (!song.tuning) song.tuning = tuning;
  return song;
});
