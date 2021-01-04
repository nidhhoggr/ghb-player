import _ from "lodash";
import config from "./config";
const { shouldDebug, debugDisabledModules } = config;

export default function({from} = {}) {
  return {
    isNumber: (number) => (_.isNumber(number) && !_.isNaN(number)),
    isPositiveNumber: (number) => (_.isNumber(number) && !_.isNaN(number) && number > 0),
    domAddClass: function({el, className}) {
      return el.classList.add(className);
    },
    location_getParameterByName: function location_getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    simulateClick: function simulateClick(elem) {
      // Create our event (with options)
      const evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      // If cancelled, don't dispatch our event
      const cancelled = !elem.dispatchEvent(evt);
      return { cancelled, evt };
    },
    debug: function() {
      (shouldDebug && !debugDisabledModules.includes(from)) && console.log.apply(undefined, arguments);
    },
    debugErr: function() {
      (shouldDebug) && console.error.apply(undefined, arguments);
    }
  }
}
