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
import HPS from "./hps";
import StateManagement from "./state";
import tippy from 'tippy.js';
import "tippy.js/dist/tippy.css";
const abcPlayer = new ABCPlayer({
  abcjs, 
  songs, 
  ABCSong, 
  Sackpipa, 
  HPS, 
  StateManagement, 
  utils,
  options: {
    currentInstrumentIndex: 109,
    refreshWhenPossible: true,
    soundFontUrl: (process.env.NODE_ENV ===  "production") ? "https://folktabs.com/midi-js-soundfonts/FluidR3_GM/" : "http://localhost:3000/midi-js-soundfonts/FluidR3_GM/",
  }
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
