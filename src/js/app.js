import _ from 'lodash';
import "../scss/app.scss";
import abcjs from "./abcjs";
import "./abcjs/abcjs-audio.css";
import "../scss/audio.css";
import ABCSong from "./song";
import songs from "./songs";
import ABCPlayer from "./player";
import Sackpipa from "./sackpipa";
import utils from "./utils";
import config from "./config";
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
  utils,
  options: config.player
});
tippy('[data-tooltip]', {
  onShow(instance) {
    const tooltip = _.get(instance, "reference.dataset.tooltip");
    console.log(instance);
    tooltip && instance.setContent(tooltip);
    return !!tooltip;
  }
});
abcPlayer.load();
