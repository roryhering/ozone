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
    //return results.length > 1 ? results : results[0]
    return results;
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

  Ozone.prototype.rect = function () {
    return this.mapOne(function (el) {
      var rect = el.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        offsetTop: el.offsetTop,
        offsetLeft: el.offsetLeft,
        offsetWidth: el.offsetWidth,
        offsetHeight: el.offsetHeight
      };
    });
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

  Ozone.prototype.css = function (attr, val) {
    if ((typeof attr === 'undefined' ? 'undefined' : _typeof(attr)) === 'object') {
      // Object instead of string
      return this.forEach(function (el) {
        for (var key in attr) {
          if (attr.hasOwnProperty(key)) {
            el.style[key.toString()] = attr[key];
          }
        }
      });
    } else {
      // String instead of object
      if (typeof val !== 'undefined') {
        return this.forEach(function (el) {
          el.style[attr] = val;
        });
      } else {
        return this.mapOne(function (el) {
          var win = el.ownerDocument.defaultView;
          return win.getComputedStyle(el, null)[attr];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxtYWluLmpzIiwic3JjXFxqc1xccGx1Z2luc1xcdGFicy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxJQUFJLE9BQU8sTUFBTSxTQUFOLENBQWdCLE9BQXZCLEtBQW1DLFVBQXZDLEVBQW1EO0FBQ2pELFFBQU0sU0FBTixDQUFnQixPQUFoQixHQUEwQixVQUFVLElBQVYsRUFBZ0I7QUFDeEMsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssTUFBekIsRUFBaUMsRUFBRSxDQUFuQyxFQUFzQztBQUNwQyxVQUFJLEtBQUssQ0FBTCxNQUFZLElBQWhCLEVBQXNCO0FBQ3BCLGVBQU8sQ0FBUDtBQUNEO0FBQ0Y7QUFDRCxXQUFPLENBQUMsQ0FBUjtBQUNELEdBUEQ7QUFRRDs7QUFFRCxDQUFDLFlBQVk7O0FBRVgsTUFBSSxPQUFPLE9BQU8sV0FBZCxLQUE4QixVQUFsQyxFQUE4QyxPQUFPLEtBQVA7O0FBRTlDLFdBQVMsV0FBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFvQztBQUNsQyxhQUFTLFVBQVU7QUFDakIsZUFBUyxLQURRO0FBRWpCLGtCQUFZLEtBRks7QUFHakIsY0FBUTtBQUhTLEtBQW5CO0FBS0EsUUFBSSxNQUFNLFNBQVMsV0FBVCxDQUFxQixhQUFyQixDQUFWO0FBQ0EsUUFBSSxlQUFKLENBQW9CLEtBQXBCLEVBQTJCLE9BQU8sT0FBbEMsRUFBMkMsT0FBTyxVQUFsRCxFQUE4RCxPQUFPLE1BQXJFO0FBQ0EsV0FBTyxHQUFQO0FBQ0Q7O0FBRUQsY0FBWSxTQUFaLEdBQXdCLE9BQU8sS0FBUCxDQUFhLFNBQXJDOztBQUVBLFNBQU8sV0FBUCxHQUFxQixXQUFyQjtBQUNELENBbEJEOztBQW9CQSxPQUFPLEVBQVAsR0FBYSxZQUFZOztBQUV2QixNQUFNLFVBQVUsT0FBaEI7O0FBRUEsTUFBSSxZQUFZO0FBQ2Qs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YztBQUMxQixZQUFRLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLEVBQXZCO0FBQ0QsR0FGRDs7QUFJQTtBQUNBLE1BQUksc0JBQW9CLFNBQVMsYUFBN0IsVUFBK0MsU0FBUyxpQkFBeEQsT0FBSjtBQUNBLE1BQUksV0FBVyxHQUFHLElBQUgsQ0FBUSxRQUFSLENBQWY7O0FBRUE7QUFDQSxNQUFJLFNBQVMsTUFBVCxHQUFrQixDQUF0QixFQUF5QjtBQUN2QixPQUFHLElBQUgsQ0FBUSxRQUFSLEVBQWtCLElBQWxCO0FBQ0Q7QUFFRixDQTNFRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAodHlwZW9mIEFycmF5LnByb3RvdHlwZS5pbmRleE9mICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGlmICh0aGlzW2ldID09PSBpdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xXHJcbiAgfVxyXG59XHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG5cclxuICBpZiAodHlwZW9mIHdpbmRvdy5DdXN0b21FdmVudCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGZ1bmN0aW9uIEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMpIHtcclxuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7IFxyXG4gICAgICBidWJibGVzOiBmYWxzZSwgXHJcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLCBcclxuICAgICAgZGV0YWlsOiB1bmRlZmluZWQgXHJcbiAgICB9XHJcbiAgICBsZXQgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50JylcclxuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbClcclxuICAgIHJldHVybiBldnRcclxuICB9XHJcblxyXG4gIEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbmRvdy5FdmVudC5wcm90b3R5cGVcclxuXHJcbiAgd2luZG93LkN1c3RvbUV2ZW50ID0gQ3VzdG9tRXZlbnRcclxufSkoKVxyXG5cclxud2luZG93Lm8zID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgY29uc3QgVkVSU0lPTiA9ICcwLjAuMSdcclxuXHJcbiAgbGV0IF9zZXR0aW5ncyA9IHtcclxuICAgIHNob3dDb25zb2xlOiBmYWxzZSxcclxuICAgIGV2ZW50UHJlZml4OiAnbzMnLFxyXG4gICAgZGF0YUF0dHJpYnV0ZTogJ2xheWVyJyxcclxuICAgIGRhdGFBdHRyaWJ1dGVUYWJzOiAndGFicydcclxuICB9XHJcblxyXG4gIGxldCBfc3lzdGVtID0ge1xyXG4gICAgYnJvd3Nlcjoge1xyXG4gICAgICBsYW5nOiBuYXZpZ2F0b3IubGFuZ3VhZ2UsXHJcbiAgICAgIG9zOiBuYXZpZ2F0b3IucGxhdGZvcm0sXHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodFxyXG4gICAgfSxcclxuICAgIHNjcmVlbjoge1xyXG4gICAgICBiaXQ6IHNjcmVlbi5jb2xvckRlcHRoLFxyXG4gICAgICB3aWR0aDogc2NyZWVuLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IHNjcmVlbi5oZWlnaHRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGxldCBzdHlsZXMgPSB7XHJcbiAgICAnc3RhcnQnOiAnYmFja2dyb3VuZDogYmx1ZTsgY29sb3I6IHdoaXRlOyBwYWRkaW5nOiAzcHggMTBweDsgZGlzcGxheTogYmxvY2s7JyxcclxuICAgICdlbmQnOiAnYmFja2dyb3VuZDogYmxhY2s7IGNvbG9yOiB3aGl0ZTsgcGFkZGluZzogM3B4IDEwcHg7IGRpc3BsYXk6IGJsb2NrOycsXHJcbiAgICAnbG9nJzogJ2NvbG9yOiBncmVlbjsgcGFkZGluZzogM3B4IDEwcHg7IGRpc3BsYXk6IGJsb2NrOycsXHJcbiAgICAnZXJyb3InOiAnY29sb3I6IHJlZDsgcGFkZGluZzogM3B4IDEwcHg7IGRpc3BsYXk6IGJsb2NrOydcclxuICB9XHJcblxyXG4gIC8vIEludGVybmFsIGRlYm91bmNlIGhhbmRsZXJcclxuICBsZXQgZGVib3VuY2UgPSBmdW5jdGlvbiAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XHJcbiAgICBsZXQgdGltZW91dFxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzXHJcbiAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzXHJcbiAgICAgIGxldCBsYXRlciA9ICgpID0+IHtcclxuICAgICAgICB0aW1lb3V0ID0gbnVsbFxyXG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XHJcbiAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxyXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcclxuICAgICAgaWYgKGNhbGxOb3cpIHtcclxuICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFdpbmRvdyByZXNpemVcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgX3N5c3RlbS5icm93c2VyLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgsXHJcbiAgICBfc3lzdGVtLmJyb3dzZXIuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHRcclxuICB9LCAyNTApKVxyXG5cclxuICBsZXQgT3pvbmUgPSBmdW5jdGlvbiAoZWxzKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVscy5sZW5ndGg7ICsraSkge1xyXG4gICAgICB0aGlzW2ldID0gZWxzW2ldXHJcbiAgICB9XHJcbiAgICB0aGlzLmxlbmd0aCA9IGVscy5sZW5ndGhcclxuICB9XHJcblxyXG4gIC8qID09PT09XHJcbiAgICogVVRJTFNcclxuICAgKiA9PT09PVxyXG4gICAqL1xyXG5cclxuICBPem9uZS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgdGhpcy5tYXAoY2FsbGJhY2spXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgbGV0IHJlc3VsdHMgPSBbXVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHJlc3VsdHMucHVzaChjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXNbaV0sIGkpKVxyXG4gICAgfVxyXG4gICAgLy9yZXR1cm4gcmVzdWx0cy5sZW5ndGggPiAxID8gcmVzdWx0cyA6IHJlc3VsdHNbMF1cclxuICAgIHJldHVybiByZXN1bHRzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUubWFwT25lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICBsZXQgbSA9IHRoaXMubWFwKGNhbGxiYWNrKVxyXG4gICAgcmV0dXJuIG0ubGVuZ3RoID4gMSA/IG0gOiBtWzBdXHJcbiAgfVxyXG5cclxuICAvKiA9PT09PT09PT09PT09PT09XHJcbiAgICogRE9NIE1BTklQVUxBVElPTlxyXG4gICAqID09PT09PT09PT09PT09PT1cclxuICAgKi9cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgaWYgKHR5cGVvZiB0ZXh0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGVsLmlubmVyVGV4dCA9IHRleHRcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICByZXR1cm4gZWwuaW5uZXJUZXh0XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uIChodG1sKSB7XHJcbiAgICBpZiAodHlwZW9mIGh0bWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gaHRtbFxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBlbC5pbm5lckhUTUxcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgIGxldCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB4OiByZWN0LngsXHJcbiAgICAgICAgeTogcmVjdC55LFxyXG4gICAgICAgIHRvcDogcmVjdC50b3AsXHJcbiAgICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSxcclxuICAgICAgICBsZWZ0OiByZWN0LmxlZnQsXHJcbiAgICAgICAgcmlnaHQ6IHJlY3QucmlnaHQsXHJcbiAgICAgICAgd2lkdGg6IHJlY3Qud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcclxuICAgICAgICBvZmZzZXRUb3A6IGVsLm9mZnNldFRvcCxcclxuICAgICAgICBvZmZzZXRMZWZ0OiBlbC5vZmZzZXRMZWZ0LFxyXG4gICAgICAgIG9mZnNldFdpZHRoOiBlbC5vZmZzZXRXaWR0aCxcclxuICAgICAgICBvZmZzZXRIZWlnaHQ6IGVsLm9mZnNldEhlaWdodFxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmFkZENsYXNzID0gZnVuY3Rpb24gKGNsYXNzZXMpIHtcclxuICAgIGxldCBjbGFzc05hbWUgPSAnJ1xyXG4gICAgaWYgKHR5cGVvZiBjbGFzc2VzICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBjbGFzc05hbWUgKz0gJyAnICsgY2xhc3Nlc1tpXVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjbGFzc05hbWUgPSAnICcgKyBjbGFzc2VzXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBlbC5jbGFzc05hbWUgKz0gY2xhc3NOYW1lXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGNscykge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgbGV0IGNzID0gZWwuY2xhc3NOYW1lLnNwbGl0KC9cXHMrLylcclxuICAgICAgbGV0IGlcclxuXHJcbiAgICAgIHdoaWxlICgoaSA9IGNzLmluZGV4T2YoY2xzKSkgPiAtMSkge1xyXG4gICAgICAgIGNzID0gY3Muc2xpY2UoMCwgaSkuY29uY2F0KGNzLnNsaWNlKCsraSkpXHJcbiAgICAgIH1cclxuICAgICAgZWwuY2xhc3NOYW1lID0gY3Muam9pbignICcpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIGF0dHIgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIC8vIE9iamVjdCBpbnN0ZWFkIG9mIHN0cmluZ1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRyKSB7XHJcbiAgICAgICAgICBpZiAoYXR0ci5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXkudG9TdHJpbmcoKSwgYXR0cltrZXldLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gU3RyaW5nIGluc3RlYWQgb2Ygb2JqZWN0XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZShhdHRyKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5jc3MgPSBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIGF0dHIgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIC8vIE9iamVjdCBpbnN0ZWFkIG9mIHN0cmluZ1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRyKSB7XHJcbiAgICAgICAgICBpZiAoYXR0ci5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGVsLnN0eWxlW2tleS50b1N0cmluZygpXSA9IGF0dHJba2V5XVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFN0cmluZyBpbnN0ZWFkIG9mIG9iamVjdFxyXG4gICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuc3R5bGVbYXR0cl0gPSB2YWxcclxuICAgICAgICB9KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHdpbiA9IGVsLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXdcclxuICAgICAgICAgIHJldHVybiB3aW4uZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbClbYXR0cl1cclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24gKGVscykge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgocGFyRWwsIGkpID0+IHtcclxuICAgICAgZWxzLmZvckVhY2goKGNoaWxkRWwpID0+IHtcclxuICAgICAgICBwYXJFbC5hcHBlbmRDaGlsZCgoaSA+IDApID8gY2hpbGRFbC5jbG9uZU5vZGUodHJ1ZSkgOiBjaGlsZEVsKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5wcmVwZW5kID0gZnVuY3Rpb24gKGVscykge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgocGFyRWwsIGkpID0+IHtcclxuICAgICAgZm9yIChsZXQgaiA9IGVscy5sZW5ndGggLSAxOyBqID4gLTE7IGotLSkge1xyXG4gICAgICAgIHBhckVsLmluc2VydEJlZm9yZSgoaSA+IDApID8gZWxzW2pdLmNsb25lTm9kZSh0cnVlKSA6IGVsc1tqXSwgcGFyRWwuZmlyc3RDaGlsZClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICByZXR1cm4gZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUub24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmbiwgZmFsc2UpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5hdHRhY2hFdmVudCkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuYXR0YWNoRXZlbnQoJ29uJyArIGV2dCwgZm4pXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsWydvbicgKyBldnRdID0gZm5cclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSgpKVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUub2ZmID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmIChkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgZm4sIGZhbHNlKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuZGV0YWNoRXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLmRldGFjaEV2ZW50KCdvbicgKyBldnQsIGZuKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMqL1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICAvKmVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMqL1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbFsnb24nICsgZXZ0XSA9IG51bGxcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSgpKVxyXG5cclxuICBsZXQgbzMgPSB7XHJcbiAgICBmaW5kOiAoc2VsZWN0b3IsIGNvbnRleHQpID0+IHtcclxuICAgICAgbGV0IGVsc1xyXG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGVscyA9IHNlbGVjdG9yIGluc3RhbmNlb2YgTm9kZSB8fCBzZWxlY3RvciBpbnN0YW5jZW9mIFdpbmRvdyA/IFtzZWxlY3Rvcl0gOiBbXS5zbGljZS5jYWxsKHR5cGVvZiBzZWxlY3RvciA9PSAnc3RyaW5nJyA/IChjb250ZXh0IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6IHNlbGVjdG9yIHx8IFtdKVxyXG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yLmxlbmd0aCkge1xyXG4gICAgICAgIGVscyA9IHNlbGVjdG9yXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxzID0gW3NlbGVjdG9yXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXcgT3pvbmUoZWxzKVxyXG4gICAgfSxcclxuICAgIGNyZWF0ZTogKHRhZ05hbWUsIGF0dHJzKSA9PiB7XHJcbiAgICAgIGxldCBlbCA9IG5ldyBPem9uZShbZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKV0pXHJcbiAgICAgIGlmIChhdHRycykge1xyXG4gICAgICAgIGlmIChhdHRycy5jbGFzc05hbWUpIHtcclxuICAgICAgICAgIGVsLmFkZENsYXNzKGF0dHJzLmNsYXNzTmFtZSlcclxuICAgICAgICAgIGRlbGV0ZSBhdHRycy5jbGFzc05hbWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGF0dHJzLnRleHQpIHtcclxuICAgICAgICAgIGVsLnRleHQoYXR0cnMudGV4dClcclxuICAgICAgICAgIGRlbGV0ZSBhdHRycy50ZXh0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRycykge1xyXG4gICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgZWwuYXR0cihrZXksIGF0dHJzW2tleV0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBlbFxyXG4gICAgfSxcclxuICAgIHNldHRpbmdzOiAob3B0cykgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIG9wdHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSBpbiBfc2V0dGluZ3MpIHtcclxuICAgICAgICAgIGlmIChfc2V0dGluZ3NbaV0gJiYgb3B0c1tpXSkge1xyXG4gICAgICAgICAgICBfc2V0dGluZ3NbaV0gPSBvcHRzW2ldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoX3NldHRpbmdzLnNob3dDb25zb2xlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnJWNPWk9ORTogTmV3IG9wdGlvbnMnLCBzdHlsZXMubG9nKVxyXG4gICAgICAgICAgY29uc29sZS5sb2coX3NldHRpbmdzKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gX3NldHRpbmdzXHJcbiAgICB9LFxyXG4gICAgZXh0OiAobmFtZSwgZm4pID0+IHtcclxuICAgICAgaWYgKHR5cGVvZiBPem9uZS5wcm90b3R5cGVbbmFtZV0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgT3pvbmUucHJvdG90eXBlW25hbWVdID0gZm5cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRyaWdnZXI6IGZ1bmN0aW9uICh0eXBlLCBlbCwgb2JqKSB7XHJcbiAgICAgIGxldCBldnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xyXG4gICAgICAgIGRldGFpbDogb2JqLFxyXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgY2FuY2VsYWJsZTogZmFsc2VcclxuICAgICAgfSlcclxuICAgICAgZWwuZGlzcGF0Y2hFdmVudChldnQpXHJcbiAgICB9LFxyXG4gICAgcmVhZHk6IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcclxuICAgICAgICBmbigpXHJcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbilcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPSAnbG9hZGluZycpXHJcbiAgICAgICAgICAgIGZuKClcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgc3lzdGVtOiBfc3lzdGVtLFxyXG4gICAgdmVyc2lvbjogVkVSU0lPTlxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG8zXHJcbn0oKSlcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAvKipcclxuICAgKiBUQUJTXHJcbiAgICovXHJcblxyXG4gIC8vIEtlZXAgaXQgc2ltcGxlXHJcbiAgbGV0IG8zID0gd2luZG93Lm8zXHJcbiAgbGV0IHNldHRpbmdzID0gbzMuc2V0dGluZ3MoKVxyXG5cclxuICAvLyBDb21wb25lbnQgZXZlbnRzXHJcbiAgY29uc3QgRVZFTlQgPSB7XHJcbiAgICBTVEFSVEVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlVGFic30uc3RhcnRlZGAsXHJcbiAgICBDT01QTEVURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVUYWJzfS5jb21wbGV0ZWRgLFxyXG4gICAgQ1JFQVRFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZVRhYnN9LmNyZWF0ZWRgLFxyXG4gICAgUkVNT1ZFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZVRhYnN9LnJlbW92ZWRgLFxyXG4gICAgU0hPVzogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZVRhYnN9LnNob3dgLFxyXG4gICAgSElERTogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZVRhYnN9LmhpZGVgLFxyXG4gIH1cclxuXHJcbiAgLy8gQWRkIHRoZSB0YWJzIGV4dGVuc2lvbjogJ3RoaXMnIGlzIGluaGVyaXRlZCBmcm9tIHRoZSBPem9uZSBwcm90b3R5cGUgKG5vdCBvMylcclxuICBvMy5leHQoJ3RhYnMnLCBmdW5jdGlvbiAob3B0cyA9ICdjcmVhdGUnKSB7XHJcbiAgICBsZXQgZWxtcyA9IHRoaXNcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxtcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICBsZXQgZWwgPSBlbG1zW2ldXHJcblxyXG4gICAgICBpZiAodHlwZW9mIG9wdHMgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIG9yIGRlc3Ryb3lcclxuICAgICAgICBzd2l0Y2ggKG9wdHMpIHtcclxuICAgICAgICAgIGNhc2UgJ2NyZWF0ZSc6XHJcbiAgICAgICAgICAgIGNyZWF0ZShlbCwgb3B0cylcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ2Rlc3Ryb3knOlxyXG4gICAgICAgICAgICBkZXN0cm95KGVsKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBDcmVhdGUgd2l0aC9jaGFuZ2Ugb3B0aW9uc1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdjcmVhdGUgd2l0aC9jaGFuZ2Ugb3B0aW9ucycsIG9wdHMpXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZml0OiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICAqL1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBjb21wb25lbnRcclxuICBsZXQgY3JlYXRlID0gZnVuY3Rpb24gKGVsLCBvcHRzKSB7XHJcblxyXG4gICAgbzMudHJpZ2dlcihFVkVOVC5TVEFSVEVELCBlbCwge30pXHJcbiAgICBjb25zb2xlLmxvZygndGFiJywgZWwsIG9wdHMpXHJcblxyXG4gICAgaWYgKHNldHRpbmdzLnNob3dDb25zb2xlKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCclY1RhYnMgY3JlYXRlZCcsIHNldHRpbmdzLnN0eWxlLmxvZylcclxuICAgIH1cclxuXHJcbiAgICBvMy50cmlnZ2VyKEVWRU5ULkNPTVBMRVRFRCwgZWwsIHt9KVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlIHRoZSBjb21wb25lbnRcclxuICBsZXQgZGVzdHJveSA9IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgY29uc29sZS5sb2coJ2Rlc3Ryb3knLCBlbClcclxuICB9XHJcblxyXG4gIC8vIFByZXBhcmUgZGF0YSBzZWxlY3RvclxyXG4gIGxldCBzZWxlY3RvciA9IGBbZGF0YS0ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGV9PVwiJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlVGFic31cIl1gXHJcbiAgbGV0IGVsZW1lbnRzID0gbzMuZmluZChzZWxlY3RvcilcclxuXHJcbiAgLy8gQXV0b21hdGljYWxseSBzZXR1cCBhbnkgZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3JcclxuICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgbzMuZmluZChlbGVtZW50cykudGFicygpXHJcbiAgfVxyXG5cclxufSkoKSJdfQ==
