(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

  // Internal debounce handler
  var debounce = function debounce(func, wait, immediate) {
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
      triggerMutationHandler(mutation.target);
    });
  });
  var observerConfig = {
    childList: true,
    subtree: true
  };

  var mutationElements = [];

  function isMutationUnique(el) {
    return mutationElements.filter(function (obj) {
      return el[0].isEqualNode(obj.target[0]);
    });
  }

  function triggerMutationHandler(el) {
    mutationElements.filter(function (obj) {
      if (el.isEqualNode(obj.target[0])) {
        obj.target[obj.handler](obj.options);
      }
    });
  }

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
    if (isMutationUnique(this)) {
      mutationElements.push({
        target: this,
        options: options,
        handler: handler
      });
      return this.forEach(function (el) {
        observer.observe(el, observerConfig);
      });
    }
    return this;
  };

  Ozone.prototype.removeMutation = function (handler) {
    var _this = this;

    if (isMutationUnique(this)) {
      mutationElements.filter(function (obj) {
        console.log(obj, _this, handler);
      });
      /* return this.forEach((el) => {
        observer.observe(el, observerConfig)
      }) */
    }
    return this;
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
            if (attr[key] === null) {
              el.removeAttribute(key.toString());
            } else {
              el.setAttribute(key.toString(), attr[key]);
            }
          }
        }
      });
    } else {
      // String instead of object
      if (typeof val !== 'undefined') {
        return this.forEach(function (el) {
          if (val === null) {
            el.removeAttribute(attr);
          } else {
            el.setAttribute(attr, val);
          }
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

  Ozone.prototype.siblings = function () {
    var current = this[0];
    var parent = current.parentNode;
    var siblings = [];
    for (var i = 0, imax = parent.children.length; i < imax; ++i) {
      var el = parent.children[i];
      if (!el.isEqualNode(current)) {
        siblings.push(el);
      }
    }
    return new Ozone(siblings);
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
    settings: function settings() {
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
    optionsToJSON: function optionsToJSON(string) {
      string = string.replace(/\s/g, '');
      string = string.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');
      return JSON.parse(string);
    },
    system: _system,
    version: VERSION
  };

  return o3;
}();

},{}],2:[function(require,module,exports){
"use strict";

},{}],3:[function(require,module,exports){
'use strict';

(function () {
  /**
   * TABS
   */

  // Keep it simple
  var o3 = window.o3;
  var settings = o3.settings();
  var component = settings.dataAttrTabs;

  // Component events
  var EVENT = {
    STARTED: settings.eventPrefix + '.' + component + '.started',
    COMPLETED: settings.eventPrefix + '.' + component + '.completed',
    CREATED: settings.eventPrefix + '.' + component + '.created',
    DESTROYED: settings.eventPrefix + '.' + component + '.destroyed',
    SHOW: settings.eventPrefix + '.' + component + '.show'

    // Add the extension: 'this' is inherited from the Ozone prototype (not o3)
  };o3.ext('' + component, function () {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'create';

    var elms = this;
    for (var i = 0; i < elms.length; ++i) {
      var el = elms[i];

      if (typeof opts === 'string') {
        // Create or destroy
        switch (opts) {
          case 'create':
          case 'update':
            create(el, opts);
            break;
          case 'destroy':
            destroy(el);
            break;
        }
      } else {
        create(el, opts);
      }
    }

    return this;
  });

  // Create the component
  var create = function create(el, opts) {

    var panels = [];

    // Send the started event
    o3.fireEvent(EVENT.STARTED, el, {});

    // Convert element to Ozone object
    var tablist = o3.find(el);

    // Look for any data options in the element to override the default
    var options = tablist.attr('data-ozone-options');
    opts = options !== null ? o3.optionsToJSON(options) : opts;

    if (tablist.attr('role') !== 'tablist' || opts === 'update') {

      // Assign the tablist role
      tablist.attr({
        role: 'tablist'
      });

      // List items are presentation only
      tablist.find(':scope > li').attr({
        role: 'presentation'
      });

      // Connect each link to their element
      tablist.find(':scope > li a:not([role="tab"]').forEach(function (el) {

        el = o3.find(el);

        if (el.attr('role') !== 'tab' || opts === 'update') {

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
              'aria-selected': 'true'
            });

            // Show the correct panel
            var current = o3.find(el.attr('href'));
            current.attr({
              'aria-hidden': null
            });

            // Hide the siblings
            current.siblings().attr({
              'aria-hidden': 'true'
            });
          });

          // Keyboard interaction
          el.on('keydown', function (event) {
            var target = undefined;
            var selected = o3.find(event.target).closest('[role="tablist"]').find('[aria-selected="true"]');
            var closest = selected.closest('li');
            var prev = closest.prev().find('[role="tab"]');
            var next = closest.next().find('[role="tab"]');

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
          if (panel.attr('role') !== 'tabpanel') {
            panel.attr({
              role: 'tabpanel',
              'aria-hidden': 'true'
            });

            // Make the first child of the tabpanel (or the tab panel itself) focusable
            var firstEl = panel[0].children.length > 0 ? o3.find(panel[0].children[0]) : panel;
            firstEl.attr({
              tabindex: '0'
            });

            // Save for later
            panels.push(panel);
          }
        }
      });

      if (opts !== 'update') {
        // Automatically select the first one (unless otherwise specified)
        var selectedIndex = opts.show ? parseInt(opts.show) : 0;
        var selectedTab = tablist.find(':scope > li');
        selectedTab = o3.find(selectedTab[selectedIndex]).find(':scope > a');
        selectedTab.attr({
          'aria-selected': 'true',
          tabindex: '0'
        });

        // Show the selected panel
        panels[selectedIndex].attr('aria-hidden', 'false');

        // Register with the mutation observer to watch for changes
        if (!opts.static) {
          tablist.mutation('' + component, 'update');
        }
      }
    }

    o3.fireEvent(EVENT.COMPLETED, el, {});
  };

  // Remove the component
  var destroy = function destroy(el) {

    // Send the started event
    o3.fireEvent(EVENT.STARTED, el, {});

    // Convert element to Ozone object
    var tablist = o3.find(el);

    // Assign the tablist role
    tablist.attr({
      role: null
    });

    // List items are presentation only
    tablist.find(':scope > li').attr({
      role: null
    });

    // Connect each link to their element
    tablist.find(':scope > li a').forEach(function (el) {

      el = o3.find(el);

      el.attr({
        role: null,
        tabindex: null,
        'aria-controls': null
      });

      el.off('click').off('keydown');

      // Set the tab panel role
      var panel = o3.find(el.attr('href'));
      panel.attr({
        role: null
      });
    });

    // Remove from the mutation observer
    tablist.removeMutation('' + component);

    o3.fireEvent(EVENT.DESTROYED, el, {});
  };

  // Prepare data selector
  var selector = '[data-' + settings.dataAttr + '="' + component + '"]';
  var elements = o3.find(selector);

  // Automatically setup any element matching the selector
  if (elements.length > 0) {
    o3.find(elements).tabs();
  }
})();

},{}]},{},[1,2,3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxjb3JlLmpzIiwic3JjL2pzL3BsdWdpbnMvbWVudS5qcyIsInNyY1xcanNcXHBsdWdpbnNcXHRhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUEsQ0FBQyxZQUFXO0FBQ1YsTUFBSSxDQUFDLFFBQVEsU0FBUixDQUFrQixPQUF2QixFQUFnQztBQUM5QixZQUFRLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsUUFBUSxTQUFSLENBQWtCLGlCQUFsQixJQUF1QyxRQUFRLFNBQVIsQ0FBa0IscUJBQXJGOztBQUVBLFFBQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsY0FBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFVBQVUsRUFBVixFQUFjLFFBQWQsRUFBd0I7QUFDbEQsWUFBSSxXQUFXLElBQWY7QUFDQSxZQUFJLENBQUMsU0FBUyxlQUFULENBQXlCLFFBQXpCLENBQWtDLEVBQWxDLENBQUwsRUFBNEMsT0FBTyxJQUFQO0FBQzVDLFdBQUc7QUFDRCxjQUFJLFNBQVMsT0FBVCxDQUFpQixRQUFqQixDQUFKLEVBQWdDLE9BQU8sUUFBUDtBQUNoQyxxQkFBVyxTQUFTLGFBQXBCO0FBQ0QsU0FIRCxRQUdTLGFBQWEsSUFIdEI7QUFJQSxlQUFPLEVBQVA7QUFDRCxPQVJEO0FBU0Q7QUFDRjs7QUFFRCxNQUFJLE9BQU8sTUFBTSxTQUFOLENBQWdCLE9BQXZCLEtBQW1DLFVBQXZDLEVBQW1EO0FBQ2pELFVBQU0sU0FBTixDQUFnQixPQUFoQixHQUEwQixVQUFVLElBQVYsRUFBZ0I7QUFDeEMsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssTUFBekIsRUFBaUMsRUFBRSxDQUFuQyxFQUFzQztBQUNwQyxZQUFJLEtBQUssQ0FBTCxNQUFZLElBQWhCLEVBQXNCO0FBQ3BCLGlCQUFPLENBQVA7QUFDRDtBQUNGO0FB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IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uKCkge1xyXG4gIGlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xyXG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvclxyXG5cclxuICAgIGlmICghRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xyXG4gICAgICBFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24gKGVsLCBzZWxlY3Rvcikge1xyXG4gICAgICAgIHZhciBhbmNlc3RvciA9IHRoaXNcclxuICAgICAgICBpZiAoIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jb250YWlucyhlbCkpIHJldHVybiBudWxsXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgaWYgKGFuY2VzdG9yLm1hdGNoZXMoc2VsZWN0b3IpKSByZXR1cm4gYW5jZXN0b3JcclxuICAgICAgICAgIGFuY2VzdG9yID0gYW5jZXN0b3IucGFyZW50RWxlbWVudFxyXG4gICAgICAgIH0gd2hpbGUgKGFuY2VzdG9yICE9PSBudWxsKVxyXG4gICAgICAgIHJldHVybiBlbFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIEFycmF5LnByb3RvdHlwZS5pbmRleE9mICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGlmICh0aGlzW2ldID09PSBpdGVtKSB7XHJcbiAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gLTFcclxuICAgIH1cclxuICB9XHJcblxyXG59KSgpLFxyXG5cclxuLypcclxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50L0N1c3RvbUV2ZW50XHJcbiAqL1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcclxuXHJcbiAgZnVuY3Rpb24gQ3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcykge1xyXG4gICAgcGFyYW1zID0gcGFyYW1zIHx8IHtcclxuICAgICAgYnViYmxlczogZmFsc2UsXHJcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxyXG4gICAgICBkZXRhaWw6IHVuZGVmaW5lZFxyXG4gICAgfVxyXG4gICAgbGV0IGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpXHJcbiAgICBldnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpXHJcbiAgICByZXR1cm4gZXZ0XHJcbiAgfVxyXG5cclxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW5kb3cuRXZlbnQucHJvdG90eXBlXHJcblxyXG4gIHdpbmRvdy5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50XHJcbn0pKCksXHJcblxyXG4vKlxyXG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82NDgxNjEyL3F1ZXJ5c2VsZWN0b3Itc2VhcmNoLWltbWVkaWF0ZS1jaGlsZHJlbiNhbnN3ZXItMTc5ODk4MDNcclxuICovXHJcbihmdW5jdGlvbiAoZG9jLCBwcm90bykge1xyXG4gIHRyeSB7XHJcbiAgICBkb2MucXVlcnlTZWxlY3RvcignOnNjb3BlIGJvZHknKVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgWydxdWVyeVNlbGVjdG9yJywgJ3F1ZXJ5U2VsZWN0b3JBbGwnXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcclxuICAgICAgbGV0IG5hdGl2ZSA9IHByb3RvW21ldGhvZF1cclxuICAgICAgcHJvdG9bbWV0aG9kXSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xyXG4gICAgICAgIGlmICgvKF58LClcXHMqOnNjb3BlLy50ZXN0KHNlbGVjdG9yKSkge1xyXG4gICAgICAgICAgbGV0IGlkID0gdGhpcy5pZFxyXG4gICAgICAgICAgdGhpcy5pZCA9ICdJRF8nICsgbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICAgICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvKChefCwpXFxzKik6c2NvcGUvZywgJyQxIycgKyB0aGlzLmlkKVxyXG4gICAgICAgICAgbGV0IHJlc3VsdCA9IGRvY1ttZXRob2RdKHNlbGVjdG9yKVxyXG4gICAgICAgICAgdGhpcy5pZCA9IGlkXHJcbiAgICAgICAgICByZXR1cm4gcmVzdWx0XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBuYXRpdmUuY2FsbCh0aGlzLCBzZWxlY3RvcilcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG59KSh3aW5kb3cuZG9jdW1lbnQsIEVsZW1lbnQucHJvdG90eXBlKSxcclxuXHJcbi8qXHJcbiAqIE96b25lIGlzIGJhc2VkIG9uIHRoZSB3b3JrIG9mIEFuZHJldyBCdXJnZXNzXHJcbiAqIFxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5kcmV3ODA4OC9kb21lL2Jsb2IvbWFzdGVyL3NyYy9kb21lLmpzXHJcbiAqL1xyXG53aW5kb3cubzMgPSAoZnVuY3Rpb24gKCkge1xyXG5cclxuICBjb25zdCBWRVJTSU9OID0gJzAuMC4xJ1xyXG5cclxuICBjb25zdCBfc2V0dGluZ3MgPSB7XHJcbiAgICBldmVudFByZWZpeDogJ28zJyxcclxuICAgIGRhdGFBdHRyOiAnb3pvbmUnLFxyXG4gICAgZGF0YUF0dHJUYWJzOiAndGFicycsXHJcbiAgICBkYXRhQXR0ck1lbnU6ICdtZW51J1xyXG4gIH1cclxuXHJcbiAgbGV0IF9zeXN0ZW0gPSB7XHJcbiAgICBicm93c2VyOiB7XHJcbiAgICAgIGxhbmc6IG5hdmlnYXRvci5sYW5ndWFnZSxcclxuICAgICAgb3M6IG5hdmlnYXRvci5wbGF0Zm9ybSxcclxuICAgICAgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgICB9LFxyXG4gICAgc2NyZWVuOiB7XHJcbiAgICAgIGJpdDogc2NyZWVuLmNvbG9yRGVwdGgsXHJcbiAgICAgIHdpZHRoOiBzY3JlZW4ud2lkdGgsXHJcbiAgICAgIGhlaWdodDogc2NyZWVuLmhlaWdodFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XHJcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yXHJcbiAgfVxyXG5cclxuICAvLyBJbnRlcm5hbCBkZWJvdW5jZSBoYW5kbGVyXHJcbiAgbGV0IGRlYm91bmNlID0gZnVuY3Rpb24gKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xyXG4gICAgbGV0IHRpbWVvdXRcclxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGxldCBjb250ZXh0ID0gdGhpc1xyXG4gICAgICBsZXQgYXJncyA9IGFyZ3VtZW50c1xyXG4gICAgICBsZXQgbGF0ZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgdGltZW91dCA9IG51bGxcclxuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xyXG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBsZXQgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dFxyXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dClcclxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXHJcbiAgICAgIGlmIChjYWxsTm93KSB7XHJcbiAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBXaW5kb3cgcmVzaXplXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlKCgpID0+IHtcclxuICAgIF9zeXN0ZW0uYnJvd3Nlci53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoXHJcbiAgICBfc3lzdGVtLmJyb3dzZXIuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHRcclxuICB9LCAyNTApKVxyXG5cclxuICBsZXQgT3pvbmUgPSBmdW5jdGlvbiAoZWxzKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVscy5sZW5ndGg7ICsraSkge1xyXG4gICAgICB0aGlzW2ldID0gZWxzW2ldXHJcbiAgICB9XHJcbiAgICB0aGlzLmxlbmd0aCA9IGVscy5sZW5ndGhcclxuICB9XHJcblxyXG4gIC8qID09PT09PT09PT09PT09PT09XHJcbiAgICogTXV0YXRpb24gT2JzZXJ2ZXJcclxuICAgKiA9PT09PT09PT09PT09PT09PVxyXG4gICAqL1xyXG5cclxuICBsZXQgTXV0YXRpb25PYnNlcnZlciA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5Nb3pNdXRhdGlvbk9ic2VydmVyXHJcblxyXG4gIGxldCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcclxuICAgIG11dGF0aW9ucy5mb3JFYWNoKChtdXRhdGlvbikgPT4ge1xyXG4gICAgICB0cmlnZ2VyTXV0YXRpb25IYW5kbGVyKG11dGF0aW9uLnRhcmdldClcclxuICAgIH0pXHJcbiAgfSlcclxuICBsZXQgb2JzZXJ2ZXJDb25maWcgPSB7XHJcbiAgICBjaGlsZExpc3Q6IHRydWUsXHJcbiAgICBzdWJ0cmVlOiB0cnVlXHJcbiAgfVxyXG5cclxuICBsZXQgbXV0YXRpb25FbGVtZW50cyA9IFtdXHJcblxyXG4gIGZ1bmN0aW9uIGlzTXV0YXRpb25VbmlxdWUoZWwpIHtcclxuICAgIHJldHVybiBtdXRhdGlvbkVsZW1lbnRzLmZpbHRlcigob2JqKSA9PiB7XHJcbiAgICAgIHJldHVybiBlbFswXS5pc0VxdWFsTm9kZShvYmoudGFyZ2V0WzBdKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHRyaWdnZXJNdXRhdGlvbkhhbmRsZXIoZWwpIHtcclxuICAgIG11dGF0aW9uRWxlbWVudHMuZmlsdGVyKChvYmopID0+IHtcclxuICAgICAgaWYgKGVsLmlzRXF1YWxOb2RlKG9iai50YXJnZXRbMF0pKSB7XHJcbiAgICAgICAgb2JqLnRhcmdldFtvYmouaGFuZGxlcl0ob2JqLm9wdGlvbnMpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvKiA9PT09PVxyXG4gICAqIFVUSUxTXHJcbiAgICogPT09PT1cclxuICAgKi9cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIHRoaXMubWFwKGNhbGxiYWNrKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIGxldCByZXN1bHRzID0gW11cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzW2ldLCBpKSlcclxuICAgIH1cclxuICAgIC8vcmV0dXJuIHJlc3VsdHMubGVuZ3RoID4gMSA/IHJlc3VsdHMgOiByZXN1bHRzWzBdXHJcbiAgICByZXR1cm4gcmVzdWx0c1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm1hcE9uZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgbGV0IG0gPSB0aGlzLm1hcChjYWxsYmFjaylcclxuICAgIHJldHVybiBtLmxlbmd0aCA+IDEgPyBtIDogbVswXVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm11dGF0aW9uID0gZnVuY3Rpb24gKGhhbmRsZXIsIG9wdGlvbnMpIHtcclxuICAgIGlmIChpc011dGF0aW9uVW5pcXVlKHRoaXMpKSB7XHJcbiAgICAgIG11dGF0aW9uRWxlbWVudHMucHVzaCh7XHJcbiAgICAgICAgdGFyZ2V0OiB0aGlzLFxyXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXHJcbiAgICAgICAgaGFuZGxlcjogaGFuZGxlclxyXG4gICAgICB9KVxyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZWwsIG9ic2VydmVyQ29uZmlnKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5yZW1vdmVNdXRhdGlvbiA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XHJcbiAgICBpZiAoaXNNdXRhdGlvblVuaXF1ZSh0aGlzKSkge1xyXG4gICAgICBtdXRhdGlvbkVsZW1lbnRzLmZpbHRlcigob2JqKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2cob2JqLCB0aGlzLCBoYW5kbGVyKVxyXG4gICAgICB9KVxyXG4gICAgICAvKiByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoZWwsIG9ic2VydmVyQ29uZmlnKVxyXG4gICAgICB9KSAqL1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5yZWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICBsZXQgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogcmVjdC54LFxyXG4gICAgICAgIHk6IHJlY3QueSxcclxuICAgICAgICB0b3A6IHJlY3QudG9wLFxyXG4gICAgICAgIGJvdHRvbTogcmVjdC5ib3R0b20sXHJcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0LFxyXG4gICAgICAgIHJpZ2h0OiByZWN0LnJpZ2h0LFxyXG4gICAgICAgIHdpZHRoOiByZWN0LndpZHRoLFxyXG4gICAgICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXHJcbiAgICAgICAgb2Zmc2V0VG9wOiBlbC5vZmZzZXRUb3AsXHJcbiAgICAgICAgb2Zmc2V0TGVmdDogZWwub2Zmc2V0TGVmdCxcclxuICAgICAgICBvZmZzZXRXaWR0aDogZWwub2Zmc2V0V2lkdGgsXHJcbiAgICAgICAgb2Zmc2V0SGVpZ2h0OiBlbC5vZmZzZXRIZWlnaHQsXHJcbiAgICAgICAgaGlkZGVuOiBlbC5oaWRkZW5cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qID09PT09PT09PT09PT09PT1cclxuICAgKiBET00gTUFOSVBVTEFUSU9OXHJcbiAgICogPT09PT09PT09PT09PT09PVxyXG4gICAqL1xyXG5cclxuICBPem9uZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oaSkge1xyXG4gICAgaWYgKHRoaXNbaV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm4gbzMuZmluZCh0aGlzW2ldKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24gKHRleHQpIHtcclxuICAgIGlmICh0eXBlb2YgdGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBlbC5pbm5lclRleHQgPSB0ZXh0XHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsLmlubmVyVGV4dFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbiAoaHRtbCkge1xyXG4gICAgaWYgKHR5cGVvZiBodG1sICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGVsLmlubmVySFRNTCA9IGh0bWxcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICByZXR1cm4gZWwuaW5uZXJIVE1MXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuYWRkQ2xhc3MgPSBmdW5jdGlvbiAoY2xhc3Nlcykge1xyXG4gICAgbGV0IGNsYXNzTmFtZSA9ICcnXHJcbiAgICBpZiAodHlwZW9mIGNsYXNzZXMgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGNsYXNzTmFtZSArPSAnICcgKyBjbGFzc2VzW2ldXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNsYXNzTmFtZSA9ICcgJyArIGNsYXNzZXNcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIGVsLmNsYXNzTmFtZSArPSBjbGFzc05hbWVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAoY2xzKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBsZXQgY3MgPSBlbC5jbGFzc05hbWUuc3BsaXQoL1xccysvKVxyXG4gICAgICBsZXQgaVxyXG5cclxuICAgICAgd2hpbGUgKChpID0gY3MuaW5kZXhPZihjbHMpKSA+IC0xKSB7XHJcbiAgICAgICAgY3MgPSBjcy5zbGljZSgwLCBpKS5jb25jYXQoY3Muc2xpY2UoKytpKSlcclxuICAgICAgfVxyXG4gICAgICBlbC5jbGFzc05hbWUgPSBjcy5qb2luKCcgJylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uIChhdHRyLCB2YWwpIHtcclxuICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgLy8gT2JqZWN0IGluc3RlYWQgb2Ygc3RyaW5nXHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGF0dHIpIHtcclxuICAgICAgICAgIGlmIChhdHRyLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgaWYgKGF0dHJba2V5XSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShrZXkudG9TdHJpbmcoKSlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LnRvU3RyaW5nKCksIGF0dHJba2V5XSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFN0cmluZyBpbnN0ZWFkIG9mIG9iamVjdFxyXG4gICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cilcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShhdHRyLCB2YWwpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKGF0dHIpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmNzcyA9IGZ1bmN0aW9uIChhdHRyLCB2YWwpIHtcclxuICAgIGlmICh0eXBlb2YgYXR0ciA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgLy8gT2JqZWN0IGluc3RlYWQgb2Ygc3RyaW5nXHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGF0dHIpIHtcclxuICAgICAgICAgIGlmIChhdHRyLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAgICAgZWwuc3R5bGVba2V5LnRvU3RyaW5nKCldID0gYXR0cltrZXldXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gU3RyaW5nIGluc3RlYWQgb2Ygb2JqZWN0XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5zdHlsZVthdHRyXSA9IHZhbFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgICAgY29uc3Qgd2luID0gZWwub3duZXJEb2N1bWVudC5kZWZhdWx0Vmlld1xyXG4gICAgICAgICAgcmV0dXJuIHdpbi5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKVthdHRyXVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5kYXRhID0gZnVuY3Rpb24gKGF0dHIsIHZhbCkge1xyXG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdkYXRhLScgKyBhdHRyLCB2YWwpXHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZSgnZGF0YS0nICsgYXR0cilcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbiAoZWxzKSB7XHJcbiAgICBpZiAodHlwZW9mIGVscyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWwuaW5uZXJIVE1MID0gZWxzXHJcbiAgICAgIGVscyA9IG8zLmZpbmQoZWwuY2hpbGRyZW4pXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChwYXJFbCwgaSkgPT4ge1xyXG4gICAgICBlbHMuZm9yRWFjaCgoY2hpbGRFbCkgPT4ge1xyXG4gICAgICAgIHBhckVsLmFwcGVuZENoaWxkKChpID4gMCkgPyBjaGlsZEVsLmNsb25lTm9kZSh0cnVlKSA6IGNoaWxkRWwpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbiAoZWxzKSB7XHJcbiAgICBpZiAodHlwZW9mIGVscyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgZWwuaW5uZXJIVE1MID0gZWxzXHJcbiAgICAgIGVscyA9IG8zLmZpbmQoZWwuY2hpbGRyZW4pXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChwYXJFbCwgaSkgPT4ge1xyXG4gICAgICBmb3IgKGxldCBqID0gZWxzLmxlbmd0aCAtIDE7IGogPiAtMTsgai0tKSB7XHJcbiAgICAgICAgcGFyRWwuaW5zZXJ0QmVmb3JlKChpID4gMCkgPyBlbHNbal0uY2xvbmVOb2RlKHRydWUpIDogZWxzW2pdLCBwYXJFbC5maXJzdENoaWxkKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIHJldHVybiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5vbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZuLCBmYWxzZSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmF0dGFjaEV2ZW50KSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgZXZ0LCBmbilcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWxbJ29uJyArIGV2dF0gPSBmblxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KCkpXHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5vZmYgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZ0LCBmbiwgZmFsc2UpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5kZXRhY2hFdmVudCkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwuZGV0YWNoRXZlbnQoJ29uJyArIGV2dCwgZm4pXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLyplc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyovXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIC8qZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyovXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsWydvbicgKyBldnRdID0gbnVsbFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KCkpXHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XHJcbiAgICByZXR1cm4gbzMuZmluZChzZWxlY3RvciwgY29udGV4dCwgdGhpc1swXSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5jbG9zZXN0ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcclxuICAgIGxldCBhbmNlc3RvciA9IHRoaXNbMF1cclxuICAgIGRvIHtcclxuICAgICAgaWYgKGFuY2VzdG9yLm1hdGNoZXMoc2VsZWN0b3IpKSB7XHJcbiAgICAgICAgcmV0dXJuIG8zLmZpbmQoYW5jZXN0b3IpXHJcbiAgICAgIH1cclxuICAgICAgYW5jZXN0b3IgPSBhbmNlc3Rvci5wYXJlbnROb2RlXHJcbiAgICB9IHdoaWxlIChhbmNlc3RvciAhPT0gbnVsbClcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucHJldiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbGV0IGVsID0gdGhpc1swXVxyXG4gICAgd2hpbGUgKChlbCA9IGVsLnByZXZpb3VzU2libGluZykpIHtcclxuICAgICAgaWYgKGVsLm5vZGVUeXBlID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIG8zLmZpbmQoZWwpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbGV0IGVsID0gdGhpc1swXVxyXG4gICAgd2hpbGUgKChlbCA9IGVsLm5leHRTaWJsaW5nKSkge1xyXG4gICAgICBpZiAoZWwubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gbzMuZmluZChlbClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5zaWJsaW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbGV0IGN1cnJlbnQgPSB0aGlzWzBdXHJcbiAgICBsZXQgcGFyZW50ID0gY3VycmVudC5wYXJlbnROb2RlXHJcbiAgICBsZXQgc2libGluZ3MgPSBbXVxyXG4gICAgZm9yIChsZXQgaSA9IDAsIGltYXggPSBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgaW1heDsgKytpKSB7XHJcbiAgICAgIGxldCBlbCA9IHBhcmVudC5jaGlsZHJlbltpXVxyXG4gICAgICBpZiAoIWVsLmlzRXF1YWxOb2RlKGN1cnJlbnQpKSB7XHJcbiAgICAgICAgc2libGluZ3MucHVzaChlbClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBPem9uZShzaWJsaW5ncylcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5mb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpc1swXS5mb2N1cygpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICBvMy5maXJlRXZlbnQodHlwZSwgZWwpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgbGV0IG8zID0ge1xyXG4gICAgZmluZDogZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0LCBwYXJlbnQpIHtcclxuICAgICAgbGV0IGVsc1xyXG4gICAgICBpZiAoY29udGV4dCkge1xyXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0WzBdXHJcbiAgICAgIH0gXHJcbiAgICAgIGlmIChjb250ZXh0ID09PSB1bmRlZmluZWQgJiYgcGFyZW50KSB7XHJcbiAgICAgICAgY29udGV4dCA9IHBhcmVudFxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgZWxzID0gc2VsZWN0b3IgaW5zdGFuY2VvZiBOb2RlIHx8IHNlbGVjdG9yIGluc3RhbmNlb2YgV2luZG93ID8gW3NlbGVjdG9yXSA6IFtdLnNsaWNlLmNhbGwodHlwZW9mIHNlbGVjdG9yID09ICdzdHJpbmcnID8gKGNvbnRleHQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDogc2VsZWN0b3IgfHwgW10pXHJcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3IubGVuZ3RoKSB7XHJcbiAgICAgICAgZWxzID0gc2VsZWN0b3JcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbHMgPSBbc2VsZWN0b3JdXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ldyBPem9uZShlbHMpXHJcbiAgICB9LFxyXG4gICAgY3JlYXRlOiAodGFnTmFtZSwgYXR0cnMpID0+IHtcclxuICAgICAgbGV0IGVsID0gbmV3IE96b25lKFtkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpXSlcclxuICAgICAgaWYgKGF0dHJzKSB7XHJcbiAgICAgICAgaWYgKGF0dHJzLmNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgZWwuYWRkQ2xhc3MoYXR0cnMuY2xhc3NOYW1lKVxyXG4gICAgICAgICAgZGVsZXRlIGF0dHJzLmNsYXNzTmFtZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXR0cnMudGV4dCkge1xyXG4gICAgICAgICAgZWwudGV4dChhdHRycy50ZXh0KVxyXG4gICAgICAgICAgZGVsZXRlIGF0dHJzLnRleHRcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGF0dHJzKSB7XHJcbiAgICAgICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBlbC5hdHRyKGtleSwgYXR0cnNba2V5XSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGVsXHJcbiAgICB9LFxyXG4gICAgc2V0dGluZ3M6ICgpID0+IHtcclxuICAgICAgcmV0dXJuIF9zZXR0aW5nc1xyXG4gICAgfSxcclxuICAgIGV4dDogKG5hbWUsIGZuKSA9PiB7XHJcbiAgICAgIGlmICh0eXBlb2YgT3pvbmUucHJvdG90eXBlW25hbWVdID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIE96b25lLnByb3RvdHlwZVtuYW1lXSA9IGZuXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBmaXJlRXZlbnQ6IGZ1bmN0aW9uICh0eXBlLCBlbCwgb2JqKSB7XHJcbiAgICAgIGxldCBldnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xyXG4gICAgICAgIGRldGFpbDogb2JqLFxyXG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgY2FuY2VsYWJsZTogZmFsc2VcclxuICAgICAgfSlcclxuICAgICAgZWwuZGlzcGF0Y2hFdmVudChldnQpXHJcbiAgICB9LFxyXG4gICAgcmVhZHk6IGZ1bmN0aW9uIChmbikge1xyXG4gICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2xvYWRpbmcnKSB7XHJcbiAgICAgICAgZm4oKVxyXG4gICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9ICdsb2FkaW5nJylcclxuICAgICAgICAgICAgZm4oKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBvcHRpb25zVG9KU09OOiBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xccy9nLCcnKVxyXG4gICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvKFxccyo/e1xccyo/fFxccyo/LFxccyo/KShbJ1wiXSk/KFthLXpBLVowLTldKykoWydcIl0pPzovZywgJyQxXCIkM1wiOicpXHJcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHN0cmluZylcclxuICAgIH0sXHJcbiAgICBzeXN0ZW06IF9zeXN0ZW0sXHJcbiAgICB2ZXJzaW9uOiBWRVJTSU9OXHJcbiAgfVxyXG5cclxuICByZXR1cm4gbzNcclxufSgpKVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYlhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWlJc0ltWnBiR1VpT2lKdFpXNTFMbXB6SWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2x0ZGZRPT0iLCIoZnVuY3Rpb24gKCkge1xyXG4gIC8qKlxyXG4gICAqIFRBQlNcclxuICAgKi9cclxuXHJcbiAgLy8gS2VlcCBpdCBzaW1wbGVcclxuICBsZXQgbzMgPSB3aW5kb3cubzNcclxuICBsZXQgc2V0dGluZ3MgPSBvMy5zZXR0aW5ncygpXHJcbiAgbGV0IGNvbXBvbmVudCA9IHNldHRpbmdzLmRhdGFBdHRyVGFic1xyXG5cclxuICAvLyBDb21wb25lbnQgZXZlbnRzXHJcbiAgY29uc3QgRVZFTlQgPSB7XHJcbiAgICBTVEFSVEVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtjb21wb25lbnR9LnN0YXJ0ZWRgLFxyXG4gICAgQ09NUExFVEVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtjb21wb25lbnR9LmNvbXBsZXRlZGAsXHJcbiAgICBDUkVBVEVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtjb21wb25lbnR9LmNyZWF0ZWRgLFxyXG4gICAgREVTVFJPWUVEOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtjb21wb25lbnR9LmRlc3Ryb3llZGAsXHJcbiAgICBTSE9XOiBgJHtzZXR0aW5ncy5ldmVudFByZWZpeH0uJHtjb21wb25lbnR9LnNob3dgXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgdGhlIGV4dGVuc2lvbjogJ3RoaXMnIGlzIGluaGVyaXRlZCBmcm9tIHRoZSBPem9uZSBwcm90b3R5cGUgKG5vdCBvMylcclxuICBvMy5leHQoYCR7Y29tcG9uZW50fWAsIGZ1bmN0aW9uIChvcHRzID0gJ2NyZWF0ZScpIHtcclxuICAgIGxldCBlbG1zID0gdGhpc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbG1zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGxldCBlbCA9IGVsbXNbaV1cclxuXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0cyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAvLyBDcmVhdGUgb3IgZGVzdHJveVxyXG4gICAgICAgIHN3aXRjaCAob3B0cykge1xyXG4gICAgICAgICAgY2FzZSAnY3JlYXRlJzpcclxuICAgICAgICAgIGNhc2UgJ3VwZGF0ZSc6XHJcbiAgICAgICAgICAgIGNyZWF0ZShlbCwgb3B0cylcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIGNhc2UgJ2Rlc3Ryb3knOlxyXG4gICAgICAgICAgICBkZXN0cm95KGVsKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjcmVhdGUoZWwsIG9wdHMpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH0pXHJcblxyXG4gIC8vIENyZWF0ZSB0aGUgY29tcG9uZW50XHJcbiAgbGV0IGNyZWF0ZSA9IGZ1bmN0aW9uIChlbCwgb3B0cykge1xyXG5cclxuICAgIGxldCBwYW5lbHMgPSBbXVxyXG5cclxuICAgIC8vIFNlbmQgdGhlIHN0YXJ0ZWQgZXZlbnRcclxuICAgIG8zLmZpcmVFdmVudChFVkVOVC5TVEFSVEVELCBlbCwge30pXHJcblxyXG4gICAgLy8gQ29udmVydCBlbGVtZW50IHRvIE96b25lIG9iamVjdFxyXG4gICAgbGV0IHRhYmxpc3QgPSBvMy5maW5kKGVsKVxyXG5cclxuICAgIC8vIExvb2sgZm9yIGFueSBkYXRhIG9wdGlvbnMgaW4gdGhlIGVsZW1lbnQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRcclxuICAgIGxldCBvcHRpb25zID0gdGFibGlzdC5hdHRyKCdkYXRhLW96b25lLW9wdGlvbnMnKVxyXG4gICAgb3B0cyA9IChvcHRpb25zICE9PSBudWxsKSA/IG8zLm9wdGlvbnNUb0pTT04ob3B0aW9ucykgOiBvcHRzXHJcblxyXG4gICAgaWYgKHRhYmxpc3QuYXR0cigncm9sZScpICE9PSAndGFibGlzdCcgfHwgb3B0cyA9PT0gJ3VwZGF0ZScpIHtcclxuXHJcbiAgICAgIC8vIEFzc2lnbiB0aGUgdGFibGlzdCByb2xlXHJcbiAgICAgIHRhYmxpc3QuYXR0cih7XHJcbiAgICAgICAgcm9sZTogJ3RhYmxpc3QnXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBMaXN0IGl0ZW1zIGFyZSBwcmVzZW50YXRpb24gb25seVxyXG4gICAgICB0YWJsaXN0LmZpbmQoJzpzY29wZSA+IGxpJykuYXR0cih7XHJcbiAgICAgICAgcm9sZTogJ3ByZXNlbnRhdGlvbidcclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIENvbm5lY3QgZWFjaCBsaW5rIHRvIHRoZWlyIGVsZW1lbnRcclxuICAgICAgdGFibGlzdC5maW5kKCc6c2NvcGUgPiBsaSBhOm5vdChbcm9sZT1cInRhYlwiXScpLmZvckVhY2goKGVsKSA9PiB7XHJcblxyXG4gICAgICAgIGVsID0gbzMuZmluZChlbClcclxuXHJcbiAgICAgICAgaWYgKGVsLmF0dHIoJ3JvbGUnKSAhPT0gJ3RhYicgfHwgb3B0cyA9PT0gJ3VwZGF0ZScpIHtcclxuXHJcbiAgICAgICAgICBlbC5hdHRyKHtcclxuICAgICAgICAgICAgcm9sZTogJ3RhYicsXHJcbiAgICAgICAgICAgIHRhYmluZGV4OiAnLTEnLFxyXG4gICAgICAgICAgICAnYXJpYS1jb250cm9scyc6IGVsLmF0dHIoJ2hyZWYnKS5zdWJzdHJpbmcoMSlcclxuICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgZWwub24oJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcblxyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGxldCB0YWIgPSBvMy5maW5kKGV2ZW50LnRhcmdldClcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSB0YWJzXHJcbiAgICAgICAgICAgIHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGkgW3JvbGU9XCJ0YWJcIl0nKS5hdHRyKHtcclxuICAgICAgICAgICAgICB0YWJpbmRleDogJy0xJyxcclxuICAgICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IG51bGxcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICAgICAgdGFiLmF0dHIoe1xyXG4gICAgICAgICAgICAgIHRhYmluZGV4OiAnMCcsXHJcbiAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSdcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIGNvcnJlY3QgcGFuZWxcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvMy5maW5kKGVsLmF0dHIoJ2hyZWYnKSlcclxuICAgICAgICAgICAgY3VycmVudC5hdHRyKHtcclxuICAgICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiBudWxsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBIaWRlIHRoZSBzaWJsaW5nc1xyXG4gICAgICAgICAgICBjdXJyZW50LnNpYmxpbmdzKCkuYXR0cih7XHJcbiAgICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAvLyBLZXlib2FyZCBpbnRlcmFjdGlvblxyXG4gICAgICAgICAgZWwub24oJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBvMy5maW5kKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW3JvbGU9XCJ0YWJsaXN0XCJdJykuZmluZCgnW2FyaWEtc2VsZWN0ZWQ9XCJ0cnVlXCJdJylcclxuICAgICAgICAgICAgbGV0IGNsb3Nlc3QgPSBzZWxlY3RlZC5jbG9zZXN0KCdsaScpXHJcbiAgICAgICAgICAgIGxldCBwcmV2ID0gY2xvc2VzdC5wcmV2KCkuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKVxyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IGNsb3Nlc3QubmV4dCgpLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0aGUgZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgIGNhc2UgMzc6XHJcbiAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHByZXZcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgY2FzZSAzOTpcclxuICAgICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gbmV4dFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgdGFyZ2V0LmZvY3VzKCkudHJpZ2dlcignY2xpY2snKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgIC8vIFNldCB0aGUgdGFiIHBhbmVsIHJvbGVcclxuICAgICAgICAgIGxldCBwYW5lbCA9IG8zLmZpbmQoZWwuYXR0cignaHJlZicpKVxyXG4gICAgICAgICAgaWYgKHBhbmVsLmF0dHIoJ3JvbGUnKSAhPT0gJ3RhYnBhbmVsJykge1xyXG4gICAgICAgICAgICBwYW5lbC5hdHRyKHtcclxuICAgICAgICAgICAgICByb2xlOiAndGFicGFuZWwnLFxyXG4gICAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgZmlyc3QgY2hpbGQgb2YgdGhlIHRhYnBhbmVsIChvciB0aGUgdGFiIHBhbmVsIGl0c2VsZikgZm9jdXNhYmxlXHJcbiAgICAgICAgICAgIGxldCBmaXJzdEVsID0gKHBhbmVsWzBdLmNoaWxkcmVuLmxlbmd0aCA+IDApID8gbzMuZmluZChwYW5lbFswXS5jaGlsZHJlblswXSkgOiBwYW5lbFxyXG4gICAgICAgICAgICBmaXJzdEVsLmF0dHIoe1xyXG4gICAgICAgICAgICAgIHRhYmluZGV4OiAnMCdcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgIHBhbmVscy5wdXNoKHBhbmVsKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIGlmIChvcHRzICE9PSAndXBkYXRlJykge1xyXG4gICAgICAgIC8vIEF1dG9tYXRpY2FsbHkgc2VsZWN0IHRoZSBmaXJzdCBvbmUgKHVubGVzcyBvdGhlcndpc2Ugc3BlY2lmaWVkKVxyXG4gICAgICAgIGxldCBzZWxlY3RlZEluZGV4ID0gKG9wdHMuc2hvdykgPyBwYXJzZUludChvcHRzLnNob3cpIDogMFxyXG4gICAgICAgIGxldCBzZWxlY3RlZFRhYiA9IHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGknKVxyXG4gICAgICAgIHNlbGVjdGVkVGFiID0gbzMuZmluZChzZWxlY3RlZFRhYltzZWxlY3RlZEluZGV4XSkuZmluZCgnOnNjb3BlID4gYScpXHJcbiAgICAgICAgc2VsZWN0ZWRUYWIuYXR0cih7XHJcbiAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJyxcclxuICAgICAgICAgIHRhYmluZGV4OiAnMCdcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBTaG93IHRoZSBzZWxlY3RlZCBwYW5lbFxyXG4gICAgICAgIHBhbmVsc1tzZWxlY3RlZEluZGV4XS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXHJcblxyXG4gICAgICAgIC8vIFJlZ2lzdGVyIHdpdGggdGhlIG11dGF0aW9uIG9ic2VydmVyIHRvIHdhdGNoIGZvciBjaGFuZ2VzXHJcbiAgICAgICAgaWYgKCFvcHRzLnN0YXRpYykge1xyXG4gICAgICAgICAgdGFibGlzdC5tdXRhdGlvbihgJHtjb21wb25lbnR9YCwgJ3VwZGF0ZScpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbzMuZmlyZUV2ZW50KEVWRU5ULkNPTVBMRVRFRCwgZWwsIHt9KVxyXG4gIH1cclxuXHJcblxyXG5cclxuICAvLyBSZW1vdmUgdGhlIGNvbXBvbmVudFxyXG4gIGxldCBkZXN0cm95ID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBcclxuICAgIC8vIFNlbmQgdGhlIHN0YXJ0ZWQgZXZlbnRcclxuICAgIG8zLmZpcmVFdmVudChFVkVOVC5TVEFSVEVELCBlbCwge30pXHJcblxyXG4gICAgLy8gQ29udmVydCBlbGVtZW50IHRvIE96b25lIG9iamVjdFxyXG4gICAgbGV0IHRhYmxpc3QgPSBvMy5maW5kKGVsKVxyXG5cclxuICAgIC8vIEFzc2lnbiB0aGUgdGFibGlzdCByb2xlXHJcbiAgICB0YWJsaXN0LmF0dHIoe1xyXG4gICAgICByb2xlOiBudWxsXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIExpc3QgaXRlbXMgYXJlIHByZXNlbnRhdGlvbiBvbmx5XHJcbiAgICB0YWJsaXN0LmZpbmQoJzpzY29wZSA+IGxpJykuYXR0cih7XHJcbiAgICAgIHJvbGU6IG51bGxcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQ29ubmVjdCBlYWNoIGxpbmsgdG8gdGhlaXIgZWxlbWVudFxyXG4gICAgdGFibGlzdC5maW5kKCc6c2NvcGUgPiBsaSBhJykuZm9yRWFjaCgoZWwpID0+IHtcclxuXHJcbiAgICAgIGVsID0gbzMuZmluZChlbClcclxuXHJcbiAgICAgIGVsLmF0dHIoe1xyXG4gICAgICAgIHJvbGU6IG51bGwsXHJcbiAgICAgICAgdGFiaW5kZXg6IG51bGwsXHJcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBudWxsXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBlbC5vZmYoJ2NsaWNrJykub2ZmKCdrZXlkb3duJylcclxuXHJcbiAgICAgIC8vIFNldCB0aGUgdGFiIHBhbmVsIHJvbGVcclxuICAgICAgbGV0IHBhbmVsID0gbzMuZmluZChlbC5hdHRyKCdocmVmJykpXHJcbiAgICAgIHBhbmVsLmF0dHIoe1xyXG4gICAgICAgIHJvbGU6IG51bGxcclxuICAgICAgfSlcclxuXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIFJlbW92ZSBmcm9tIHRoZSBtdXRhdGlvbiBvYnNlcnZlclxyXG4gICAgdGFibGlzdC5yZW1vdmVNdXRhdGlvbihgJHtjb21wb25lbnR9YClcclxuICAgIFxyXG4gICAgbzMuZmlyZUV2ZW50KEVWRU5ULkRFU1RST1lFRCwgZWwsIHt9KVxyXG4gIH1cclxuXHJcbiAgLy8gUHJlcGFyZSBkYXRhIHNlbGVjdG9yXHJcbiAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLSR7c2V0dGluZ3MuZGF0YUF0dHJ9PVwiJHtjb21wb25lbnR9XCJdYFxyXG4gIGxldCBlbGVtZW50cyA9IG8zLmZpbmQoc2VsZWN0b3IpXHJcblxyXG4gIC8vIEF1dG9tYXRpY2FsbHkgc2V0dXAgYW55IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIHNlbGVjdG9yXHJcbiAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgIG8zLmZpbmQoZWxlbWVudHMpLnRhYnMoKVxyXG4gIH1cclxuXHJcbn0pKCkiXX0=
