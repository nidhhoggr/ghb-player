import _ from "lodash";
import utils from "./utils";
const { 
  isMobileUserAgent,
  isNumber, 
  isPositiveNumber, 
  debug, 
  debugErr, 
  location_getParameterByName,
  simulateClick,
  callEvery,
  updateClasses,
  bindEl,
} = utils({from: "player"});

function ABCPlayer({
  abcjs,
  songs,
  Sackpipa,
  stateMgr,
  HPS,
  options
}) {

  this.abcjs = abcjs;

  this.songs = songs;

  this.Sackpipa = Sackpipa;

  this.HPS = HPS;

  this.stateMgr = stateMgr;

  this.options = options;
  this.playerOptions = options.player;
  this.sackpipaOptions = options.sackpipa;
  this.hpsOptions = options.hps;

  this.isSettingTune = true;
  this.currentTuneIndex = 0;
  this.transposition = 0;
  this.tempo = 0;

  //stores how many times the player was reloaded due to an error
  this.errorReloadCount = 0;

  //used to store events to dispatch when play button is fired
  this.onStartCbQueue = [];

  this.domBinding = {};

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
    "firstGroup",
    "secondGroup"
  ];

  this.domBindingKeys = [
    ...this.domButtonSelectors,
    "currentTransposition",
    "currentTempo",
    "currentSong",
    "currentBeat",
    "currentChanter",
    "currentKeySig",
    "playernotes",
    "audio",
    "noteDiagram",
    "scrollingNotesWrapper",
    "firstScrollingNote",
  ]

  this.urlParamNames = [
    "currentChanterIndex",
    "currentTuneIndex",
    "currentTransposition",
    "currentTempo",
    "currentNoteIndex",
    "fgp",//firstGroupPlugged
    "sgp",//SecondGroupPlugged,
    "erc",//error reload count,
    "imb",//isMobileBuild
  ];

  this.urlParams = {};

  this.synthControl = null;

  this.audioContext = new AudioContext();

  this.abcOptions = {
    ...options.player.abcOptions,
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
        debugErr("error playing note", error);
      });
    }
  };


  this.audioParams = {
    audioContext: this.audioContext,
    //visualObj,
    // sequence: [],
    // millisecondsPerMeasure: 1000,
    // debugCallback: function(message) { debug(message) },
    options: {
      soundFontUrl: this.playerOptions.getSoundFontUrl(this.options), 
      program: this.playerOptions.currentInstrumentIndex,
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

}

export default ABCPlayer;



function clickBinder({el, selector, eventCb, eventName = "click"}) {
  if (!el) el = document.querySelector(selector);
  if (!el) return debugErr(`Could not get element from selector: ${selector}`);
  el.addEventListener(eventName, (e) => {
    eventCb();
  });
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
  debug("onNoteChange:", {pitch, cmd, event});
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
      //debug({offset, targetXPoos});
      this.noteScroller.setScrollerXPos({xpos: offset});
    }
    catch (err) {
      debugErr(`Could not calculate offset`);
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
  return new Promise((resolve) => {
    const _domBinding = {};
    this.domBindingKeys.map((className) => {
      const el = bindEl({className});
      if (el) _domBinding[className] = el;
    });
    this.domBinding = new Proxy(_domBinding, {
      get(target, prop) {
        if (prop in target) {
          return target[prop]
        }
        else {
          debug("RETRY", prop);
          const el = bindEl({className: prop});
          if (el) target[prop] = el;
          return el;
        }
      }
    });
    this.domButtonSelectors.map((elName) => {
      try {
        clickBinder({
          el: this.domBinding[elName], 
          eventCb: this[elName].bind(this)
        });
      } 
      catch(err) {
        debugErr(`Error attetmping to bind ${elName} to dom selectors`, err);
      }
    });

    this.urlParamNames.map((urlParamName) => {
      this.urlParams[urlParamName] = location_getParameterByName(urlParamName);
    });

    if (this.abcjs.synth.supportsAudio()) {
      this.synthControl = new this.abcjs.synth.SynthController();
      const cursorControl = new CursorControl({
        playerInstance: this,
        onBeatChange: ({beatNumber, totalBeats, totalTime}) => {
          this.domBinding["currentBeat"].innerText = `Beat: ${beatNumber}/${totalBeats}`;
        }
      });
      this.synthControl.load("#audio", cursorControl, this.playerOptions.visualOptions);
    } else {
      this.domBinding.audio.innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
    }
    
    this.sackpipa = new this.Sackpipa(this.sackpipaOptions);
    this.noteScroller = new this.HPS(this.hpsOptions.wrapperName, this.hpsOptions);
    this.setCurrentSongFromUrlParam();

    const _handleErr = (err) => {
      debugErr(err);
      const error = err?.message || err?.error?.mesage || err;
      debugErr(`Error occurred: ${error}`);
      if (this.errorReloadCount < this.options?.errorReloadLimit) {
        this.errorReloadCount = this.errorReloadCount + 1;
        setTimeout(() => {
          this.reloadWindow();
        }, 2000);
      }
      else if (this.errorReloadCount === this.options?.errorReloadLimit) {
        setTimeout(() => {
          this.errorReloadCount = 0;
        }, this.errorReloadResetDuration);
      }
    };
    
    const urlProcessing = this.evaluateUrlParams();


    //this seems to do nothing
    if (isMobileUserAgent()) {
      //requires a user gesture
      this.options.isMobileBuild = true;
      this.onStartCbQueue.push(() => { 
        document.body.requestFullscreen().then(debug).catch(debugErr);
        screen.orientation.lock('landscape').then(debug).catch(debugErr)
      });
    }

    if (this.options.isMobileBuild) {
      this.playerOptions.showSheetMusic = false;
      this.playerOptions.showNoteDiagram = false;
      this.stateMgr.activityQueue.push(() => {
        debug("First Activity", this.domBinding.firstScrollingNote, this.domBinding);
        this.domBinding.firstScrollingNote.style.width = "100px";
        this.domBinding.playercontrols.style.transform = "scale(0.8)";
      });
    }

    if(!this.playerOptions.showSheetMusic) {
      this.domBinding.playernotes.hide();
    }

    this.setTune({userAction: true, onSuccess: this.onSuccesses, calledFrom: "load"}).then(() => {
      debug("URL Processing", urlProcessing);
      this.processUrlParams(urlProcessing);
      window.onerror = function (message, file, line, col, error) {
        _handleErr(error);
      };
      window.addEventListener("error", function (e) {
        _handleErr(e);
      })
      window.addEventListener('unhandledrejection', function (e) {
        _handleErr(e);
      })
      this.stateMgr.idleWatcher({
        playerInstance: this,
        inactiveTimeout: 60000 * 5, 
        onInaction: () => {
          debug("My inaction function"); 
        },
        onReactivate: () => {
          debug("my reactivate function");
          this.reloadWindow();
        }
      });
      setInterval(() => {
        this.updateState();
      }, this.playerOptions.stateAssessmentLoopInterval);
    })
    document.onkeydown = (evt) => {
      evt = evt || window.event;
      const { keyCode } = evt;
      const { keyCodes } = this.playerOptions;
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
      else if (keyCode === keyCodes.refresh) {
        this.reloadWindow();
      }
    };

    resolve({player: this});
  });
}

ABCPlayer.prototype.reloadWindow = function() {
  this.updateState({onFinish: () => (window.location.reload())});
}

ABCPlayer.prototype.sackpipaReload = function(options = {}) {
  this.sackpipaOptions = _.merge(this.sackpipaOptions,options);
  const { isFirstGroupPlugged, isSecondGroupPlugged } = this.sackpipaOptions;
  this.sackpipa = new this.Sackpipa(this.sackpipaOptions);
  if (options.skipUpdate) return;
  this._updateChanter();
  this.updateState();
  if (!this.sackpipa.isFirstGroupPlugged) {
    this.domBinding.firstGroup.classList.remove("plugged");
  } 
  else {
    updateClasses(this.domBinding, "firstGroup", ["plugged"]);
  }
  if (!this.sackpipa.isSecondGroupPlugged) {
    this.domBinding.secondGroup.classList.remove("plugged");
  }
  else {
    updateClasses(this.domBinding, "secondGroup", ["plugged"]);
  }
}




ABCPlayer.prototype.processUrlParams = function(toSet) {
  if(toSet["sackpipaOptions.isFirstGroupPlugged"]) {
    this.sackpipaOptions.isFirstGroupPlugged = toSet["sackpipaOptions.isFirstGroupPlugged"];
  }
  if (toSet["sackpipaOptions.isSecondGroupPlugged"]) {
    this.sackpipaOptions.isSecondGroupPlugged = toSet["sackpipaOptions.isSecondGroupPlugged"];
  }
  if (toSet["errorReloadCount"]) {
    this.errorReloadCount = toSet["errorReloadCount"];
  }

  if (toSet["sackpipa.tuning"]) {
    this.sackpipaReload({tuning: toSet["sackpipa.tuning"]});
  }
  else {
    this.sackpipaReload();
  }
  
  this.setCurrentSongFromUrlParam();

  const onSuccesses = [];
  onSuccesses.push(() => {
    if (isNumber(toSet.chanterIndex)) {
      //this needs to execute later in the stack due to some race condition
      setTimeout(() => {
        this._updateChanter(toSet.chanterIndex, {from: toSet.from_chanterIndex});
      });
    }
    if (isNumber(toSet.tempo)) this.setTempo(toSet.tempo, {from: toSet.from_tempo});
    if (isNumber(toSet.transposition)) this.setTransposition(toSet.transposition, {from: toSet.from_transposition});
  });

  if (toSet["setNoteScrollerItem"]) {
    const currentNoteIndex = toSet["setNoteScrollerItem"];
    function clickItem() {
      const nsItem = this.getNoteScrollerItem({currentNoteIndex});
      nsItem && simulateClick(nsItem);
    }
    //this will be fired when the user clicks play is needed in addtion to the call below
    //this will be fired first to set the note before clicking play
    onSuccesses.push(setTimeout(clickItem.bind(this), 2000));
  }

  callEvery(onSuccesses);
}

ABCPlayer.prototype.evaluateUrlParams = function() {

  let urlParam = false;

  const toSet = {};//stores a set of properties to perform logic on
  urlParam = parseInt(this.urlParams["fgp"]);
  if (isNumber(urlParam)) {
    toSet["sackpipaOptions.isFirstGroupPlugged"] = !(urlParam === 0);
  }

  urlParam = parseInt(this.urlParams["sgp"]);
  if (urlParam === 1) {
    toSet["sackpipaOptions.isSecondGroupPlugged"] = !(urlParam === 0);
  }

  urlParam = parseInt(this.urlParams["erc"]);
  if (isPositiveNumber(urlParam)) {
    toSet["errorReloadCount"] = urlParam;
  }

  urlParam = parseInt(this.urlParams["imb"]);
  if (urlParam === 1) {
    this.options.isMobileBuild = true;
  }

  urlParam = parseInt(this.urlParams["currentChanterIndex"]);
  if (isNumber(urlParam)) {
    const currentChanterIndex = this.getCurrentChanterIndex();
    const urlChanterIndex = urlParam;
    debug("URL CHANTER", currentChanterIndex, urlChanterIndex);
    if (currentChanterIndex !== urlChanterIndex && urlChanterIndex !== 0) {
      toSet.chanterIndex = urlChanterIndex;
      toSet.from_chanterIndex = currentChanterIndex;
      const tuning = this.sackpipa.getChanterKeyByIndex(urlChanterIndex);
      toSet["sackpipa.tuning"] = tuning;
    }
  }

  urlParam = parseInt(this.urlParams["currentTransposition"]);
  if (isNumber(urlParam)) {
    const currentTransposition = this.currentSong?.transposition || this.transposition;
    const urlTransposition = urlParam;
    debug("URL TRANSPOSITION", currentTransposition, urlTransposition);
    if (currentTransposition !== urlTransposition && urlTransposition !== 0) {
      toSet.transposition = urlTransposition;
      toSet.from_transposition = currentTransposition;
    }
  }

  urlParam = parseInt(this.urlParams["currentTempo"]);
  if (isNumber(urlParam)) {
    const currentTempo = this.currentSong?.tempo || this.tempo;
    const urlTempo = urlParam;
    debug("URL TEMPO", currentTempo, urlTempo, this.currentSong);
    if (currentTempo !== urlTempo && urlTempo !== 0) {
      toSet.tempo = urlTempo;
      toSet.from_tempo = currentTempo;
    }
  }

  urlParam = parseInt(this.urlParams["currentNoteIndex"]);
  if (isNumber(urlParam)) {
    const currentNoteIndex = urlParam;
    if (isNumber(currentNoteIndex)) {
      toSet["setNoteScrollerItem"] = currentNoteIndex - 1;
    }
  }

  return toSet;
}

ABCPlayer.prototype.setNoteDiagram = function({pitchIndex, currentNote}) {
  if (!this.playerOptions.showNoteDiagram) return;

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
  const lines = this.audioParams.visualObj.noteTimings || [];
  const linesLength = lines.length;
  const totalDuration = _.get(this.midiBuffer, "flattened.totalDuration") * 1000;
  let durationReached = 0;
  if (lines?.length === 0) return onFinish?.(0)
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
      if (line.type == "end") {
        onFinish?.(lKey + 1);
      }
    }
  });
}

ABCPlayer.prototype.start = function() {
  if (this.isSettingTune) return;
  if (!this.domBinding.firstScrollingNote) {
    //the loader didn't load properly
    const q = this.stop();
    setTimeout(() => {
      if (q) {
        q.then(this.start.bind(this));
      }
      else {
        this.start();
      }
    }, 2000);
  }
  else {
    if (this.synthControl) {
      this.synthControl.play();
      if (this.onStartCbQueue.length) {
        this.synthControl?.pause();
        _.each(this.onStartCbQueue, (cq, i) => {
          _.isFunction(cq) && cq();
          delete this.onStartCbQueue[i];
        });
      }
    }
  }
}

ABCPlayer.prototype.stop = function(args = {}) {
  this.synthControl?.destroy?.();
  this.synthControl?.stop?.();
  if (this.playerOptions.refreshWhenPossible) {
    this.updateState({
      playerInstance: {
        currentNoteIndex: 0,
        currentTuneIndex: args.currentTuneIndex || this.currentTuneIndex,
        ...args
      },
      onFinish: this.reloadWindow.bind(this),
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
    return Promise.resolve(this.setTune({userAction: true, calledFrom: args.changeSong ? "song" : "stop"}));
  }
}

ABCPlayer.prototype.changeSong = function(args) {
  this.synthControl?.stop?.();
  this.unsetUrlTransposition();
  this.unsetUrlTempo();
  this.unsetUrlChanter();
  this.stop({changeSong: true, ...args});
  //in case we do no refresh, unset these functions set by urlparam eveluation
}


ABCPlayer.prototype.songPrev = function() {
  if (this.isSettingTune) return;
  if (this.currentTuneIndex > 0)
    this.currentTuneIndex = this.currentTuneIndex - 1;
  else
    this.currentTuneIndex = this.songs.getCount() - 1;
  this.changeSong({currentTuneIndex: this.currentTuneIndex});
}

ABCPlayer.prototype.songNext = function() {
  if (this.isSettingTune) return;
  this.currentTuneIndex = this.currentTuneIndex + 1;
  if (this.currentTuneIndex >= this.songs.getCount()) this.currentTuneIndex = 0;
  this.changeSong({currentTuneIndex: this.currentTuneIndex});
}


ABCPlayer.prototype.transposeUp = function() {
  if (this.isSettingTune) return;
  if (this.transposition < this.playerOptions.transpositionLimits.max) {
    this.setTransposition(this.transposition + 1, {from: this.transposition});
  }
}

ABCPlayer.prototype.transposeDown = function() {
  if (this.isSettingTune) return;
  if (this.transposition > this.playerOptions.transpositionLimits.min) {
    this.setTransposition(this.transposition - 1, {from: this.transposition});
  }
}

ABCPlayer.prototype.tempoUp = function(by = 1) {
  if (this.isSettingTune) return;
  if ((this.tempo + by) <= this.playerOptions.tempoLimits.max) {
    const from = this.tempo;
    this.tempo += by;
    this.setTempo(undefined, {from});
  }
}

ABCPlayer.prototype.tempoDown = function(by = 1) {
  if (this.isSettingTune) return;
  if ((this.tempo - by) >= this.playerOptions.tempoLimits.min) {
    const from = this.tempo;
    this.tempo -= by;
    this.setTempo(undefined, {from});
  }
}

ABCPlayer.prototype.chanterDown = function() {
  if (this.isSettingTune) return;
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
  if (this.isSettingTune) return;
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

ABCPlayer.prototype._updateChanter = function updateChanter(chanterKeyIndex = 0, {from} = {}) {
  const { possibleChanters } = this.sackpipa;
  if (chanterKeyIndex < 0 || !isNumber(chanterKeyIndex)) chanterKeyIndex = 0;
  this.sackpipa.setChanterKey(possibleChanters[chanterKeyIndex]);
  this.setTune({
    userAction: true,
    isSameSong: true,
    currentSong: this.currentSong,
    abcOptions: {
      visualTranspose: this.transposition
    },
    onSuccess: () => {
      debug(`Updated the chanter to ${chanterKeyIndex}`);
      if ((chanterKeyIndex % possibleChanters.length) === 0) {
        this.domBinding.secondGroup.hide();

        //@TODO get plugged holes working
        this.domBinding.firstGroup.show();
      }
      else {
        //@TODO get plugged holes working
        this.domBinding.firstGroup.hide();
        this.domBinding.secondGroup.hide();
      }
      if (isNumber(chanterKeyIndex) && chanterKeyIndex === this.currentSong?.original?.tuning) {
        delete this.onUnsetUrlParamChanter;
        this.domBinding.unsetUrlChanter.hide();
      }
      else if (!this.onUnsetUrlParamChanter && isNumber(from) && chanterKeyIndex !== from) {
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

ABCPlayer.prototype.firstGroup = function() {
  this.sackpipaReload({
    isFirstGroupPlugged: !this.sackpipa.isFirstGroupPlugged
  });
}

ABCPlayer.prototype.secondGroup = function() {
  this.sackpipaReload({
    isSecondGroupPlugged: !this.sackpipa.isSecondGroupPlugged
  });
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
      debugErr(`Could not set transposition by ${semitones}`)
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
          debug(`Set transposition by ${semitones} half steps.`);
          if (isNumber(semitones) && semitones === this.currentSong?.original?.transposition) {
            this.domBinding.unsetUrlTransposition.hide();
            delete this.onUnsetUrlParamTransposition;
          }
          else if (!this.onUnsetUrlParamTransposition && isNumber(from) && semitones !== from) {
            this.onUnsetUrlParamTransposition = () => {
              this.setTransposition(from);
            }
            this.domBinding.unsetUrlTransposition.show();
          }
        },
        calledFrom: "transposition"
      });
    }
  }); 
}

ABCPlayer.prototype.setCurrentSongFromUrlParam = function() {
  const urlParam = parseInt(this.urlParams["currentTuneIndex"]);
  if (isNumber(urlParam)) {
    this.currentTuneIndex = urlParam;
    const song =  this.songs.loadSong({songIndex: this.currentTuneIndex});
    if (song) {
      this.currentSong = song;
    }
    else {
      debugErr(`Could not get song from index ${this.currentTuneIndex}`);
    }
  }
}

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
      debug(`Set tempo to ${tempo}.`);
      if (isNumber(tempo) && tempo === this.currentSong?.original?.tempo) {
        delete this.onUnsetUrlParamTempo;
        this.domBinding.unsetUrlTempo.hide();
      }
      else if (!this.onUnsetUrlParamTempo && isNumber(from) && tempo !== from) {
        this.onUnsetUrlParamTempo = () => {
          this.setTempo(from);
        }
        this.domBinding.unsetUrlTempo.show();
      }
    },
    calledFrom: "tempo"
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
  return new Promise((resolve, reject) => {
    this.isSettingTune = true;
    if (!currentSong) {
      this.currentSong = this.songs.loadSong({songIndex: this.currentTuneIndex});
    }
    else {
      this.currentSong = currentSong;
    }
   
    if (!isSameSong) {
      this.noteScroller?.setScrollerXPos({xpos: 0});
      const { tempo, transposition, tuning, fgp, sgp } = this.currentSong;
      //the shouldSetTune flag ensures that it will not call setTune, were already here!
      if (isNumber(fgp) && !!fgp !== this.sackpipaOptions.isFirstGroupPlugged) {
        this.firstGroup();
      }
      if (isNumber(sgp) && !!sgp !== this.sackpipaOptions.isSecondGroupPlugged) {
        this.secondGroup();
      }
      if (tempo) {
        this.setTempo(tempo, {shouldSetTune: false});
      }
      //this will override URLPARAMS
      if (isNumber(transposition) //can contain zero
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
          debugErr(onSuccess);
          throw new Error("Has no member length");
        }
      }
      if (isNumber(tuning) && !this.onUnsetUrlParamChanter) {
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
          debugErr(onSuccess);
          throw new Error("Has no member length");
        }
      }
      _.set(this.domBinding, "currentSong.innerText", this.currentSong.name);
    }
    
    const { abc } = this.currentSong;
    
    var midi, midiButton;
    try {

      if (shouldReuseInstances(calledFrom) && this.audioParams.visualObj) { 
        debug(`reusing visual obj`);
      }
      else {
        const selector = this.playerOptions.showSheetMusic ? "paper" : "*";
        const rendered = this.abcjs.renderAbc(selector, abc, {
          ...this.abcOptions,
          ...abcOptions
        });
        this.audioParams.visualObj = rendered?.[0];
        debug(`recreating visual obj on selector ${selector}`, this.audioParams.visualObj, calledFrom);
      }
    } catch(err) {
      debugErr(err);
      this.isSettingTune = false;
      reject(err);
      return debug("Couldn't get midi file", {err});
    }
    this.updateControlStats();
    const tuneArgs = arguments[0];
    const _onSuccess = onSuccess;
    tuneArgs.onSuccess = (response) => {
      this.setNoteScroller({calledFrom}).then((noteScrollerInit) => {
        this.updateControlStats();
        debug("Audio successfully loaded.", this.synthControl);
        callEvery(_onSuccess);
      });
    }
    //only reuse if the chanter chnaged
    if (shouldReuseInstances(calledFrom) && this.midiBuffer) { 
      debug(`resuing midiBuffer instance`);
      this._setTune({...tuneArgs, resolve, reject}); 
    } 
    else {
      this.createMidiBuffer().then((response) => {
        debug(`creating new midiBuffer instance`, this.midiBuffer);
        this._setTune({...tuneArgs, resolve, reject}); 
      }).catch(reject);
    }
  });
}

ABCPlayer.prototype._setTune = function _setTune({calledFrom, userAction, onSuccess, onError, resolve, reject} = {}) {
  this.isSettingTune = true;
  this.synthControl?.setTune?.(this.audioParams.visualObj, userAction, this.audioParams.options).then((response) => {
    debug("setTune 1:", response);
    //if its called by anything other than  tempo
    this.setCurrentSongNoteSequence({visualObj: this.audioParams.visualObj, onFinish: (result) => {
      debug(`Set current note sequence ${result}`);
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
      debug("setTune 2:", this.currentSong);
      onSuccess && onSuccess({response});
      resolve?.(response);
      this.isSettingTune = false;
    }});
  })
  .catch((error) => {
    this.isSettingTune = false;
    reject(error);
    onError && onError(error); 
    console.warn("Audio problem:", error);
  });
}

ABCPlayer.prototype.setNoteScroller = function setNoteScoller({calledFrom}) {
  return new Promise((resolve, reject) => {
    if (!["tempo"].includes(calledFrom)) {
      //set the current scrolling chanter css and html element if eniteNoteSequence 
      if (_.get(this.domBinding, "scrollingNotesWrapper") && _.get(this.currentSong, "entireNoteSequence")) {
        const cK = this.sackpipa.getChanterKeyAbbr();
        updateClasses(this.domBinding, "scrollingNotesWrapper", [`scrolling_notes-playable_chanter-${cK}`]);
        this.noteScrollerClear({
          onFinish: () => {
            debug("clear onFinish");
            this.noteScrollerAddItems({
              onFinish: (noteScrollerInit) => {
                resolve(noteScrollerInit);
              }
            });
          }
        });
      }
      else {
        //either the scroller dom was missing or the entireNoteSequence is empty
        resolve();
      }
    }
    else {
      //its called from something we're not interested in.
      resolve();
    }
  });
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
  if (((pitchIndex < _.get(this.currentSong, "compatibility.pitchReached.min") && pitchIndex < this.sackpipa.getLowestPlayablePitch()) || 
  (pitchIndex > _.get(this.currentSong, "compatibility.pitchReached.max") && pitchIndex > this.sackpipa.getHighestPlayablePitch()))) {
    section.classList.add(`unplayable_note`);
    section.classList.add(`exceeds_pitch_range`);
    section.classList.add(`exceeded-pitch-${pitchIndex}`);
    section.innerHTML = `<h4>${noteName}</h4>`;
  }
  else if (_.get(this.currentSong, "compatibility.compatiblePitches.incompatible")?.includes?.(pitchIndex)) {
    section.classList.add(`unplayable_pitch-${pitchIndex}`);
    section.classList.add(`unplayable_note`);
    section.classList.add(`incompatible_pitch`);
    section.innerHTML = `<h4>${noteName}</h4>`;
  }
  else {
    section.classList.add(`playable_pitch-${pitchIndex}`);
    section.classList.add(`playable_duration-${dur}`);
    if (this.playerOptions.showPlayableNoteNamesInScroller) { 
      section.innerHTML = `<div></div><h4>${noteName}</h4>`;
    }
    else {
      section.innerHTML = `<div></div>`;
    }
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
  if (!e && isNumber(currentNoteIndex)) {
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
      debugErr(`Both noteTimingIndex and percentage required ${noteTimingIndex} ${percentage}`);
    }
  }
}

ABCPlayer.prototype.noteScrollerAddItems = function noteScrollerAddItems({onFinish} = {}) {
  this.noteScroller && this.noteScroller.addItems({
    firstEl: this.playerOptions.firstScrollingNoteSection,
    items: this.currentSong.entireNoteSequence, 
    itemIterator: scrollingNoteItemIterator.bind(this),
    onFinish: () => {
      const init = this.noteScroller?.init?.();
      onFinish?.(init);
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

function CursorControl({
  onBeatChange,
  playerInstance,
}) {
  var self = this;
  const shouldShowSheetMusic = playerInstance?.playerOptions?.showSheetMusic;
  if (shouldShowSheetMusic) {
    self.onStart = onStart;
    self.onFinished = onFinished;
  }
  self.beatSubdivisions = 2;
  self.onBeat = function(beatNumber = 0, totalBeats = 0, totalTime = 0) {
    if (onBeatChange) onBeatChange({beatNumber, totalBeats, totalTime});
  };
  self.onEvent = function(ev) {
    if (ev.measureStart && ev.left === null)
      return; // abcPlayer was the second part of a tie across a measure line. Just ignore it.
    if(ev.midiPitches && ev.midiPitches.length && ev.midiPitches[0].cmd == "note") {
      playerInstance?.onNoteChange({event: ev, midiPitch: ev.midiPitches[0]});
    }
    
    if (!shouldShowSheetMusic) return; 

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
  function onStart() {
    var svg = document.querySelector("#paper svg");
    if (!svg) return;
    var cursor = document.createElementNS("https://www.w3.org/2000/svg", "line");
    cursor.setAttribute("class", "abcjs-cursor");
    cursor.setAttributeNS(null, 'x1', 0);
    cursor.setAttributeNS(null, 'y1', 0);
    cursor.setAttributeNS(null, 'x2', 0);
    cursor.setAttributeNS(null, 'y2', 0);
    svg.appendChild(cursor);
  }
  function onFinished() {
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
