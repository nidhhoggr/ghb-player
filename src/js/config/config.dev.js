import { player, sackpipa, hps, _base} from './base';

const config = {
  ..._base,
  shouldDebug: true,
  debugDisabledModules: ["state"],
  prodDomain: "www.folktabs.com",
  isMobileBuild: false,
  errorReloadDisabled: false,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
