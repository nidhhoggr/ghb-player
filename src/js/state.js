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

function StateManagement({options} = {}) {
  this.options = options;
}

StateManagement.prototype.getState = () => (state);

StateManagement.prototype.onAssessState = function onAssessState({playerInstance, onFinish, changeSong}) {
   const { 
    tempo, 
    transposition, 
    currentTuneIndex, 
    currentNoteIndex,
    getCurrentChanterIndex,
    sackpipaOptions,
  } = playerInstance;

  if (changeSong && !_.isNaN(currentTuneIndex)) {
    if (this.options?.player?.refreshWhenPossible) {
      window.location.href = window.location.origin + window.location.pathname + `?currentTuneIndex=${currentTuneIndex}`
    }
    else {
      history.replaceState({}, null, `?currentTuneIndex=${currentTuneIndex}`);
      setTimeout(() => {
        onFinish && onFinish();
      }, 100);
    }
  }
  else if (!state.isActive) {
    debugLog("State isActive return early")
    return;
  }
  else {
    const stateArray = [];
    const currentChanterIndex = getCurrentChanterIndex?.call(playerInstance, undefined);
    _.isNumber(tempo) && stateArray.push(["currentTempo", tempo]);//contains zero to reset for next initialization
    _.isNumber(transposition) && stateArray.push(["currentTransposition", transposition]);//contains zero
    _.isNumber(currentTuneIndex) && stateArray.push(["currentTuneIndex", currentTuneIndex]);//contain zero
    _.isNumber(currentNoteIndex) && stateArray.push(["currentNoteIndex", currentNoteIndex]);
    _.isNumber(currentChanterIndex) && stateArray.push(["currentChanterIndex", currentChanterIndex]);//contains zero
    stateArray.push(["fgp",sackpipaOptions?.isFirstGroupPlugged ? 1 : 0]);
    stateArray.push(["sgp",sackpipaOptions?.isSecondGroupPlugged ? 1 : 0]);
    const queryParams = new URLSearchParams(window.location.search);
    const qpOld = queryParams.toString();
    stateArray.forEach((sa, i) => {
      queryParams.set(sa[0], sa[1]);
      if (i == (stateArray.length - 1)) {
        const qpNew = queryParams.toString();
        if (qpNew !== qpOld) {
          console.log("Updating state and url",{qpOld, qpNew, stateArray});
          history.replaceState(null, null, "?" + queryParams.toString());
          onFinish && onFinish();
        }
        else if(qpNew == qpOld) {
          debugLog("State unchanged, nothing to do", onFinish);
          onFinish && onFinish();
        }
      }
    });
  }
}

StateManagement.prototype.idleWatcher = function idleWatcher({onInaction, inactiveTimeout = 20000, onReactivate}) {
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
}

export default StateManagement;
