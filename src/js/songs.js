import _ from "lodash";
import ABCSong from "./song";
import utils from "./utils";
const {
  debug,
  debugErr,
  getInfoField,
} = utils({from: "songs"});

export const tempo = 80;
export const transposition = 0;
export const tuning = 0;

let abcFiles = require.context("./../abc/", true, /\.abc$/);
abcFiles = _.clone(abcFiles?.keys().filter(filename => !filename.includes("disabled-")));

const preserved = [];
export function getAbc(file) {
  if (!abcFiles.includes(file)) return;
  const _file = file.replace("./","");
  debug(`requiring ${_file}`);
  const abc = require(`./../abc/${_file}`);
  abcFiles = _.without(abcFiles, file);
  preserved.push(file);
  return abc;
}

const abcSongs = [];
abcFiles.map( file => {
  let abc = getAbc(file);
  if (abc) {
    debug(`loading file ${file}`);
    abcSongs.push(abc);
  }
});

function ABCSongs() {
  this.abcFiles = preserved;
  this.abcSongs = abcSongs;
  //will store songs loaded (abc -> ABCSong) by thier index
  this.loaded = [];
  debug(this);
}

export default ABCSongs;

ABCSongs.prototype.setPlayerInstance = function(playerInstance) {
  this.playerInstance = playerInstance;
}

ABCSongs.prototype.loadSong = function({songIndex}) {
  let song;
  if(this.loaded[songIndex]) {
    song = this.loaded[songIndex];
  }
  else {
    song = new ABCSong({
      abc: this.abcSongs[songIndex], 
      playerInstance: this.playerInstance
    });
    if (song) {
      this.loaded[songIndex] = song;
      debug(`Loading new song at ${songIndex}`, this.loaded);
    }
  }
  song.tempo ??= tempo;
  song.transposition ??= transposition;
  song.tuning ??= tuning;
  return song;
}

ABCSongs.prototype.getCount = function() {
  return this.abcFiles.length;
}

ABCSongs.prototype.loadPlayerDropdown = function({playerInstance, onFinish}) {
  const selector = playerInstance.domBinding.currentSong;
  let title;
  for (var i in this.abcSongs) {
    title = getInfoField(this.abcSongs[i], "T");
    const opt = document.createElement("option");
    opt.value = i;
    opt.text = title || this.abcFiles[i];
    selector.add(opt);
  }
  onFinish?.();
}
