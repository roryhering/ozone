(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
 */

/*
(function() {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector

    if (!Element.prototype.closest) {
      Element.prototype.closest = function (el, selector) {
        var ancestor = this
        if (!document.documentElement.contains(el)) return null
        do {
          if (ancestor.matches(selector)) return ancestor
          ancestor = ancestor.parentElement
        } while (ancestor !== null)
        return el
      }
    }
  }
})(),
*/

(function () {
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
})(),

/*
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
function () {
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
}(),

/*
 * https://stackoverflow.com/questions/6481612/queryselector-search-immediate-children#answer-17989803
 */
function (doc, proto) {
  try {
    doc.querySelector(':scope body');
  } catch (err) {
    ['querySelector', 'querySelectorAll'].forEach(function (method) {
      var native = proto[method];
      proto[method] = function (selector) {
        if (/(^|,)\s*:scope/.test(selector)) {
          var id = this.id;
          this.id = 'ID_' + new Date().getTime();
          selector = selector.replace(/((^|,)\s*):scope/g, '$1#' + this.id);
          var result = doc[method](selector);
          this.id = id;
          return result;
        } else {
          return native.call(this, selector);
        }
      };
    });
  }
}(window.document, Element.prototype),

/*
 * Ozone is based on the work of Andrew Burgess
 * 
 * https://github.com/andrew8088/dome/blob/master/src/dome.js
 */
window.o3 = function () {

  var VERSION = '0.0.1';

  var _settings = {
    showConsole: false,
    eventPrefix: 'o3',
    dataAttribute: 'layer',
    dataAttributeTabs: 'tabs',
    dataAttributeMenu: 'menu'
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

  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }

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
    _system.browser.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    _system.browser.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }, 250));

  var Ozone = function Ozone(els) {
    for (var i = 0; i < els.length; ++i) {
      this[i] = els[i];
    }
    this.length = els.length;
  };

  /* =================
   * Mutation Observer
   * =================
   */

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      console.log(mutation.type);
    });
  });
  var observerConfig = {
    attributes: false,
    childList: true,
    characterData: false

    /* =====
     * UTILS
     * =====
     */

  };Ozone.prototype.forEach = function (callback) {
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

  Ozone.prototype.mutation = function () {
    return this.forEach(function (el) {
      observer.observe(el, observerConfig);
    });
  };

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
        offsetHeight: el.offsetHeight,
        hidden: el.hidden
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
            el.setAttribute(key.toString(), attr[key]);
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

  Ozone.prototype.find = function (selector, context) {
    return o3.find(selector, context, this[0]);
  };

  Ozone.prototype.closest = function (selector) {
    var ancestor = this[0];
    do {
      if (ancestor.matches(selector)) {
        return o3.find(ancestor);
      }
      ancestor = ancestor.parentNode;
    } while (ancestor !== null);
    return this;
  };

  Ozone.prototype.prev = function () {
    var el = this[0];
    while (el = el.previousSibling) {
      if (el.nodeType === 1) {
        return o3.find(el);
      }
    }
    return this;
  };

  Ozone.prototype.next = function () {
    var el = this[0];
    while (el = el.nextSibling) {
      if (el.nodeType === 1) {
        return o3.find(el);
      }
    }
    return this;
  };

  Ozone.prototype.focus = function () {
    this[0].focus();
    return this;
  };

  Ozone.prototype.trigger = function (type) {
    return this.forEach(function (el) {
      o3.fireEvent(type, el);
    });
  };

  var o3 = {
    find: function find(selector, context, parent) {
      var els = void 0;
      if (context) {
        context = context[0];
      }
      if (context === undefined && parent) {
        context = parent;
      }
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
    fireEvent: function fireEvent(type, el, obj) {
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
   * MENU
   */

  // Keep it simple
  var o3 = window.o3;
  var settings = o3.settings();

  // Component events
  var EVENT = {
    STARTED: settings.eventPrefix + '.' + settings.dataAttributeMenu + '.started',
    COMPLETED: settings.eventPrefix + '.' + settings.dataAttributeMenu + '.completed',
    CREATED: settings.eventPrefix + '.' + settings.dataAttributeMenu + '.created',
    REMOVED: settings.eventPrefix + '.' + settings.dataAttributeMenu + '.removed',
    SHOW: settings.eventPrefix + '.' + settings.dataAttributeMenu + '.show',
    HIDE: settings.eventPrefix + '.' + settings.dataAttributeMenu + '.hide'

    // Add the menu extension: 'this' is inherited from the Ozone prototype (not o3)
  };o3.ext('menu', function () {
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

    o3.fireEvent(EVENT.STARTED, el, {});
    console.log('menu', el, opts);

    if (settings.showConsole) {
      console.log('%cMenu created', settings.style.log);
    }

    o3.fireEvent(EVENT.COMPLETED, el, {});
  };

  // Remove the component
  var destroy = function destroy(el) {
    console.log('destroy', el);
  };

  // Prepare data selector
  var selector = '[data-' + settings.dataAttribute + '="' + settings.dataAttributeMenu + '"]';
  var elements = o3.find(selector);

  // Automatically setup any element matching the selector
  if (elements.length > 0) {
    o3.find(elements).menu();
  }
})();

},{}],3:[function(require,module,exports){
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
          fit: false,
          show: 0
        }
        */
      }
    }
  });

  // Create the component
  var create = function create(el, opts) {

    var panels = [];

    // Send the started event
    o3.fireEvent(EVENT.STARTED, el, {});
    console.log('tab', el, opts);

    // Convert element to Ozone object
    var tablist = o3.find(el);

    if (tablist.attr('role') !== 'tablist') {

      // Assign the tablist role
      tablist.attr({
        role: 'tablist'
      });

      // List items are presentation only
      tablist.find(':scope > li').attr({
        role: 'presentation'
      });

      // Connect each link to their element
      tablist.find(':scope > li a').forEach(function (el) {

        el = o3.find(el);
        el.attr({
          role: 'tab',
          tabindex: '-1',
          'aria-controls': el.attr('href').substring(1)
        });

        el.on('click', function (event) {

          event.preventDefault();
          var tab = o3.find(event.target);

          // Reset the tabs
          tablist.find(':scope > li [role="tab"]').attr({
            tabindex: '-1',
            'aria-selected': null
          });

          // Set the current one
          tab.attr({
            tabindex: '0',
            'aria-selected': true
          });

          // Reset the panels
          for (var i = 0, imax = panels.length; i < imax; ++i) {
            var _panel = o3.find(panels[i]);
            _panel.attr({
              'aria-hidden': true
            });
          }

          // Show the correct panel
          o3.find(el.attr('href')).attr({
            'aria-hidden': null
          });
        });

        // Keyboard interaction
        el.on('keydown', function (event) {
          var target = undefined;
          var selected = o3.find(event.target).closest('[role="tablist"]').find('[aria-selected="true"]');
          var prev = selected.closest('li').prev().find('[role="tab"]');
          var next = selected.closest('li').next().find('[role="tab"]');

          // Determine the direction
          switch (event.keyCode) {
            case 37:
            case 38:
              target = prev;
              break;
            case 39:
            case 40:
              target = next;
              break;
            default:
              target = undefined;
              break;
          }

          if (target && target.length) {
            event.preventDefault();
            target.focus().trigger('click');
          }
        });

        // Set the tab panel role
        var panel = o3.find(el.attr('href'));
        panel.attr({
          role: 'tabpanel'
        });

        // Make the first child of the tabpanel focusable
        var firstEl = panel[0].children.length > 0 ? o3.find(panel[0].children[0]) : panel;
        firstEl.attr({
          tabindex: '0'
        });

        // Save for later
        panels.push(panel);
      });

      // Automatically select the first one
      var selectedIndex = 0;
      var selectedTab = tablist.find(':scope > li'); //:eq(' + selectedIndex + ') a')
      selectedTab = o3.find(selectedTab[selectedIndex]).find(':scope > a');
      selectedTab.attr({
        'aria-selected': 'true',
        tabindex: '0'
      });

      // Hide all panels (except for the selected panel)
      for (var i = 0, imax = panels.length; i < imax; ++i) {
        var panel = o3.find(panels[i]);
        if (i !== selectedIndex) {
          panel.attr({
            'aria-hidden': true
          });
        }
      }
    }

    if (settings.showConsole) {
      console.log('%cTabs created', settings.style.log);
    }

    o3.fireEvent(EVENT.COMPLETED, el, {});
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

},{}]},{},[1,2,3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxjb3JlLmpzIiwic3JjXFxqc1xccGx1Z2luc1xcbWVudS5qcyIsInNyY1xcanNcXHBsdWdpbnNcXHRhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7Ozs7QUFJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsQ0FBQyxZQUFZO0FBQ1gsTUFBSSxPQUFPLE1BQU0sU0FBTixDQUFnQixPQUF2QixLQUFtQyxVQUF2QyxFQUFtRDtBQUNqRCxVQUFNLFNBQU4sQ0FBZ0IsT0FBaEIsR0FBMEIsVUFBVSxJQUFWLEVBQWdCO0FBQ3hDLFdBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLE1BQXpCLEVBQWlDLEVBQUUsQ0FBbkMsRUFBc0M7QUFDcEMsWUFBSSxLQUFLLENBQUwsTUFBWSxJQUFoQixFQUFzQjtBQUNwQixpQkFBTyxDQUFQO0FBQ0Q7QUFDRjtBQUNELGFBQU8sQ0FBQyxDQUFSO0FBQ0QsS0FQRDtBQVFEO0FBQ0YsQ0FYRDs7QUFhQTs7O0FBR0MsWUFBWTtBQUNYLE1BQUksT0FBTyxPQUFPLFdBQWQsS0FBOEIsVUFBbEMsRUFBOEMsT0FBTyxLQUFQOztBQUU5QyxXQUFTLFdBQVQsQ0FBcUIsS0FBckIsRUFBNEIsTUFBNUIsRUFBb0M7QUFDbEMsYUFBUyxVQUFVO0FBQ2pCLGVBQVMsS0FEUTtBQUVqQixrQkFBWSxLQUZLO0FBR2pCLGNBQVE7QUFIUyxLQUFuQjtBQUtBLFFBQUksTUFBTSxTQUFTLFdBQVQsQ0FBcUIsYUFBckIsQ0FBVjtBQUNBLFFBQUksZUFBSixDQUFvQixLQUFwQixFQUEyQixPQUFPLE9BQWxDLEVBQTJDLE9BQU8sVUFBbEQsRUFBOEQsT0FBTyxNQUFyRTtBQUNBLFdBQU8sR0FBUDtBQUNEOztBQUVELGNBQVksU0FBWixHQUF3QixPQUFPLEtBQVAsQ0FBYSxTQUFyQzs7QUFFQSxTQUFPLFdBQVAsR0FBcUIs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QXdJQTtBQUNBLE1BQUksVUFBVSxTQUFWLE9BQVUsQ0FBVSxFQUFWLEVBQWM7QUFDMUIsWUFBUSxHQUFSLENBQVksU0FBWixFQUF1QixFQUF2QjtBQUNELEdBRkQ7O0FBSUE7QUFDQSxNQUFJLHNCQUFvQixTQUFTLGFBQTdCLFVBQStDLFNBQVMsaUJBQXhELE9BQUo7QUFDQSxNQUFJLFdBQVcsR0FBRyxJQUFILENBQVEsUUFBUixDQUFmOztBQUVBO0FBQ0EsTUFBSSxTQUFTLE1BQVQsR0FBa0IsQ0FBdEIsRUFBeUI7QUFDdkIsT0FBRyxJQUFILENBQVEsUUFBUixFQUFrQixJQUFsQjtBQUNEO0FBRUYsQ0F4TUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2xvc2VzdFxyXG4gKi9cclxuXHJcbi8qXHJcbihmdW5jdGlvbigpIHtcclxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcclxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3JcclxuXHJcbiAgICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcclxuICAgICAgRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uIChlbCwgc2VsZWN0b3IpIHtcclxuICAgICAgICB2YXIgYW5jZXN0b3IgPSB0aGlzXHJcbiAgICAgICAgaWYgKCFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY29udGFpbnMoZWwpKSByZXR1cm4gbnVsbFxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgIGlmIChhbmNlc3Rvci5tYXRjaGVzKHNlbGVjdG9yKSkgcmV0dXJuIGFuY2VzdG9yXHJcbiAgICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudEVsZW1lbnRcclxuICAgICAgICB9IHdoaWxlIChhbmNlc3RvciAhPT0gbnVsbClcclxuICAgICAgICByZXR1cm4gZWxcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkoKSxcclxuKi9cclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKHR5cGVvZiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBpZiAodGhpc1tpXSA9PT0gaXRlbSkge1xyXG4gICAgICAgICAgcmV0dXJuIGlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIC0xXHJcbiAgICB9XHJcbiAgfVxyXG59KSgpLFxyXG5cclxuLypcclxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50L0N1c3RvbUV2ZW50XHJcbiAqL1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcclxuXHJcbiAgZnVuY3Rpb24gQ3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcykge1xyXG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHtcclxuICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxyXG4gICAgICBkZXRhaWw6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gICAgbGV0IGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpXHJcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpXHJcbiAgICByZXR1cm4gZXZ0XHJcbiAgfVxyXG5cclxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW5kb3cuRXZlbnQucHJvdG90eXBlXHJcblxyXG4gIHdpbmRvdy5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50XHJcbn0pKCksXHJcblxyXG4vKlxyXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82NDgxNjEyL3F1ZXJ5c2VsZWN0b3Itc2VhcmNoLWltbWVkaWF0ZS1jaGlsZHJlbiNhbnN3ZXItMTc5ODk4MDNcclxuICovXHJcbihmdW5jdGlvbiAoZG9jLCBwcm90bykge1xyXG4gIHRyeSB7XHJcbiAgICBkb2MucXVlcnlTZWxlY3RvcignOnNjb3BlIGJvZHknKVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgWydxdWVyeVNlbGVjdG9yJywgJ3F1ZXJ5U2VsZWN0b3JBbGwnXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcclxuICAgICAgbGV0IG5hdGl2ZSA9IHByb3RvW21ldGhvZF1cclxuICAgICAgcHJvdG9bbWV0aG9kXSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICAgIGlmICgvKF58LClcXHMqOnNjb3BlLy50ZXN0KHNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgbGV0IGlkID0gdGhpcy5pZFxyXG4gICAgICAgICAgdGhpcy5pZCA9ICdJRF8nICsgbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvKChefCwpXFxzKik6c2NvcGUvZywgJyQxIycgKyB0aGlzLmlkKVxyXG4gICAgICAgICAgbGV0IHJlc3VsdCA9IGRvY1ttZXRob2RdKHNlbGVjdG9yKVxyXG4gICAgICAgICAgdGhpcy5pZCA9IGlkXHJcbiAgICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBuYXRpdmUuY2FsbCh0aGlzLCBzZWxlY3RvcilcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59KSh3aW5kb3cuZG9jdW1lbnQsIEVsZW1lbnQucHJvdG90eXBlKSxcclxuXHJcbi8qXHJcbiAqIE96b25lIGlzIGJhc2VkIG9uIHRoZSB3b3JrIG9mIEFuZHJldyBCdXJnZXNzXHJcbiAqIFxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5kcmV3ODA4OC9kb21lL2Jsb2IvbWFzdGVyL3NyYy9kb21lLmpzXHJcbiAqL1xyXG53aW5kb3cubzMgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICBjb25zdCBWRVJTSU9OID0gJzAuMC4xJ1xyXG5cclxuICBsZXQgX3NldHRpbmdzID0ge1xyXG4gICAgc2hvd0NvbnNvbGU6IGZhbHNlLFxyXG4gICAgZXZlbnRQcmVmaXg6ICdvMycsXHJcbiAgICBkYXRhQXR0cmlidXRlOiAnbGF5ZXInLFxyXG4gICAgZGF0YUF0dHJpYnV0ZVRhYnM6ICd0YWJzJyxcclxuICAgIGRhdGFBdHRyaWJ1dGVNZW51OiAnbWVudSdcclxuICB9XHJcblxyXG4gIGxldCBfc3lzdGVtID0ge1xyXG4gICAgYnJvd3Nlcjoge1xyXG4gICAgICBsYW5nOiBuYXZpZ2F0b3IubGFuZ3VhZ2UsXHJcbiAgICAgIG9zOiBuYXZpZ2F0b3IucGxhdGZvcm0sXHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodFxyXG4gICAgfSxcclxuICAgIHNjcmVlbjoge1xyXG4gICAgICBiaXQ6IHNjcmVlbi5jb2xvckRlcHRoLFxyXG4gICAgICB3aWR0aDogc2NyZWVuLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IHNjcmVlbi5oZWlnaHRcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xyXG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvclxyXG4gIH1cclxuXHJcbiAgbGV0IHN0eWxlcyA9IHtcclxuICAgICdzdGFydCc6ICdiYWNrZ3JvdW5kOiBibHVlOyBjb2xvcjogd2hpdGU7IHBhZGRpbmc6IDNweCAxMHB4OyBkaXNwbGF5OiBibG9jazsnLFxyXG4gICAgJ2VuZCc6ICdiYWNrZ3JvdW5kOiBibGFjazsgY29sb3I6IHdoaXRlOyBwYWRkaW5nOiAzcHggMTBweDsgZGlzcGxheTogYmxvY2s7JyxcclxuICAgICdsb2cnOiAnY29sb3I6IGdyZWVuOyBwYWRkaW5nOiAzcHggMTBweDsgZGlzcGxheTogYmxvY2s7JyxcclxuICAgICdlcnJvcic6ICdjb2xvcjogcmVkOyBwYWRkaW5nOiAzcHggMTBweDsgZGlzcGxheTogYmxvY2s7J1xyXG4gIH1cclxuXHJcbiAgLy8gSW50ZXJuYWwgZGVib3VuY2UgaGFuZGxlclxyXG4gIGxldCBkZWJvdW5jZSA9IGZ1bmN0aW9uIChmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcclxuICAgIGxldCB0aW1lb3V0XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xyXG4gICAgICBsZXQgY29udGV4dCA9IHRoaXNcclxuICAgICAgbGV0IGFyZ3MgPSBhcmd1bWVudHNcclxuICAgICAgbGV0IGxhdGVyID0gKCkgPT4ge1xyXG4gICAgICAgIHRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcclxuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgbGV0IGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXRcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXHJcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxyXG4gICAgICBpZiAoY2FsbE5vdykge1xyXG4gICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gV2luZG93IHJlc2l6ZVxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZSgoKSA9PiB7XHJcbiAgICBfc3lzdGVtLmJyb3dzZXIud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggfHwgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aFxyXG4gICAgX3N5c3RlbS5icm93c2VyLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfSwgMjUwKSlcclxuXHJcbiAgbGV0IE96b25lID0gZnVuY3Rpb24gKGVscykge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgdGhpc1tpXSA9IGVsc1tpXVxyXG4gICAgfVxyXG4gICAgdGhpcy5sZW5ndGggPSBlbHMubGVuZ3RoXHJcbiAgfVxyXG5cclxuICAvKiA9PT09PT09PT09PT09PT09PVxyXG4gICAqIE11dGF0aW9uIE9ic2VydmVyXHJcbiAgICogPT09PT09PT09PT09PT09PT1cclxuICAgKi9cclxuXHJcbiAgbGV0IE11dGF0aW9uT2JzZXJ2ZXIgPSB3aW5kb3cuTXV0YXRpb25PYnNlcnZlciB8fCB3aW5kb3cuV2ViS2l0TXV0YXRpb25PYnNlcnZlciB8fCB3aW5kb3cuTW96TXV0YXRpb25PYnNlcnZlclxyXG5cclxuICBsZXQgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XHJcbiAgICBtdXRhdGlvbnMuZm9yRWFjaCgobXV0YXRpb24pID0+IHtcclxuICAgICAgY29uc29sZS5sb2cobXV0YXRpb24udHlwZSlcclxuICAgIH0pXHJcbiAgfSlcclxuICBsZXQgb2JzZXJ2ZXJDb25maWcgPSB7XHJcbiAgICBhdHRyaWJ1dGVzOiBmYWxzZSxcclxuICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgIGNoYXJhY3RlckRhdGE6IGZhbHNlXHJcbiAgfVxyXG5cclxuICAvKiA9PT09PVxyXG4gICAqIFVUSUxTXHJcbiAgICogPT09PT1cclxuICAgKi9cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIHRoaXMubWFwKGNhbGxiYWNrKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIGxldCByZXN1bHRzID0gW11cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzW2ldLCBpKSlcclxuICAgIH1cclxuICAgIC8vcmV0dXJuIHJlc3VsdHMubGVuZ3RoID4gMSA/IHJlc3VsdHMgOiByZXN1bHRzWzBdXHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm1hcE9uZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgbGV0IG0gPSB0aGlzLm1hcChjYWxsYmFjaylcclxuICAgIHJldHVybiBtLmxlbmd0aCA+IDEgPyBtIDogbVswXVxyXG4gIH1cclxuXHJcbiAgLyogPT09PT09PT09PT09PT09PVxyXG4gICAqIERPTSBNQU5JUFVMQVRJT05cclxuICAgKiA9PT09PT09PT09PT09PT09XHJcbiAgICovXHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5tdXRhdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIG9ic2VydmVyLm9ic2VydmUoZWwsIG9ic2VydmVyQ29uZmlnKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24gKHRleHQpIHtcclxuICAgIGlmICh0eXBlb2YgdGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBlbC5pbm5lclRleHQgPSB0ZXh0XHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsLmlubmVyVGV4dFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbiAoaHRtbCkge1xyXG4gICAgaWYgKHR5cGVvZiBodG1sICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGh0bWxcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICByZXR1cm4gZWwuaW5uZXJIVE1MXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgbGV0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHJlY3QueCxcclxuICAgICAgICB5OiByZWN0LnksXHJcbiAgICAgICAgdG9wOiByZWN0LnRvcCxcclxuICAgICAgICBib3R0b206IHJlY3QuYm90dG9tLFxyXG4gICAgICAgIGxlZnQ6IHJlY3QubGVmdCxcclxuICAgICAgICByaWdodDogcmVjdC5yaWdodCxcclxuICAgICAgICB3aWR0aDogcmVjdC53aWR0aCxcclxuICAgICAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxyXG4gICAgICAgIG9mZnNldFRvcDogZWwub2Zmc2V0VG9wLFxyXG4gICAgICAgIG9mZnNldExlZnQ6IGVsLm9mZnNldExlZnQsXHJcbiAgICAgICAgb2Zmc2V0V2lkdGg6IGVsLm9mZnNldFdpZHRoLFxyXG4gICAgICAgIG9mZnNldEhlaWdodDogZWwub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICAgIGhpZGRlbjogZWwuaGlkZGVuXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuYWRkQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3Nlcykge1xyXG4gICAgbGV0IGNsYXNzTmFtZSA9ICcnXHJcbiAgICBpZiAodHlwZW9mIGNsYXNzZXMgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGNsYXNzTmFtZSArPSAnICcgKyBjbGFzc2VzW2ldXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNsYXNzTmFtZSA9ICcgJyArIGNsYXNzZXNcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIGVsLmNsYXNzTmFtZSArPSBjbGFzc05hbWVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoY2xzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBsZXQgY3MgPSBlbC5jbGFzc05hbWUuc3BsaXQoL1xccysvKVxyXG4gICAgICBsZXQgaVxyXG5cclxuICAgICAgd2hpbGUgKChpID0gY3MuaW5kZXhPZihjbHMpKSA+IC0xKSB7XHJcbiAgICAgICAgY3MgPSBjcy5zbGljZSgwLCBpKS5jb25jYXQoY3Muc2xpY2UoKytpKSlcclxuICAgICAgfVxyXG4gICAgICBlbC5jbGFzc05hbWUgPSBjcy5qb2luKCcgJylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uIChhdHRyLCB2YWwpIHtcclxuICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgLy8gT2JqZWN0IGluc3RlYWQgb2Ygc3RyaW5nXHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGF0dHIpIHtcclxuICAgICAgICAgIGlmIChhdHRyLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleS50b1N0cmluZygpLCBhdHRyW2tleV0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gU3RyaW5nIGluc3RlYWQgb2Ygb2JqZWN0XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZShhdHRyKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5jc3MgPSBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIGF0dHIgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIC8vIE9iamVjdCBpbnN0ZWFkIG9mIHN0cmluZ1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRyKSB7XHJcbiAgICAgICAgICBpZiAoYXR0ci5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGVsLnN0eWxlW2tleS50b1N0cmluZygpXSA9IGF0dHJba2V5XVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFN0cmluZyBpbnN0ZWFkIG9mIG9iamVjdFxyXG4gICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuc3R5bGVbYXR0cl0gPSB2YWxcclxuICAgICAgICB9KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHdpbiA9IGVsLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXdcclxuICAgICAgICAgIHJldHVybiB3aW4uZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbClbYXR0cl1cclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24gKGVscykge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgocGFyRWwsIGkpID0+IHtcclxuICAgICAgZWxzLmZvckVhY2goKGNoaWxkRWwpID0+IHtcclxuICAgICAgICBwYXJFbC5hcHBlbmRDaGlsZCgoaSA+IDApID8gY2hpbGRFbC5jbG9uZU5vZGUodHJ1ZSkgOiBjaGlsZEVsKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5wcmVwZW5kID0gZnVuY3Rpb24gKGVscykge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgocGFyRWwsIGkpID0+IHtcclxuICAgICAgZm9yIChsZXQgaiA9IGVscy5sZW5ndGggLSAxOyBqID4gLTE7IGotLSkge1xyXG4gICAgICAgIHBhckVsLmluc2VydEJlZm9yZSgoaSA+IDApID8gZWxzW2pdLmNsb25lTm9kZSh0cnVlKSA6IGVsc1tqXSwgcGFyRWwuZmlyc3RDaGlsZClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICByZXR1cm4gZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUub24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmbiwgZmFsc2UpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5hdHRhY2hFdmVudCkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuYXR0YWNoRXZlbnQoJ29uJyArIGV2dCwgZm4pXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsWydvbicgKyBldnRdID0gZm5cclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSgpKVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUub2ZmID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmIChkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgZm4sIGZhbHNlKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuZGV0YWNoRXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLmRldGFjaEV2ZW50KCdvbicgKyBldnQsIGZuKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMqL1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICAvKmVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMqL1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbFsnb24nICsgZXZ0XSA9IG51bGxcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSgpKVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xyXG4gICAgcmV0dXJuIG8zLmZpbmQoc2VsZWN0b3IsIGNvbnRleHQsIHRoaXNbMF0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICBsZXQgYW5jZXN0b3IgPSB0aGlzWzBdXHJcbiAgICBkbyB7XHJcbiAgICAgIGlmIChhbmNlc3Rvci5tYXRjaGVzKHNlbGVjdG9yKSkge1xyXG4gICAgICAgIHJldHVybiBvMy5maW5kKGFuY2VzdG9yKVxyXG4gICAgICB9XHJcbiAgICAgIGFuY2VzdG9yID0gYW5jZXN0b3IucGFyZW50Tm9kZVxyXG4gICAgfSB3aGlsZSAoYW5jZXN0b3IgIT09IG51bGwpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbigpIHtcclxuICAgIGxldCBlbCA9IHRoaXNbMF1cclxuICAgIHdoaWxlICgoZWwgPSBlbC5wcmV2aW91c1NpYmxpbmcpKSB7XHJcbiAgICAgIGlmIChlbC5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgIHJldHVybiBvMy5maW5kKGVsKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIGxldCBlbCA9IHRoaXNbMF1cclxuICAgIHdoaWxlICgoZWwgPSBlbC5uZXh0U2libGluZykpIHtcclxuICAgICAgaWYgKGVsLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIG8zLmZpbmQoZWwpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXNbMF0uZm9jdXMoKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgbzMuZmlyZUV2ZW50KHR5cGUsIGVsKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGxldCBvMyA9IHtcclxuICAgIGZpbmQ6IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCwgcGFyZW50KSB7XHJcbiAgICAgIGxldCBlbHNcclxuICAgICAgaWYgKGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0ID0gY29udGV4dFswXVxyXG4gICAgICB9IFxyXG4gICAgICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkICYmIHBhcmVudCkge1xyXG4gICAgICAgIGNvbnRleHQgPSBwYXJlbnRcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIGVscyA9IHNlbGVjdG9yIGluc3RhbmNlb2YgTm9kZSB8fCBzZWxlY3RvciBpbnN0YW5jZW9mIFdpbmRvdyA/IFtzZWxlY3Rvcl0gOiBbXS5zbGljZS5jYWxsKHR5cGVvZiBzZWxlY3RvciA9PSAnc3RyaW5nJyA/IChjb250ZXh0IHx8IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6IHNlbGVjdG9yIHx8IFtdKVxyXG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yLmxlbmd0aCkge1xyXG4gICAgICAgIGVscyA9IHNlbGVjdG9yXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxzID0gW3NlbGVjdG9yXVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXcgT3pvbmUoZWxzKVxyXG4gICAgfSxcclxuICAgIGNyZWF0ZTogKHRhZ05hbWUsIGF0dHJzKSA9PiB7XHJcbiAgICAgIGxldCBlbCA9IG5ldyBPem9uZShbZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKV0pXHJcbiAgICAgIGlmIChhdHRycykge1xyXG4gICAgICAgIGlmIChhdHRycy5jbGFzc05hbWUpIHtcclxuICAgICAgICAgIGVsLmFkZENsYXNzKGF0dHJzLmNsYXNzTmFtZSlcclxuICAgICAgICAgIGRlbGV0ZSBhdHRycy5jbGFzc05hbWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGF0dHJzLnRleHQpIHtcclxuICAgICAgICAgIGVsLnRleHQoYXR0cnMudGV4dClcclxuICAgICAgICAgIGRlbGV0ZSBhdHRycy50ZXh0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRycykge1xyXG4gICAgICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgZWwuYXR0cihrZXksIGF0dHJzW2tleV0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBlbFxyXG4gICAgfSxcclxuICAgIHNldHRpbmdzOiAob3B0cykgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIG9wdHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSBpbiBfc2V0dGluZ3MpIHtcclxuICAgICAgICAgIGlmIChfc2V0dGluZ3NbaV0gJiYgb3B0c1tpXSkge1xyXG4gICAgICAgICAgICBfc2V0dGluZ3NbaV0gPSBvcHRzW2ldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoX3NldHRpbmdzLnNob3dDb25zb2xlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnJWNPWk9ORTogTmV3IG9wdGlvbnMnLCBzdHlsZXMubG9nKVxyXG4gICAgICAgICAgY29uc29sZS5sb2coX3NldHRpbmdzKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gX3NldHRpbmdzXHJcbiAgICB9LFxyXG4gICAgZXh0OiAobmFtZSwgZm4pID0+IHtcclxuICAgICAgaWYgKHR5cGVvZiBPem9uZS5wcm90b3R5cGVbbmFtZV0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgT3pvbmUucHJvdG90eXBlW25hbWVdID0gZm5cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGZpcmVFdmVudDogZnVuY3Rpb24gKHR5cGUsIGVsLCBvYmopIHtcclxuICAgICAgbGV0IGV2dCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XHJcbiAgICAgICAgZGV0YWlsOiBvYmosXHJcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcclxuICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZVxyXG4gICAgICB9KVxyXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2dClcclxuICAgIH0sXHJcbiAgICByZWFkeTogZnVuY3Rpb24gKGZuKSB7XHJcbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcclxuICAgICAgICBmbigpXHJcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbilcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT0gJ2xvYWRpbmcnKVxyXG4gICAgICAgICAgICBmbigpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHN5c3RlbTogX3N5c3RlbSxcclxuICAgIHZlcnNpb246IFZFUlNJT05cclxuICB9XHJcblxyXG4gIHJldHVybiBvM1xyXG59KCkpXHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgLyoqXHJcbiAgICogTUVOVVxyXG4gICAqL1xyXG5cclxuICAvLyBLZWVwIGl0IHNpbXBsZVxyXG4gIGxldCBvMyA9IHdpbmRvdy5vM1xyXG4gIGxldCBzZXR0aW5ncyA9IG8zLnNldHRpbmdzKClcclxuXHJcbiAgLy8gQ29tcG9uZW50IGV2ZW50c1xyXG4gIGNvbnN0IEVWRU5UID0ge1xyXG4gICAgU1RBUlRFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZU1lbnV9LnN0YXJ0ZWRgLFxyXG4gICAgQ09NUExFVEVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlTWVudX0uY29tcGxldGVkYCxcclxuICAgIENSRUFURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVNZW51fS5jcmVhdGVkYCxcclxuICAgIFJFTU9WRUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVNZW51fS5yZW1vdmVkYCxcclxuICAgIFNIT1c6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVNZW51fS5zaG93YCxcclxuICAgIEhJREU6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVNZW51fS5oaWRlYCxcclxuICB9XHJcblxyXG4gIC8vIEFkZCB0aGUgbWVudSBleHRlbnNpb246ICd0aGlzJyBpcyBpbmhlcml0ZWQgZnJvbSB0aGUgT3pvbmUgcHJvdG90eXBlIChub3QgbzMpXHJcbiAgbzMuZXh0KCdtZW51JywgZnVuY3Rpb24gKG9wdHMgPSAnY3JlYXRlJykge1xyXG4gICAgbGV0IGVsbXMgPSB0aGlzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsbXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgbGV0IGVsID0gZWxtc1tpXVxyXG5cclxuICAgICAgaWYgKHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIC8vIENyZWF0ZSBvciBkZXN0cm95XHJcbiAgICAgICAgc3dpdGNoIChvcHRzKSB7XHJcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxyXG4gICAgICAgICAgICBjcmVhdGUoZWwsIG9wdHMpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdkZXN0cm95JzpcclxuICAgICAgICAgICAgZGVzdHJveShlbClcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHdpdGgvY2hhbmdlIG9wdGlvbnNcclxuICAgICAgICBjb25zb2xlLmxvZygnY3JlYXRlIHdpdGgvY2hhbmdlIG9wdGlvbnMnLCBvcHRzKVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpdDogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgY29tcG9uZW50XHJcbiAgbGV0IGNyZWF0ZSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG5cclxuICAgIG8zLmZpcmVFdmVudChFVkVOVC5TVEFSVEVELCBlbCwge30pXHJcbiAgICBjb25zb2xlLmxvZygnbWVudScsIGVsLCBvcHRzKVxyXG5cclxuICAgIGlmIChzZXR0aW5ncy5zaG93Q29uc29sZSkge1xyXG4gICAgICBjb25zb2xlLmxvZygnJWNNZW51IGNyZWF0ZWQnLCBzZXR0aW5ncy5zdHlsZS5sb2cpXHJcbiAgICB9XHJcblxyXG4gICAgbzMuZmlyZUV2ZW50KEVWRU5ULkNPTVBMRVRFRCwgZWwsIHt9KVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlIHRoZSBjb21wb25lbnRcclxuICBsZXQgZGVzdHJveSA9IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgY29uc29sZS5sb2coJ2Rlc3Ryb3knLCBlbClcclxuICB9XHJcblxyXG4gIC8vIFByZXBhcmUgZGF0YSBzZWxlY3RvclxyXG4gIGxldCBzZWxlY3RvciA9IGBbZGF0YS0ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGV9PVwiJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlTWVudX1cIl1gXHJcbiAgbGV0IGVsZW1lbnRzID0gbzMuZmluZChzZWxlY3RvcilcclxuXHJcbiAgLy8gQXV0b21hdGljYWxseSBzZXR1cCBhbnkgZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3JcclxuICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgbzMuZmluZChlbGVtZW50cykubWVudSgpXHJcbiAgfVxyXG5cclxufSkoKSIsIihmdW5jdGlvbiAoKSB7XHJcbiAgLyoqXHJcbiAgICogVEFCU1xyXG4gICAqL1xyXG5cclxuICAvLyBLZWVwIGl0IHNpbXBsZVxyXG4gIGxldCBvMyA9IHdpbmRvdy5vM1xyXG4gIGxldCBzZXR0aW5ncyA9IG8zLnNldHRpbmdzKClcclxuXHJcbiAgLy8gQ29tcG9uZW50IGV2ZW50c1xyXG4gIGNvbnN0IEVWRU5UID0ge1xyXG4gICAgU1RBUlRFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZVRhYnN9LnN0YXJ0ZWRgLFxyXG4gICAgQ09NUExFVEVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlVGFic30uY29tcGxldGVkYCxcclxuICAgIENSRUFURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVUYWJzfS5jcmVhdGVkYCxcclxuICAgIFJFTU9WRUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVUYWJzfS5yZW1vdmVkYCxcclxuICAgIFNIT1c6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVUYWJzfS5zaG93YCxcclxuICAgIEhJREU6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyaWJ1dGVUYWJzfS5oaWRlYCxcclxuICB9XHJcblxyXG4gIC8vIEFkZCB0aGUgdGFicyBleHRlbnNpb246ICd0aGlzJyBpcyBpbmhlcml0ZWQgZnJvbSB0aGUgT3pvbmUgcHJvdG90eXBlIChub3QgbzMpXHJcbiAgbzMuZXh0KCd0YWJzJywgZnVuY3Rpb24gKG9wdHMgPSAnY3JlYXRlJykge1xyXG4gICAgbGV0IGVsbXMgPSB0aGlzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsbXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgbGV0IGVsID0gZWxtc1tpXVxyXG5cclxuICAgICAgaWYgKHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIC8vIENyZWF0ZSBvciBkZXN0cm95XHJcbiAgICAgICAgc3dpdGNoIChvcHRzKSB7XHJcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxyXG4gICAgICAgICAgICBjcmVhdGUoZWwsIG9wdHMpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdkZXN0cm95JzpcclxuICAgICAgICAgICAgZGVzdHJveShlbClcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHdpdGgvY2hhbmdlIG9wdGlvbnNcclxuICAgICAgICBjb25zb2xlLmxvZygnY3JlYXRlIHdpdGgvY2hhbmdlIG9wdGlvbnMnLCBvcHRzKVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpdDogZmFsc2UsXHJcbiAgICAgICAgICBzaG93OiAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgICovXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG5cclxuICAvLyBDcmVhdGUgdGhlIGNvbXBvbmVudFxyXG4gIGxldCBjcmVhdGUgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuXHJcbiAgICBsZXQgcGFuZWxzID0gW11cclxuXHJcbiAgICAvLyBTZW5kIHRoZSBzdGFydGVkIGV2ZW50XHJcbiAgICBvMy5maXJlRXZlbnQoRVZFTlQuU1RBUlRFRCwgZWwsIHt9KVxyXG4gICAgY29uc29sZS5sb2coJ3RhYicsIGVsLCBvcHRzKVxyXG5cclxuICAgIC8vIENvbnZlcnQgZWxlbWVudCB0byBPem9uZSBvYmplY3RcclxuICAgIGxldCB0YWJsaXN0ID0gbzMuZmluZChlbClcclxuXHJcbiAgICBpZiAodGFibGlzdC5hdHRyKCdyb2xlJykgIT09ICd0YWJsaXN0Jykge1xyXG4gICAgXHJcbiAgICAgIC8vIEFzc2lnbiB0aGUgdGFibGlzdCByb2xlXHJcbiAgICAgIHRhYmxpc3QuYXR0cih7XHJcbiAgICAgICAgcm9sZTogJ3RhYmxpc3QnXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBMaXN0IGl0ZW1zIGFyZSBwcmVzZW50YXRpb24gb25seVxyXG4gICAgICB0YWJsaXN0LmZpbmQoJzpzY29wZSA+IGxpJykuYXR0cih7XHJcbiAgICAgICAgcm9sZTogJ3ByZXNlbnRhdGlvbidcclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIENvbm5lY3QgZWFjaCBsaW5rIHRvIHRoZWlyIGVsZW1lbnRcclxuICAgICAgdGFibGlzdC5maW5kKCc6c2NvcGUgPiBsaSBhJykuZm9yRWFjaCgoZWwpID0+IHtcclxuXHJcbiAgICAgICAgZWwgPSBvMy5maW5kKGVsKVxyXG4gICAgICAgIGVsLmF0dHIoe1xyXG4gICAgICAgICAgcm9sZTogJ3RhYicsXHJcbiAgICAgICAgICB0YWJpbmRleDogJy0xJyxcclxuICAgICAgICAgICdhcmlhLWNvbnRyb2xzJzogZWwuYXR0cignaHJlZicpLnN1YnN0cmluZygxKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGVsLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG5cclxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgIGxldCB0YWIgPSBvMy5maW5kKGV2ZW50LnRhcmdldClcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gUmVzZXQgdGhlIHRhYnNcclxuICAgICAgICAgIHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGkgW3JvbGU9XCJ0YWJcIl0nKS5hdHRyKHtcclxuICAgICAgICAgICAgdGFiaW5kZXg6ICctMScsXHJcbiAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogbnVsbFxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAvLyBTZXQgdGhlIGN1cnJlbnQgb25lXHJcbiAgICAgICAgICB0YWIuYXR0cih7XHJcbiAgICAgICAgICAgIHRhYmluZGV4OiAnMCcsXHJcbiAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAvLyBSZXNldCB0aGUgcGFuZWxzXHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMCwgaW1heCA9IHBhbmVscy5sZW5ndGg7IGkgPCBpbWF4OyArK2kpIHtcclxuICAgICAgICAgICAgbGV0IHBhbmVsID0gbzMuZmluZChwYW5lbHNbaV0pXHJcbiAgICAgICAgICAgIHBhbmVsLmF0dHIoe1xyXG4gICAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTaG93IHRoZSBjb3JyZWN0IHBhbmVsXHJcbiAgICAgICAgICBvMy5maW5kKGVsLmF0dHIoJ2hyZWYnKSkuYXR0cih7XHJcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IG51bGxcclxuICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIEtleWJvYXJkIGludGVyYWN0aW9uXHJcbiAgICAgICAgZWwub24oJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgIGxldCB0YXJnZXQgPSB1bmRlZmluZWRcclxuICAgICAgICAgIGxldCBzZWxlY3RlZCA9IG8zLmZpbmQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdbcm9sZT1cInRhYmxpc3RcIl0nKS5maW5kKCdbYXJpYS1zZWxlY3RlZD1cInRydWVcIl0nKVxyXG4gICAgICAgICAgbGV0IHByZXYgPSBzZWxlY3RlZC5jbG9zZXN0KCdsaScpLnByZXYoKS5maW5kKCdbcm9sZT1cInRhYlwiXScpXHJcbiAgICAgICAgICBsZXQgbmV4dCA9IHNlbGVjdGVkLmNsb3Nlc3QoJ2xpJykubmV4dCgpLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDM3OlxyXG4gICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICAgIHRhcmdldCA9IHByZXZcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDM5OlxyXG4gICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgIHRhcmdldCA9IG5leHRcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgIHRhcmdldCA9IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgdGFyZ2V0LmZvY3VzKCkudHJpZ2dlcignY2xpY2snKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgdGFiIHBhbmVsIHJvbGVcclxuICAgICAgICBsZXQgcGFuZWwgPSBvMy5maW5kKGVsLmF0dHIoJ2hyZWYnKSlcclxuICAgICAgICBwYW5lbC5hdHRyKHtcclxuICAgICAgICAgIHJvbGU6ICd0YWJwYW5lbCdcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBNYWtlIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgdGFicGFuZWwgZm9jdXNhYmxlXHJcbiAgICAgICAgbGV0IGZpcnN0RWwgPSAocGFuZWxbMF0uY2hpbGRyZW4ubGVuZ3RoID4gMCkgPyBvMy5maW5kKHBhbmVsWzBdLmNoaWxkcmVuWzBdKSA6IHBhbmVsXHJcbiAgICAgICAgZmlyc3RFbC5hdHRyKHtcclxuICAgICAgICAgIHRhYmluZGV4OiAnMCdcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBTYXZlIGZvciBsYXRlclxyXG4gICAgICAgIHBhbmVscy5wdXNoKHBhbmVsKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gQXV0b21hdGljYWxseSBzZWxlY3QgdGhlIGZpcnN0IG9uZVxyXG4gICAgICBsZXQgc2VsZWN0ZWRJbmRleCA9IDBcclxuICAgICAgbGV0IHNlbGVjdGVkVGFiID0gdGFibGlzdC5maW5kKCc6c2NvcGUgPiBsaScpIC8vOmVxKCcgKyBzZWxlY3RlZEluZGV4ICsgJykgYScpXHJcbiAgICAgIHNlbGVjdGVkVGFiID0gbzMuZmluZChzZWxlY3RlZFRhYltzZWxlY3RlZEluZGV4XSkuZmluZCgnOnNjb3BlID4gYScpXHJcbiAgICAgIHNlbGVjdGVkVGFiLmF0dHIoe1xyXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogJ3RydWUnLFxyXG4gICAgICAgIHRhYmluZGV4OiAnMCdcclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIEhpZGUgYWxsIHBhbmVscyAoZXhjZXB0IGZvciB0aGUgc2VsZWN0ZWQgcGFuZWwpXHJcbiAgICAgIGZvciAobGV0IGkgPSAwLCBpbWF4ID0gcGFuZWxzLmxlbmd0aDsgaSA8IGltYXg7ICsraSkge1xyXG4gICAgICAgIGxldCBwYW5lbCA9IG8zLmZpbmQocGFuZWxzW2ldKVxyXG4gICAgICAgIGlmIChpICE9PSBzZWxlY3RlZEluZGV4KSB7XHJcbiAgICAgICAgICBwYW5lbC5hdHRyKHtcclxuICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogdHJ1ZVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2V0dGluZ3Muc2hvd0NvbnNvbGUpIHtcclxuICAgICAgY29uc29sZS5sb2coJyVjVGFicyBjcmVhdGVkJywgc2V0dGluZ3Muc3R5bGUubG9nKVxyXG4gICAgfVxyXG5cclxuICAgIG8zLmZpcmVFdmVudChFVkVOVC5DT01QTEVURUQsIGVsLCB7fSlcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSB0aGUgY29tcG9uZW50XHJcbiAgbGV0IGRlc3Ryb3kgPSBmdW5jdGlvbiAoZWwpIHtcclxuICAgIGNvbnNvbGUubG9nKCdkZXN0cm95JywgZWwpXHJcbiAgfVxyXG5cclxuICAvLyBQcmVwYXJlIGRhdGEgc2VsZWN0b3JcclxuICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtJHtzZXR0aW5ncy5kYXRhQXR0cmlidXRlfT1cIiR7c2V0dGluZ3MuZGF0YUF0dHJpYnV0ZVRhYnN9XCJdYFxyXG4gIGxldCBlbGVtZW50cyA9IG8zLmZpbmQoc2VsZWN0b3IpXHJcblxyXG4gIC8vIEF1dG9tYXRpY2FsbHkgc2V0dXAgYW55IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIHNlbGVjdG9yXHJcbiAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgIG8zLmZpbmQoZWxlbWVudHMpLnRhYnMoKVxyXG4gIH1cclxuXHJcbn0pKCkiXX0=
