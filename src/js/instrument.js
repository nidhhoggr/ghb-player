import _ from 'lodash';
import utils from "./utils";
const { isNumber, debug } = utils({from: "instrument"});
export const possibleTunings = ["Bb"];

function Instrument({
  tuningKeyIndex = 0,//the key of the tuning, EA, DG, 
  dronesSynth,//an instance of CreateSynth that plays the drone
  playableExtraNotes = {},//an object of playable notes because some instruments can play more notes,
  playableExtraNotesOptions = {},//an object of playable note descriptions
  dronesEnabled = [],//an array of notes for the drones enabled, uses ABC for pitches
  canPlayUnpluggedGroupsIndividually = false,//an advanced technique that we disable by default
  pitchToNoteName,//utility function to do what it says
}) {
  this.dronesSynth = dronesSynth;
  this.possibleTunings = possibleTunings;
  this.playableExtraNotes = playableExtraNotes[tuningKeyIndex];
  this.playableExtraNotesOptions = playableExtraNotesOptions[tuningKeyIndex];
  this.dronesEnabled = dronesEnabled;
  this.canPlayUnpluggedGroupsIndividually = canPlayUnpluggedGroupsIndividually;
  this.tuningKeyIndex = tuningKeyIndex;
  this.tuningKey = this.possibleTunings[tuningKeyIndex];
  this.pitchToNoteName = pitchToNoteName;
  this.setPitchRange();
}

export default Instrument;

Instrument.prototype.getTuningKeyAbbr = function getTuningKeyAbbr() {
  switch (this.tuningKey) {
    case "Bb": 
      return _.replace(_.lowerCase(this.tuningKey)," ","");
    default:
      return "invalidTuningKey";
  }
}

Instrument.prototype.getLowestPlayablePitch = function() {
  const notes = this.getPlayableNotes({pitchesOnly: true});
  return _.min(notes);
}

Instrument.prototype.getHighestPlayablePitch = function() {
  const notes = this.getPlayableNotes({pitchesOnly: true});
  return _.max(notes);
}

Instrument.prototype.getPlayableNotes = function getPlayableNotes({tuningKey, notesOnly, pitchesOnly} = {}) {
  if (!tuningKey) tuningKey = this.tuningKey;
  let notes = {};
  let pitches = [];
  switch (tuningKey) {
    case "Bb": {
            // D    E    ^F    G    ^G    A    B    C'   ^C' 
            // D'   E'
      //G, [G#], A, [A#], B, [C], C#, D, [D#], E, [F], F#, G, [G#], A
      //67  68  69   70   71 72   73  74  75   76  77  78  79  80   81
      notes = {
        "G": [67, 79],
        "Ab": 80,
        "A": [69, 81],
        "Bb": 70, 
        "B": 71, 
        "C": 72,
        "Db": 73,
        "D": 74,
        "E": 76,
        "F": 77,
        "Gb": 78
      };
      break;
    }
  }
  if (_.keys(this.playableExtraNotes)?.length > 0) {
    if (notesOnly) {
      notes = [
        ..._.keys(notes),
        ..._.keys(this.playableExtraNotes),
      ]
    }
    else if (pitchesOnly) {
      notes = _.uniq([
        ..._.flatten(_.values(notes)),
        ..._.flatten(_.values(this.playableExtraNotes))
      ]);
    }
  }
  else {
    if (notesOnly) {
      notes = _.keys(notes)
    }
    else if (pitchesOnly) {
      notes = _.uniq(_.flatten(_.values(notes)));
    }
  }
    
  return notes;
}


//@TODO this need  to use pitch comparison, note string comparison by note name
Instrument.prototype.getCompatibleNotes = function getCompatibleNotes({abcSong}) {
  const mapToNoteNames = (arr) => {
    return arr.map((a) => this.pitchToNoteName[a]);
  }
  /*
  const playableSong = abcSong.getDistinctNotes();
  const playableTuning = this.getPlayableNotes({"notesOnly": true});
  const compatible = _.intersection(playableSong, playableTuning);
  const _incompatible = _.xor(playableSong, playableTuning)
  return {
    compatible,//notes in the song playable on the chnater
    _incompatible,//notes only in the song OR the playlist
    incompatible: _.difference(playableSong, playableTuning),
    unplayable: _.difference(playableTuning, playableSong),//these are notes that exist in the tuning but not the song
  }
  */
  const {compatible, _incompatible, incompatible, unplayable} = this.getCompatiblePitches({abcSong});
  return {
    compatible: mapToNoteNames(compatible),//notes in the song playable on the chnater
    _incompatible: mapToNoteNames(_incompatible),//notes only in the song OR the playlist
    incompatible: mapToNoteNames(incompatible),
    unplayable: mapToNoteNames(unplayable)
  }
}


//@TODO this need  to use pitch comparison, note string comparison by note name
Instrument.prototype.getCompatiblePitches = function getCompatiblePitches({abcSong}) {
  const playableSong = abcSong.getDistinctPitches();
  const playableTuning = this.getPlayableNotes({"pitchesOnly": true});
  const compatible = _.intersection(playableSong, playableTuning);
  const _incompatible = _.xor(playableSong, playableTuning)
  return {
    compatible,//notes in the song playable on the chnater
    _incompatible,//notes only in the song OR the playlist
    incompatible: _.difference(playableSong, playableTuning),
    unplayable: _.difference(playableTuning, playableSong),//these are notes that exist in the tuning but not the song
  }
}


Instrument.prototype.setTuningKey = function setTuningKey(tuningKey = null) {
  if (!tuningKey) {
    this.tuningKey = this.possibleTunings[0];
  }
  if(this.possibleTunings.includes(tuningKey)) {
    this.tuningKey = tuningKey;
    this.tuningKeyIndex = _.indexOf(this.possibleTunings, tuningKey);
    this.setPitchRange();
  }
}

Instrument.prototype.getTuningKeyByIndex = function getTuningKeyByIndex(tuningKeyIndex) {
  if (!isNumber(tuningKeyIndex)) throw new Error(`${tuningKeyIndex} is not numeric`);
  tuningKeyIndex = tuningKeyIndex % this.possibleTunings.length;
  return this.possibleTunings[tuningKeyIndex];
}

Instrument.prototype.getTuningKeyIndex = function getTuningKeyIndex({tuning}) {
  return _.indexOf(this.possibleTunings, tuning);
}

Instrument.prototype.setPitchRange = function setPitchRange() {
  const playableNotes = this.getPlayableNotes({pitchesOnly: true});
  const minPlayableNote = _.min(playableNotes);
  const maxPlayableNote = _.max(playableNotes);
  this.pitchRange = {
    min: minPlayableNote,
    max: maxPlayableNote,
    total: maxPlayableNote - minPlayableNote
  }
}

Instrument.prototype.isPitchInRange = function isPitchInRange({pitchIndex}) {
  //debug("isPitchInRange", pitchIndex, this.pitchRange)
  return _.inRange(pitchIndex, this.pitchRange.min, this.pitchRange.max + 1);
}

Instrument.prototype.getPeno = function getPeno({pitchIndex}) {
  return this.playableExtraNotesOptions?.[pitchIndex];
}
