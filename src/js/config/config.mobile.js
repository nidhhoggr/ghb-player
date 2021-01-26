import { player, sackpipa, hps, _base } from './base';

const config = {
  ..._base,
  prodDomain: "mobile.folktabs.com",
  isMobileBuild: true,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
