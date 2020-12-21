function ABCPlayer({
  abcjs,
  songs,
  ABCSong,
  Sackpipa,
  stateMgr,
  HPS,
  utils,
  options
}) {

  this.abcjs = abcjs;

  this.songs = songs;

  this.ABCSong = ABCSong;

  this.Sackpipa = Sackpipa;

  this.HPS = HPS;

  this.stateMgr = stateMgr;

  this.utils = utils;

  this.options = options;

  this.currentTuneIndex = 0;
  this.transposition = 0;
  this.tempo = 0;

  //how often to analyze the state
  this.stateAssessmentLoopInterval = 5000;//milliseconds

  //used to store events to dispatch when play button is fired
  this.onStartCbQueue = [];

  this.domBinding = {};

  this.domBindingKeys = [
    "start",
    "stop",
    "songNext",
    "songPrev",
    "transposeUp",
    "transposeDown",
    "tempoUp",
    "tempoDown",
    "chanterUp",
    "chanterDown",
    "currentTransposition",
    "currentTempo",
    "currentSong",
    "currentBeat",
    "currentChanter",
    "currentKeySig",
    "audio",
    "noteDiagram",
    "scrollingNotesWrapper",
    "unsetUrlTempo",
    "unsetUrlTransposition",
    "unsetUrlChanter",
  ];

  this.domButtonSelectors = [
    "start",
    "stop",
    "songNext",
    "songPrev",
    "transposeUp",
    "transposeDown",
    "tempoUp",
    "tempoDown",
    "chanterUp",
    "chanterDown",
    "unsetUrlTempo",
    "unsetUrlTransposition",
    "unsetUrlChanter",
  ];

  this.urlParamNames = [
    "currentChanterIndex",
    "currentTuneIndex",
    "currentTransposition",
    "currentTempo",
    "currentNoteIndex"
  ];

  this.urlParams = {};

  this.firstScrollingNoteSection = `<section class="firstScrollingNote"></section>`;
  /*
   * @TODO look into abctune.formatting.bagpipe
   */
  this.currentInstrumentIndex = 109 || options.currentInstrumentIndex; //bagpipe

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
      
      /*
      var output = "currentTrackMilliseconds: " + abcElem.currentTrackMilliseconds + "<br>" +
        "midiPitches: " + JSON.stringify(abcElem.midiPitches, null, 4) + "<br>" +
        "gracenotes: " + JSON.stringify(abcElem.gracenotes, null, 4) + "<br>" +
        "midiGraceNotePitches: " + JSON.stringify(abcElem.midiGraceNotePitches, null, 4) + "<br>";
      document.querySelector(".clicked-info").innerHTML = "<div class='label'>Clicked info:</div>" +output;
      */

      var lastClicked = abcElem.midiPitches;
      if (!lastClicked) return;

      this.abcjs.synth.playEvent(lastClicked, abcElem.midiGraceNotePitches, this.synthControl.visualObj.millisecondsPerMeasure()).then((response) => {
        const { cmd, pitch, duration, ensIndex } = lastClicked[0];
        if (cmd == "note") {
          this.setNoteDiagram({pitchIndex: pitch, duration});
          const firstPitch = _.get(abcElem, "midiPitches[0]");
          if (firstPitch) {
            const currentNoteIndex = _.get(firstPitch, "ensIndexes[0]");
            if (currentNoteIndex) 
              this.noteScrollerItemOnClick(undefined, {currentNoteIndex: currentNoteIndex - 1});
              this.assessState({currentNoteIndex});
          }
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
      soundFontUrl: this.options.soundFontUrl, 
      program: this.currentInstrumentIndex,
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
    displayLoop: false,
    displayRestart: false,
    displayPlay: false,
    displayProgress: false
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


ABCPlayer.prototype.setTempo = function(tempo, {shouldSetTune = true, from} = {}) {
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
  shouldSetTune && this.setTune({
    userAction: true,
    isSameSong: true,
    currentSong: this.currentSong,
    abcOptions: {
      visualTranspose: this.transposition
    },
    onSuccess: () => {
      this.domBinding.currentTempo.innerText = tempo;
      console.log(`Set tempo to ${tempo}.`);
      if (!this.onUnsetUrlParamTempo && _.isNumber(from) && !_.isNaN(from) && tempo !== from) {
        this.onUnsetUrlParamTempo = () => {
          this.setTempo(from);
        }
        this.domBinding.unsetUrlTempo.show();
      }
    },
    calledFrom: "tempo"
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

ABCPlayer.prototype.onNoteChange = function onNoteChange({event, midiPitch: {
  cmd,
  pitch,
  //volume,
  //start,
  duration,
  //instrument,
  //endType,
  //gap,
}}) {
  const scrollingNotesWrapper = this.domBinding?.scrollingNotesWrapper;
  console.log("onNoteChange:", {pitch, cmd, event});
  if (scrollingNotesWrapper) {
    const index = event.ensIndex + 1;
    if (_.isNaN(index)) return;
    this.currentNoteIndex = index;
    this.updateState();
    const snItem = this.getNoteScrollerItem({currentNoteIndex: index});
    try { 
      const firstLeft = scrollingNotesWrapper.getBoundingClientRect();
      const snItemRect = snItem.getBoundingClientRect();
      const offset = (snItemRect.left - firstLeft.left - this.hpsOptions.sectionOffset) * -1;
      const targetXPos = ((this.hpsOptions.sectionWidth * index) * -1);
      console.log({offset, targetXPos});
      this.noteScroller.setScrollerXPos({xpos: offset});
    }
    catch (err) {
      console.error(`Could not calculate offset`);
    }
    const scrollingNoteDivs = this.domBinding?.scrollingNotesWrapper.children || [];
    const currEl = scrollingNoteDivs[index];
    let i, snd;
    if (currEl && !currEl.className.includes("currentNote")) {
      currEl.className = currEl.className.concat(" currentNote");
    }
    Array.from(scrollingNoteDivs).map((snd, i) => {
      if (i !== index && snd.className && snd.className.includes("currentNote")) {
        snd.className = snd.className.replace("currentNote","");
      }
    });
  }
  return this.setNoteDiagram({pitchIndex: pitch, duration});
}


ABCPlayer.prototype.load = function() {

  this.domBindingKeys.map((name) => {
    this.domBinding[name] = document.querySelector(`.${name}`);
    if (this.domBinding[name]) { 
      this.domBinding[name].hide = function() {
        this.style.display = "none";
      }
      this.domBinding[name].show = function() {
        this.style.display = "inline-block";
      }
    }
  });

  this.domButtonSelectors.map((elName) => {
    clickBinder({el: this.domBinding[elName], eventCb: this[elName].bind(this)});
  });

  this.urlParamNames.map((urlParamName) => {
    this.urlParams[urlParamName] = this.utils.location_getParameterByName(urlParamName);
  });

  if (this.abcjs.synth.supportsAudio()) {
    this.synthControl = new this.abcjs.synth.SynthController();
    const cursorControl = new CursorControl({
      onNoteChange: this.onNoteChange.bind(this),
      onBeatChange: ({beatNumber, totalBeats, totalTime}) => {
        if(beatNumber == 0) {}
        totalTime = totalTime && _.round(totalTime / 60);
        this.domBinding["currentBeat"].innerText = `Beat: ${beatNumber}/${totalBeats}`;
      }
    });
    this.synthControl.load("#audio", cursorControl, this.visualOptions);
  } else {
    this.domBinding.audio.innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
  }
  
  this.sackpipa = new this.Sackpipa(this.sackpipaOptions);
  

  this.evaluateUrlParams();
  
  this.noteScroller = new this.HPS(this.hpsOptions.wrapperName, this.hpsOptions);
  this.setTune({userAction: true, onSuccess: this.onSuccesses});
  this.stateMgr.idleWatcher({
    inactiveTimeout: 60000 * 5, 
    onInaction: () => {
      console.log("My inaction function"); 
    },
    onReactivate: () => {
      console.log("My reactivate function");
      this.updateState({onFinish: () => (window.location.reload())});
    }
  });
  setInterval(() => {
    this.updateState();
  }, this.stateAssessmentLoopInterval);

  document.onkeydown = (evt) => {
    evt = evt || window.event;
    const { keyCode } = evt;
    const { keyCodes } = this.options;
    if (!keyCodes) return;
    if (keyCode === keyCodes.esc) { 
      history.replaceState({}, null, `?currentTuneIndex=${this.currentTuneIndex}`);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
    else if (keyCode === keyCodes.prev) {
      this.songPrev();
    }
    else if (keyCode === keyCodes.play) {
      this.start();
    }
    else if (keyCode === keyCodes.next) {
      this.songNext();
    }
  };

  /*
  ({}) => {
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
  }});
  */
}

ABCPlayer.prototype.evaluateUrlParams = function() {
  //an array of callbacks to be executed in the sequence they are inserted
  this.onSuccesses = [];
  let urlParam = parseInt(this.urlParams["currentTuneIndex"]);
  if (_.isNumber(urlParam) && !_.isNaN(urlParam)) {
    this.currentTuneIndex = urlParam;
    if (this.songs[this.currentTuneIndex]) {
      const song = this.songs[this.currentTuneIndex];
      this.currentSong = new this.ABCSong(song);
      this.currentSong.load();
    }
    else {
      console.error(`Could not get song from index ${this.currentTuneIndex}`);
    }
  }

  const toSet = {};//stores a set of properties to call in onSuccess
  urlParam = parseInt(this.urlParams["currentChanterIndex"]);
  if (_.isNumber(urlParam) && !_.isNaN(urlParam)) {
    const currentChanterIndex = this.getCurrentChanterIndex();
    const urlChanterIndex = urlParam;
    console.log("URL CHANTER", currentChanterIndex, urlChanterIndex);
    if (currentChanterIndex !== urlChanterIndex && urlChanterIndex !== 0) {
      toSet.chanterIndex = urlChanterIndex;
      toSet.from_chanterIndex = currentChanterIndex;
    }
  }

  urlParam = parseInt(this.urlParams["currentTransposition"]);
  if (_.isNumber(urlParam) && !_.isNaN(urlParam)) {
    const currentTransposition = this.currentSong?.transposition || this.transposition;
    const urlTransposition = urlParam;
    console.log("URL TRANSPOSITION", currentTransposition, urlTransposition);
    if (currentTransposition !== urlTransposition && urlTransposition !== 0) {
      toSet.transposition = urlTransposition;
      toSet.from_transposition = currentTransposition;
    }
  }

  urlParam = parseInt(this.urlParams["currentTempo"]);
  if (_.isNumber(urlParam) && !_.isNaN(urlParam)) {
    const currentTempo = this.currentSong?.tempo || this.tempo;
    const urlTempo = urlParam;
    console.log("URL TEMPO", currentTempo, urlTempo, this.currentSong);
    if (currentTempo !== urlTempo && urlTempo !== 0) {
      toSet.tempo = urlTempo;
      toSet.from_tempo = currentTempo;
    }
  }

  this.onSuccesses.push(() => {
    if (_.isNumber(toSet.chanterIndex)) this._updateChanter(toSet.chanterIndex, {from: toSet.from_chanterIndex});
    if (_.isNumber(toSet.tempo)) this.setTempo(toSet.tempo, {from: toSet.from_tempo});
    if (_.isNumber(toSet.transposition)) this.setTransposition(toSet.transposition, {from: toSet.from_transposition});
  });

  urlParam = parseInt(this.urlParams["currentNoteIndex"]);
  if (_.isNumber(urlParam) && !_.isNaN(urlParam)) {
    const currentNoteIndex = urlParam;
    if (_.isNaN(currentNoteIndex)) return;
    function clickItem() {
      const nsItem = this.getNoteScrollerItem({currentNoteIndex: currentNoteIndex - 1});
      nsItem && this.utils.simulateClick(nsItem);
    }
    //this will be fired when the user clicks play is needed in addtion to the call below
    this.onStartCbQueue.push(clickItem.bind(this));
    //this will be fired first to set the note before clicking play
    this.onSuccesses.push(setTimeout(clickItem.bind(this), 2000));
  }
}

ABCPlayer.prototype.setNoteDiagram = function({pitchIndex, currentNote}) {
  if (!currentNote) {
    currentNote = this.abcjs.synth.pitchToNoteName[pitchIndex];
  }
  const chanterKey = this.sackpipa.getChanterKeyAbbr();
  if ((pitchIndex < this.currentSong?.compatibility?.pitchReached.min ||
    (pitchIndex > this.currentSong?.compatibility?.pitchReached.max))) {
    this.domBinding.noteDiagram.innerHTML = `<div class="playable_chanter-${chanterKey} unplayable-note"><h1>${currentNote}</h1></div>`;
  }
  else {
    this.domBinding.noteDiagram.innerHTML = `<div class="playable_chanter-${chanterKey} playable_pitch-${pitchIndex}"><h1>${currentNote}</h1></div>`;
  }
}


ABCPlayer.prototype.setCurrentSongNoteSequence = function({visualObj, onFinish}) {
  this.currentSong.entireNoteSequence = [];
  const lines = this.audioParams.visualObj.noteTimings;
  const linesLength = lines.length;
  const totalDuration = _.get(this.midiBuffer, "flattened.totalDuration") * 1000;
  let durationReached = 0;
  lines.map((line, lKey) => {
    if (_.get(line, "midiPitches[0].cmd") === "note") {
      const pitchIndex = line.midiPitches[0].pitch;
      const noteName = this.abcjs.synth.pitchToNoteName[pitchIndex];
      const duration = line.midiPitches[0].duration;
      const percentage = _.round((durationReached * 1000 / totalDuration), 5);
      const ensIndex = this.currentSong.entireNoteSequence.push({
        noteName,
        pitchIndex,
        duration,
        durationReached,
        _percentage: percentage,
        percentage: percentage.toString().replace(".","_"),
        measureStart: line.measureStart
      }) - 1;
      this.audioParams.visualObj.noteTimings[lKey].ensIndex = ensIndex;
      this.currentSong.entireNoteSequence[ensIndex].noteTimingIndex = lKey;
      this.currentSong.entireNoteSequence[ensIndex].ensIndex = ensIndex;
      durationReached += duration;
    }
    else {
      if (line.type == "end" && onFinish) {
        onFinish();
      }
    }
  });
}

ABCPlayer.prototype.start = function() {
  if (this.synthControl) {
    this.synthControl.play();
    if (this.onStartCbQueue.length) {
      this.synthControl.pause();
      _.each(this.onStartCbQueue, (cq, i) => {
        _.isFunction(cq) && cq();
        delete this.onStartCbQueue[i];
      });
    }
  }
}

ABCPlayer.prototype.stop = function(args = {}) {
  if (this.options.refreshWhenPossible) {
    this.updateState({
      playerInstance: {
        currentNoteIndex: 0,
        currentTuneIndex: args.currentTuneIndex || this.currentTuneIndex,
        ...args
      },
      onFinish: () => (window.location.reload()),
      changeSong: args.changeSong,
    });
  }
  else {
    this.updateState({
      playerInstance: {
        currentNoteIndex: 0,
        currentTuneIndex: args.currentTuneIndex || this.currentTuneIndex,
        tempo: this.currentTempo,
        transposition: this.transposition,
        ...args
      },
      changeSong: args.changeSong,
    });
    this.setTune({userAction: true, calledFrom: "song"});
  }
}

ABCPlayer.prototype.changeSong = function(args) {
  this.unsetUrlTransposition();
  this.unsetUrlTempo();
  this.unsetUrlChanter();
  this.stop({changeSong: true, ...args});
  //in case we do no refresh, unset these functions set by urlparam eveluation
}


ABCPlayer.prototype.songPrev = function() {
  if (this.currentTuneIndex > 0)
    this.currentTuneIndex = this.currentTuneIndex - 1;
  else
    this.currentTuneIndex = this.songs.length - 1;
  this.changeSong({currentTuneIndex: this.currentTuneIndex});
}

ABCPlayer.prototype.songNext = function() {
  this.currentTuneIndex = this.currentTuneIndex + 1;
  if (this.currentTuneIndex >= this.songs.length) this.currentTuneIndex = 0;
  this.changeSong({currentTuneIndex: this.currentTuneIndex});
}


ABCPlayer.prototype.transposeUp = function() {
  if (this.transposition < this.transpositionLimits.max) {
    this.setTransposition(this.transposition + 1, {from: this.transposition});
  }
}

ABCPlayer.prototype.transposeDown = function() {
  if (this.transposition > this.transpositionLimits.min) {
    this.setTransposition(this.transposition - 1, {from: this.transposition});
  }
}

ABCPlayer.prototype.tempoUp = function(by = 1) {
  if ((this.tempo + by) <= this.tempoLimits.max) {
    const from = this.tempo;
    this.tempo += by;
    this.setTempo(undefined, {from});
  }
}

ABCPlayer.prototype.tempoDown = function(by = 1) {
  if ((this.tempo - by) >= this.tempoLimits.min) {
    const from = this.tempo;
    this.tempo -= by;
    this.setTempo(undefined, {from});
  }
}

ABCPlayer.prototype.chanterDown = function() {
  const { chanterKey, possibleChanters } = this.sackpipa;
  const currentIndex = this.getCurrentChanterIndex();
  let nextIndex;
  if (currentIndex >= possibleChanters.length) {
    nextIndex = 0;
  }
  else if (currentIndex === 0 || currentIndex) {
    nextIndex = currentIndex + 1;
  }
  this._updateChanter(nextIndex, {from: currentIndex});
}

ABCPlayer.prototype.chanterUp = function() {
  const { chanterKey, possibleChanters } = this.sackpipa;
  const currentIndex = this.getCurrentChanterIndex();
  let nextIndex;
  if (currentIndex <= 0) {
    nextIndex = possibleChanters.length - 1;
  }
  else if (currentIndex)  {
    nextIndex = currentIndex - 1;
  }
  this._updateChanter(nextIndex, {from: currentIndex});
}

ABCPlayer.prototype.getCurrentChanterIndex = function() {
  if (!this.sackpipa) return 0;
  const { chanterKey, possibleChanters } = this.sackpipa;
  return _.indexOf(possibleChanters, chanterKey);
}

ABCPlayer.prototype._updateChanter = function updateChanter(chanterKeyIndex, {from} = {}) {
  const { possibleChanters } = this.sackpipa;
  this.sackpipa.setChanterKey(possibleChanters[chanterKeyIndex]);
  this.setTune({
    userAction: true,
    isSameSong: true,
    currentSong: this.currentSong,
    abcOptions: {
      visualTranspose: this.transposition
    },
    onSuccess: () => {
      console.log(`Updated the chanter to ${chanterKeyIndex}`);
      if (!this.onUnsetUrlParamChanter && _.isNumber(from) && !_.isNaN(from) && chanterKeyIndex !== from) {
        this.onUnsetUrlParamChanter = () => {
          this._updateChanter(from);
        }
        this.domBinding.unsetUrlChanter.show();
      }
    },
    calledFrom: "chanter",
  });
}

ABCPlayer.prototype.unsetUrlTempo = function() {
  this.onUnsetUrlParamTempo?.();
  this.domBinding.unsetUrlTempo.hide();
  this.updateState();
  delete this.onUnsetUrlParamTempo;
}

ABCPlayer.prototype.unsetUrlTransposition = function() {
  this.onUnsetUrlParamTransposition?.();
  this.domBinding.unsetUrlTransposition.hide();
  this.updateState();
  delete this.onUnsetUrlParamTransposition;
}

ABCPlayer.prototype.unsetUrlChanter = function() {
  this.onUnsetUrlParamChanter?.();
  this.domBinding.unsetUrlChanter.hide();
  this.updateState();
  delete this.onUnsetUrlParamChanter;
}

ABCPlayer.prototype.updateControlStats = function updateControlStats() {
  this.domBinding.currentTransposition.innerText = this.transposition;
  this.domBinding.currentTempo.innerText = this.tempo;
  this.domBinding.currentSong.innerText = this.currentSong.name;
  this.domBinding.currentChanter.innerText = _.get(this.sackpipa, "chanterKey", "");
  if (this.audioParams.visualObj) {
    const keySig = this.audioParams.visualObj.getKeySignature();
    if (keySig) {
      const { root, mode } = keySig;
      this.domBinding.currentKeySig.innerText = `${root}${mode}`;
    }
  }
}

ABCPlayer.prototype.setTransposition = function(semitones, {shouldSetTune = true, from} = {}) {
  this.transposition = semitones;
  this.currentSong.setTransposition(semitones, ({isSet}) => {
    if (!isSet) {
      console.error(`Could not set transposition by ${semitones}`)
      return;
    }
    else {
      this.updateState();
      shouldSetTune && this.setTune({
        userAction: true,
        isSameSong: true,
        currentSong: this.currentSong,
        abcOptions: {
          visualTranspose: semitones
        },
        onSuccess: () => {
          console.log(`Set transposition by ${semitones} half steps.`);
          if (!this.onUnsetUrlParamTransposition && _.isNumber(from) && !_.isNaN(from) && semitones !== from) {
            this.onUnsetUrlParamTransposition = () => {
              this.setTransposition(from);
            }
            this.domBinding.unsetUrlTransposition.show();
          }
        }
      });
    }
  }); 
}

ABCPlayer.prototype.assessState = function(args = {}) {
  let i, j;
  for (i in args) {
    this[i] = args[i];
  }
  this.stateMgr.onAssessState({playerInstance: this});
}

ABCPlayer.prototype.updateState = function(args) {
  return this.stateMgr.onAssessState({playerInstance: this, ...args});
}

ABCPlayer.prototype.setTune = function setTune({userAction, onSuccess, abcOptions, currentSong, isSameSong, calledFrom = null}) {
  
  if (!currentSong) {
    const song = this.songs[this.currentTuneIndex];
    this.currentSong = new this.ABCSong(song);
  }
  else {
    this.currentSong = currentSong;
  }
 
  if (!isSameSong) {
    if (this.noteScroller) this.noteScroller.setScrollerXPos({xpos: 0});
    const { tempo, transposition, tuning } = this.currentSong;
    //the shouldSetTune flag ensures that it will not call setTune, were already here!
    if (tempo) {
      this.setTempo(tempo, {shouldSetTune: false});
    }
    //this will override URLPARAMS
    if (_.isNumber(transposition) //can contain zero
        && transposition !== this.transposition //song trans. doesnt match player trans.
        && !this.onUnsetUrlParamTransposition) {//the trans. was not set by urlparams
      const setEm = () => {
        //altough were already here well need to set the tune again...
        this.setTransposition(transposition, {shouldSetTune: true});
        //needed to set tranposition to zero if it is zero
      }
      if (onSuccess && onSuccess.hasOwnProperty("length")) {
        onSuccess.push(setEm);
      }
      else if (!onSuccess) {
        onSuccess = [setEm];
      }
      else {
        console.error(onSuccess);
        throw new Error("Has no member length");
      }
    }
    if (tuning && !this.onUnsetUrlParamChanter) {
       const setEm = () => {
        this._updateChanter(tuning);
      }
      if (onSuccess && onSuccess.hasOwnProperty("length")) {
        onSuccess.push(setEm);
      }
      else if (!onSuccess) {
        onSuccess = [setEm];
      }
      else {
        console.error(onSuccess);
        throw new Error("Has no member length");
      }
    }
    this.domBinding.currentSong.innerText = this.currentSong.name;
  }
  
  const { abc } = this.currentSong;
  
  var midi, midiButton;
  try {

    if (shouldReuseInstances(calledFrom) && this.audioParams.visualObj) { 
      console.log(`reusing visual obj`);
    }
    else {
      this.audioParams.visualObj = this.abcjs.renderAbc("paper", abc, {
        ...this.abcOptions,
        ...abcOptions
      })[0];
      console.log(`recreating visual obj`, this.audioParams.visualObj);
    }
  } catch(err) {
    console.error(err);
    return console.log("Couldn't get midi file", {err});
  }
  this.updateControlStats();
  const tuneArgs = arguments[0];
  const _onSuccess = onSuccess;
  tuneArgs.onSuccess = (response) => {
    this.setNoteScroller({calledFrom});
    this.updateControlStats();
    console.log("Audio successfully loaded.", this.synthControl);
    if (_onSuccess) {
      if (_.isArray(_onSuccess)) {
        _.each(_onSuccess, (onS) => {
          try {
            _.isFunction(onS) && onS();
          }
          catch(err) {
            console.error(err);
          }
        });
      }
      else {
        _onSuccess(response);
      }
    }
  }
  //only reuse if the chanter chnaged
  if (shouldReuseInstances(calledFrom) && this.midiBuffer) { 
    console.log(`resuing midiBuffer instance`);
    this._setTune(tuneArgs); 
  } 
  else {
    this.createMidiBuffer().then((response) => {
      console.log(`creating new midiBuffer instance`, this.midiBuffer);
      this._setTune(tuneArgs); 
    }).catch(console.error);
  }
}

ABCPlayer.prototype._setTune = function _setTune({calledFrom, userAction, onSuccess, onError} = {}) {
  this.synthControl && this.synthControl.setTune(this.audioParams.visualObj, userAction, this.audioParams.options).then((response) => {
    //if its called by anything other than  tempo
    this.setCurrentSongNoteSequence({visualObj: this.audioParams.visualObj, onFinish: () => {
      console.log("Set current note sequence");
      const compatiblePitches = this.sackpipa && this.sackpipa.getCompatiblePitches({abcSong: this.currentSong});
      const pitches = this.currentSong.getDistinctPitches();
      this.currentSong.compatibility = {
        playableNotes: this.currentSong.getDistinctNotes(),
        playablePitches: this.currentSong.getDistinctPitches(),
        compatibleNotes: this.sackpipa && this.sackpipa.getCompatibleNotes({abcSong: this.currentSong}),
        compatiblePitches,
        pitchReached: {
          min: _.min(compatiblePitches.compatible),
          max: _.max(compatiblePitches.compatible),
        }
      };
      console.log("setTune", this.currentSong);
      onSuccess && onSuccess({response});
    }});
  })
  .catch((error) => {
    onError && onError(error); 
    console.warn("Audio problem:", error);
  });
}

  ABCPlayer.prototype.setNoteScroller = function setNoteScoller({calledFrom}) {
  if (!["tempo"].includes(calledFrom)) {
    //set the current scrolling chanter css and html element if eniteNoteSequence 
    if (_.get(this.domBinding, "scrollingNotesWrapper") && _.get(this.currentSong, "entireNoteSequence")) {
      const cK = this.sackpipa.getChanterKeyAbbr();
      updateClasses(this.domBinding, "scrollingNotesWrapper", [`scrolling_notes-playable_chanter-${cK}`]);
      this.noteScrollerClear({
        onFinish: () => {
          console.log("clear onFinish");
          this.noteScrollerAddItems();
        }
      });
    }
  }
}

function shouldReuseInstances(calledFrom, from = ["chanter"]) {
  return from.includes(calledFrom);
}

ABCPlayer.prototype.createMidiBuffer = function createMidiBuffer() {
  this.audioParams.visualObj.formatting.bagpipes = true;
  this.midiBuffer = new this.abcjs.synth.CreateSynth();
  return this.midiBuffer.init(this.audioParams);
}

//This is called whenever a note is added to the scroller
function scrollingNoteItemIterator({section, item}) {
  const { 
    duration, 
    noteName, 
    pitchIndex, 
    ensIndex, 
    noteTimingIndex, 
    percentage, 
    measureStart 
  } = item;
  const dur = _.ceil(duration * 100);
  if ((pitchIndex < _.get(this.currentSong, "compatibility.pitchReached.min") || 
  (pitchIndex > _.get(this.currentSong, "compatibility.pitchReached.max")))) {
    section.classList.add(`unplayable_note`);
    section.innerHTML = `<h4>${noteName}</h4>`;
  }
  else {
    section.classList.add(`playable_pitch-${pitchIndex}`);
    section.classList.add(`playable_duration-${dur}`);
    section.innerHTML = `<div></div>`;
  }
  section.setAttribute("data-ensindex", ensIndex);
  section.setAttribute("data-notetimingindex", noteTimingIndex);
  section.setAttribute("data-percentage", percentage);
  section.setAttribute("data-duration", `${duration}`);
  if (measureStart) section.setAttribute("data-measureStart", "true");
  section.addEventListener("click", this.noteScrollerItemOnClick.bind(this));
}

ABCPlayer.prototype.getNoteScrollerItem = function getNoteScrollerItem({currentNoteIndex} = {}) {
  return document.querySelector(`[data-ensindex="${currentNoteIndex}"]`);
}

ABCPlayer.prototype.noteScrollerItemOnClick = function noteScrollerItemOnClick(e, {currentNoteIndex} = {}) {
  if (!e && _.isNumber(currentNoteIndex)) {
    const target = this.getNoteScrollerItem({currentNoteIndex});
    e = {target};
  }
  if (!e) return;
  this.assessState({currentNoteIndex});
  const noteTimingIndex = _.get(e, "target.dataset.notetimingindex");
  const percentage = _.get(e, "target.dataset.percentage", 0);
  if (noteTimingIndex && percentage) {
    const noteEvent = _.get(this.audioParams, `visualObj.noteTimings[${noteTimingIndex}]`);
    if (noteEvent) {
      const percent = parseFloat(percentage.replace("_","."));
      this.synthControl.randomAccessBy({percent});
    }
    else {
      console.error(`Both noteTimingIndex and percentage required ${noteTimingIndex} ${percentage}`);
    }
  }
}

ABCPlayer.prototype.noteScrollerAddItems = function noteScrollerAddItems() {
  this.noteScroller && this.noteScroller.addItems({
    firstEl: this.firstScrollingNoteSection,
    items: this.currentSong.entireNoteSequence, 
    itemIterator: scrollingNoteItemIterator.bind(this),
    onFinish: () => {
      this.noteScroller && this.noteScroller.init();
    }
  });
}

ABCPlayer.prototype.noteScrollerClear = function noteScrollerClear({onFinish}) {
  const scrollingNoteDivs = Array.from(_.get(this.domBinding,"scrollingNotesWrapper.children", []));
  const scrollingNoteDivsLength = scrollingNoteDivs.length;//declared to constantize
  if (scrollingNoteDivsLength) {
    let i, noteDiv;
    for (i in scrollingNoteDivs) {
      noteDiv = scrollingNoteDivs[i];
      const firstChild = _.get(this.domBinding,"scrollingNotesWrapper.firstChild");
      if (firstChild) {
        this.domBinding.scrollingNotesWrapper.removeChild(firstChild);
      } 
      if (parseInt(i) === scrollingNoteDivsLength - 1) {
        onFinish && onFinish();
      }
    }
  }
  else {
    onFinish && onFinish();
  }
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
  };
  self.onStart = function() {
    var svg = document.querySelector("#paper svg");
    var cursor = document.createElementNS("https://www.w3.org/2000/svg", "line");
    cursor.setAttribute("class", "abcjs-cursor");
    cursor.setAttributeNS(null, 'x1', 0);
    cursor.setAttributeNS(null, 'y1', 0);
    cursor.setAttributeNS(null, 'x2', 0);
    cursor.setAttributeNS(null, 'y2', 0);
    svg.appendChild(cursor);

  };
  self.beatSubdivisions = 2;
  self.onBeat = function(beatNumber = 0, totalBeats = 0, totalTime = 0) {
    if (onBeatChange) onBeatChange({beatNumber, totalBeats, totalTime});
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

    //var el = document.querySelector(".feedback").innerHTML = "<div class='label'>Current Note:</div>" + JSON.stringify(ev, null, 4);
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
