export const _base = {
  soundFontDir: "midi-js-soundfonts/FluidR3_GM/",
  errorReloadLimit: 5,
  errorReloadResetDuration: 20000,//in milliseconds
  shouldDebug: true,
  debugDisabledModules: [],//"state"],//disable debugging in these modules,
  mobileMaxWidth: 555//width exceeding beyond are not considered mobile
}

export const player = {
  currentInstrumentIndex: 109,
  refreshWhenPossible: false,
  getSoundFontUrl: (config) =>  window.location.hostname.includes(config.prodDomain) ? `https://${config.prodDomain}/${config.soundFontDir}` : `http://localhost:3000/${config.soundFontDir}`,
  keyCodes: {
    prev: 118,
    next: 120,
    play: 119,
    esc: 27,
    refresh: 116,
  },
  showPlayableNoteNamesInScroller: true,
  showSheetMusic: true,
  showNoteDiagram: true,
  stateAssessmentLoopInterval: 5000,//how often to check the state
};

export const sackpipa = {
  chanterKey: "E/A",
  dronesEnabled: ["E4","A3"],
  isFirstGroupPlugged: true,//on all chnaters the high d note on the E/A chanter
  isSecondGroupPlugged: false,//only on D/G and C/F chanters
  dronesSynth: null,//should be an instance of the sackpipaDroneSynth above,
  playableExtraNotes: {
    0: {//for the E/A chanter
      "Db": [63, 75],
      "F": 65,
      "Bb": [70]
    },
  }
}

export const hps = {
  ease: 0.025,
  sectionWidth: 58,
  sectionOffset: 420,
  wrapperName: ".scrollingNotesWrapper"
}
