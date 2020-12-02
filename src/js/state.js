import _ from 'lodash';

var idleInterval;
const debug = false;
const debugLog = function() {
  (debug) && console.log.apply(undefined, arguments);
}
var state = {
  isActive: true,
  onReactivate: null,
};

const StateManagement = {
  onAssessState: function({playerInstance, onFinish, overideFalsy}) {
    if (!state.isActive) {
      debugLog("State isActive return early")
      return;
    }
    const stateArray = [];
    const { 
      tempo, 
      transposition, 
      currentTune, 
      currentNoteIndex,
      getCurrentChanterIndex 
    } = playerInstance;
    getCurrentChanterIndex
    const currentChanterIndex = getCurrentChanterIndex?.call(playerInstance, undefined);
    tempo && stateArray.push(["currentTempo", tempo]);
    (transposition || overideFalsy) && stateArray.push(["currentTransposition", transposition]);//contains zero
    stateArray.push(["currentTuneIndex", currentTune]);//contain zero
    _.isNumber(currentNoteIndex) && stateArray.push(["currentNoteIndex", currentNoteIndex]);
    stateArray.push(["currentChanterIndex", currentChanterIndex]);//contains zero
    const queryParams = new URLSearchParams(window.location.search);
    const qpOld = queryParams.toString();
    stateArray.forEach((sa, i) => {
      queryParams.set(sa[0], sa[1]);
      if (i == (stateArray.length - 1)) {
        const qpNew = queryParams.toString();
        if (qpNew !== qpOld) {
          debugLog("Updating state and url",{qpOld, qpNew, stateArray});
          history.replaceState(null, null, "?" + queryParams.toString());
          onFinish && onFinish();
        }
        else if(qpNew == qpOld) {
          debugLog("State unchanged, nothing to do", onFinish);
          onFinish && onFinish();
        }
      }
    });
  },
  idleWatcher: function({onInaction, inactiveTimeout = 20000, onReactivate}) {
    const self = this;
    function resetTimer () {
      state.isActive = true;
      debugLog("activity detected", {onInaction, inactiveTimeout});
      clearTimeout(idleInterval);
      if (onReactivate && state.wasInactive) {
        onReactivate();
      }
      else {
        debugLog("reactivate was null");
      }
      idleInterval = setTimeout(() => {
        state.isActive = false;
        state.wasInactive = true;
        debugLog("inactivity detected");
        onInaction && onInaction();
      }, inactiveTimeout);  // time is in milliseconds
    }
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;  // catches touchscreen presses as well      
    window.ontouchstart = resetTimer; // catches touchscreen swipes as well 
    window.onclick = resetTimer;      // catches touchpad clicks as well
    window.onkeydown = resetTimer;   
    window.addEventListener('scroll', resetTimer, true); // improved; see comments
  },
  getState: () => (state)
}

export default StateManagement;
