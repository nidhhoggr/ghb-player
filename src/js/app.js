import _ from 'lodash';
import "../scss/app.scss";
import abcjs from "./abcjs";
import "./abcjs/abcjs-audio.css";
import "../scss/audio.css";
import ABCSong from "./song";
import songs from "./songs";
import ABCPlayer from "./player";
import Sackpipa from "./sackpipa";
import config from "config";
import HPS from "./hps";
import StateManagement from "./state";
import tippy from 'tippy.js';
import "tippy.js/dist/tippy.css";
const stateMgr = new StateManagement({options: config});
const abcPlayer = new ABCPlayer({
  abcjs, 
  songs, 
  ABCSong, 
  Sackpipa, 
  HPS, 
  stateMgr, 
  options: config
});
abcPlayer.load().then(({player}) => {
  if (!player.options.isMobileBuild) tippy('[data-tooltip]', {
    onShow(instance) {
      const tooltip = _.get(instance, "reference.dataset.tooltip");
      tooltip && instance.setContent(tooltip);
      return !!tooltip;
    }
  });
});
