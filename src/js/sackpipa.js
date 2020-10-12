import _ from 'lodash';

function Sackpipa({
  chanterKey,//the key of the chanter, EA, DG, 
  dronesSynth,//an instance of CreateSynth that plays the drone
  playableNotes = [],//an array of playable notes because some instruments can play more notes,
  dronesEnabled = [],//an array of notes for the drones enabled, uses ABC for pitches
  canPlayUnpluggedGroupsIndividually = false,//an advanced technique that we disable by default
  isFirstGroupPlugged = true,
  isSecondGroupPlugged = true,
}) {
  this.possibleChanters = ["E/A", "D/G","C/F"];
  this.dronesSynth = dronesSynth;
  this.playableNotes = playableNotes;
  this.dronesEnabled = dronesEnabled;
  this.canPlayUnpluggedGroupsIndividually = canPlayUnpluggedGroupsIndividually;
  this.isFirstGroupPlugged = isFirstGroupPlugged;
  this.isSecondGroupPlugged = isSecondGroupPlugged;
  
  this.chanterKey = chanterKey;
}

export default Sackpipa;

Sackpipa.prototype.getPlayableNotes = function getPlayableNotes({chanterKey} = {}) {
  if (!chanterKey) chanterKey = this.chanterKey;
  let notes = [];
  switch (chanterKey) {
    case "E/A": {
      //not accounting for the next e in the octave
            // D    E    ^F    G    ^G    A    B    C'   ^C' 
            // D'   E'
      notes = ["D", "E", "Gb", "G", "Ab", "A", "B", "C", "Db"];
      
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
      notes = ["C", "D", "E", "F", "Gb", "G", "A", "Bb", "B", "Db"];
      
      if (this.isFirstGroupPlugged) {
        notes = _.omit(notes, ["B"]);
      }
      else if (!this.canPlayUnpluggedGroupsIndividually) {
        notes = _.omit(notes, ["Bb"]);
      }
      if (this.isSecondGroupPlugged) {
        notes = _.omit(notes, ["Db"]);
      }
      if (!this.canPlayUnpluggedGroupsIndividually) {
        notes =  _.omit(notes, ["C"]);
      }
      break;
    }
    case "C/F": {
      //      _B    C    D    _E   =E    F    G    _A    =A 
      //      _B =B C'
      notes = ["Bb", "C", "Db", "Eb", "E", "F", "G", "Ab", "A", "B"];

      if (this.isFirstGroupPlugged) {
        notes = _.omit(notes, ["A"]);
      }
      else if (!this.canPlayUnpluggedGroupsIndividually) {
        notes = _.omit(notes, ["Ab"]);
      }
      if (this.isSecondGroupPlugged) {
        notes = _.omit(notes, ["B"]);
      }
      if (!this.canPlayUnpluggedGroupsIndividually) {
        notes =  _.omit(notes, ["Bb"]);
      }
      break;
    }
  }
  return _.sortedUniq(_.concat(_.values(notes), this.playableNotes));
}

Sackpipa.prototype.getCompatibleNotes = function getCompatibleNotes({abcSong}) {
  const playableSong = abcSong.getPlayableNotes();
  const playableChanter = this.getPlayableNotes();
  console.log({playableSong, playableChanter});
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
