export default HPS;

function HPS(wrapperName, options) {

  var self = Object.create(HPS.prototype);

  self.animReq = null;

  var deviceWidth,
        deviceHeight,
        originStyles = [],
        controlsNode;


  // Default Settings
  self.options = {
    sectionClass: 'hps-section',
    scrollCallback: false,
    touchMult: -2,
    firefoxMult: 15,
    mouseMult: 1,
    ease: 0.1,
    sectionWidth: 0,
    sectionOffset: 0,
    controls: {
      append: false,
      elementClass: 'hps-controls',
      prevButtonClass: 'hps-control-prev',
      nextButtonClass: 'hps-control-next'
    }
  };

  // User defined options (might have more in the future)
  if (options){
    Object.keys(options).forEach(function(key){
      self.options[key] = options[key];
    });
  }

  self.wrapperName = wrapperName;
  // By default, hps-wrapper class
  if (!self.wrapperName) {
    self.wrapperName = '.hps-wrapper';
  }
  else if (typeof wrapperName === 'string') {
    var wrapper = document.querySelector(self.wrapperName);
  }
  else {
    var wrapper = self.wrapperName[0] || self.wrapperName;
  }

  // Now query selector
  if (wrapper && typeof wrapper === 'object') {
    self.wrapper = wrapper;
    if (wrapper.children.length > 0) {
      self.sections = wrapper.children;
    }
    else {
      // There is no children elements to swipe!
      throw new Error("Selected wrapper does not contain any child object.")
    }
  }
  // The wrapper don't exist
  else {
    throw new Error("The wrapper you're trying to select don't exist.");
  }

  // Let's kick this script off

  // Set styles that are CRUCIAL for the script to work
  self.setupStyles = function setupStyles() {
    originStyles = [];

    deviceWidth = window.innerWidth;
    deviceHeight = window.innerHeight;
    applyStyle(document.querySelector('body'), {
      overflow: 'hidden',
    });
    applyStyle(document.querySelector('html'), {
      overflow: 'hidden',
    });
    applyStyle(self.wrapper, {
      width: (self.options.sectionWidth || deviceWidth) * self.sections.length + self.options.sectionOffset
    });
    for (var elem of self.sections){
      applyStyle(elem, {
        float: 'left'
      });
      elem.classList.add(self.options.sectionClass);
    };
  }

  self.setupControls = function setupControls() {
    controlsNode = document.createElement('div');
    controlsNode.classList.add(self.options.controls.elementClass);
    //temp
    controlsNode.style.cssText = 'position:fixed;top:0;left:0;z-index:999;';
    var arrowLeft = document.createElement('button');
    arrowLeft.classList.add(self.options.controls.prevButtonClass);
    //temp
    arrowLeft.style.cssText = 'font-size: 21px';
    arrowLeft.innerText = 'Previous';
    var arrowRight = document.createElement('button');
    arrowRight.classList.add(self.options.controls.nextButtonClass);
    //temp
    arrowRight.style.cssText = 'font-size: 21px';
    arrowRight.innerText = 'Next';
    controlsNode.appendChild(arrowLeft);
    controlsNode.appendChild(arrowRight);
    document.querySelector('body').appendChild(controlsNode);
  }

  // Let me make your website as it was before kicking this script off
  var destroyStyles = function() {
    if (originStyles.length > 0) {
      for (var key in originStyles) {
        applyStyle(originStyles[key].elem, originStyles[key].styles, false);
      }
    }
    for (var elem of self.sections){
      elem.classList.remove(self.options.sectionClass);
    };

    originStyles = [];
  }

  // Helper function, so the styling looks clean and lets us track changes
  var applyStyle = function(elem, css, saveOrigin = true) {
    if (saveOrigin) {
      var currentElem = {};
      currentElem.elem = elem;
      currentElem.styles = {
        transform: "",
        webkitTransform: "",
        mozTransform: "",
        msTransform: ""
      };
    }

    for (var property in css) {

      if (typeof css[property] === 'number') {
        css[property] += 'px';
      }

      saveOrigin ?  currentElem.styles[property] = elem.style[property] : false;
      elem.style[property] = css[property];
    }

    saveOrigin ? originStyles.push(currentElem) : false;
  }

  /****** SCROLL SETUP *****/
  var numListeners,
         listeners = [],
         touchStartX,
         touchStartY,
         bodyTouchAction,
         currentSection = 0;

  self.currentX = 0;
  self.targetX = 0;

  var hasWheelEvent = 'onwheel' in document;
  var hasMouseWheelEvent = 'onmousewheel' in document;
  var hasTouch = 'ontouchstart' in document;
  var hasTouchWin = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
  var hasPointer = !!window.navigator.msPointerEnabled;
  var hasKeyDown = 'onkeydown' in document;

  var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

  self.mouseEvent = {
    y: 0,
    x: 0,
    deltaX: 0,
    deltaY: 0,
    originalEvent: null
  };

  var notify = function(e) {
    self.mouseEvent.x += self.mouseEvent.deltaX;
    self.mouseEvent.y += self.mouseEvent.deltaY;
    self.mouseEvent.originalEvent = e;

    if (!self.options.scrollCallback) {
      if (e.type == 'click') {
        self.targetX = -self.mouseEvent.deltaX || self.mouseEvent.deltaY
      }
      else {
        self.targetX += -self.mouseEvent.deltaX || self.mouseEvent.deltaY;
        self.targetX = Math.max( ((deviceWidth * self.sections.length) - deviceWidth) * -1, self.targetX);
        self.targetX = Math.min(0, self.targetX);
      }
    }

    self.animate(e);
  }

  var onWheel = function(e) {
    // In Chrome and in Firefox (at least the new one)
    self.mouseEvent.deltaX = e.wheelDeltaX || e.deltaX * -1;
    self.mouseEvent.deltaY = e.wheelDeltaY || e.deltaY * -1;

    // for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad
    // real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
    if(isFirefox && e.deltaMode == 1) {
      self.mouseEvent.deltaX *= self.options.firefoxMult;
      self.mouseEvent.deltaY *= self.options.firefoxMult;
    }

    self.mouseEvent.deltaX *= self.options.mouseMult;
    self.mouseEvent.deltaY *= self.options.mouseMult;

    notify(e);
  }

  var onMouseWheel = function(e) {
    // In Safari, IE and in Chrome if 'wheel' isn't defined
    self.mouseEvent.deltaX = (e.wheelDeltaX) ? e.wheelDeltaX : 0;
    self.mouseEvent.deltaY = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;

    notify(e);
  }

  var onTouchStart = function(e) {
    var t = (e.targetTouches) ? e.targetTouches[0] : e;
    touchStartX = t.pageX;
    touchStartY = t.pageY;
  }

  var onTouchMove = function(e) {
    // e.prself.mouseEventDefault(); // < This needs to be managed externally
    var t = (e.targetTouches) ? e.targetTouches[0] : e;

    self.mouseEvent.deltaX = (t.pageX - touchStartX) * self.options.touchMult;
    self.mouseEvent.deltaY = (t.pageY - touchStartY) * self.options.touchMult;

    touchStartX = t.pageX;
    touchStartY = t.pageY;

    notify(e);
  }

  var onControlsClick = function(e) {
    document.querySelector('.'+self.options.controls.nextButtonClass).removeAttribute('disabled');
    document.querySelector('.'+self.options.controls.prevButtonClass).removeAttribute('disabled');

    currentSection = Math.abs(Math.round(self.currentX / deviceWidth));

    if (e.target.className.indexOf(self.options.controls.nextButtonClass) > -1) {
      currentSection < self.sections.length - 1 ? currentSection++ : false;
      currentSection == self.sections.length - 1 ? e.target.setAttribute('disabled', 'true') : false;
    }
    else {
      currentSection > 0 ? currentSection-- : false;
      currentSection == 0 ? e.target.setAttribute('disabled', 'true') : false;
    }

    self.mouseEvent.deltaX = self.sections[currentSection].offsetLeft;
    self.mouseEvent.deltaY = -self.sections[currentSection].offsetLeft;

    notify(e);
  }

  // Just listen...
  self.setupListeners = function setupListeners() {
    if(hasWheelEvent) document.addEventListener("wheel", onWheel);
    if(hasMouseWheelEvent) document.addEventListener("mousewheel", onMouseWheel);

    if(hasTouch) {
      document.addEventListener("touchstart", onTouchStart);
      document.addEventListener("touchmove", onTouchMove);
    }

    if(hasPointer && hasTouchWin) {
      bodyTouchAction = document.body.style.msTouchAction;
      document.body.style.msTouchAction = "none";
      document.addEventListener("MSPointerDown", onTouchStart, true);
      document.addEventListener("MSPointerMove", onTouchMove, true);
    }

    if (self.options.controls.append) {
      controlsNode.addEventListener("click", onControlsClick);
    }
  }

    // Stop listening!
  var destroyListeners = function() {
    if(hasWheelEvent) document.removeEventListener("wheel", onWheel);
    if(hasMouseWheelEvent) document.removeEventListener("mousewheel", onMouseWheel);

    if(hasTouch) {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    }

    if(hasPointer && hasTouchWin) {
      document.body.style.msTouchAction = bodyTouchAction;
      document.removeEventListener("MSPointerDown", onTouchStart, true);
      document.removeEventListener("MSPointerMove", onTouchMove, true);
    }

    if (self.options.controls.append) {
      controlsNode.removeEventListener("click", onControlsClick);
    }
  }

  // Or fire up user's callback
  self.destroy = function() {
    destroyListeners();
    destroyStyles();
    controlsNode.remove();
  };

  return self;
};

HPS.prototype.addItems = function addItems({items, itemIterator, onFinish, firstEl}) {
  const self = this;
  if (firstEl && typeof firstEl === "string") {
    self.wrapper.innerHTML = firstEl;
  }
  items.map((item, i) => {
    const itemSection = document.createElement('section');
    itemIterator && itemIterator({section: itemSection, item});
    self.wrapper.appendChild(itemSection);
    //last iteration;
    if (i == (items.length - 1)) {
      console.log("Finished", i, items.length);
      onFinish({
        el: self.wrapper
      });
    }
  });
}

HPS.prototype.animate = function animate(e) {

  const self = this;

  console.log(self.currentX);

  if (self.options.scrollCallback) {
    self.options.scrollCallback({event: self.mouseEvent, hps: self, originEvent: e});
  }
  else if (self.isHoveringWithinWrapper(e)) {
    self.currentX += (self.targetX - self.currentX) * self.options.ease;
    isNaN(self.currentX) || self.currentX > -self.options.ease ? self.currentX = 0 : false;
    self.setScrollerXPos({xpos: self.currentX});
  }
}

HPS.prototype.setScrollerXPos = function setScrollerXPos({xpos}) {
  const self = this;
  var t = 'translateX(' + xpos + 'px) translateZ(0)';
  var s = self.wrapper.style;
  s["transform"] = t;
  s["webkitTransform"] = t;
  s["mozTransform"] = t;
  s["msTransform"] = t;
}


HPS.prototype.init = function() {
  const self = this;
  self.setupStyles();

  if (self.options.controls.append) {
    self.setupControls();
  }

  self.setupListeners();

  self.animate();
};

HPS.prototype.isHoveringWithinWrapper = function(e) {
  if (!e) return false; 
  const self = this;
  let i, p, found = false;
  for (i in e.path) {
    p = e.path[i];
    if (p && p.className && p.className.toString().includes(self.wrapperName.replace('.',''))) {
      found = true;
      break;
    }
    else if (i > 3) {
      break;
    } 
  }

  return found;
}
