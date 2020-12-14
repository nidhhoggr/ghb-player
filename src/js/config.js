const config = {
  prodDomain: "folktabs.com",
  soundFontDir: "midi-js-soundfonts/FluidR3_GM/",
}

const player = {
  currentInstrumentIndex: 109,
  refreshWhenPossible: true,
  soundFontDir: "midi-js-soundfonts/FluidR3_GM/",
  soundFontUrl: window.location.hostname.includes(config.prodDomain) ? `https://${config.prodDomain}/${config.soundFontDir}` : `http://localhost:3000/${config.soundFontDir}`
};

export default {
  ...config,
  player
};
