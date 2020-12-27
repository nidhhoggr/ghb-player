const config = {
  prodDomain: "folktabs.com",
  soundFontDir: "midi-js-soundfonts/FluidR3_GM/",
}

const player = {
  currentInstrumentIndex: 109,
  refreshWhenPossible: false,
  soundFontDir: "midi-js-soundfonts/FluidR3_GM/",
  soundFontUrl: window.location.hostname.includes(config.prodDomain) ? `https://${config.prodDomain}/${config.soundFontDir}` : `http://localhost:3000/${config.soundFontDir}`,
  keyCodes: {
    prev: 118,
    next: 120,
    play: 119,
    esc: 27
  },
  showPlayableNoteNamesInScroller: true
};

const sackpipa = {
  chanterKey: "E/A",
  dronesEnabled: ["E4","A3"],
  isFirstGroupPlugged: true,//on all chnaters the high d note on the E/A chanter
  isSecondGroupPlugged: true,//only on D/G and C/F chanters
  dronesSynth: null,//should be an instance of the sackpipaDroneSynth above,
  playableExtraNotes: {
    "Db": [63, 75],
    "F": 65,
    "Bb": [70]
  }
}

export default {
  ...config,
  player,
  sackpipa
};
