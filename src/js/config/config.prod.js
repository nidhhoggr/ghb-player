import { player, sackpipa, hps, _base} from './base';

const config = {
  ..._base,
  prodDomain: "www.folktabs.com",
  isMobileBuild: false,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
