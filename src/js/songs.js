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
abcFiles = _.clone(abcFiles?.keys().filter(filename => !filename.includes("disabled")));

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
  //stores an array of songs that were added at runtime
  this.runtimeSongs = [];
  //must provide set and get methods
  this.storage = {
    get: () => {
      const storage = window.localStorage.getItem("abcSongs");
      if (storage) {
        let parsed;
        try {
          parsed = JSON.parse(storage);
        }
        catch(err) {
          return storage;
        }
        return parsed;
      }
    },
    set: (key) => window.localStorage.setItem("abcSongs", JSON.stringify(key)),
    clear: window.localStorage.clear 
  };
}
  
ABCSongs.prototype.load = function load({playerInstance, songIndex}) {
  this.playerInstance = playerInstance;
  const stored = this.storage.get();
  if (stored) {
    stored.map(({filename, song}) => {
      debug(`Loading ${filename} from storage`);
      this.addSong({song});
    });
    if (songIndex) {
      this.playerInstance.currentTuneIndex = songIndex;
      this.playerInstance.changeSong({currentTuneIndex: songIndex});
    }
  }
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
  else if (this.abcSongs[songIndex]) {
    song = new ABCSong({
      abc: this.abcSongs[songIndex], 
      playerInstance: this.playerInstance
    });
    if (song) {
      this.loaded[songIndex] = song;
      debug(`Loading new song at ${songIndex}`, this.loaded);
    }
  }
  if (song) {
    song.tempo ??= tempo;
    song.transposition ??= transposition;
    song.tuning ??= tuning;
    return song;
  }
}

ABCSongs.prototype.addSong = function({song, changeSong}) {
  let index = this.abcSongs.push(song);
  index = index - 1;
  const loaded = this.loadSong({songIndex: index});
  const title = getInfoField(this.abcSongs[index], "T");
  const filename = `${_.snakeCase(title)}-${index}`;
  this.abcFiles[index] = filename;
  this.runtimeSongs.push({filename, song});
  this.storage.set(this.runtimeSongs);
  const selector = this.playerInstance.domBinding.currentSong;
  const opt = document.createElement("option");
  opt.value = index;
  opt.text = title || this.abcFiles[index];
  selector.add(opt);
  this.playerInstance.reloadSongSelector({playerInstance: this.playerInstance});
  if (changeSong) {
    this.playerInstance.currentTuneIndex = index;
    this.playerInstance.changeSong({currentTuneIndex: index});
  }
  return {
    index,
    loaded
  };
}

ABCSongs.prototype.editSong = function({songIndex, song, changeSong}) {
  const loaded = this.getFromRuntime({songIndex});
  const runtimeIndex = _.findKey(this.runtimeSongs, (s) => s.filename === loaded.filename);
  debug(loaded, songIndex, runtimeIndex);
  if (!runtimeIndex) return;
  const title = getInfoField(song, "T");
  const filename = `${_.snakeCase(title)}-${songIndex}`;
  this.runtimeSongs[runtimeIndex] = {
    filename,
    song
  };
  this.abcSongs[songIndex] = song;
  delete this.loaded[songIndex];
  this.storage.set(this.runtimeSongs);
  this.playerInstance.reloadSongSelector({playerInstance: this.playerInstance});
  if (changeSong) {
    this.playerInstance.currentTuneIndex = songIndex;
    this.playerInstance.changeSong({currentTuneIndex: songIndex});
  }
  return {
    index: songIndex,
    loaded
  };
}


ABCSongs.prototype.getFromRuntime = function loadFromRuntime({songIndex}) {
  const filename = this.abcFiles[songIndex];
  if (filename) {
    const filtered = _.filter( this.runtimeSongs, (s) => s.filename === filename);
    if ( filtered?.length === 1) {
      return filtered[0];
    }
  }
}

ABCSongs.prototype.isRuntimeSong = function({songIndex, filename}) {
  if (songIndex) {
    filename = this.abcFiles[songIndex];
  }
  const filtered = _.filter( this.runtimeSongs, (s) => s.filename === filename);
  return filtered?.length === 1;
}

ABCSongs.prototype.getCount = function() {
  return this.abcFiles.length;
}

ABCSongs.prototype.clearPlayerDropdown = function({playerInstance, onFinish}) {
  const selector = playerInstance.domBinding.currentSong;
  var length = selector.options.length;
  for (let i = length-1; i >= 0; i--) {
      selector.options[i] = null;
  }
  onFinish?.({selector});
}

ABCSongs.prototype.loadPlayerDropdown = function({playerInstance, onFinish}) {
  this.clearPlayerDropdown({playerInstance, onFinish: ({selector}) => {
    let title;
    for (var i in this.abcSongs) {
      title = getInfoField(this.abcSongs[i], "T");
      const opt = document.createElement("option");
      opt.value = i;
      opt.text = title || this.abcFiles[i];
      selector.add(opt);
    }
    onFinish?.();
  }});
}
