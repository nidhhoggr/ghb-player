import "../scss/app.scss";
import abcjs from "./abcjs";
import "abcjs/abcjs-audio.css";
import "../scss/audio.css";
import ABCSong from "./song";
import songs from "./songs";
import ABCPlayer from "./player";

const abcPlayer = new ABCPlayer({abcjs, songs, ABCSong});
abcPlayer.load();
