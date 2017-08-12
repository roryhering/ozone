(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

if (typeof Array.prototype.indexOf !== 'function') {
  Array.prototype.indexOf = function (item) {
    for (var i = 0; i < this.length; ++i) {
      if (this[i] === item) {
        return i;
      }
    }
    return -1;
  };
}

(function () {

  if (typeof window.CustomEvent === 'function') return false;

  function CustomEvent(event, params) {
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

window.o3 = function () {

  var VERSION = '0.0.1';

  var _settings = {
    showConsole: false,
    eventPrefix: 'o3',
    dataAttribute: 'layer',
    dataAttributeTabs: 'tabs'
  };

  var _system = {
    browser: {
      lang: navigator.language,
      os: navigator.platform,
      width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    },
    screen: {
      bit: screen.colorDepth,
      width: screen.width,
      height: screen.height
    }
  };

  var styles = {
    'start': 'background: blue; color: white; padding: 3px 10px; display: block;',
    'end': 'background: black; color: white; padding: 3px 10px; display: block;',
    'log': 'color: green; padding: 3px 10px; display: block;',
    'error': 'color: red; padding: 3px 10px; display: block;'

    // Internal debounce handler
  };var debounce = function debounce(func, wait, immediate) {
    var timeout = void 0;
    return function () {
      var context = this;
      var args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  // Window resize
  window.addEventListener('resize', debounce(function () {
    _system.browser.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth, _system.browser.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }, 250));

  var Ozone = function Ozone(els) {
    for (var i = 0; i < els.length; ++i) {
      this[i] = els[i];
    }
    this.length = els.length;
  };

  /* =====
   * UTILS
   * =====
   */

  Ozone.prototype.forEach = function (callback) {
    this.map(callback);
    return this;
  };

  Ozone.prototype.map = function (callback) {
    var results = [];
    for (var i = 0; i < this.length; ++i) {
      results.push(callback.call(this, this[i], i));
    }
    return results.length > 1 ? results : results[0];
    // return results
  };

  Ozone.prototype.mapOne = function (callback) {
    var m = this.map(callback);
    return m.length > 1 ? m : m[0];
  };

  /* ================
   * DOM MANIPULATION
   * ================
   */

  Ozone.prototype.text = function (text) {
    if (typeof text !== 'undefined') {
      return this.forEach(function (el) {
        el.innerText = text;
      });
    } else {
      return this.mapOne(function (el) {
        return el.innerText;
      });
    }
  };

  Ozone.prototype.html = function (html) {
    if (typeof html !== 'undefined') {
      return this.forEach(function (el) {
        el.innerHTML = html;
      });
    } else {
      return this.mapOne(function (el) {
        return el.innerHTML;
      });
    }
  };

  Ozone.prototype.addClass = function (classes) {
    var className = '';
    if (typeof classes !== 'string') {
      for (var i = 0; i < classes.length; ++i) {
        className += ' ' + classes[i];
      }
    } else {
      className = ' ' + classes;
    }
    return this.forEach(function (el) {
      el.className += className;
    });
  };

  Ozone.prototype.removeClass = function (cls) {
    return this.forEach(function (el) {
      var cs = el.className.split(/\s+/);
      var i = void 0;

      while ((i = cs.indexOf(cls)) > -1) {
        cs = cs.slice(0, i).concat(cs.slice(++i));
      }
      el.className = cs.join(' ');
    });
  };

  Ozone.prototype.attr = function (attr, val) {
    if ((typeof attr === 'undefined' ? 'undefined' : _typeof(attr)) === 'object') {
      // Object instead of string
      return this.forEach(function (el) {
        for (var key in attr) {
          if (attr.hasOwnProperty(key)) {
            el.setAttribute(key.toString(), attr[key].toString());
          }
        }
      });
    } else {
      // String instead of object
      if (typeof val !== 'undefined') {
        return this.forEach(function (el) {
          el.setAttribute(attr, val);
        });
      } else {
        return this.mapOne(function (el) {
          return el.getAttribute(attr);
        });
      }
    }
  };

  Ozone.prototype.append = function (els) {
    return this.forEach(function (parEl, i) {
      els.forEach(function (childEl) {
        parEl.appendChild(i > 0 ? childEl.cloneNode(true) : childEl);
      });
    });
  };

  Ozone.prototype.prepend = function (els) {
    return this.forEach(function (parEl, i) {
      for (var j = els.length - 1; j > -1; j--) {
        parEl.insertBefore(i > 0 ? els[j].cloneNode(true) : els[j], parEl.firstChild);
      }
    });
  };

  Ozone.prototype.remove = function () {
    return this.forEach(function (el) {
      return el.parentNode.removeChild(el);
    });
  };

  Ozone.prototype.on = function () {
    if (document.addEventListener) {
      return function (evt, fn) {
        return this.forEach(function (el) {
          el.addEventListener(evt, fn, false);
        });
      };
    } else if (document.attachEvent) {
      return function (evt, fn) {
        return this.forEach(function (el) {
          el.attachEvent('on' + evt, fn);
        });
      };
    } else {
      return function (evt, fn) {
        return this.forEach(function (el) {
          el['on' + evt] = fn;
        });
      };
    }
  }();

  Ozone.prototype.off = function () {
    if (document.removeEventListener) {
      return function (evt, fn) {
        return this.forEach(function (el) {
          el.removeEventListener(evt, fn, false);
        });
      };
    } else if (document.detachEvent) {
      return function (evt, fn) {
        return this.forEach(function (el) {
          el.detachEvent('on' + evt, fn);
        });
      };
    } else {
      /*eslint-disable no-unused-vars*/
      return function (evt, fn) {
        /*eslint-enable no-unused-vars*/
        return this.forEach(function (el) {
          el['on' + evt] = null;
        });
      };
    }
  }();

  var o3 = {
    find: function find(selector, context) {
      var els = void 0;
      if (typeof selector === 'string') {
        els = selector instanceof Node || selector instanceof Window ? [selector] : [].slice.call(typeof selector == 'string' ? (context || document).querySelectorAll(selector) : selector || []);
      } else if (selector.length) {
        els = selector;
      } else {
        els = [selector];
      }
      return new Ozone(els);
    },
    create: function create(tagName, attrs) {
      var el = new Ozone([document.createElement(tagName)]);
      if (attrs) {
        if (attrs.className) {
          el.addClass(attrs.className);
          delete attrs.className;
        }
        if (attrs.text) {
          el.text(attrs.text);
          delete attrs.text;
        }
        for (var key in attrs) {
          if (attrs.hasOwnProperty(key)) {
            el.attr(key, attrs[key]);
          }
        }
      }
      return el;
    },
    settings: function settings(opts) {
      if ((typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === 'object') {
        for (var i in _settings) {
          if (_settings[i] && opts[i]) {
            _settings[i] = opts[i];
          }
        }

        if (_settings.showConsole) {
          console.log('%cOZONE: New options', styles.log);
          console.log(_settings);
        }
      }
      return _settings;
    },
    ext: function ext(name, fn) {
      if (typeof Ozone.prototype[name] === 'undefined') {
        Ozone.prototype[name] = fn;
      }
    },
    trigger: function trigger(type, el, obj) {
      var evt = new CustomEvent(type, {
        detail: obj,
        bubbles: true,
        cancelable: false
      });
      el.dispatchEvent(evt);
    },
    ready: function ready(fn) {
      if (document.readyState !== 'loading') {
        fn();
      } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn);
      } else {
        document.attachEvent('onreadystatechange', function () {
          if (document.readyState != 'loading') fn();
        });
      }
    },
    system: _system,
    version: VERSION
  };

  return o3;
}();

},{}],2:[function(require,module,exports){
'use strict';

(function () {
  /**
   * TABS
   */

  // Keep it simple
  var o3 = window.o3;
  var settings = o3.settings();

  // Component events
  var EVENT = {
    STARTED: settings.eventPrefix + '.' + settings.dataAttributeTabs + '.started',
    COMPLETED: settings.eventPrefix + '.' + settings.dataAttributeTabs + '.completed',
    CREATED: settings.eventPrefix + '.' + settings.dataAttributeTabs + '.created',
    REMOVED: settings.eventPrefix + '.' + settings.dataAttributeTabs + '.removed',
    SHOW: settings.eventPrefix + '.' + settings.dataAttributeTabs + '.show',
    HIDE: settings.eventPrefix + '.' + settings.dataAttributeTabs + '.hide'

    // Add the tabs extension: 'this' is inherited from the Ozone prototype (not o3)
  };o3.ext('tabs', function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'create';

    var elms = this;
    for (var i = 0; i < elms.length; ++i) {
      var el = elms[i];

      if (typeof opts === 'string') {
        // Create or destroy
        switch (opts) {
          case 'create':
            create(el, opts);
            break;
          case 'destroy':
            destroy(el);
            break;
        }
      } else {
        // Create with/change options
        console.log('create with/change options', opts);

        /*
        {
          fit: false
        }
        */
      }
    }
  });

  // Create the component
  var create = function create(el, opts) {

    o3.trigger(EVENT.STARTED, el, {});
    console.log('tab', el, opts);

    if (settings.showConsole) {
      console.log('%cTabs created', settings.style.log);
    }

    o3.trigger(EVENT.COMPLETED, el, {});
  };

  // Remove the component
  var destroy = function destroy(el) {
    console.log('destroy', el);
  };

  // Prepare data selector
  var selector = '[data-' + settings.dataAttribute + '="' + settings.dataAttributeTabs + '"]';
  var elements = o3.find(selector);

  // Automatically setup any element matching the selector
  if (elements.length > 0) {
    o3.find(elements).tabs();
  }
})();

},{}]},{},[1,2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxtYWluLmpzIiwic3JjXFxqc1xccGx1Z2luc1xcdGFicy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxJQUFJLE9BQU8sTUFBTSxTQUFOLENBQWdCLE9BQXZCLEtBQW1DLFVBQXZDLEVBQW1EO0FBQ2pELFFBQU0sU0FBTixDQUFnQixPQUFoQixHQUEwQixVQUFVLElBQVYsRUFBZ0I7QUFDeEMsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssTUFBekIsRUFBaUMsRUFBRSxDQUFuQyxFQUFzQztBQUNwQyxVQUFJLEtBQUssQ0FBTCxNQUFZLElBQWhCLEVBQXNCO0FBQ3BCLGVBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxXQUFPLENBQUMsQ0FBUjtBQUNELEdBUEQ7QUFRRDs7QUFFRCxDQUFDLFlBQVk7O0FBRVgsTUFBSSxPQUFPLE9BQU8sV0FBZCxLQUE4QixVQUFsQyxFQUE4QyxPQUFPLEtBQVA7O0FBRTlDLFdBQVMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFvQztBQUNsQyxhQUFTLFVBQVU7QUFDakIsZUFBUyxLQURRO0FBRWpCLGtCQUFZLEtBRks7QUFHakIsY0FBUTtBQUhTLEtBQW5CO0FBS0EsUUFBSSxNQUFNLFNBQVMsV0FBVCxDQUFxQixhQUFyQixDQUFWO0FBQ0EsUUFBSSxlQUFKLENBQW9CLEtBQXBCLEVBQTJCLE9BQU8sT0FBbEMsRUFBMkMsT0FBTyxVQUFsRCxFQUE4RCxPQUFPLE1BQXJFO0FBQ0EsV0FBTyxHQUFQO0FBQ0Q7O0FBRUQsY0FBWSxTQUFaLEdBQXdCLE9BQU8sS0FBUCxDQUFhLFNBQXJDOztBQUVBLFNBQU8sV0FBUCxHQUFxQixXQUFyQjtBQUNELENBbEJEOztBQW9CQSxPQUFPLEVBQVAsR0FBYSxZQUFZOztBQUV2QixNQUFNLFVBQVUsT0FBaEI7O0FBRUEsTUFBSSxZQUFZO0FBQ2Qs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QVcsR0FBRyxJQUFILENBQVEsUUFBUixDQUFmOztBQUVBO0FBQ0EsTUFBSSxTQUFTLE1BQVQsR0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsT0FBRyxJQUFILENBQVEsUUFBUixFQUFrQixJQUFsQjtBQUNEO0FBRUYsQ0EzRUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICBpZiAodGhpc1tpXSA9PT0gaXRlbSkge1xyXG4gICAgICAgIHJldHVybiBpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMVxyXG4gIH1cclxufVxyXG5cclxuKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZVxyXG5cclxuICBmdW5jdGlvbiBDdXN0b21FdmVudChldmVudCwgcGFyYW1zKSB7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwgeyBcclxuICAgICAgYnViYmxlczogZmFsc2UsIFxyXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSwgXHJcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkIFxyXG4gICAgfVxyXG4gICAgbGV0IGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpXHJcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpXHJcbiAgICByZXR1cm4gZXZ0XHJcbiAgfVxyXG5cclxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW5kb3cuRXZlbnQucHJvdG90eXBlXHJcblxyXG4gIHdpbmRvdy5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50XHJcbn0pKClcclxuXHJcbndpbmRvdy5vMyA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gIGNvbnN0IFZFUlNJT04gPSAnMC4wLjEnXHJcblxyXG4gIGxldCBfc2V0dGluZ3MgPSB7XHJcbiAgICBzaG93Q29uc29sZTogZmFsc2UsXHJcbiAgICBldmVudFByZWZpeDogJ28zJyxcclxuICAgIGRhdGFBdHRyaWJ1dGU6ICdsYXllcicsXHJcbiAgICBkYXRhQXR0cmlidXRlVGFiczogJ3RhYnMnXHJcbiAgfVxyXG5cclxuICBsZXQgX3N5c3RlbSA9IHtcclxuICAgIGJyb3dzZXI6IHtcclxuICAgICAgbGFuZzogbmF2aWdhdG9yLmxhbmd1YWdlLFxyXG4gICAgICBvczogbmF2aWdhdG9yLnBsYXRmb3JtLFxyXG4gICAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgsXHJcbiAgICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHRcclxuICAgIH0sXHJcbiAgICBzY3JlZW46IHtcclxuICAgICAgYml0OiBzY3JlZW4uY29sb3JEZXB0aCxcclxuICAgICAgd2lkdGg6IHNjcmVlbi53aWR0aCxcclxuICAgICAgaGVpZ2h0OiBzY3JlZW4uaGVpZ2h0XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBsZXQgc3R5bGVzID0ge1xyXG4gICAgJ3N0YXJ0JzogJ2JhY2tncm91bmQ6IGJsdWU7IGNvbG9yOiB3aGl0ZTsgcGFkZGluZzogM3B4IDEwcHg7IGRpc3BsYXk6IGJsb2NrOycsXHJcbiAgICAnZW5kJzogJ2JhY2tncm91bmQ6IGJsYWNrOyBjb2xvcjogd2hpdGU7IHBhZGRpbmc6IDNweCAxMHB4OyBkaXNwbGF5OiBibG9jazsnLFxyXG4gICAgJ2xvZyc6ICdjb2xvcjogZ3JlZW47IHBhZGRpbmc6IDNweCAxMHB4OyBkaXNwbGF5OiBibG9jazsnLFxyXG4gICAgJ2Vycm9yJzogJ2NvbG9yOiByZWQ7IHBhZGRpbmc6IDNweCAxMHB4OyBkaXNwbGF5OiBibG9jazsnXHJcbiAgfVxyXG5cclxuICAvLyBJbnRlcm5hbCBkZWJvdW5jZSBoYW5kbGVyXHJcbiAgbGV0IGRlYm91bmNlID0gZnVuY3Rpb24gKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xyXG4gICAgbGV0IHRpbWVvdXRcclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGxldCBjb250ZXh0ID0gdGhpc1xyXG4gICAgICBsZXQgYXJncyA9IGFyZ3VtZW50c1xyXG4gICAgICBsZXQgbGF0ZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgdGltZW91dCA9IG51bGxcclxuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xyXG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBsZXQgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dFxyXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dClcclxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXHJcbiAgICAgIGlmIChjYWxsTm93KSB7XHJcbiAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBXaW5kb3cgcmVzaXplXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKCgpID0+IHtcclxuICAgIF9zeXN0ZW0uYnJvd3Nlci53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoLFxyXG4gICAgX3N5c3RlbS5icm93c2VyLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfSwgMjUwKSlcclxuXHJcbiAgbGV0IE96b25lID0gZnVuY3Rpb24gKGVscykge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdGhpc1tpXSA9IGVsc1tpXVxyXG4gICAgfVxyXG4gICAgdGhpcy5sZW5ndGggPSBlbHMubGVuZ3RoXHJcbiAgfVxyXG5cclxuICAvKiA9PT09PVxyXG4gICAqIFVUSUxTXHJcbiAgICogPT09PT1cclxuICAgKi9cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIHRoaXMubWFwKGNhbGxiYWNrKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIGxldCByZXN1bHRzID0gW11cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzW2ldLCBpKSlcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHRzLmxlbmd0aCA+IDEgPyByZXN1bHRzIDogcmVzdWx0c1swXVxyXG4gICAgLy8gcmV0dXJuIHJlc3VsdHNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5tYXBPbmUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIGxldCBtID0gdGhpcy5tYXAoY2FsbGJhY2spXHJcbiAgICByZXR1cm4gbS5sZW5ndGggPiAxID8gbSA6IG1bMF1cclxuICB9XHJcblxyXG4gIC8qID09PT09PT09PT09PT09PT1cclxuICAgKiBET00gTUFOSVBVTEFUSU9OXHJcbiAgICogPT09PT09PT09PT09PT09PVxyXG4gICAqL1xyXG5cclxuICBPem9uZS5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICBpZiAodHlwZW9mIHRleHQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZWwuaW5uZXJUZXh0ID0gdGV4dFxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBlbC5pbm5lclRleHRcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24gKGh0bWwpIHtcclxuICAgIGlmICh0eXBlb2YgaHRtbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBlbC5pbm5lckhUTUwgPSBodG1sXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsLmlubmVySFRNTFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmFkZENsYXNzID0gZnVuY3Rpb24gKGNsYXNzZXMpIHtcclxuICAgIGxldCBjbGFzc05hbWUgPSAnJ1xyXG4gICAgaWYgKHR5cGVvZiBjbGFzc2VzICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBjbGFzc05hbWUgKz0gJyAnICsgY2xhc3Nlc1tpXVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjbGFzc05hbWUgPSAnICcgKyBjbGFzc2VzXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBlbC5jbGFzc05hbWUgKz0gY2xhc3NOYW1lXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGNscykge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgbGV0IGNzID0gZWwuY2xhc3NOYW1lLnNwbGl0KC9cXHMrLylcclxuICAgICAgbGV0IGlcclxuXHJcbiAgICAgIHdoaWxlICgoaSA9IGNzLmluZGV4T2YoY2xzKSkgPiAtMSkge1xyXG4gICAgICAgIGNzID0gY3Muc2xpY2UoMCwgaSkuY29uY2F0KGNzLnNsaWNlKCsraSkpXHJcbiAgICAgIH1cclxuICAgICAgZWwuY2xhc3NOYW1lID0gY3Muam9pbignICcpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIGF0dHIgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIC8vIE9iamVjdCBpbnN0ZWFkIG9mIHN0cmluZ1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRyKSB7XHJcbiAgICAgICAgICBpZiAoYXR0ci5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXkudG9TdHJpbmcoKSwgYXR0cltrZXldLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gU3RyaW5nIGluc3RlYWQgb2Ygb2JqZWN0XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZShhdHRyKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbiAoZWxzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChwYXJFbCwgaSkgPT4ge1xyXG4gICAgICBlbHMuZm9yRWFjaCgoY2hpbGRFbCkgPT4ge1xyXG4gICAgICAgIHBhckVsLmFwcGVuZENoaWxkKChpID4gMCkgPyBjaGlsZEVsLmNsb25lTm9kZSh0cnVlKSA6IGNoaWxkRWwpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbiAoZWxzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChwYXJFbCwgaSkgPT4ge1xyXG4gICAgICBmb3IgKGxldCBqID0gZWxzLmxlbmd0aCAtIDE7IGogPiAtMTsgai0tKSB7XHJcbiAgICAgICAgcGFyRWwuaW5zZXJ0QmVmb3JlKChpID4gMCkgPyBlbHNbal0uY2xvbmVOb2RlKHRydWUpIDogZWxzW2pdLCBwYXJFbC5maXJzdENoaWxkKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIHJldHVybiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5vbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZuLCBmYWxzZSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmF0dGFjaEV2ZW50KSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgZXZ0LCBmbilcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWxbJ29uJyArIGV2dF0gPSBmblxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KCkpXHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5vZmYgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZ0LCBmbiwgZmFsc2UpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5kZXRhY2hFdmVudCkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuZGV0YWNoRXZlbnQoJ29uJyArIGV2dCwgZm4pXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLyplc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyovXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIC8qZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyovXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsWydvbicgKyBldnRdID0gbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KCkpXHJcblxyXG4gIGxldCBvMyA9IHtcclxuICAgIGZpbmQ6IChzZWxlY3RvciwgY29udGV4dCkgPT4ge1xyXG4gICAgICBsZXQgZWxzXHJcbiAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgZWxzID0gc2VsZWN0b3IgaW5zdGFuY2VvZiBOb2RlIHx8IHNlbGVjdG9yIGluc3RhbmNlb2YgV2luZG93ID8gW3NlbGVjdG9yXSA6IFtdLnNsaWNlLmNhbGwodHlwZW9mIHNlbGVjdG9yID09ICdzdHJpbmcnID8gKGNvbnRleHQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDogc2VsZWN0b3IgfHwgW10pXHJcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IubGVuZ3RoKSB7XHJcbiAgICAgICAgZWxzID0gc2VsZWN0b3JcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbHMgPSBbc2VsZWN0b3JdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ldyBPem9uZShlbHMpXHJcbiAgICB9LFxyXG4gICAgY3JlYXRlOiAodGFnTmFtZSwgYXR0cnMpID0+IHtcclxuICAgICAgbGV0IGVsID0gbmV3IE96b25lKFtkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpXSlcclxuICAgICAgaWYgKGF0dHJzKSB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgZWwuYWRkQ2xhc3MoYXR0cnMuY2xhc3NOYW1lKVxyXG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmNsYXNzTmFtZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXR0cnMudGV4dCkge1xyXG4gICAgICAgICAgZWwudGV4dChhdHRycy50ZXh0KVxyXG4gICAgICAgICAgZGVsZXRlIGF0dHJzLnRleHRcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGF0dHJzKSB7XHJcbiAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBlbC5hdHRyKGtleSwgYXR0cnNba2V5XSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGVsXHJcbiAgICB9LFxyXG4gICAgc2V0dGluZ3M6IChvcHRzKSA9PiB7XHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICBmb3IgKGxldCBpIGluIF9zZXR0aW5ncykge1xyXG4gICAgICAgICAgaWYgKF9zZXR0aW5nc1tpXSAmJiBvcHRzW2ldKSB7XHJcbiAgICAgICAgICAgIF9zZXR0aW5nc1tpXSA9IG9wdHNbaV1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfc2V0dGluZ3Muc2hvd0NvbnNvbGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCclY09aT05FOiBOZXcgb3B0aW9ucycsIHN0eWxlcy5sb2cpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhfc2V0dGluZ3MpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBfc2V0dGluZ3NcclxuICAgIH0sXHJcbiAgICBleHQ6IChuYW1lLCBmbikgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIE96b25lLnByb3RvdHlwZVtuYW1lXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICBPem9uZS5wcm90b3R5cGVbbmFtZV0gPSBmblxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24gKHR5cGUsIGVsLCBvYmopIHtcclxuICAgICAgbGV0IGV2dCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XHJcbiAgICAgICAgZGV0YWlsOiBvYmosXHJcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcclxuICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZVxyXG4gICAgICB9KVxyXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2dClcclxuICAgIH0sXHJcbiAgICByZWFkeTogZnVuY3Rpb24oZm4pIHtcclxuICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJykge1xyXG4gICAgICAgIGZuKClcclxuICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZuKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9ICdsb2FkaW5nJylcclxuICAgICAgICAgICAgZm4oKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzeXN0ZW06IF9zeXN0ZW0sXHJcbiAgICB2ZXJzaW9uOiBWRVJTSU9OXHJcbiAgfVxyXG5cclxuICByZXR1cm4gbzNcclxufSgpKVxyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gIC8qKlxyXG4gICAqIFRBQlNcclxuICAgKi9cclxuXHJcbiAgLy8gS2VlcCBpdCBzaW1wbGVcclxuICBsZXQgbzMgPSB3aW5kb3cubzNcclxuICBsZXQgc2V0dGluZ3MgPSBvMy5zZXR0aW5ncygpXHJcblxyXG4gIC8vIENvbXBvbmVudCBldmVudHNcclxuICBjb25zdCBFVkVOVCA9IHtcclxuICAgIFNUQVJURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVUYWJzfS5zdGFydGVkYCxcclxuICAgIENPTVBMRVRFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZVRhYnN9LmNvbXBsZXRlZGAsXHJcbiAgICBDUkVBVEVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlVGFic30uY3JlYXRlZGAsXHJcbiAgICBSRU1PVkVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlVGFic30ucmVtb3ZlZGAsXHJcbiAgICBTSE9XOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlVGFic30uc2hvd2AsXHJcbiAgICBISURFOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlVGFic30uaGlkZWAsXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgdGhlIHRhYnMgZXh0ZW5zaW9uOiAndGhpcycgaXMgaW5oZXJpdGVkIGZyb20gdGhlIE96b25lIHByb3RvdHlwZSAobm90IG8zKVxyXG4gIG8zLmV4dCgndGFicycsIGZ1bmN0aW9uIChvcHRzID0gJ2NyZWF0ZScpIHtcclxuICAgIGxldCBlbG1zID0gdGhpc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbG1zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGxldCBlbCA9IGVsbXNbaV1cclxuXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAvLyBDcmVhdGUgb3IgZGVzdHJveVxyXG4gICAgICAgIHN3aXRjaCAob3B0cykge1xyXG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcclxuICAgICAgICAgICAgY3JlYXRlKGVsLCBvcHRzKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgY2FzZSAnZGVzdHJveSc6XHJcbiAgICAgICAgICAgIGRlc3Ryb3koZWwpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENyZWF0ZSB3aXRoL2NoYW5nZSBvcHRpb25zXHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZSB3aXRoL2NoYW5nZSBvcHRpb25zJywgb3B0cylcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaXQ6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgICovXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG5cclxuICAvLyBDcmVhdGUgdGhlIGNvbXBvbmVudFxyXG4gIGxldCBjcmVhdGUgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuXHJcbiAgICBvMy50cmlnZ2VyKEVWRU5ULlNUQVJURUQsIGVsLCB7fSlcclxuICAgIGNvbnNvbGUubG9nKCd0YWInLCBlbCwgb3B0cylcclxuXHJcbiAgICBpZiAoc2V0dGluZ3Muc2hvd0NvbnNvbGUpIHtcclxuICAgICAgY29uc29sZS5sb2coJyVjVGFicyBjcmVhdGVkJywgc2V0dGluZ3Muc3R5bGUubG9nKVxyXG4gICAgfVxyXG5cclxuICAgIG8zLnRyaWdnZXIoRVZFTlQuQ09NUExFVEVELCBlbCwge30pXHJcbiAgfVxyXG5cclxuICAvLyBSZW1vdmUgdGhlIGNvbXBvbmVudFxyXG4gIGxldCBkZXN0cm95ID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBjb25zb2xlLmxvZygnZGVzdHJveScsIGVsKVxyXG4gIH1cclxuXHJcbiAgLy8gUHJlcGFyZSBkYXRhIHNlbGVjdG9yXHJcbiAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLSR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZX09XCIke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVUYWJzfVwiXWBcclxuICBsZXQgZWxlbWVudHMgPSBvMy5maW5kKHNlbGVjdG9yKVxyXG5cclxuICAvLyBBdXRvbWF0aWNhbGx5IHNldHVwIGFueSBlbGVtZW50IG1hdGNoaW5nIHRoZSBzZWxlY3RvclxyXG4gIGlmIChlbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICBvMy5maW5kKGVsZW1lbnRzKS50YWJzKClcclxuICB9XHJcblxyXG59KSgpIl19
