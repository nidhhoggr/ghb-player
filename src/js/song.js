function ABCSong(song) {
  this.name = song.name;
  this.tempo = song.tempo;
  this.abc = song.abc;
  this.options = {
    "infoFieldMapping": getInfoFieldMapping(),
    "infoFieldKeyMapping": swap(getInfoFieldMapping())
  };
}

function getInfoFieldMapping() {
  return {
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

String.prototype.containsPrefix = function(prefix) {
  return this.toString().indexOf(`${prefix}:`) == 0;
}

String.prototype.withoutPrefix = function(prefix) {
  return this.toString().replace(`${prefix}:`, "");
}

String.prototype.insertNewLineAtIndex = function({line, index}) {
  const newLineDelimited = this.toString().split("\n");
  const newLineDelimitedLength = newLineDelimited.length;
  const temp = newLineDelimited[index];
  newLineDelimited[index] = line;
  for (var i = index + 1; i < newLineDelimitedLength; i++) {
    newLineDelimited[i] = newLineDelimited[i + 1];
  }
  newLineDelimited[index + 1] = temp;
  return newLineDelimited.join("\n");
}

ABCSong.prototype.insertNewLineAtIndex = function(args) {
  this.abc = this.abc.insertNewLineAtIndex(args); 
  console.log(this.abs);
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
  const fieldKey = this.options.infoFieldKeyMapping["tempo"];
  this.lineIterator((line, {isLastLine}) => {
    if (line.containsPrefix(fieldKey)){
      console.log(`Replacing existing tempo ${line}`);
      this.abc.replace(line, `${fieldKey}: ${tempo}`);
    }
    else if (isLastLine) {
      this.insertNewLineAtIndex({
        line: `${fieldKey}: ${tempo}`, 
        index: 1
      });
    }
  });
}

export default ABCSong;
