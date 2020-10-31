import _ from 'lodash';

function ABCSong(song) {
  this.name = song.name;
  this.tempo = song.tempo;
  this.abc = song.abc;
  this.transposition = song.transposition || 0;
  this.tuning = song.tuning || "E/A";
  /**
   *  //loaded when the tune is set,
   *    used to peform various analytics and calculations
   *
   * this.entireNoteSequence;
   */
  this.options = {
    "infoFieldMapping": getInfoFieldMapping(),
    "infoFieldKeyMapping": swap(getInfoFieldMapping())
  };
}

function getInfoFieldMapping({key} = {}) {
  const mapping = {
    "X": "Reference Number",
    "T": "Tune Title",
    "C": "Composer",
    "O": "Origin",
    "A": "Area",
    "M": "Meter",
    "L": "Unit Note Length",
    "Q": "Tempo",
    "P": "Parts",
    "Z": "Transcription",
    "N": "Notes",
    "G": "Group",
    "H": "History",
    "K": "Key",
    "R": "Rhythm"
  };
  if (key) {
    return mapping[key];
  }
  else {
    return mapping;
  }
}


function swap(json){
  var ret = {};
  var field;
  for(var key in json){
    field = json[key];
    field = field.replace(/\s/g, '_');
    field = field.toLowerCase();
    ret[field] = key;
  }
  return ret;
}

ABCSong.prototype.lineIterator = function(perform) {
  const newLineDelimited = this.abc.split("\n");
  return newLineDelimited.map((line, key) => {
    perform(line, {
      key,
      isLastLine: (key == newLineDelimited.length - 1)
    });
  });
}

String.prototype.isInfoField = function() {
  const infoFieldPrefix = this.toString().substr(0, 2);
  const fieldMapping = getInfoFieldMapping();
  return ((infoFieldPrefix && infoFieldPrefix[1] == ":") && fieldMapping[infoFieldPrefix[0]]);
}

String.prototype.containsPrefix = function(prefix) {
  return this.toString().indexOf(`${prefix}:`) == 0;
}

String.prototype.withoutPrefix = function(prefix) {
  return this.toString().replace(`${prefix}:`, "");
}

ABCSong.prototype.insertInformationField = function({line}) {
  if (!line.isInfoField()) {
    return false;
    console.error(`prefix is malformed and requires a : delimiter: ${line}`);
  }
  
  const key = line[0];
  const mappingValue = getInfoFieldMapping({key});

  if (!mappingValue) {
    console.error(`Could not get mapping from prefix: ${key}`); 
  }
  const newLineDelimited = this.abc.toString().split("\n");
  const newLineDelimitedLength = newLineDelimited.length; 
  const infoFields = _.dropRightWhile(newLineDelimited, (o) => !o.isInfoField());
  infoFields.push(line);
  const songLines = _.takeRight(newLineDelimited, newLineDelimitedLength - (infoFields.length - 1));
  console.log({infoFields, songLines});
  this.abc = [
    ...infoFields,
    ...songLines
  ].join("\n");
  return this.abc.includes(line);
}

/*
   noteName,
   pitchIndex,
   duration,
   durationReached,
   _percentage: percentage,
   percentage: percentage.toString().replace(".","_"*
*/

//@TODO MEmoize as an instance of currentSong
ABCSong.prototype.getDistinctNotes = function() {
  if (!this.entireNoteSequence) return;
  return _.uniq(this.entireNoteSequence.map(({noteName}) => {
    const strippedPitchNote = noteName.match(/^[A-Za-z]+/);
    return strippedPitchNote[0];
  }));
}

//@TODO MEmoize as an instance of currentSong
ABCSong.prototype.getDistinctPitches = function() {
  if (!this.entireNoteSequence) return;
  return _.uniq(this.entireNoteSequence.map(({pitchIndex}) => {
    return pitchIndex
  }));
}

ABCSong.prototype.getInformationByFieldName = function({fieldName, flatten = true}) {
  const fieldKey = this.options.infoFieldKeyMapping[fieldName];
  const found = [];
  this.lineIterator((line, isLastLine) => {
    if (line.containsPrefix(fieldKey)){
      found.push(line.withoutPrefix(fieldKey));
    }
    else if (isLastLine) {
      
    }
  });
  if (flatten) {
    return found.join(" ");
  }
  else {
    return found;
  }
}

ABCSong.prototype.setTempo = function(tempo) {
  this.tempo = tempo;
  const fieldKey = this.options.infoFieldKeyMapping["tempo"];
  this.lineIterator((line, {isLastLine}) => {
    if (line.containsPrefix(fieldKey)){
      console.log(`Replacing existing tempo ${line}`);
      this.abc = this.abc.replace(line, `${fieldKey}: ${tempo}`);
    }
    else if (isLastLine) {
      console.log(`Inserting info field for tempo: ${tempo}`);
      const inserted = this.insertInformationField({line: `${fieldKey}: ${tempo}`});
      console.log({inserted});
    }
  });
}

ABCSong.prototype.setTransposition = function(semitones, cb) {
  const fieldKey = this.options.infoFieldKeyMapping["key"];
  const stringReplacement = `transpose=${semitones}`;
  let isSet = false;
  this.lineIterator((line, {isLastLine}) => {
    if (line.containsPrefix(fieldKey)){
      const transpoisitionMatched = line.match(/transpose=(?:-?\d+)?$/);
      if (transpoisitionMatched) {//transposition already exists
        console.log(`Replacing existing transposition ${line}`);
        this.abc = this.abc.replace(transpoisitionMatched[0], stringReplacement);
        isSet = true;
      }
      else {//transpoisition doesnt exist so we simply add it
        console.log(`Transposition does exist so well add it to ${line}`);
        this.abc = this.abc.replace(line, `${line} ${stringReplacement}`);
        isSet = true;
      }
    }
    else if (isLastLine) {//last line and doesnt contain prefix
      this.insertInformationField({line: `${fieldKey}: ${stringReplacement}`});
    }

    if (isLastLine && cb) {
      cb({isSet, abc: this.abc});
    }
  });
}


export default ABCSong;
