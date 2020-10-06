function ABCPlayer({
  abcjs,
  songs,
  ABCSong
}) {

  this.abcjs = abcjs;

  this.songs = songs;

  this.ABCSong = ABCSong;

  this.currentTune = 0;

  /*
   * @TODO look into abctune.formatting.bagpipe
   */
  this.currentInstrumentIndex = 109; //bagpipe

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

      this.abcjs.synth.playEvent(lastClicked, abcElem.midiGraceNotePitches, this.synthControl.visualObj.millisecondsPerMeasure()).then(function (response) {
        console.log("note played");
      }).catch(function (error) {
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
}

export default ABCPlayer;

ABCPlayer.prototype.setBPM = function(bpm) {
  this.bpm = bpm;
  //difference between QPM and BPM?
  this.audioParams.options.qpm = bpm;
  this.audioParams.options.defaultQpm = bpm;
  this.currentSong.setTempo(bpm);
}

ABCPlayer.prototype.load = function() {
  document.querySelector(".next").addEventListener("click", this.next.bind(this));
  document.querySelector(".start").addEventListener("click", this.start.bind(this));

  if (this.abcjs.synth.supportsAudio()) {
    this.synthControl = new this.abcjs.synth.SynthController();
    const cursorControl = new CursorControl();
    this.synthControl.load("#audio", cursorControl, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});
  } else {
    document.querySelector("#audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";
  }
  this.setTune(false);
}

ABCPlayer.prototype.start = function() {
  if (this.synthControl) {
    console.log(this.synthControl);
    this.synthControl.play();
  }
}

ABCPlayer.prototype.setTune = function(userAction) {
  const currentTune = this.songs[this.currentTune];
  if (!currentTune) return;
  this.currentSong = new this.ABCSong(currentTune);
  console.log(this.currentSong);
  const qpm = currentTune.tempo;
  this.setBPM(qpm);
  var midi, midiButton;
  console.log(this.currentSong.abc, this.currentSong.getInformationByFieldName("tempo"));
  try {
    this.audioParams.visualObj = this.abcjs.renderAbc("paper", this.currentSong.abc, this.abcOptions)[0];
    midi = this.abcjs.synth.getMidiFile(this.currentSong.abc);
    midiButton = document.querySelector(".midi");
    midiButton.innerHTML = midi;
  } catch(err) {
    console.error(err);
    console.log("Couldn't get midi file", {err});
  }
  console.log(this.audioParams.visualObj);
  //set it to bagpipes
  this.audioParams.visualObj.formatting.bagpipes = true;
  // TODO-PER: This will allow the callback function to have access to timing info - this should be incorporated into the render at some point.
  var midiBuffer = new this.abcjs.synth.CreateSynth();
  midiBuffer.init(this.audioParams).then((response) => {
    console.log(response);
    if (this.synthControl) {
      this.synthControl.setTune(this.audioParams.visualObj, userAction, this.audioParams.options)
        .then((response) => {
        console.log("Audio successfully loaded.", this.synthControl)
      }).catch(function (error) {
        console.warn("Audio problem:", error);
      });
    }
  }).catch(function (error) {
    console.warn("Audio problem:", error);
  });
}

ABCPlayer.prototype.next = function() {
  this.currentTune++;
  if (this.currentTune >= this.songs.length)
    this.currentTune = 0;
  this.setTune(true);
}

function CursorControl() {
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
    self.beatDiv.innerText = "Beat: " + beatNumber + " Total: " + totalBeats + " Total time: " + totalTime;
  };
  self.onEvent = function(ev) {
    if (ev.measureStart && ev.left === null)
      return; // abcPlayer was the second part of a tie across a measure line. Just ignore it.

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
