import _ from 'lodash';
import utils from "./utils";
const { isNumber } = utils;

function Sackpipa({
  chanterKeyIndex = 0,//the key of the chanter, EA, DG, 
  dronesSynth,//an instance of CreateSynth that plays the drone
  playableNotes = [],//an array of playable notes because some instruments can play more notes,
  dronesEnabled = [],//an array of notes for the drones enabled, uses ABC for pitches
  canPlayUnpluggedGroupsIndividually = false,//an advanced technique that we disable by default
  isFirstGroupPlugged = true,
  isSecondGroupPlugged = true,
}) {
  this.dronesSynth = dronesSynth;
  this.possibleChanters = ["E/A","D/G","C/F"];
  this.playableNotes = playableNotes;
  this.dronesEnabled = dronesEnabled;
  this.canPlayUnpluggedGroupsIndividually = canPlayUnpluggedGroupsIndividually;
  this.isFirstGroupPlugged = isFirstGroupPlugged;
  this.isSecondGroupPlugged = isSecondGroupPlugged;
  this.chanterKey = this.possibleChanters[chanterKeyIndex];
}

export default Sackpipa;

Sackpipa.prototype.getChanterKeyAbbr = function getChanterKeyAbbr() {
  switch (this.chanterKey) {
    case "E/A": 
    case "D/G": 
    case "C/F":
      return _.replace(_.lowerCase(this.chanterKey)," ","");
    default:
      return "invalidChanterKey";
  }
}

Sackpipa.prototype.getPlayableNotes = function getPlayableNotes({chanterKey, notesOnly, pitchesOnly} = {}) {
  if (!chanterKey) chanterKey = this.chanterKey;
  let notes = {};
  let pitches = [];
  switch (chanterKey) {
    case "E/A": {
            // D    E    ^F    G    ^G    A    B    C'   ^C' 
            // D'   E'
      notes = {
        "D": [62,74],
        "E": [64,76],
        "Gb": 66,
        "G": 67, 
        "Ab": 68, 
        "A": 69,
        "B": 71,
        "C": 72,
        "Db": 73,
        //"D": 74,//Cannot have duplicate elements so we use the array above
        //"E": 76
      };
      //E/A Chromaticism reached with the addition of Eb (63), F (65), Bb(70), and Eb (76)
      //D, [Eb], E, [F], Gb, G, Ab, A, [Bb], B, C, Db, D, [Eb], E
      //62 63    64 65   66  67 68  69  70   71 72 73  74 75    76
      //notes = ["D", "E", "Gb", "G", "Ab", "A", "B", "C", "Db"];
      if (this.isFirstGroupPlugged) {
        notes = _.omit(notes, ["Db"]);
      }
      else if (!this.canPlayUnpluggedGroupsIndividually) {
        notes = _.omit(notes, ["C"]);
      }
      break;
    }
    case "D/G": {
      //      C      D   E    F    ^F    G    A    _B    =B 
      //      C' ^C' D'
      notes = {
        "C": [60, 72],
        "D": [62, 74],
        "E": 64,
        "F": 65,
        "Gb": 66,
        "G": 67,
        "A": 69,
        "Bb": 70,
        "B": 71,
        "Db": 73,
      };
      // D/G Chromaticism reached with the addition of Db (61), Eb (63), Ab (68)
      //C, [Db], D, [Eb], E, F, Gb, G, [Ab], A, Bb, B, C, Db, D
      //60 61    62 63    64 65 66  67 68    69 70  71 72 73  74
      //notes = ["C", "D", "E", "F", "Gb", "G", "A", "Bb", "B", "Db"];
      if (this.isFirstGroupPlugged) {
        notes = _.omit(notes, ["B"]);
      }
      else if (!this.isFirstGroupPlugged && !this.canPlayUnpluggedGroupsIndividually) {
        notes = _.omit(notes, ["Bb"]);
      }
      if (this.isSecondGroupPlugged) {
        notes = _.omit(notes, ["Db"]);
      }
      else if (!this.isSecondGroupPlugged && !this.canPlayUnpluggedGroupsIndividually) {
        notes["C"] = _.omit(notes["C"], [72]);
      }
      break;
    }
    case "C/F": {
      notes = {
        "Bb": [58, 70],
        "C": [60, 72],
        "D": 62,
        "Eb": 63, 
        "E": 64,
        "F": 65,
        "G": 67,
        "Ab": 68,
        "A": 69,
        //"Bb": 70,
        "B": 71
        //C": 72
      };
      // C/F Chromaticism reached with the addition of B (59), Db (61), Gb (66)
      // Bb, [B], C, [Db], D, Eb, E, F, [Gb], G, Ab, A, Bb, B, C
      // 58  59   60 61    62 63  64 65 66    67 68  69 70  71 72
      //      _B    C    D    _E   =E    F    G    _A    =A 
      //      _B =B C'
      //        
      //notes = ["Bb", "C", "D", "Eb", "E", "F", "G", "Ab", "A", "B"];

      if (this.isFirstGroupPlugged) {
        notes = _.omit(notes, ["A"]);
      }
      else if (!this.isFirstGroupPlugged && !this.canPlayUnpluggedGroupsIndividually) {
        notes = _.omit(notes, ["Ab"]);
      }
      if (this.isSecondGroupPlugged) {
        notes = _.omit(notes, ["B"]);
      }
      else if (!this.isSecondGroupPlugged && !this.canPlayUnpluggedGroupsIndividually) {
        notes["Bb"] = _.omit(notes["Bb"], [70]);
      }
      break;
    }
  }
  if (notesOnly) {
    return _.keys(notes);
  }
  else if (pitchesOnly) {
    return _.flatten(_.values(notes));
  }
  else {
    return notes;
  }
  //@TODO Playablenote feature
  //return _.sortedUniq(_.concat(_.values(notes), this.playableNotes));
}


//@TODO this need  to use pitch comparison, note string comparison by note name
Sackpipa.prototype.getCompatibleNotes = function getCompatibleNotes({abcSong}) {
  const playableSong = abcSong.getDistinctNotes();
  const playableChanter = this.getPlayableNotes({"notesOnly": true});
  const compatible = _.intersection(playableSong, playableChanter);
  const _incompatible = _.xor(playableSong, playableChanter)
  return {
    compatible,//notes in the song playable on the chnater
    _incompatible,//notes only in the song OR the playlist
    incompatible: _.difference(playableSong, playableChanter),
    unplayable: _.difference(playableChanter, playableSong),//these are notes that exist in the chanter but not the song
  }
}

//@TODO this need  to use pitch comparison, note string comparison by note name
Sackpipa.prototype.getCompatiblePitches = function getCompatiblePitches({abcSong}) {
  const playableSong = abcSong.getDistinctPitches();
  const playableChanter = this.getPlayableNotes({"pitchesOnly": true});
  const compatible = _.intersection(playableSong, playableChanter);
  const _incompatible = _.xor(playableSong, playableChanter)
  return {
    compatible,//notes in the song playable on the chnater
    _incompatible,//notes only in the song OR the playlist
    incompatible: _.difference(playableSong, playableChanter),
    unplayable: _.difference(playableChanter, playableSong),//these are notes that exist in the chanter but not the song
  }
}


Sackpipa.prototype.setChanterKey = function setChanterKey(chanterKey = null) {
  if (!chanterKey) {
    this.chanterKey = this.possibleChanters[0];
  }
  if(this.possibleChanters.includes(chanterKey)) {
    this.chanterKey = chanterKey;
  }
}

Sackpipa.prototype.getChanterKeyByIndex = function getChanterKeyByIndex(chanterKeyIndex) {
  if (!isNumber(chanterKeyIndex)) throw new Error(`${chanterKeyIndex} is not numeric`);
  chanterKeyIndex = chanterKeyIndex % this.possibleChanters.length;
  return this.possibleChanters[chanterKeyIndex];
}

Sackpipa.prototype.getChanterKeyIndex = function getChanterKeyIndex({tuning}) {
  return _.indexOf(this.possibleChanters, tuning);
}
