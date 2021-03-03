import { player, sackpipa, hps, _base} from './base';

const config = {
  ..._base,
  shouldDebug: false,
  debugDisabledModules: ["state"],//disable debugging in these modules
  prodDomain: "www.folktabs.com",
  isMobileBuild: false,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
