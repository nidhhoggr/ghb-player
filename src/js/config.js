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
  }
};

export default {
  ...config,
  player
};
