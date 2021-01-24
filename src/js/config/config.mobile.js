import { player, sackpipa, hps } from './base';

const config = {
  prodDomain: "mobile.folktabs.com",
  soundFontDir: "midi-js-soundfonts/FluidR3_GM/",
  errorReloadLimit: 5,
  errorReloadResetDuration: 20000,//in milliseconds
  shouldDebug: true,
  debugDisabledModules: ["state"],//disable debugging in these modules,
  isMobileBuild: true,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
