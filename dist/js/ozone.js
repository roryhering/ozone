(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
 */

(function () {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

    if (!Element.prototype.closest) {
      Element.prototype.closest = function (el, selector) {
        var ancestor = this;
        if (!document.documentElement.contains(el)) return null;
        do {
          if (ancestor.matches(selector)) return ancestor;
          ancestor = ancestor.parentElement;
        } while (ancestor !== null);
        return el;
      };
    }
  }
})(), function () {
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
}(),

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
    dataAttr: 'ozone',
    dataAttrTabs: 'tabs',
    dataAttrMenu: 'menu'
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
      console.log('mutation', mutation);
    });
  });
  var observerConfig = {
    childList: true,
    subtree: true
  };

  var mutationElements = [];

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

  Ozone.prototype.mutation = function (handler, options) {
    mutationElements.push({
      target: this,
      options: options,
      handler: handler
    });
    console.log('mutationElements', mutationElements);
    return this.forEach(function (el) {
      observer.observe(el, observerConfig);
    });
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

  /* ================
   * DOM MANIPULATION
   * ================
   */

  Ozone.prototype.get = function (i) {
    if (this[i] !== undefined) {
      return o3.find(this[i]);
    }
    return this;
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

  Ozone.prototype.data = function (attr, val) {
    if (typeof val !== 'undefined') {
      return this.forEach(function (el) {
        el.setAttribute('data-' + attr, val);
      });
    } else {
      return this.mapOne(function (el) {
        return el.getAttribute('data-' + attr);
      });
    }
  };

  Ozone.prototype.append = function (els) {
    if (typeof els === 'string') {
      var el = document.createElement('div');
      el.innerHTML = els;
      els = o3.find(el.children);
    }
    return this.forEach(function (parEl, i) {
      els.forEach(function (childEl) {
        parEl.appendChild(i > 0 ? childEl.cloneNode(true) : childEl);
      });
    });
  };

  Ozone.prototype.prepend = function (els) {
    if (typeof els === 'string') {
      var el = document.createElement('div');
      el.innerHTML = els;
      els = o3.find(el.children);
    }
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
    STARTED: settings.eventPrefix + '.' + settings.dataAttrMenu + '.started',
    COMPLETED: settings.eventPrefix + '.' + settings.dataAttrMenu + '.completed',
    CREATED: settings.eventPrefix + '.' + settings.dataAttrMenu + '.created',
    REMOVED: settings.eventPrefix + '.' + settings.dataAttrMenu + '.removed',
    SHOW: settings.eventPrefix + '.' + settings.dataAttrMenu + '.show',
    HIDE: settings.eventPrefix + '.' + settings.dataAttrMenu + '.hide'

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
  var selector = '[data-' + settings.dataAttr + '="' + settings.dataAttrMenu + '"]';
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
    STARTED: settings.eventPrefix + '.' + settings.dataAttrTabs + '.started',
    COMPLETED: settings.eventPrefix + '.' + settings.dataAttrTabs + '.completed',
    CREATED: settings.eventPrefix + '.' + settings.dataAttrTabs + '.created',
    REMOVED: settings.eventPrefix + '.' + settings.dataAttrTabs + '.removed',
    SHOW: settings.eventPrefix + '.' + settings.dataAttrTabs + '.show',
    HIDE: settings.eventPrefix + '.' + settings.dataAttrTabs + '.hide'

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
          show: 0,
          watch: true
        }
        */
      }
    }

    return this;
  });

  // Create the component
  var create = function create(el, opts) {

    var panels = [];

    // Send the started event
    o3.fireEvent(EVENT.STARTED, el, {});
    console.log('tab', el, opts);

    // Convert element to Ozone object
    var tablist = o3.find(el);

    // Look for any data options in the element to override the default
    var options = tablist.data('ozone-options');
    console.log('ozone-options', options);

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

        if (el.attr('role') !== 'tab') {

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
        }
      });

      // Automatically select the first one
      var selectedIndex = 0;
      var selectedTab = tablist.find(':scope > li');
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

      // Register with the mutation observer to watch for changes
      tablist.mutation('tabs', opts);
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
  var selector = '[data-' + settings.dataAttr + '="' + settings.dataAttrTabs + '"]';
  var elements = o3.find(selector);

  // Automatically setup any element matching the selector
  if (elements.length > 0) {
    o3.find(elements).tabs();
  }
})();

},{}]},{},[1,2,3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxjb3JlLmpzIiwic3JjXFxqc1xccGx1Z2luc1xcbWVudS5qcyIsInNyY1xcanNcXHBsdWdpbnNcXHRhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7Ozs7QUFJQSxDQUFDLFlBQVc7QUFDVixNQUFJLENBQUMsUUFBUSxTQUFSLENBQWtCLE9BQXZCLEVBQWdDO0FBQzlCLFlBQVEsU0FBUixDQUFrQixPQUFsQixHQUE0QixRQUFRLFNBQVIsQ0FBa0IsaUJBQWxCLElBQXVDLFFBQVEsU0FBUixDQUFrQixxQkFBckY7O0FBRUEsUUFBSSxDQUFDLFFBQVEsU0FBUixDQUFrQixPQUF2QixFQUFnQztBQUM5QixjQUFRLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsVUFBVSxFQUFWLEVBQWMsUUFBZCxFQUF3QjtBQUNsRCxZQUFJLFdBQVcsSUFBZjtBQUNBLFlBQUksQ0FBQyxTQUFTLGVBQVQsQ0FBeUIsUUFBekIsQ0FBa0MsRUFBbEMsQ0FBTCxFQUE0QyxPQUFPLElBQVA7QUFDNUMsV0FBRztBQUNELGNBQUksU0FBUyxPQUFULENBQWlCLFFBQWpCLENBQUosRUFBZ0MsT0FBTyxRQUFQO0FBQ2hDLHFCQUFXLFNBQVMsYUFBcEI7QUFDRCxTQUhELFFBR1MsYUFBYSxJQUh0QjtBQUlBLGVBQU8sRUFBUDtBQUNELE9BUkQ7QUFTRDtBQUNGO0FBQ0YsQ0FoQkQsS0FrQkMsWUFBWTtBQUNYLE1BQUksT0FBTyxNQUFNLFNBQU4sQ0FBZ0IsT0FBdkIsS0FBbUMsVUFBdkMsRUFBbUQ7QUFDakQsVUFBTSxTQUFOLENBQWdCLE9BQWhCLEdBQTBCLFVBQVUsSUFBVixFQUFnQjtBQUN4QyxXQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxNQUF6QixFQUFpQyxFQUFFLENBQW5DLEVBQXNDO0FBQ3BDLFlBQUksS0FBSyxDQUFMLE1BQVksSUFBaEIsRUFB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QUksU0FBUyxNQUFULEdBQWtCLENBQXRCLEVBQXlCO0FBQ3ZCLE9BQUcsSUFBSCxDQUFRLFFBQVIsRUFBa0IsSUFBbEI7QUFDRDtBQUVGLENBdE5EIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L2Nsb3Nlc3RcclxuICovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XHJcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yXHJcblxyXG4gICAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XHJcbiAgICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbiAoZWwsIHNlbGVjdG9yKSB7XHJcbiAgICAgICAgdmFyIGFuY2VzdG9yID0gdGhpc1xyXG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGVsKSkgcmV0dXJuIG51bGxcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICBpZiAoYW5jZXN0b3IubWF0Y2hlcyhzZWxlY3RvcikpIHJldHVybiBhbmNlc3RvclxyXG4gICAgICAgICAgYW5jZXN0b3IgPSBhbmNlc3Rvci5wYXJlbnRFbGVtZW50XHJcbiAgICAgICAgfSB3aGlsZSAoYW5jZXN0b3IgIT09IG51bGwpXHJcbiAgICAgICAgcmV0dXJuIGVsXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pKCksXHJcblxyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0eXBlb2YgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IGl0ZW0pIHtcclxuICAgICAgICAgIHJldHVybiBpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAtMVxyXG4gICAgfVxyXG4gIH1cclxufSkoKSxcclxuXHJcbi8qXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9DdXN0b21FdmVudFxyXG4gKi9cclxuKGZ1bmN0aW9uICgpIHtcclxuICBpZiAodHlwZW9mIHdpbmRvdy5DdXN0b21FdmVudCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXHJcblxyXG4gIGZ1bmN0aW9uIEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMpIHtcclxuICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7XHJcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxyXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcclxuICAgICAgZGV0YWlsOiB1bmRlZmluZWRcclxuICAgIH1cclxuICAgIGxldCBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKVxyXG4gICAgZXZ0LmluaXRDdXN0b21FdmVudChldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKVxyXG4gICAgcmV0dXJuIGV2dFxyXG4gIH1cclxuXHJcbiAgQ3VzdG9tRXZlbnQucHJvdG90eXBlID0gd2luZG93LkV2ZW50LnByb3RvdHlwZVxyXG5cclxuICB3aW5kb3cuQ3VzdG9tRXZlbnQgPSBDdXN0b21FdmVudFxyXG59KSgpLFxyXG5cclxuLypcclxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjQ4MTYxMi9xdWVyeXNlbGVjdG9yLXNlYXJjaC1pbW1lZGlhdGUtY2hpbGRyZW4jYW5zd2VyLTE3OTg5ODAzXHJcbiAqL1xyXG4oZnVuY3Rpb24gKGRvYywgcHJvdG8pIHtcclxuICB0cnkge1xyXG4gICAgZG9jLnF1ZXJ5U2VsZWN0b3IoJzpzY29wZSBib2R5JylcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIFsncXVlcnlTZWxlY3RvcicsICdxdWVyeVNlbGVjdG9yQWxsJ10uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XHJcbiAgICAgIGxldCBuYXRpdmUgPSBwcm90b1ttZXRob2RdXHJcbiAgICAgIHByb3RvW21ldGhvZF0gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcclxuICAgICAgICBpZiAoLyhefCwpXFxzKjpzY29wZS8udGVzdChzZWxlY3RvcikpIHtcclxuICAgICAgICAgIGxldCBpZCA9IHRoaXMuaWRcclxuICAgICAgICAgIHRoaXMuaWQgPSAnSURfJyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoLygoXnwsKVxccyopOnNjb3BlL2csICckMSMnICsgdGhpcy5pZClcclxuICAgICAgICAgIGxldCByZXN1bHQgPSBkb2NbbWV0aG9kXShzZWxlY3RvcilcclxuICAgICAgICAgIHRoaXMuaWQgPSBpZFxyXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gbmF0aXZlLmNhbGwodGhpcywgc2VsZWN0b3IpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxufSkod2luZG93LmRvY3VtZW50LCBFbGVtZW50LnByb3RvdHlwZSksXHJcblxyXG4vKlxyXG4gKiBPem9uZSBpcyBiYXNlZCBvbiB0aGUgd29yayBvZiBBbmRyZXcgQnVyZ2Vzc1xyXG4gKiBcclxuICogaHR0cHM6Ly9naXRodWIuY29tL2FuZHJldzgwODgvZG9tZS9ibG9iL21hc3Rlci9zcmMvZG9tZS5qc1xyXG4gKi9cclxud2luZG93Lm8zID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgY29uc3QgVkVSU0lPTiA9ICcwLjAuMSdcclxuXHJcbiAgbGV0IF9zZXR0aW5ncyA9IHtcclxuICAgIHNob3dDb25zb2xlOiBmYWxzZSxcclxuICAgIGV2ZW50UHJlZml4OiAnbzMnLFxyXG4gICAgZGF0YUF0dHI6ICdvem9uZScsXHJcbiAgICBkYXRhQXR0clRhYnM6ICd0YWJzJyxcclxuICAgIGRhdGFBdHRyTWVudTogJ21lbnUnXHJcbiAgfVxyXG5cclxuICBsZXQgX3N5c3RlbSA9IHtcclxuICAgIGJyb3dzZXI6IHtcclxuICAgICAgbGFuZzogbmF2aWdhdG9yLmxhbmd1YWdlLFxyXG4gICAgICBvczogbmF2aWdhdG9yLnBsYXRmb3JtLFxyXG4gICAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgsXHJcbiAgICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHRcclxuICAgIH0sXHJcbiAgICBzY3JlZW46IHtcclxuICAgICAgYml0OiBzY3JlZW4uY29sb3JEZXB0aCxcclxuICAgICAgd2lkdGg6IHNjcmVlbi53aWR0aCxcclxuICAgICAgaGVpZ2h0OiBzY3JlZW4uaGVpZ2h0XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcclxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3JcclxuICB9XHJcblxyXG4gIGxldCBzdHlsZXMgPSB7XHJcbiAgICAnc3RhcnQnOiAnYmFja2dyb3VuZDogYmx1ZTsgY29sb3I6IHdoaXRlOyBwYWRkaW5nOiAzcHggMTBweDsgZGlzcGxheTogYmxvY2s7JyxcclxuICAgICdlbmQnOiAnYmFja2dyb3VuZDogYmxhY2s7IGNvbG9yOiB3aGl0ZTsgcGFkZGluZzogM3B4IDEwcHg7IGRpc3BsYXk6IGJsb2NrOycsXHJcbiAgICAnbG9nJzogJ2NvbG9yOiBncmVlbjsgcGFkZGluZzogM3B4IDEwcHg7IGRpc3BsYXk6IGJsb2NrOycsXHJcbiAgICAnZXJyb3InOiAnY29sb3I6IHJlZDsgcGFkZGluZzogM3B4IDEwcHg7IGRpc3BsYXk6IGJsb2NrOydcclxuICB9XHJcblxyXG4gIC8vIEludGVybmFsIGRlYm91bmNlIGhhbmRsZXJcclxuICBsZXQgZGVib3VuY2UgPSBmdW5jdGlvbiAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XHJcbiAgICBsZXQgdGltZW91dFxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzXHJcbiAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzXHJcbiAgICAgIGxldCBsYXRlciA9ICgpID0+IHtcclxuICAgICAgICB0aW1lb3V0ID0gbnVsbFxyXG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XHJcbiAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxyXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcclxuICAgICAgaWYgKGNhbGxOb3cpIHtcclxuICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFdpbmRvdyByZXNpemVcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgX3N5c3RlbS5icm93c2VyLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGhcclxuICAgIF9zeXN0ZW0uYnJvd3Nlci5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodFxyXG4gIH0sIDI1MCkpXHJcblxyXG4gIGxldCBPem9uZSA9IGZ1bmN0aW9uIChlbHMpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHRoaXNbaV0gPSBlbHNbaV1cclxuICAgIH1cclxuICAgIHRoaXMubGVuZ3RoID0gZWxzLmxlbmd0aFxyXG4gIH1cclxuXHJcbiAgLyogPT09PT09PT09PT09PT09PT1cclxuICAgKiBNdXRhdGlvbiBPYnNlcnZlclxyXG4gICAqID09PT09PT09PT09PT09PT09XHJcbiAgICovXHJcblxyXG4gIGxldCBNdXRhdGlvbk9ic2VydmVyID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93Lk1vek11dGF0aW9uT2JzZXJ2ZXJcclxuXHJcbiAgbGV0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xyXG4gICAgbXV0YXRpb25zLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdtdXRhdGlvbicsIG11dGF0aW9uKVxyXG4gICAgfSlcclxuICB9KVxyXG4gIGxldCBvYnNlcnZlckNvbmZpZyA9IHtcclxuICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgIHN1YnRyZWU6IHRydWVcclxuICB9XHJcblxyXG4gIGxldCBtdXRhdGlvbkVsZW1lbnRzID0gW11cclxuXHJcbiAgLyogPT09PT1cclxuICAgKiBVVElMU1xyXG4gICAqID09PT09XHJcbiAgICovXHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLm1hcChjYWxsYmFjaylcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICBsZXQgcmVzdWx0cyA9IFtdXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgcmVzdWx0cy5wdXNoKGNhbGxiYWNrLmNhbGwodGhpcywgdGhpc1tpXSwgaSkpXHJcbiAgICB9XHJcbiAgICAvL3JldHVybiByZXN1bHRzLmxlbmd0aCA+IDEgPyByZXN1bHRzIDogcmVzdWx0c1swXVxyXG4gICAgcmV0dXJuIHJlc3VsdHNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5tYXBPbmUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIGxldCBtID0gdGhpcy5tYXAoY2FsbGJhY2spXHJcbiAgICByZXR1cm4gbS5sZW5ndGggPiAxID8gbSA6IG1bMF1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5tdXRhdGlvbiA9IGZ1bmN0aW9uIChoYW5kbGVyLCBvcHRpb25zKSB7XHJcbiAgICBtdXRhdGlvbkVsZW1lbnRzLnB1c2goe1xyXG4gICAgICB0YXJnZXQ6IHRoaXMsXHJcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXHJcbiAgICAgIGhhbmRsZXI6IGhhbmRsZXJcclxuICAgIH0pXHJcbiAgICBjb25zb2xlLmxvZygnbXV0YXRpb25FbGVtZW50cycsIG11dGF0aW9uRWxlbWVudHMpXHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBvYnNlcnZlci5vYnNlcnZlKGVsLCBvYnNlcnZlckNvbmZpZylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucmVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgbGV0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHJlY3QueCxcclxuICAgICAgICB5OiByZWN0LnksXHJcbiAgICAgICAgdG9wOiByZWN0LnRvcCxcclxuICAgICAgICBib3R0b206IHJlY3QuYm90dG9tLFxyXG4gICAgICAgIGxlZnQ6IHJlY3QubGVmdCxcclxuICAgICAgICByaWdodDogcmVjdC5yaWdodCxcclxuICAgICAgICB3aWR0aDogcmVjdC53aWR0aCxcclxuICAgICAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxyXG4gICAgICAgIG9mZnNldFRvcDogZWwub2Zmc2V0VG9wLFxyXG4gICAgICAgIG9mZnNldExlZnQ6IGVsLm9mZnNldExlZnQsXHJcbiAgICAgICAgb2Zmc2V0V2lkdGg6IGVsLm9mZnNldFdpZHRoLFxyXG4gICAgICAgIG9mZnNldEhlaWdodDogZWwub2Zmc2V0SGVpZ2h0LFxyXG4gICAgICAgIGhpZGRlbjogZWwuaGlkZGVuXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKiA9PT09PT09PT09PT09PT09XHJcbiAgICogRE9NIE1BTklQVUxBVElPTlxyXG4gICAqID09PT09PT09PT09PT09PT1cclxuICAgKi9cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGkpIHtcclxuICAgIGlmICh0aGlzW2ldICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIG8zLmZpbmQodGhpc1tpXSlcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICBpZiAodHlwZW9mIHRleHQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZWwuaW5uZXJUZXh0ID0gdGV4dFxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBlbC5pbm5lclRleHRcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24gKGh0bWwpIHtcclxuICAgIGlmICh0eXBlb2YgaHRtbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBlbC5pbm5lckhUTUwgPSBodG1sXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsLmlubmVySFRNTFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmFkZENsYXNzID0gZnVuY3Rpb24gKGNsYXNzZXMpIHtcclxuICAgIGxldCBjbGFzc05hbWUgPSAnJ1xyXG4gICAgaWYgKHR5cGVvZiBjbGFzc2VzICE9PSAnc3RyaW5nJykge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBjbGFzc05hbWUgKz0gJyAnICsgY2xhc3Nlc1tpXVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjbGFzc05hbWUgPSAnICcgKyBjbGFzc2VzXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBlbC5jbGFzc05hbWUgKz0gY2xhc3NOYW1lXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGNscykge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgbGV0IGNzID0gZWwuY2xhc3NOYW1lLnNwbGl0KC9cXHMrLylcclxuICAgICAgbGV0IGlcclxuXHJcbiAgICAgIHdoaWxlICgoaSA9IGNzLmluZGV4T2YoY2xzKSkgPiAtMSkge1xyXG4gICAgICAgIGNzID0gY3Muc2xpY2UoMCwgaSkuY29uY2F0KGNzLnNsaWNlKCsraSkpXHJcbiAgICAgIH1cclxuICAgICAgZWwuY2xhc3NOYW1lID0gY3Muam9pbignICcpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIGF0dHIgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIC8vIE9iamVjdCBpbnN0ZWFkIG9mIHN0cmluZ1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBhdHRyKSB7XHJcbiAgICAgICAgICBpZiAoYXR0ci5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXkudG9TdHJpbmcoKSwgYXR0cltrZXldKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFN0cmluZyBpbnN0ZWFkIG9mIG9iamVjdFxyXG4gICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsIHZhbClcclxuICAgICAgICB9KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICAgIHJldHVybiBlbC5nZXRBdHRyaWJ1dGUoYXR0cilcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuY3NzID0gZnVuY3Rpb24gKGF0dHIsIHZhbCkge1xyXG4gICAgaWYgKHR5cGVvZiBhdHRyID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAvLyBPYmplY3QgaW5zdGVhZCBvZiBzdHJpbmdcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXR0cikge1xyXG4gICAgICAgICAgaWYgKGF0dHIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBlbC5zdHlsZVtrZXkudG9TdHJpbmcoKV0gPSBhdHRyW2tleV1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBTdHJpbmcgaW5zdGVhZCBvZiBvYmplY3RcclxuICAgICAgaWYgKHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLnN0eWxlW2F0dHJdID0gdmFsXHJcbiAgICAgICAgfSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB3aW4gPSBlbC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3XHJcbiAgICAgICAgICByZXR1cm4gd2luLmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpW2F0dHJdXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmRhdGEgPSBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGF0dHIsIHZhbClcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBhdHRyKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uIChlbHMpIHtcclxuICAgIGlmICh0eXBlb2YgZWxzID09PSAnc3RyaW5nJykge1xyXG4gICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbC5pbm5lckhUTUwgPSBlbHNcclxuICAgICAgZWxzID0gbzMuZmluZChlbC5jaGlsZHJlbilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKHBhckVsLCBpKSA9PiB7XHJcbiAgICAgIGVscy5mb3JFYWNoKChjaGlsZEVsKSA9PiB7XHJcbiAgICAgICAgcGFyRWwuYXBwZW5kQ2hpbGQoKGkgPiAwKSA/IGNoaWxkRWwuY2xvbmVOb2RlKHRydWUpIDogY2hpbGRFbClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucHJlcGVuZCA9IGZ1bmN0aW9uIChlbHMpIHtcclxuICAgIGlmICh0eXBlb2YgZWxzID09PSAnc3RyaW5nJykge1xyXG4gICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbC5pbm5lckhUTUwgPSBlbHNcclxuICAgICAgZWxzID0gbzMuZmluZChlbC5jaGlsZHJlbilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKHBhckVsLCBpKSA9PiB7XHJcbiAgICAgIGZvciAobGV0IGogPSBlbHMubGVuZ3RoIC0gMTsgaiA+IC0xOyBqLS0pIHtcclxuICAgICAgICBwYXJFbC5pbnNlcnRCZWZvcmUoKGkgPiAwKSA/IGVsc1tqXS5jbG9uZU5vZGUodHJ1ZSkgOiBlbHNbal0sIHBhckVsLmZpcnN0Q2hpbGQpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgcmV0dXJuIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2dCwgZm4sIGZhbHNlKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyBldnQsIGZuKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbFsnb24nICsgZXZ0XSA9IGZuXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0oKSlcclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm9mZiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGZuLCBmYWxzZSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmRldGFjaEV2ZW50KSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgZXZ0LCBmbilcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKmVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzKi9cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgLyplc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzKi9cclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWxbJ29uJyArIGV2dF0gPSBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0oKSlcclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcclxuICAgIHJldHVybiBvMy5maW5kKHNlbGVjdG9yLCBjb250ZXh0LCB0aGlzWzBdKVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgbGV0IGFuY2VzdG9yID0gdGhpc1swXVxyXG4gICAgZG8ge1xyXG4gICAgICBpZiAoYW5jZXN0b3IubWF0Y2hlcyhzZWxlY3RvcikpIHtcclxuICAgICAgICByZXR1cm4gbzMuZmluZChhbmNlc3RvcilcclxuICAgICAgfVxyXG4gICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudE5vZGVcclxuICAgIH0gd2hpbGUgKGFuY2VzdG9yICE9PSBudWxsKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgZWwgPSB0aGlzWzBdXHJcbiAgICB3aGlsZSAoKGVsID0gZWwucHJldmlvdXNTaWJsaW5nKSkge1xyXG4gICAgICBpZiAoZWwubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gbzMuZmluZChlbClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgZWwgPSB0aGlzWzBdXHJcbiAgICB3aGlsZSAoKGVsID0gZWwubmV4dFNpYmxpbmcpKSB7XHJcbiAgICAgIGlmIChlbC5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgIHJldHVybiBvMy5maW5kKGVsKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzWzBdLmZvY3VzKClcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIG8zLmZpcmVFdmVudCh0eXBlLCBlbClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBsZXQgbzMgPSB7XHJcbiAgICBmaW5kOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQsIHBhcmVudCkge1xyXG4gICAgICBsZXQgZWxzXHJcbiAgICAgIGlmIChjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHRbMF1cclxuICAgICAgfSBcclxuICAgICAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCAmJiBwYXJlbnQpIHtcclxuICAgICAgICBjb250ZXh0ID0gcGFyZW50XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBlbHMgPSBzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGUgfHwgc2VsZWN0b3IgaW5zdGFuY2VvZiBXaW5kb3cgPyBbc2VsZWN0b3JdIDogW10uc2xpY2UuY2FsbCh0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZycgPyAoY29udGV4dCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOiBzZWxlY3RvciB8fCBbXSlcclxuICAgICAgfSBlbHNlIGlmIChzZWxlY3Rvci5sZW5ndGgpIHtcclxuICAgICAgICBlbHMgPSBzZWxlY3RvclxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVscyA9IFtzZWxlY3Rvcl1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3IE96b25lKGVscylcclxuICAgIH0sXHJcbiAgICBjcmVhdGU6ICh0YWdOYW1lLCBhdHRycykgPT4ge1xyXG4gICAgICBsZXQgZWwgPSBuZXcgT3pvbmUoW2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSldKVxyXG4gICAgICBpZiAoYXR0cnMpIHtcclxuICAgICAgICBpZiAoYXR0cnMuY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICBlbC5hZGRDbGFzcyhhdHRycy5jbGFzc05hbWUpXHJcbiAgICAgICAgICBkZWxldGUgYXR0cnMuY2xhc3NOYW1lXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhdHRycy50ZXh0KSB7XHJcbiAgICAgICAgICBlbC50ZXh0KGF0dHJzLnRleHQpXHJcbiAgICAgICAgICBkZWxldGUgYXR0cnMudGV4dFxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXR0cnMpIHtcclxuICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGVsLmF0dHIoa2V5LCBhdHRyc1trZXldKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZWxcclxuICAgIH0sXHJcbiAgICBzZXR0aW5nczogKG9wdHMpID0+IHtcclxuICAgICAgaWYgKHR5cGVvZiBvcHRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIGZvciAobGV0IGkgaW4gX3NldHRpbmdzKSB7XHJcbiAgICAgICAgICBpZiAoX3NldHRpbmdzW2ldICYmIG9wdHNbaV0pIHtcclxuICAgICAgICAgICAgX3NldHRpbmdzW2ldID0gb3B0c1tpXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKF9zZXR0aW5ncy5zaG93Q29uc29sZSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJyVjT1pPTkU6IE5ldyBvcHRpb25zJywgc3R5bGVzLmxvZylcclxuICAgICAgICAgIGNvbnNvbGUubG9nKF9zZXR0aW5ncylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIF9zZXR0aW5nc1xyXG4gICAgfSxcclxuICAgIGV4dDogKG5hbWUsIGZuKSA9PiB7XHJcbiAgICAgIGlmICh0eXBlb2YgT3pvbmUucHJvdG90eXBlW25hbWVdID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIE96b25lLnByb3RvdHlwZVtuYW1lXSA9IGZuXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaXJlRXZlbnQ6IGZ1bmN0aW9uICh0eXBlLCBlbCwgb2JqKSB7XHJcbiAgICAgIGxldCBldnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xyXG4gICAgICAgIGRldGFpbDogb2JqLFxyXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgY2FuY2VsYWJsZTogZmFsc2VcclxuICAgICAgfSlcclxuICAgICAgZWwuZGlzcGF0Y2hFdmVudChldnQpXHJcbiAgICB9LFxyXG4gICAgcmVhZHk6IGZ1bmN0aW9uIChmbikge1xyXG4gICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKSB7XHJcbiAgICAgICAgZm4oKVxyXG4gICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9ICdsb2FkaW5nJylcclxuICAgICAgICAgICAgZm4oKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzeXN0ZW06IF9zeXN0ZW0sXHJcbiAgICB2ZXJzaW9uOiBWRVJTSU9OXHJcbiAgfVxyXG5cclxuICByZXR1cm4gbzNcclxufSgpKVxyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gIC8qKlxyXG4gICAqIE1FTlVcclxuICAgKi9cclxuXHJcbiAgLy8gS2VlcCBpdCBzaW1wbGVcclxuICBsZXQgbzMgPSB3aW5kb3cubzNcclxuICBsZXQgc2V0dGluZ3MgPSBvMy5zZXR0aW5ncygpXHJcblxyXG4gIC8vIENvbXBvbmVudCBldmVudHNcclxuICBjb25zdCBFVkVOVCA9IHtcclxuICAgIFNUQVJURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyTWVudX0uc3RhcnRlZGAsXHJcbiAgICBDT01QTEVURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyTWVudX0uY29tcGxldGVkYCxcclxuICAgIENSRUFURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyTWVudX0uY3JlYXRlZGAsXHJcbiAgICBSRU1PVkVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0ck1lbnV9LnJlbW92ZWRgLFxyXG4gICAgU0hPVzogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJNZW51fS5zaG93YCxcclxuICAgIEhJREU6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyTWVudX0uaGlkZWAsXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgdGhlIG1lbnUgZXh0ZW5zaW9uOiAndGhpcycgaXMgaW5oZXJpdGVkIGZyb20gdGhlIE96b25lIHByb3RvdHlwZSAobm90IG8zKVxyXG4gIG8zLmV4dCgnbWVudScsIGZ1bmN0aW9uIChvcHRzID0gJ2NyZWF0ZScpIHtcclxuICAgIGxldCBlbG1zID0gdGhpc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbG1zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGxldCBlbCA9IGVsbXNbaV1cclxuXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAvLyBDcmVhdGUgb3IgZGVzdHJveVxyXG4gICAgICAgIHN3aXRjaCAob3B0cykge1xyXG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcclxuICAgICAgICAgICAgY3JlYXRlKGVsLCBvcHRzKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgY2FzZSAnZGVzdHJveSc6XHJcbiAgICAgICAgICAgIGRlc3Ryb3koZWwpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIENyZWF0ZSB3aXRoL2NoYW5nZSBvcHRpb25zXHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NyZWF0ZSB3aXRoL2NoYW5nZSBvcHRpb25zJywgb3B0cylcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICB7XHJcbiAgICAgICAgICBmaXQ6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgICovXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG5cclxuICAvLyBDcmVhdGUgdGhlIGNvbXBvbmVudFxyXG4gIGxldCBjcmVhdGUgPSBmdW5jdGlvbiAoZWwsIG9wdHMpIHtcclxuXHJcbiAgICBvMy5maXJlRXZlbnQoRVZFTlQuU1RBUlRFRCwgZWwsIHt9KVxyXG4gICAgY29uc29sZS5sb2coJ21lbnUnLCBlbCwgb3B0cylcclxuXHJcbiAgICBpZiAoc2V0dGluZ3Muc2hvd0NvbnNvbGUpIHtcclxuICAgICAgY29uc29sZS5sb2coJyVjTWVudSBjcmVhdGVkJywgc2V0dGluZ3Muc3R5bGUubG9nKVxyXG4gICAgfVxyXG5cclxuICAgIG8zLmZpcmVFdmVudChFVkVOVC5DT01QTEVURUQsIGVsLCB7fSlcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSB0aGUgY29tcG9uZW50XHJcbiAgbGV0IGRlc3Ryb3kgPSBmdW5jdGlvbiAoZWwpIHtcclxuICAgIGNvbnNvbGUubG9nKCdkZXN0cm95JywgZWwpXHJcbiAgfVxyXG5cclxuICAvLyBQcmVwYXJlIGRhdGEgc2VsZWN0b3JcclxuICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtJHtzZXR0aW5ncy5kYXRhQXR0cn09XCIke3NldHRpbmdzLmRhdGFBdHRyTWVudX1cIl1gXHJcbiAgbGV0IGVsZW1lbnRzID0gbzMuZmluZChzZWxlY3RvcilcclxuXHJcbiAgLy8gQXV0b21hdGljYWxseSBzZXR1cCBhbnkgZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3JcclxuICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgbzMuZmluZChlbGVtZW50cykubWVudSgpXHJcbiAgfVxyXG5cclxufSkoKSIsIihmdW5jdGlvbiAoKSB7XHJcbiAgLyoqXHJcbiAgICogVEFCU1xyXG4gICAqL1xyXG5cclxuICAvLyBLZWVwIGl0IHNpbXBsZVxyXG4gIGxldCBvMyA9IHdpbmRvdy5vM1xyXG4gIGxldCBzZXR0aW5ncyA9IG8zLnNldHRpbmdzKClcclxuXHJcbiAgLy8gQ29tcG9uZW50IGV2ZW50c1xyXG4gIGNvbnN0IEVWRU5UID0ge1xyXG4gICAgU1RBUlRFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJUYWJzfS5zdGFydGVkYCxcclxuICAgIENPTVBMRVRFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJUYWJzfS5jb21wbGV0ZWRgLFxyXG4gICAgQ1JFQVRFRDogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJUYWJzfS5jcmVhdGVkYCxcclxuICAgIFJFTU9WRUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke3NldHRpbmdzLmRhdGFBdHRyVGFic30ucmVtb3ZlZGAsXHJcbiAgICBTSE9XOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtzZXR0aW5ncy5kYXRhQXR0clRhYnN9LnNob3dgLFxyXG4gICAgSElERTogYCR7c2V0dGluZ3MuZXZlbnRQcmVmaXh9LiR7c2V0dGluZ3MuZGF0YUF0dHJUYWJzfS5oaWRlYCxcclxuICB9XHJcblxyXG4gIC8vIEFkZCB0aGUgdGFicyBleHRlbnNpb246ICd0aGlzJyBpcyBpbmhlcml0ZWQgZnJvbSB0aGUgT3pvbmUgcHJvdG90eXBlIChub3QgbzMpXHJcbiAgbzMuZXh0KCd0YWJzJywgZnVuY3Rpb24gKG9wdHMgPSAnY3JlYXRlJykge1xyXG4gICAgbGV0IGVsbXMgPSB0aGlzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsbXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgbGV0IGVsID0gZWxtc1tpXVxyXG5cclxuICAgICAgaWYgKHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIC8vIENyZWF0ZSBvciBkZXN0cm95XHJcbiAgICAgICAgc3dpdGNoIChvcHRzKSB7XHJcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxyXG4gICAgICAgICAgICBjcmVhdGUoZWwsIG9wdHMpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICBjYXNlICdkZXN0cm95JzpcclxuICAgICAgICAgICAgZGVzdHJveShlbClcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHdpdGgvY2hhbmdlIG9wdGlvbnNcclxuICAgICAgICBjb25zb2xlLmxvZygnY3JlYXRlIHdpdGgvY2hhbmdlIG9wdGlvbnMnLCBvcHRzKVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGZpdDogZmFsc2UsXHJcbiAgICAgICAgICBzaG93OiAwLFxyXG4gICAgICAgICAgd2F0Y2g6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgKi9cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfSlcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBjb21wb25lbnRcclxuICBsZXQgY3JlYXRlID0gZnVuY3Rpb24gKGVsLCBvcHRzKSB7XHJcblxyXG4gICAgbGV0IHBhbmVscyA9IFtdXHJcblxyXG4gICAgLy8gU2VuZCB0aGUgc3RhcnRlZCBldmVudFxyXG4gICAgbzMuZmlyZUV2ZW50KEVWRU5ULlNUQVJURUQsIGVsLCB7fSlcclxuICAgIGNvbnNvbGUubG9nKCd0YWInLCBlbCwgb3B0cylcclxuXHJcbiAgICAvLyBDb252ZXJ0IGVsZW1lbnQgdG8gT3pvbmUgb2JqZWN0XHJcbiAgICBsZXQgdGFibGlzdCA9IG8zLmZpbmQoZWwpXHJcblxyXG4gICAgLy8gTG9vayBmb3IgYW55IGRhdGEgb3B0aW9ucyBpbiB0aGUgZWxlbWVudCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdFxyXG4gICAgbGV0IG9wdGlvbnMgPSB0YWJsaXN0LmRhdGEoJ296b25lLW9wdGlvbnMnKVxyXG4gICAgY29uc29sZS5sb2coJ296b25lLW9wdGlvbnMnLCBvcHRpb25zKVxyXG5cclxuICAgIGlmICh0YWJsaXN0LmF0dHIoJ3JvbGUnKSAhPT0gJ3RhYmxpc3QnKSB7XHJcbiAgICBcclxuICAgICAgLy8gQXNzaWduIHRoZSB0YWJsaXN0IHJvbGVcclxuICAgICAgdGFibGlzdC5hdHRyKHtcclxuICAgICAgICByb2xlOiAndGFibGlzdCdcclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIExpc3QgaXRlbXMgYXJlIHByZXNlbnRhdGlvbiBvbmx5XHJcbiAgICAgIHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGknKS5hdHRyKHtcclxuICAgICAgICByb2xlOiAncHJlc2VudGF0aW9uJ1xyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gQ29ubmVjdCBlYWNoIGxpbmsgdG8gdGhlaXIgZWxlbWVudFxyXG4gICAgICB0YWJsaXN0LmZpbmQoJzpzY29wZSA+IGxpIGEnKS5mb3JFYWNoKChlbCkgPT4ge1xyXG5cclxuICAgICAgICBlbCA9IG8zLmZpbmQoZWwpXHJcblxyXG4gICAgICAgIGlmIChlbC5hdHRyKCdyb2xlJykgIT09ICd0YWInKSB7XHJcblxyXG4gICAgICAgICAgZWwuYXR0cih7XHJcbiAgICAgICAgICAgIHJvbGU6ICd0YWInLFxyXG4gICAgICAgICAgICB0YWJpbmRleDogJy0xJyxcclxuICAgICAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBlbC5hdHRyKCdocmVmJykuc3Vic3RyaW5nKDEpXHJcbiAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgIGVsLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBsZXQgdGFiID0gbzMuZmluZChldmVudC50YXJnZXQpXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBSZXNldCB0aGUgdGFic1xyXG4gICAgICAgICAgICB0YWJsaXN0LmZpbmQoJzpzY29wZSA+IGxpIFtyb2xlPVwidGFiXCJdJykuYXR0cih7XHJcbiAgICAgICAgICAgICAgdGFiaW5kZXg6ICctMScsXHJcbiAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBudWxsXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGN1cnJlbnQgb25lXHJcbiAgICAgICAgICAgIHRhYi5hdHRyKHtcclxuICAgICAgICAgICAgICB0YWJpbmRleDogJzAnLFxyXG4gICAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgLy8gUmVzZXQgdGhlIHBhbmVsc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgaW1heCA9IHBhbmVscy5sZW5ndGg7IGkgPCBpbWF4OyArK2kpIHtcclxuICAgICAgICAgICAgICBsZXQgcGFuZWwgPSBvMy5maW5kKHBhbmVsc1tpXSlcclxuICAgICAgICAgICAgICBwYW5lbC5hdHRyKHtcclxuICAgICAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWVcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTaG93IHRoZSBjb3JyZWN0IHBhbmVsXHJcbiAgICAgICAgICAgIG8zLmZpbmQoZWwuYXR0cignaHJlZicpKS5hdHRyKHtcclxuICAgICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiBudWxsXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAvLyBLZXlib2FyZCBpbnRlcmFjdGlvblxyXG4gICAgICAgICAgZWwub24oJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBvMy5maW5kKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW3JvbGU9XCJ0YWJsaXN0XCJdJykuZmluZCgnW2FyaWEtc2VsZWN0ZWQ9XCJ0cnVlXCJdJylcclxuICAgICAgICAgICAgbGV0IHByZXYgPSBzZWxlY3RlZC5jbG9zZXN0KCdsaScpLnByZXYoKS5maW5kKCdbcm9sZT1cInRhYlwiXScpXHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gc2VsZWN0ZWQuY2xvc2VzdCgnbGknKS5uZXh0KCkuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgY2FzZSAzNzpcclxuICAgICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gcHJldlxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICBjYXNlIDM5OlxyXG4gICAgICAgICAgICAgIGNhc2UgNDA6XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBuZXh0XHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICB0YXJnZXQuZm9jdXMoKS50cmlnZ2VyKCdjbGljaycpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgLy8gU2V0IHRoZSB0YWIgcGFuZWwgcm9sZVxyXG4gICAgICAgICAgbGV0IHBhbmVsID0gbzMuZmluZChlbC5hdHRyKCdocmVmJykpXHJcbiAgICAgICAgICBwYW5lbC5hdHRyKHtcclxuICAgICAgICAgICAgcm9sZTogJ3RhYnBhbmVsJ1xyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAvLyBNYWtlIHRoZSBmaXJzdCBjaGlsZCBvZiB0aGUgdGFicGFuZWwgZm9jdXNhYmxlXHJcbiAgICAgICAgICBsZXQgZmlyc3RFbCA9IChwYW5lbFswXS5jaGlsZHJlbi5sZW5ndGggPiAwKSA/IG8zLmZpbmQocGFuZWxbMF0uY2hpbGRyZW5bMF0pIDogcGFuZWxcclxuICAgICAgICAgIGZpcnN0RWwuYXR0cih7XHJcbiAgICAgICAgICAgIHRhYmluZGV4OiAnMCdcclxuICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgLy8gU2F2ZSBmb3IgbGF0ZXJcclxuICAgICAgICAgIHBhbmVscy5wdXNoKHBhbmVsKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIEF1dG9tYXRpY2FsbHkgc2VsZWN0IHRoZSBmaXJzdCBvbmVcclxuICAgICAgbGV0IHNlbGVjdGVkSW5kZXggPSAwXHJcbiAgICAgIGxldCBzZWxlY3RlZFRhYiA9IHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGknKVxyXG4gICAgICBzZWxlY3RlZFRhYiA9IG8zLmZpbmQoc2VsZWN0ZWRUYWJbc2VsZWN0ZWRJbmRleF0pLmZpbmQoJzpzY29wZSA+IGEnKVxyXG4gICAgICBzZWxlY3RlZFRhYi5hdHRyKHtcclxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJyxcclxuICAgICAgICB0YWJpbmRleDogJzAnXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBIaWRlIGFsbCBwYW5lbHMgKGV4Y2VwdCBmb3IgdGhlIHNlbGVjdGVkIHBhbmVsKVxyXG4gICAgICBmb3IgKGxldCBpID0gMCwgaW1heCA9IHBhbmVscy5sZW5ndGg7IGkgPCBpbWF4OyArK2kpIHtcclxuICAgICAgICBsZXQgcGFuZWwgPSBvMy5maW5kKHBhbmVsc1tpXSlcclxuICAgICAgICBpZiAoaSAhPT0gc2VsZWN0ZWRJbmRleCkge1xyXG4gICAgICAgICAgcGFuZWwuYXR0cih7XHJcbiAgICAgICAgICAgICdhcmlhLWhpZGRlbic6IHRydWVcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZWdpc3RlciB3aXRoIHRoZSBtdXRhdGlvbiBvYnNlcnZlciB0byB3YXRjaCBmb3IgY2hhbmdlc1xyXG4gICAgICB0YWJsaXN0Lm11dGF0aW9uKCd0YWJzJywgb3B0cylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2V0dGluZ3Muc2hvd0NvbnNvbGUpIHtcclxuICAgICAgY29uc29sZS5sb2coJyVjVGFicyBjcmVhdGVkJywgc2V0dGluZ3Muc3R5bGUubG9nKVxyXG4gICAgfVxyXG5cclxuICAgIG8zLmZpcmVFdmVudChFVkVOVC5DT01QTEVURUQsIGVsLCB7fSlcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSB0aGUgY29tcG9uZW50XHJcbiAgbGV0IGRlc3Ryb3kgPSBmdW5jdGlvbiAoZWwpIHtcclxuICAgIGNvbnNvbGUubG9nKCdkZXN0cm95JywgZWwpXHJcbiAgfVxyXG5cclxuICAvLyBQcmVwYXJlIGRhdGEgc2VsZWN0b3JcclxuICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtJHtzZXR0aW5ncy5kYXRhQXR0cn09XCIke3NldHRpbmdzLmRhdGFBdHRyVGFic31cIl1gXHJcbiAgbGV0IGVsZW1lbnRzID0gbzMuZmluZChzZWxlY3RvcilcclxuXHJcbiAgLy8gQXV0b21hdGljYWxseSBzZXR1cCBhbnkgZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3JcclxuICBpZiAoZWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgbzMuZmluZChlbGVtZW50cykudGFicygpXHJcbiAgfVxyXG5cclxufSkoKSJdfQ==
