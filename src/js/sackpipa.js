function Sackpipa({
  chanterKey,//the key of the chanter, EA, DG, 
  dronesSynth,//an instance of CreateSynth that plays the drone
  playableNotes,//an array of playable notes because some instruments can play more notes,
  dronesEnabled,//an array of notes for the drones enabled, uses ABC for pitches
}) {
  this.chanterKey = chanterKey;
  this.dronesSynth = dronesSynth;
  this.playableNotes = playableNotes;
  this.dronesEnabled = dronesEnabled;
  this.possibleChanters = ["E/A", "D/G"];
}

export default Sackpipa;

Sackpipa.prototype.getPlayableNotes = function() {
  return getPlayableNotes({chanterKey: this.chanterKey})
}

function getPlayableNotes({chanterKey}) {
  switch (chanterKey) {
    case "E/A": {
      //not accounting for the next e in the octave
            // D    E    ^F    G    ^G    A    B    C'   ^C' 
            // D'   E'
      return ["D", "E", "Gb", "G", "Ab", "A", "B", "C", "Db"];
    }
    case "D/G": {
      //      C      D   E    F    ^F    G    A    _B    =B 
      //      C' ^C' D'
      return ["C", "D", "E", "F", "Gb", "G", "A", "Bb", "B", "Db"];
    }
    case "C/F": {
      //      _B    C    D    _E   =E    F    G    _A    =A 
      //      _B =B C'
    }
  }
}
