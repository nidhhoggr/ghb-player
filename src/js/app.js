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
import tippy from 'tippy.js';
import "tippy.js/dist/tippy.css";
const abcPlayer = new ABCPlayer({abcjs, songs, ABCSong, Sackpipa, HPS, utils, options: {
  currentInstrumentIndex: 109
}});
tippy('[data-tooltip]', {
  onShow(instance) {
    const tooltip = _.get(instance, "reference.dataset.tooltip");
    console.log(instance);
    tooltip && instance.setContent(tooltip);
    return !!tooltip;
  }
});
abcPlayer.load();
