function ABCPlayer({
  abcjs,
  songs,
  ABCSong,
  Sackpipa,
  HPS,
  utils
}) {

  this.abcjs = abcjs;

  this.songs = songs;

  this.ABCSong = ABCSong;

  this.Sackpipa = Sackpipa;

  this.HPS = HPS;

  this.currentTune = 0;

  this.currentNoteIndex = 1;

  this.domBinding = {};

  this.domBindingKeys = [
    'start',
    'songNext',
    'songPrev',
    'transposeUp',
    'transposeDown',
    'tempoUp',
    'tempoDown',
    'chanterUp',
    'chanterDown',
    'currentTransposition',
    'currentTempo',
    'currentSong',
    'currentChanter',
    'audio',
    'noteDiagram',
    'scrollingNotesWrapper',
  ];
    

  this.firstScrollingNoteSection = `<section class="firstScrollingNote"></section>`;
  /*
   * @TODO look into abctune.formatting.bagpipe
   */
  this.currentInstrumentIndex = 109; //bagpipe

  this.transpositionLimits = {
    min: -12,
    max: 12
  };

  this.tempoLimits = {
    min: 20,
    max: 180,
  }

  this.synthControl = null;

  this.audioContext = new AudioContext();

  this.abcOptions = {
    bagpipes: true,
    add_classes: true,
    responsive: "resize",
    clickListener: (abcElem, tuneNumber, classes, analysis, drag, mouseEvent) => {
      var output = "currentTrackMilliseconds: " + abcElem.currentTrackMilliseconds + "<br>" +
        "midiPitches: " + JSON.stringify(abcElem.midiPitches, null, 4) + "<br>" +
        "gracenotes: " + JSON.stringify(abcElem.gracenotes, null, 4) + "<br>" +
        "midiGraceNotePitches: " + JSON.stringify(abcElem.midiGraceNotePitches, null, 4) + "<br>";
      document.querySelector(".clicked-info").innerHTML = "<div class='label'>Clicked info:</div>" +output;

      var lastClicked = abcElem.midiPitches;
      if (!lastClicked)
        return;

      this.abcjs.synth.playEvent(lastClicked, abcElem.midiGraceNotePitches, this.synthControl.visualObj.millisecondsPerMeasure()).then((response) => {
        const { cmd, pitch, duration } = lastClicked[0];
        if (cmd == "note") {
          this.setNoteDiagram({pitchIndex: pitch, duration});
        }
      }).catch((error) => {
        console.log("error playing note", error);
      });
    }
  };


  this.audioParams = {
    audioContext: this.audioContext,
    //visualObj,
    // sequence: [],
    // millisecondsPerMeasure: 1000,
    // debugCallback: function(message) { console.log(message) },
    options: {
      soundFontUrl: "http://folktabs.com/midi-js-soundfonts/FluidR3_GM/",
      program: 109,//bagpipe
      // soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/" ,
      // sequenceCallback: function(noteMapTracks, callbackContext) { return noteMapTracks; },
      // callbackContext: this,
      // onEnded: function(callbackContext),
      // pan: [ -0.5, 0.5 ]
      //qpm,
      //defaultQpm: qpm,
      chordsOff: true,
      voicesOff: true
    }
  }

  this.visualOptions = {
    displayWarp: false,
    displayLoop: true,
    displayRestart: true,
    displayPlay: true,
    displayProgress: true
  };

  this.sackpipaDroneSynth = null; 

  this.sackpipaOptions = {
    chanterKey: "E/A",
    dronesEnabled: ["E4","A3"],
    isFirstGroupPlugged: true,//on all chnaters the high d note on the E/A chanter
    isSecondGroupPlugged: true,//only on D/G and C/F chanters
    dronesSynth: null,//should be an instance of the sackpipaDroneSynth above,
    playableNotes: [],//["F"]
  };

  this.hpsOptions = {
    ease: 0.08,
    sectionWidth: 58,
    sectionOffset: 420,
    wrapperName: ".scrollingNotesWrapper"
  };
}

export default ABCPlayer;

ABCPlayer.prototype.setTempo = function(tempo) {
  if (!tempo) {
    tempo = this.tempo;
  }
  else if (tempo) {
    this.tempo = tempo;
  }
  //difference between QPM and BPM?
  this.audioParams.options.qpm = tempo;
  this.audioParams.options.defaultQpm = tempo;
  this.currentSong.setTempo(tempo);
  this.setTune({
    userAction: true,
    isSameSong: true,
    currentSong: this.currentSong,
    abcOptions: {
      visualTranspose: this.transposition
    },
    onSuccess: () => {
      this.domBinding.currentTempo.innerText = tempo;
      console.log(`Set tempo to ${tempo}.`);
    }
  });
}

function clickBinder({el, selector, eventCb, eventName = "click"}) {
  if (!el) el = document.querySelector(selector);
  if (!el) return console.error(`Could not get element from selector: ${selector}`);
  el.addEventListener(eventName, (e) => eventCb());
  const mouseLeft = false;
  let pressHoldInterval;
  el.addEventListener("mousedown", (e) => {
    pressHoldInterval = setInterval(() => {
      eventCb(5);
    }, 333);
  });  
  el.addEventListener("mouseleave", () => {
    clearInterval(pressHoldInterval);
  });
  el.addEventListener("mouseup", () => {
    clearInterval(pressHoldInterval);
  });

}

ABCPlayer.prototype.load = function() {

  this.domBindingKeys.map((name) => {
    this.domBinding[name] = document.querySelector(`.${name}`);
    console.log(name, this.domBinding[name]);
  });


  [
    "start",
    "songNext",
    "songPrev",
    "transposeUp",
    "transposeDown",
    "tempoUp",
    "tempoDown",
    "chanterUp",
    "chanterDown",
  ].map((elName) => {
    clickBinder({el: this.domBinding[elName], eventCb: this[elName].bind(this)});
  });

  if (this.abcjs.synth.supportsAudio()) {
    this.synthControl = new this.abcjs.synth.SynthController();
    const cursorControl = new CursorControl({
      onNoteChange: ({event, midiPitch: {
        cmd,
        pitch,
        //volume,
        //start,
        duration,
        //instrument,
        //endType,
        //gap,
      }}) => {
        const scrollingNotesWrapper = _.get(this.domBinding, "scrollingNotesWrapper");
        console.log("onNoteChange:", pitch, cmd, event, this.currentNoteIndex);
        if (scrollingNotesWrapper) {
          if (scrollingNotesWrapper) {
            const targetXPos = (this.hpsOptions.sectionWidth * (this.currentNoteIndex - 1) * -1);
            this.noteScroller.setScrollerXPos({xpos: targetXPos});
          }
          const scrollingNoteDivs = _.get(this.domBinding,"scrollingNotesWrapper.children", []);
          const currEl = scrollingNoteDivs[this.currentNoteIndex];
          let i, snd;
          if (currEl) currEl.className = currEl.className.concat(" currentNote");
          for (i in scrollingNoteDivs) {
            if (i == this.currentNoteIndex) continue;
            snd = scrollingNoteDivs[i];
            if (snd.className && snd.className.includes("currentNote")) {
              snd.className = snd.className.replace("currentNote","");
              break;
            }
          }
        }
        this.currentNoteIndex++;
        return this.setNoteDiagram({pitchIndex: pitch, duration});
      },
      onBeatChange: ({beatNumber}) => {
        if(beatNumber == 0 && this.currentNoteIndex > 5) {
          this.currentNoteIndex = 1;
          this.noteScroller.setScrollerXPos({xpos: 0});
        }
      }
    });
    this.synthControl.load("#audio", cursorControl, this.visualOptions);
  } else {
    this.domBinding.audio.innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
  }

  this.sackpipa = new this.Sackpipa(this.sackpipaOptions);
  this.noteScroller = new this.HPS(this.hpsOptions.wrapperName, this.hpsOptions);
  this.setTune({userAction: false, onSuccess: ({synth}) => {
    /*
     * Was attempting to load a bass done here
    const noteNameToPitch = _.invert(this.abcjs.synth.pitchToNoteName);
    const pitches = [];
    pitches.push(noteNameToPitch["A4"]);

    var sequence = new this.abcjs.synth.SynthSequence();

    for (var i = 0; i < pitches.length; i++) {
      var trackNum = sequence.addTrack();
      sequence.setInstrument(trackNum, this.currentInstrumentIndex);
      sequence.appendNote(trackNum, pitches[i], 12000, 64);
    }

    var buffer = new this.abcjs.synth.CreateSynth();
    return buffer.init({
      sequence: sequence,
      millisecondsPerMeasure: 1000
    }).then(function () {
      return buffer.prime();
    }).then(function () {
      return buffer.start();
    });
    */
  }});
}

ABCPlayer.prototype.setNoteDiagram = function({pitchIndex, currentNote}) {
  if (!currentNote) {
    currentNote = this.abcjs.synth.pitchToNoteName[pitchIndex];
  }
  console.log({currentNote});
  const chanterKey = this.sackpipa.getChanterKeyAbbr();
  this.domBinding.noteDiagram.innerHTML = `<div class="playable_chanter-${chanterKey} playable_note-${currentNote}"><h1>${currentNote}</h1></div>`;
}

ABCPlayer.prototype.start = function() {
  if (this.synthControl) {
    this.synthControl.play();
  }
}

ABCPlayer.prototype.setCurrentSongNoteSequence = function() {
  this.currentSong.entireNoteSequence = [];
  this.currentSong.pitchReached = false;
  const lines = this.audioParams.visualObj.lines;
  const linesLength = lines.length;
  lines.map((line, lKey) => {
    const firstVoice = _.get(line, 'staff[0].voices[0]');
    console.log(firstVoice);
    if (firstVoice) firstVoice.filter((v) => v.el_type == "note")
    .map((note) => {
      if (note && note.midiPitches) {
        const pitchIndex = note.midiPitches[0].pitch;
        const noteName = this.abcjs.synth.pitchToNoteName[pitchIndex];
        if (!this.currentSong.pitchReached) {
          this.currentSong.pitchReached = {
            highest: pitchIndex,
            lowest: pitchIndex,
          };
        }
        else if (pitchIndex > this.currentSong.pitchReached.highest) {
          this.currentSong.pitchReached.highest = pitchIndex;
        }
        else if (pitchIndex < this.currentSong.pitchReached.lowest) {
          this.currentSong.pitchReached.lowest = pitchIndex;
        }
        this.currentSong.entireNoteSequence.push(noteName);
      }
    })
  });
}

ABCPlayer.prototype.songPrev = function() {
  if (this.currentTune > 0)
    this.currentTune--
  else
    this.currentTune = this.songs.length - 1;
  this.setTune({userAction: true});
}

ABCPlayer.prototype.songNext = function() {
  this.currentTune++;
  if (this.currentTune >= this.songs.length)
    this.currentTune = 0;
  this.setTune({userAction: true});
}


ABCPlayer.prototype.transposeUp = function() {
  if (this.transposition < this.transpositionLimits.max) {
    this.transposition += 1;
    console.log(this.currentSong);
    this.setTransposition();
  }
}

ABCPlayer.prototype.transposeDown = function() {
  if (this.transposition > this.transpositionLimits.min) {
    this.transposition -= 1;
    this.setTransposition();
  }
}

ABCPlayer.prototype.tempoUp = function(by = 1) {
  console.log(this.tempo, this.tempoLimits.max);
  if ((this.tempo + by) <= this.tempoLimits.max) {
    this.tempo += by;
    this.setTempo();
  }
}

ABCPlayer.prototype.tempoDown = function(by = 1) {
  if ((this.tempo - by) >= this.tempoLimits.min) {
    this.tempo -= by;
    this.setTempo();
  }
}

ABCPlayer.prototype.chanterDown = function() {
  const { chanterKey, possibleChanters } = this.sackpipa;
  const currentIndex = _.indexOf(possibleChanters, chanterKey);
  let nextIndex;
  if (currentIndex >= possibleChanters.length) {
    nextIndex = 0;
  }
  else if (currentIndex === 0 || currentIndex) {
    nextIndex = currentIndex + 1;
  }
  this._updateChanter(possibleChanters[nextIndex]);
}

ABCPlayer.prototype.chanterUp = function() {
  const { chanterKey, possibleChanters } = this.sackpipa;
  const currentIndex = _.indexOf(possibleChanters, chanterKey);
  let nextIndex;
  if (currentIndex <= 0) {
    nextIndex = possibleChanters.length - 1;
  }
  else if (currentIndex)  {
    this.sackpipa.setChanterKey(possibleChanters[currentIndex - 1]);
    nextIndex = currentIndex - 1;
  }
  this._updateChanter(possibleChanters[nextIndex]);
}

ABCPlayer.prototype._updateChanter = function updateChanter(chanterKey) {
  this.sackpipa.setChanterKey(chanterKey);
  this.setTune({
    userAction: true,
    isSameSong: true,
    currentSong: this.currentSong,
    abcOptions: {
      visualTranspose: this.transposition
    },
    onSuccess: () => {
      console.log(`Updated the chanter to ${chanterKey}`);
    }
  });
}

ABCPlayer.prototype.updateControlStats = function updateControlStats() {
  this.domBinding.currentTransposition.innerText = this.transposition;
  this.domBinding.currentTempo.innerText = this.tempo;
  this.domBinding.currentSong.innerText = this.currentSong.name;
  this.domBinding.currentChanter.innerText = _.get(this.sackpipa, "chanterKey", "");
}

ABCPlayer.prototype.setTransposition = function(semitones) {
  if (!semitones) semitones = this.transposition;
  this.currentSong.setTransposition(semitones, ({isSet}) => {
    if (!isSet) {
      console.error(`Could not set transposition by ${semitones}`)
      return;
    }
    else {
      this.setTune({
        userAction: true,
        isSameSong: true,
        currentSong: this.currentSong,
        abcOptions: {
          visualTranspose: semitones
        },
        onSuccess: () => {
          console.log(`Set transposition by ${semitones} half steps.`);
        }
      });
    }
  }); 
}

ABCPlayer.prototype.setTune = function({userAction, onSuccess, abcOptions, currentSong, isSameSong}) {
  
  if (!currentSong) {
    const currentTune = this.songs[this.currentTune];
    this.currentSong = new this.ABCSong(currentTune);
    this.currentSong.allNotes = [];
    this.currentSong.entireNoteSequence = [];
  }
  else {
    this.currentSong = currentSong;
  }
 
  if (!isSameSong) {
    this.transposition = 0;
    this.currentNoteIndex = 1;
    if (this.noteScroller) this.noteScroller.setScrollerXPos({xpos: 0});
    const { tempo } = this.currentSong;
    this.setTempo(tempo);
    this.domBinding.currentSong.innerText = this.currentSong.name;
  }
  
  const { abc } = this.currentSong;
  
  var midi, midiButton;
  try {
    this.audioParams.visualObj = this.abcjs.renderAbc("paper", abc, {

      ...this.abcOptions,
      ...abcOptions
    })[0];
  } catch(err) {
    console.error(err);
    console.log("Couldn't get midi file", {err});
  }
  this.updateControlStats();
  //set it to bagpipes
  this.audioParams.visualObj.formatting.bagpipes = true;
  const midiBuffer = new this.abcjs.synth.CreateSynth();
  midiBuffer.init(this.audioParams).then((response) => {
    if (this.synthControl) {
      this.synthControl.setTune(this.audioParams.visualObj, userAction, this.audioParams.options).then((response) => {
        this.setCurrentSongNoteSequence();
        setTimeout(() => {
          console.log({
            playableNotes: this.currentSong.getPlayableNotes(),
            compatibleNotes: this.sackpipa && this.sackpipa.getCompatibleNotes({abcSong: this.currentSong})
          });
          this.updateControlStats();
          if (_.get(this.domBinding, "scrollingNotesWrapper") && this.currentSong && this.currentSong.entireNoteSequence) {
            const cK = this.sackpipa.getChanterKeyAbbr();
            updateClasses(this.domBinding, "scrollingNotesWrapper", [`scrolling_notes-playable_chanter-${cK}`]);
            const scrollingNoteDivs = _.get(this.domBinding,"scrollingNotesWrapper.children", []);
            let i, noteDiv;
            console.log(scrollingNoteDivs, scrollingNoteDivs.length);
            if (scrollingNoteDivs.length) {
              for (i in scrollingNoteDivs) {
                noteDiv = scrollingNoteDivs[i];
                const firstChild = _.get(this.domBinding,"scrollingNotesWrapper.firstChild");
                if (firstChild) {
                  this.domBinding.scrollingNotesWrapper.removeChild(firstChild);
                } 
                if (i === scrollingNoteDivs.length - 1) {
                  this.noteScrollerAddItems();
                }
              }
            }
            else {
              this.noteScrollerAddItems();
            }
          }
        });
        onSuccess && onSuccess({response, synth: midiBuffer});
        console.log("Audio successfully loaded.", this.synthControl)
      }).catch(function (error) {
        console.warn("Audio problem:", error);
      });
    }
  }).catch(function (error) {
    console.warn("Audio problem:", error);
  });
}

ABCPlayer.prototype.noteScrollerAddItems = function noteScrollerAddItems() {
  this.noteScroller && this.noteScroller.addItems({
    firstEl: this.firstScrollingNoteSection,
    items: this.currentSong.entireNoteSequence, 
    itemIterator: ({section, item}) => {
      console.log({section, item});
      section.classList.add(`playable_note-${item}`); 
    }, 
    onFinish: () => {
      console.log(`finished`); 
      this.noteScroller && this.noteScroller.init();
    }
  });
}


function updateClasses(domBinding, elClassName, classes = []) {
  domBinding[elClassName].className = `${elClassName} `.concat(classes.join(" "));
}

function CursorControl({
  onNoteChange,
  onBeatChange,
}) {
  var self = this;

  self.onReady = function() {
    var clickEl = document.querySelector(".click-explanation")
    clickEl.setAttribute("style", "");
  };
  self.onStart = function() {
    var svg = document.querySelector("#paper svg");
    var cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
    cursor.setAttribute("class", "abcjs-cursor");
    cursor.setAttributeNS(null, 'x1', 0);
    cursor.setAttributeNS(null, 'y1', 0);
    cursor.setAttributeNS(null, 'x2', 0);
    cursor.setAttributeNS(null, 'y2', 0);
    svg.appendChild(cursor);

  };
  self.beatSubdivisions = 2;
  self.onBeat = function(beatNumber, totalBeats, totalTime) {
    if (!self.beatDiv)
      self.beatDiv = document.querySelector(".beat");
    if (onBeatChange) onBeatChange({beatNumber});
    self.beatDiv.innerText = "Beat: " + beatNumber + " Total: " + totalBeats + " Total time: " + totalTime;
  };
  self.onEvent = function(ev) {
    if (ev.measureStart && ev.left === null)
      return; // abcPlayer was the second part of a tie across a measure line. Just ignore it.
    if(ev.midiPitches && ev.midiPitches.length && ev.midiPitches[0].cmd == "note") {
      onNoteChange({event: ev, midiPitch: ev.midiPitches[0]});
    }

    var lastSelection = document.querySelectorAll("#paper svg .highlight");
    for (var k = 0; k < lastSelection.length; k++)
      lastSelection[k].classList.remove("highlight");

    var el = document.querySelector(".feedback").innerHTML = "<div class='label'>Current Note:</div>" + JSON.stringify(ev, null, 4);
    for (var i = 0; i < ev.elements.length; i++ ) {
      var note = ev.elements[i];
      for (var j = 0; j < note.length; j++) {
        note[j].classList.add("highlight");
      }
    }

    var cursor = document.querySelector("#paper svg .abcjs-cursor");
    if (cursor) {
      cursor.setAttribute("x1", ev.left - 2);
      cursor.setAttribute("x2", ev.left - 2);
      cursor.setAttribute("y1", ev.top);
      cursor.setAttribute("y2", ev.top + ev.height);
    }
  };
  self.onFinished = function() {
    var els = document.querySelectorAll("svg .highlight");
    for (var i = 0; i < els.length; i++ ) {
      els[i].classList.remove("highlight");
    }
    var cursor = document.querySelector("#paper svg .abcjs-cursor");
    if (cursor) {
      cursor.setAttribute("x1", 0);
      cursor.setAttribute("x2", 0);
      cursor.setAttribute("y1", 0);
      cursor.setAttribute("y2", 0);
    }
  };
}
