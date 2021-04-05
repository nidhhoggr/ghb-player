import _ from 'lodash';
import "../scss/app.scss";
import abcjs from "./abcjs";
import "./abcjs/abcjs-audio.css";
import "../scss/audio.css";
import "../scss/vanilla-js-dropdown.css";
import ABCSongs from "./songs";
import ABCSong from "./song";
import ABCPlayer from "./player";
import Sackpipa from "./sackpipa";
import Storage from "./storage";
import config from "config";
import HPS from "./hps";
import StateManagement from "./state";
import tippy from 'tippy.js';
import "tippy.js/dist/tippy.css";
import CustomSelect from "./vanilla-js-dropdown";
import "ldCover/dist/ldcv.min.css";
import ldCover from "ldCover/dist/ldcv.min.js";
const stateMgr = new StateManagement({options: config});
const songs = new ABCSongs({
  ioc: {
    ABCSong,
    Storage,
  }
});
const abcPlayer = new ABCPlayer({
  abcjs, 
  songs,
  ioc: {//classes that need instantation (inversion of control)
    Sackpipa, 
    HPS, 
    CustomSelect,
    ldCover,
    Storage
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
