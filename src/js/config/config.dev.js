import { player, sackpipa, hps, _base} from './base';

const config = {
  ..._base,
  shouldDebug: true,
  debugDisabledModules: [],
  prodDomain: "www.folktabs.com",
  isMobileBuild: false,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
