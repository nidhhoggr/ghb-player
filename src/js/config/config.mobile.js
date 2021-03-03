import { player as _player, sackpipa, hps, _base } from './base';

const config = {
  ..._base,
  shouldDebug: false,
  debugDisabledModules: ["state"],//disable debugging in these modules
  prodDomain: "mobile.folktabs.com",
  isMobileBuild: true,
}

const player = {
  ..._player,
  firstScrollingNoteSection: `<section class="firstScrollingNote" style="width: 100px"></section>`,
}

export default {
  ...config,
  player,
  sackpipa,
  hps,
};
