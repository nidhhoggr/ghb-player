import { player, sackpipa, hps } from './base';

const config = {
  prodDomain: "www.folktabs.com",
  soundFontDir: "midi-js-soundfonts/FluidR3_GM/",
  errorReloadLimit: 5,
  errorReloadResetDuration: 20000,//in milliseconds
  shouldDebug: true,
  debugDisabledModules: ["state"],//disable debugging in these modules,
  isMobileBuild: false,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
