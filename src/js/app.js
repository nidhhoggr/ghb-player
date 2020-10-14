import "../scss/app.scss";
import abcjs from "./abcjs";
import "abcjs/abcjs-audio.css";
import "../scss/audio.css";
import ABCSong from "./song";
import songs from "./songs";
import ABCPlayer from "./player";
import Sackpipa from "./sackpipa";
import HPS from "./hps";
import utils from "./utils";
const noteScroller = new HPS('.scrollingNotesWrapper', {
  ease: 0.08,
  sectionWidth: 100
});

const abcPlayer = new ABCPlayer({abcjs, songs, ABCSong, Sackpipa, utils, noteScroller});
abcPlayer.load();
