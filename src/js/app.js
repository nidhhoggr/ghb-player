import _ from 'lodash';
import "../scss/app.scss";
import abcjs from "./abcjs";
import "./abcjs/abcjs-audio.css";
import "../scss/audio.css";
import "../scss/vanilla-js-dropdown.css";
import ABCSongs from "./songs";
import ABCPlayer from "./player";
import Sackpipa from "./sackpipa";
import config from "config";
import HPS from "./hps";
import StateManagement from "./state";
import tippy from 'tippy.js';
import "tippy.js/dist/tippy.css";
import CustomSelect from "./vanilla-js-dropdown";
const stateMgr = new StateManagement({options: config});
const songs = new ABCSongs();
const abcPlayer = new ABCPlayer({
  abcjs, 
  songs,
  ioc: {//classes that need instantation (inversion of control)
    Sackpipa, 
    HPS, 
    CustomSelect,
  },
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
