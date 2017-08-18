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
      tablist.find(':scope > li a').forEach(function (el) {

        el = o3.find(el);

        if (el.attr('role') !== 'tab' || opts === 'update') {

          el.attr({
            role: 'tab',
            tabindex: '-1',
            'aria-controls': el.attr('href').substring(1)
          });

          el.on('click', function (event) {

            console.log('click', event);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGpzXFxjb3JlLmpzIiwic3JjL2pzL3BsdWdpbnMvbWVudS5qcyIsInNyY1xcanNcXHBsdWdpbnNcXHRhYnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUEsQ0FBQyxZQUFXO0FBQ1YsTUFBSSxDQUFDLFFBQVEsU0FBUixDQUFrQixPQUF2QixFQUFnQztBQUM5QixZQUFRLFNBQVIsQ0FBa0IsT0FBbEIsR0FBNEIsUUFBUSxTQUFSLENBQWtCLGlCQUFsQixJQUF1QyxRQUFRLFNBQVIsQ0FBa0IscUJBQXJGOztBQUVBLFFBQUksQ0FBQyxRQUFRLFNBQVIsQ0FBa0IsT0FBdkIsRUFBZ0M7QUFDOUIsY0FBUSxTQUFSLENBQWtCLE9BQWxCLEdBQTRCLFVBQVUsRUFBVixFQUFjLFFBQWQsRUFBd0I7QUFDbEQsWUFBSSxXQUFXLElBQWY7QUFDQSxZQUFJLENBQUMsU0FBUyxlQUFULENBQXlCLFFBQXpCLENBQWtDLEVBQWxDLENBQUwsRUFBNEMsT0FBTyxJQUFQO0FBQzVDLFdBQUc7QUFDRCxjQUFJLFNBQVMsT0FBVCxDQUFpQixRQUFqQixDQUFKLEVBQWdDLE9BQU8sUUFBUDtBQUNoQyxxQkFBVyxTQUFTLGFBQXBCO0FBQ0QsU0FIRCxRQUdTLGFBQWEsSUFIdEI7QUFJQSxlQUFPLEVBQVA7QUFDRCxPQVJEO0FBU0Q7QUFDRjs7QUFFRCxNQUFJLE9BQU8sTUFBTSxTQUFOLENBQWdCLE9BQXZCLEtBQW1DLFVBQXZDLEVBQW1EO0FBQ2pELFVBQU0sU0FBTixDQUFnQixPQUFoQixHQUEwQixVQUFVLElBQVYsRUFBZ0I7QUFDeEMsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssTUFBekIsRUFBaUMsRUFBRSxDQUFuQyxFQUFzQztBQUNwQyxZQUFJLEtBQUssQ0FBTCxNQUFZLElBQWhCLEVBQXNCO0FBQ3BCLGlCQUFPLENBQVA7QUFDRDtBQUNGO0FB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RCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24oKSB7XHJcbiAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XHJcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yXHJcblxyXG4gICAgaWYgKCFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XHJcbiAgICAgIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbiAoZWwsIHNlbGVjdG9yKSB7XHJcbiAgICAgICAgdmFyIGFuY2VzdG9yID0gdGhpc1xyXG4gICAgICAgIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGVsKSkgcmV0dXJuIG51bGxcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICBpZiAoYW5jZXN0b3IubWF0Y2hlcyhzZWxlY3RvcikpIHJldHVybiBhbmNlc3RvclxyXG4gICAgICAgICAgYW5jZXN0b3IgPSBhbmNlc3Rvci5wYXJlbnRFbGVtZW50XHJcbiAgICAgICAgfSB3aGlsZSAoYW5jZXN0b3IgIT09IG51bGwpXHJcbiAgICAgICAgcmV0dXJuIGVsXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICh0eXBlb2YgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgIT09ICdmdW5jdGlvbicpIHtcclxuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IGl0ZW0pIHtcclxuICAgICAgICAgIHJldHVybiBpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAtMVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0pKCksXHJcblxyXG4vKlxyXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQvQ3VzdG9tRXZlbnRcclxuICovXHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZVxyXG5cclxuICBmdW5jdGlvbiBDdXN0b21FdmVudChldmVudCwgcGFyYW1zKSB7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMgfHwge1xyXG4gICAgICBidWJibGVzOiBmYWxzZSxcclxuICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXHJcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgICBsZXQgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50JylcclxuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbClcclxuICAgIHJldHVybiBldnRcclxuICB9XHJcblxyXG4gIEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbmRvdy5FdmVudC5wcm90b3R5cGVcclxuXHJcbiAgd2luZG93LkN1c3RvbUV2ZW50ID0gQ3VzdG9tRXZlbnRcclxufSkoKSxcclxuXHJcbi8qXHJcbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzY0ODE2MTIvcXVlcnlzZWxlY3Rvci1zZWFyY2gtaW1tZWRpYXRlLWNoaWxkcmVuI2Fuc3dlci0xNzk4OTgwM1xyXG4gKi9cclxuKGZ1bmN0aW9uIChkb2MsIHByb3RvKSB7XHJcbiAgdHJ5IHtcclxuICAgIGRvYy5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgYm9keScpXHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBbJ3F1ZXJ5U2VsZWN0b3InLCAncXVlcnlTZWxlY3RvckFsbCddLmZvckVhY2goZnVuY3Rpb24gKG1ldGhvZCkge1xyXG4gICAgICBsZXQgbmF0aXZlID0gcHJvdG9bbWV0aG9kXVxyXG4gICAgICBwcm90b1ttZXRob2RdID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgaWYgKC8oXnwsKVxccyo6c2NvcGUvLnRlc3Qoc2VsZWN0b3IpKSB7XHJcbiAgICAgICAgICBsZXQgaWQgPSB0aGlzLmlkXHJcbiAgICAgICAgICB0aGlzLmlkID0gJ0lEXycgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC8oKF58LClcXHMqKTpzY29wZS9nLCAnJDEjJyArIHRoaXMuaWQpXHJcbiAgICAgICAgICBsZXQgcmVzdWx0ID0gZG9jW21ldGhvZF0oc2VsZWN0b3IpXHJcbiAgICAgICAgICB0aGlzLmlkID0gaWRcclxuICAgICAgICAgIHJldHVybiByZXN1bHRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIG5hdGl2ZS5jYWxsKHRoaXMsIHNlbGVjdG9yKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcbn0pKHdpbmRvdy5kb2N1bWVudCwgRWxlbWVudC5wcm90b3R5cGUpLFxyXG5cclxuLypcclxuICogT3pvbmUgaXMgYmFzZWQgb24gdGhlIHdvcmsgb2YgQW5kcmV3IEJ1cmdlc3NcclxuICogXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmRyZXc4MDg4L2RvbWUvYmxvYi9tYXN0ZXIvc3JjL2RvbWUuanNcclxuICovXHJcbndpbmRvdy5vMyA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gIGNvbnN0IFZFUlNJT04gPSAnMC4wLjEnXHJcblxyXG4gIGNvbnN0IF9zZXR0aW5ncyA9IHtcclxuICAgIGV2ZW50UHJlZml4OiAnbzMnLFxyXG4gICAgZGF0YUF0dHI6ICdvem9uZScsXHJcbiAgICBkYXRhQXR0clRhYnM6ICd0YWJzJyxcclxuICAgIGRhdGFBdHRyTWVudTogJ21lbnUnXHJcbiAgfVxyXG5cclxuICBsZXQgX3N5c3RlbSA9IHtcclxuICAgIGJyb3dzZXI6IHtcclxuICAgICAgbGFuZzogbmF2aWdhdG9yLmxhbmd1YWdlLFxyXG4gICAgICBvczogbmF2aWdhdG9yLnBsYXRmb3JtLFxyXG4gICAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgsXHJcbiAgICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHRcclxuICAgIH0sXHJcbiAgICBzY3JlZW46IHtcclxuICAgICAgYml0OiBzY3JlZW4uY29sb3JEZXB0aCxcclxuICAgICAgd2lkdGg6IHNjcmVlbi53aWR0aCxcclxuICAgICAgaGVpZ2h0OiBzY3JlZW4uaGVpZ2h0XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcclxuICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgPSBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fCBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3JcclxuICB9XHJcblxyXG4gIC8vIEludGVybmFsIGRlYm91bmNlIGhhbmRsZXJcclxuICBsZXQgZGVib3VuY2UgPSBmdW5jdGlvbiAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XHJcbiAgICBsZXQgdGltZW91dFxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgbGV0IGNvbnRleHQgPSB0aGlzXHJcbiAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzXHJcbiAgICAgIGxldCBsYXRlciA9ICgpID0+IHtcclxuICAgICAgICB0aW1lb3V0ID0gbnVsbFxyXG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XHJcbiAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxyXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcclxuICAgICAgaWYgKGNhbGxOb3cpIHtcclxuICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFdpbmRvdyByZXNpemVcclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UoKCkgPT4ge1xyXG4gICAgX3N5c3RlbS5icm93c2VyLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGhcclxuICAgIF9zeXN0ZW0uYnJvd3Nlci5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodFxyXG4gIH0sIDI1MCkpXHJcblxyXG4gIGxldCBPem9uZSA9IGZ1bmN0aW9uIChlbHMpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHRoaXNbaV0gPSBlbHNbaV1cclxuICAgIH1cclxuICAgIHRoaXMubGVuZ3RoID0gZWxzLmxlbmd0aFxyXG4gIH1cclxuXHJcbiAgLyogPT09PT09PT09PT09PT09PT1cclxuICAgKiBNdXRhdGlvbiBPYnNlcnZlclxyXG4gICAqID09PT09PT09PT09PT09PT09XHJcbiAgICovXHJcblxyXG4gIGxldCBNdXRhdGlvbk9ic2VydmVyID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93Lk1vek11dGF0aW9uT2JzZXJ2ZXJcclxuXHJcbiAgbGV0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xyXG4gICAgbXV0YXRpb25zLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XHJcbiAgICAgIHRyaWdnZXJNdXRhdGlvbkhhbmRsZXIobXV0YXRpb24udGFyZ2V0KVxyXG4gICAgfSlcclxuICB9KVxyXG4gIGxldCBvYnNlcnZlckNvbmZpZyA9IHtcclxuICAgIGNoaWxkTGlzdDogdHJ1ZSxcclxuICAgIHN1YnRyZWU6IHRydWVcclxuICB9XHJcblxyXG4gIGxldCBtdXRhdGlvbkVsZW1lbnRzID0gW11cclxuXHJcbiAgZnVuY3Rpb24gaXNNdXRhdGlvblVuaXF1ZShlbCkge1xyXG4gICAgcmV0dXJuIG11dGF0aW9uRWxlbWVudHMuZmlsdGVyKChvYmopID0+IHtcclxuICAgICAgcmV0dXJuIGVsWzBdLmlzRXF1YWxOb2RlKG9iai50YXJnZXRbMF0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdHJpZ2dlck11dGF0aW9uSGFuZGxlcihlbCkge1xyXG4gICAgbXV0YXRpb25FbGVtZW50cy5maWx0ZXIoKG9iaikgPT4ge1xyXG4gICAgICBpZiAoZWwuaXNFcXVhbE5vZGUob2JqLnRhcmdldFswXSkpIHtcclxuICAgICAgICBvYmoudGFyZ2V0W29iai5oYW5kbGVyXShvYmoub3B0aW9ucylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8qID09PT09XHJcbiAgICogVVRJTFNcclxuICAgKiA9PT09PVxyXG4gICAqL1xyXG5cclxuICBPem9uZS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgdGhpcy5tYXAoY2FsbGJhY2spXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgbGV0IHJlc3VsdHMgPSBbXVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIHJlc3VsdHMucHVzaChjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXNbaV0sIGkpKVxyXG4gICAgfVxyXG4gICAgLy9yZXR1cm4gcmVzdWx0cy5sZW5ndGggPiAxID8gcmVzdWx0cyA6IHJlc3VsdHNbMF1cclxuICAgIHJldHVybiByZXN1bHRzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUubWFwT25lID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICBsZXQgbSA9IHRoaXMubWFwKGNhbGxiYWNrKVxyXG4gICAgcmV0dXJuIG0ubGVuZ3RoID4gMSA/IG0gOiBtWzBdXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUubXV0YXRpb24gPSBmdW5jdGlvbiAoaGFuZGxlciwgb3B0aW9ucykge1xyXG4gICAgaWYgKGlzTXV0YXRpb25VbmlxdWUodGhpcykpIHtcclxuICAgICAgbXV0YXRpb25FbGVtZW50cy5wdXNoKHtcclxuICAgICAgICB0YXJnZXQ6IHRoaXMsXHJcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcclxuICAgICAgICBoYW5kbGVyOiBoYW5kbGVyXHJcbiAgICAgIH0pXHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShlbCwgb2JzZXJ2ZXJDb25maWcpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlbW92ZU11dGF0aW9uID0gZnVuY3Rpb24gKGhhbmRsZXIpIHtcclxuICAgIGlmIChpc011dGF0aW9uVW5pcXVlKHRoaXMpKSB7XHJcbiAgICAgIG11dGF0aW9uRWxlbWVudHMuZmlsdGVyKChvYmopID0+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhvYmosIHRoaXMsIGhhbmRsZXIpXHJcbiAgICAgIH0pXHJcbiAgICAgIC8qIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShlbCwgb2JzZXJ2ZXJDb25maWcpXHJcbiAgICAgIH0pICovXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnJlY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgIGxldCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICB4OiByZWN0LngsXHJcbiAgICAgICAgeTogcmVjdC55LFxyXG4gICAgICAgIHRvcDogcmVjdC50b3AsXHJcbiAgICAgICAgYm90dG9tOiByZWN0LmJvdHRvbSxcclxuICAgICAgICBsZWZ0OiByZWN0LmxlZnQsXHJcbiAgICAgICAgcmlnaHQ6IHJlY3QucmlnaHQsXHJcbiAgICAgICAgd2lkdGg6IHJlY3Qud2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcclxuICAgICAgICBvZmZzZXRUb3A6IGVsLm9mZnNldFRvcCxcclxuICAgICAgICBvZmZzZXRMZWZ0OiBlbC5vZmZzZXRMZWZ0LFxyXG4gICAgICAgIG9mZnNldFdpZHRoOiBlbC5vZmZzZXRXaWR0aCxcclxuICAgICAgICBvZmZzZXRIZWlnaHQ6IGVsLm9mZnNldEhlaWdodCxcclxuICAgICAgICBoaWRkZW46IGVsLmhpZGRlblxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyogPT09PT09PT09PT09PT09PVxyXG4gICAqIERPTSBNQU5JUFVMQVRJT05cclxuICAgKiA9PT09PT09PT09PT09PT09XHJcbiAgICovXHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihpKSB7XHJcbiAgICBpZiAodGhpc1tpXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybiBvMy5maW5kKHRoaXNbaV0pXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgaWYgKHR5cGVvZiB0ZXh0ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGVsLmlubmVyVGV4dCA9IHRleHRcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICByZXR1cm4gZWwuaW5uZXJUZXh0XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuaHRtbCA9IGZ1bmN0aW9uIChodG1sKSB7XHJcbiAgICBpZiAodHlwZW9mIGh0bWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgZWwuaW5uZXJIVE1MID0gaHRtbFxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFwT25lKChlbCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBlbC5pbm5lckhUTUxcclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5hZGRDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc2VzKSB7XHJcbiAgICBsZXQgY2xhc3NOYW1lID0gJydcclxuICAgIGlmICh0eXBlb2YgY2xhc3NlcyAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzZXNbaV1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2xhc3NOYW1lID0gJyAnICsgY2xhc3Nlc1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgZWwuY2xhc3NOYW1lICs9IGNsYXNzTmFtZVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChjbHMpIHtcclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIGxldCBjcyA9IGVsLmNsYXNzTmFtZS5zcGxpdCgvXFxzKy8pXHJcbiAgICAgIGxldCBpXHJcblxyXG4gICAgICB3aGlsZSAoKGkgPSBjcy5pbmRleE9mKGNscykpID4gLTEpIHtcclxuICAgICAgICBjcyA9IGNzLnNsaWNlKDAsIGkpLmNvbmNhdChjcy5zbGljZSgrK2kpKVxyXG4gICAgICB9XHJcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGNzLmpvaW4oJyAnKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5hdHRyID0gZnVuY3Rpb24gKGF0dHIsIHZhbCkge1xyXG4gICAgaWYgKHR5cGVvZiBhdHRyID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAvLyBPYmplY3QgaW5zdGVhZCBvZiBzdHJpbmdcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXR0cikge1xyXG4gICAgICAgICAgaWYgKGF0dHIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBpZiAoYXR0cltrZXldID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGtleS50b1N0cmluZygpKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXkudG9TdHJpbmcoKSwgYXR0cltrZXldKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gU3RyaW5nIGluc3RlYWQgb2Ygb2JqZWN0XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBpZiAodmFsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShhdHRyKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGF0dHIsIHZhbClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICAgIHJldHVybiBlbC5nZXRBdHRyaWJ1dGUoYXR0cilcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUuY3NzID0gZnVuY3Rpb24gKGF0dHIsIHZhbCkge1xyXG4gICAgaWYgKHR5cGVvZiBhdHRyID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAvLyBPYmplY3QgaW5zdGVhZCBvZiBzdHJpbmdcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXR0cikge1xyXG4gICAgICAgICAgaWYgKGF0dHIuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgICAgICBlbC5zdHlsZVtrZXkudG9TdHJpbmcoKV0gPSBhdHRyW2tleV1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBTdHJpbmcgaW5zdGVhZCBvZiBvYmplY3RcclxuICAgICAgaWYgKHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLnN0eWxlW2F0dHJdID0gdmFsXHJcbiAgICAgICAgfSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tYXBPbmUoKGVsKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB3aW4gPSBlbC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3XHJcbiAgICAgICAgICByZXR1cm4gd2luLmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpW2F0dHJdXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmRhdGEgPSBmdW5jdGlvbiAoYXR0ciwgdmFsKSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIGF0dHIsIHZhbClcclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1hcE9uZSgoZWwpID0+IHtcclxuICAgICAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLScgKyBhdHRyKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uIChlbHMpIHtcclxuICAgIGlmICh0eXBlb2YgZWxzID09PSAnc3RyaW5nJykge1xyXG4gICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbC5pbm5lckhUTUwgPSBlbHNcclxuICAgICAgZWxzID0gbzMuZmluZChlbC5jaGlsZHJlbilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKHBhckVsLCBpKSA9PiB7XHJcbiAgICAgIGVscy5mb3JFYWNoKChjaGlsZEVsKSA9PiB7XHJcbiAgICAgICAgcGFyRWwuYXBwZW5kQ2hpbGQoKGkgPiAwKSA/IGNoaWxkRWwuY2xvbmVOb2RlKHRydWUpIDogY2hpbGRFbClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucHJlcGVuZCA9IGZ1bmN0aW9uIChlbHMpIHtcclxuICAgIGlmICh0eXBlb2YgZWxzID09PSAnc3RyaW5nJykge1xyXG4gICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBlbC5pbm5lckhUTUwgPSBlbHNcclxuICAgICAgZWxzID0gbzMuZmluZChlbC5jaGlsZHJlbilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKHBhckVsLCBpKSA9PiB7XHJcbiAgICAgIGZvciAobGV0IGogPSBlbHMubGVuZ3RoIC0gMTsgaiA+IC0xOyBqLS0pIHtcclxuICAgICAgICBwYXJFbC5pbnNlcnRCZWZvcmUoKGkgPiAwKSA/IGVsc1tqXS5jbG9uZU5vZGUodHJ1ZSkgOiBlbHNbal0sIHBhckVsLmZpcnN0Q2hpbGQpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgcmV0dXJuIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGlmIChkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2dCwgZm4sIGZhbHNlKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYXR0YWNoRXZlbnQpIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyBldnQsIGZuKVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbFsnb24nICsgZXZ0XSA9IGZuXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0oKSlcclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLm9mZiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGV2dCwgZm4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGZuLCBmYWxzZSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmRldGFjaEV2ZW50KSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoZXZ0LCBmbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgZXZ0LCBmbilcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKmVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzKi9cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldnQsIGZuKSB7XHJcbiAgICAgICAgLyplc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzKi9cclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgICAgZWxbJ29uJyArIGV2dF0gPSBudWxsXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0oKSlcclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcclxuICAgIHJldHVybiBvMy5maW5kKHNlbGVjdG9yLCBjb250ZXh0LCB0aGlzWzBdKVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmNsb3Nlc3QgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgbGV0IGFuY2VzdG9yID0gdGhpc1swXVxyXG4gICAgZG8ge1xyXG4gICAgICBpZiAoYW5jZXN0b3IubWF0Y2hlcyhzZWxlY3RvcikpIHtcclxuICAgICAgICByZXR1cm4gbzMuZmluZChhbmNlc3RvcilcclxuICAgICAgfVxyXG4gICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudE5vZGVcclxuICAgIH0gd2hpbGUgKGFuY2VzdG9yICE9PSBudWxsKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgZWwgPSB0aGlzWzBdXHJcbiAgICB3aGlsZSAoKGVsID0gZWwucHJldmlvdXNTaWJsaW5nKSkge1xyXG4gICAgICBpZiAoZWwubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gbzMuZmluZChlbClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIE96b25lLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgZWwgPSB0aGlzWzBdXHJcbiAgICB3aGlsZSAoKGVsID0gZWwubmV4dFNpYmxpbmcpKSB7XHJcbiAgICAgIGlmIChlbC5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgIHJldHVybiBvMy5maW5kKGVsKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLnNpYmxpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgY3VycmVudCA9IHRoaXNbMF1cclxuICAgIGxldCBwYXJlbnQgPSBjdXJyZW50LnBhcmVudE5vZGVcclxuICAgIGxldCBzaWJsaW5ncyA9IFtdXHJcbiAgICBmb3IgKGxldCBpID0gMCwgaW1heCA9IHBhcmVudC5jaGlsZHJlbi5sZW5ndGg7IGkgPCBpbWF4OyArK2kpIHtcclxuICAgICAgbGV0IGVsID0gcGFyZW50LmNoaWxkcmVuW2ldXHJcbiAgICAgIGlmICghZWwuaXNFcXVhbE5vZGUoY3VycmVudCkpIHtcclxuICAgICAgICBzaWJsaW5ncy5wdXNoKGVsKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IE96b25lKHNpYmxpbmdzKVxyXG4gIH1cclxuXHJcbiAgT3pvbmUucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzWzBdLmZvY3VzKClcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBPem9uZS5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgIHJldHVybiB0aGlzLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgIG8zLmZpcmVFdmVudCh0eXBlLCBlbClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBsZXQgbzMgPSB7XHJcbiAgICBmaW5kOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQsIHBhcmVudCkge1xyXG4gICAgICBsZXQgZWxzXHJcbiAgICAgIGlmIChjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHRbMF1cclxuICAgICAgfSBcclxuICAgICAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCAmJiBwYXJlbnQpIHtcclxuICAgICAgICBjb250ZXh0ID0gcGFyZW50XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBlbHMgPSBzZWxlY3RvciBpbnN0YW5jZW9mIE5vZGUgfHwgc2VsZWN0b3IgaW5zdGFuY2VvZiBXaW5kb3cgPyBbc2VsZWN0b3JdIDogW10uc2xpY2UuY2FsbCh0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZycgPyAoY29udGV4dCB8fCBkb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOiBzZWxlY3RvciB8fCBbXSlcclxuICAgICAgfSBlbHNlIGlmIChzZWxlY3Rvci5sZW5ndGgpIHtcclxuICAgICAgICBlbHMgPSBzZWxlY3RvclxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVscyA9IFtzZWxlY3Rvcl1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3IE96b25lKGVscylcclxuICAgIH0sXHJcbiAgICBjcmVhdGU6ICh0YWdOYW1lLCBhdHRycykgPT4ge1xyXG4gICAgICBsZXQgZWwgPSBuZXcgT3pvbmUoW2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSldKVxyXG4gICAgICBpZiAoYXR0cnMpIHtcclxuICAgICAgICBpZiAoYXR0cnMuY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICBlbC5hZGRDbGFzcyhhdHRycy5jbGFzc05hbWUpXHJcbiAgICAgICAgICBkZWxldGUgYXR0cnMuY2xhc3NOYW1lXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhdHRycy50ZXh0KSB7XHJcbiAgICAgICAgICBlbC50ZXh0KGF0dHJzLnRleHQpXHJcbiAgICAgICAgICBkZWxldGUgYXR0cnMudGV4dFxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gYXR0cnMpIHtcclxuICAgICAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XHJcbiAgICAgICAgICAgIGVsLmF0dHIoa2V5LCBhdHRyc1trZXldKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZWxcclxuICAgIH0sXHJcbiAgICBzZXR0aW5nczogKCkgPT4ge1xyXG4gICAgICByZXR1cm4gX3NldHRpbmdzXHJcbiAgICB9LFxyXG4gICAgZXh0OiAobmFtZSwgZm4pID0+IHtcclxuICAgICAgaWYgKHR5cGVvZiBPem9uZS5wcm90b3R5cGVbbmFtZV0gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgT3pvbmUucHJvdG90eXBlW25hbWVdID0gZm5cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGZpcmVFdmVudDogZnVuY3Rpb24gKHR5cGUsIGVsLCBvYmopIHtcclxuICAgICAgbGV0IGV2dCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XHJcbiAgICAgICAgZGV0YWlsOiBvYmosXHJcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcclxuICAgICAgICBjYW5jZWxhYmxlOiBmYWxzZVxyXG4gICAgICB9KVxyXG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2dClcclxuICAgIH0sXHJcbiAgICByZWFkeTogZnVuY3Rpb24gKGZuKSB7XHJcbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcclxuICAgICAgICBmbigpXHJcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmbilcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkb2N1bWVudC5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT0gJ2xvYWRpbmcnKVxyXG4gICAgICAgICAgICBmbigpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIG9wdGlvbnNUb0pTT046IGZ1bmN0aW9uKHN0cmluZykge1xyXG4gICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFxzL2csJycpXHJcbiAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC8oXFxzKj97XFxzKj98XFxzKj8sXFxzKj8pKFsnXCJdKT8oW2EtekEtWjAtOV0rKShbJ1wiXSk/Oi9nLCAnJDFcIiQzXCI6JylcclxuICAgICAgcmV0dXJuIEpTT04ucGFyc2Uoc3RyaW5nKVxyXG4gICAgfSxcclxuICAgIHN5c3RlbTogX3N5c3RlbSxcclxuICAgIHZlcnNpb246IFZFUlNJT05cclxuICB9XHJcblxyXG4gIHJldHVybiBvM1xyXG59KCkpXHJcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJaUlzSW1acGJHVWlPaUp0Wlc1MUxtcHpJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHRkZlE9PSIsIihmdW5jdGlvbiAoKSB7XHJcbiAgLyoqXHJcbiAgICogVEFCU1xyXG4gICAqL1xyXG5cclxuICAvLyBLZWVwIGl0IHNpbXBsZVxyXG4gIGxldCBvMyA9IHdpbmRvdy5vM1xyXG4gIGxldCBzZXR0aW5ncyA9IG8zLnNldHRpbmdzKClcclxuICBsZXQgY29tcG9uZW50ID0gc2V0dGluZ3MuZGF0YUF0dHJUYWJzXHJcblxyXG4gIC8vIENvbXBvbmVudCBldmVudHNcclxuICBjb25zdCBFVkVOVCA9IHtcclxuICAgIFNUQVJURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke2NvbXBvbmVudH0uc3RhcnRlZGAsXHJcbiAgICBDT01QTEVURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke2NvbXBvbmVudH0uY29tcGxldGVkYCxcclxuICAgIENSRUFURUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke2NvbXBvbmVudH0uY3JlYXRlZGAsXHJcbiAgICBERVNUUk9ZRUQ6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke2NvbXBvbmVudH0uZGVzdHJveWVkYCxcclxuICAgIFNIT1c6IGAke3NldHRpbmdzLmV2ZW50UHJlZml4fS4ke2NvbXBvbmVudH0uc2hvd2BcclxuICB9XHJcblxyXG4gIC8vIEFkZCB0aGUgZXh0ZW5zaW9uOiAndGhpcycgaXMgaW5oZXJpdGVkIGZyb20gdGhlIE96b25lIHByb3RvdHlwZSAobm90IG8zKVxyXG4gIG8zLmV4dChgJHtjb21wb25lbnR9YCwgZnVuY3Rpb24gKG9wdHMgPSAnY3JlYXRlJykge1xyXG4gICAgbGV0IGVsbXMgPSB0aGlzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsbXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgbGV0IGVsID0gZWxtc1tpXVxyXG5cclxuICAgICAgaWYgKHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgIC8vIENyZWF0ZSBvciBkZXN0cm95XHJcbiAgICAgICAgc3dpdGNoIChvcHRzKSB7XHJcbiAgICAgICAgICBjYXNlICdjcmVhdGUnOlxyXG4gICAgICAgICAgY2FzZSAndXBkYXRlJzpcclxuICAgICAgICAgICAgY3JlYXRlKGVsLCBvcHRzKVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgY2FzZSAnZGVzdHJveSc6XHJcbiAgICAgICAgICAgIGRlc3Ryb3koZWwpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNyZWF0ZShlbCwgb3B0cylcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfSlcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBjb21wb25lbnRcclxuICBsZXQgY3JlYXRlID0gZnVuY3Rpb24gKGVsLCBvcHRzKSB7XHJcblxyXG4gICAgbGV0IHBhbmVscyA9IFtdXHJcblxyXG4gICAgLy8gU2VuZCB0aGUgc3RhcnRlZCBldmVudFxyXG4gICAgbzMuZmlyZUV2ZW50KEVWRU5ULlNUQVJURUQsIGVsLCB7fSlcclxuXHJcbiAgICAvLyBDb252ZXJ0IGVsZW1lbnQgdG8gT3pvbmUgb2JqZWN0XHJcbiAgICBsZXQgdGFibGlzdCA9IG8zLmZpbmQoZWwpXHJcblxyXG4gICAgLy8gTG9vayBmb3IgYW55IGRhdGEgb3B0aW9ucyBpbiB0aGUgZWxlbWVudCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdFxyXG4gICAgbGV0IG9wdGlvbnMgPSB0YWJsaXN0LmF0dHIoJ2RhdGEtb3pvbmUtb3B0aW9ucycpXHJcbiAgICBvcHRzID0gKG9wdGlvbnMgIT09IG51bGwpID8gbzMub3B0aW9uc1RvSlNPTihvcHRpb25zKSA6IG9wdHNcclxuXHJcbiAgICBpZiAodGFibGlzdC5hdHRyKCdyb2xlJykgIT09ICd0YWJsaXN0JyB8fCBvcHRzID09PSAndXBkYXRlJykge1xyXG5cclxuICAgICAgLy8gQXNzaWduIHRoZSB0YWJsaXN0IHJvbGVcclxuICAgICAgdGFibGlzdC5hdHRyKHtcclxuICAgICAgICByb2xlOiAndGFibGlzdCdcclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIExpc3QgaXRlbXMgYXJlIHByZXNlbnRhdGlvbiBvbmx5XHJcbiAgICAgIHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGknKS5hdHRyKHtcclxuICAgICAgICByb2xlOiAncHJlc2VudGF0aW9uJ1xyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gQ29ubmVjdCBlYWNoIGxpbmsgdG8gdGhlaXIgZWxlbWVudFxyXG4gICAgICB0YWJsaXN0LmZpbmQoJzpzY29wZSA+IGxpIGEnKS5mb3JFYWNoKChlbCkgPT4ge1xyXG5cclxuICAgICAgICBlbCA9IG8zLmZpbmQoZWwpXHJcblxyXG4gICAgICAgIGlmIChlbC5hdHRyKCdyb2xlJykgIT09ICd0YWInIHx8IG9wdHMgPT09ICd1cGRhdGUnKSB7XHJcblxyXG4gICAgICAgICAgZWwuYXR0cih7XHJcbiAgICAgICAgICAgIHJvbGU6ICd0YWInLFxyXG4gICAgICAgICAgICB0YWJpbmRleDogJy0xJyxcclxuICAgICAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBlbC5hdHRyKCdocmVmJykuc3Vic3RyaW5nKDEpXHJcbiAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgIGVsLm9uKCdjbGljaycsIChldmVudCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NsaWNrJywgZXZlbnQpXHJcblxyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGxldCB0YWIgPSBvMy5maW5kKGV2ZW50LnRhcmdldClcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSB0YWJzXHJcbiAgICAgICAgICAgIHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGkgW3JvbGU9XCJ0YWJcIl0nKS5hdHRyKHtcclxuICAgICAgICAgICAgICB0YWJpbmRleDogJy0xJyxcclxuICAgICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IG51bGxcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgY3VycmVudCBvbmVcclxuICAgICAgICAgICAgdGFiLmF0dHIoe1xyXG4gICAgICAgICAgICAgIHRhYmluZGV4OiAnMCcsXHJcbiAgICAgICAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSdcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIFNob3cgdGhlIGNvcnJlY3QgcGFuZWxcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvMy5maW5kKGVsLmF0dHIoJ2hyZWYnKSlcclxuICAgICAgICAgICAgY3VycmVudC5hdHRyKHtcclxuICAgICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiBudWxsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBIaWRlIHRoZSBzaWJsaW5nc1xyXG4gICAgICAgICAgICBjdXJyZW50LnNpYmxpbmdzKCkuYXR0cih7XHJcbiAgICAgICAgICAgICAgJ2FyaWEtaGlkZGVuJzogJ3RydWUnXHJcbiAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAvLyBLZXlib2FyZCBpbnRlcmFjdGlvblxyXG4gICAgICAgICAgZWwub24oJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldCA9IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBvMy5maW5kKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnW3JvbGU9XCJ0YWJsaXN0XCJdJykuZmluZCgnW2FyaWEtc2VsZWN0ZWQ9XCJ0cnVlXCJdJylcclxuICAgICAgICAgICAgbGV0IGNsb3Nlc3QgPSBzZWxlY3RlZC5jbG9zZXN0KCdsaScpXHJcbiAgICAgICAgICAgIGxldCBwcmV2ID0gY2xvc2VzdC5wcmV2KCkuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKVxyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IGNsb3Nlc3QubmV4dCgpLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0aGUgZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgIGNhc2UgMzc6XHJcbiAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgIHRhcmdldCA9IHByZXZcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgY2FzZSAzOTpcclxuICAgICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gbmV4dFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgdGFyZ2V0LmZvY3VzKCkudHJpZ2dlcignY2xpY2snKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgIC8vIFNldCB0aGUgdGFiIHBhbmVsIHJvbGVcclxuICAgICAgICAgIGxldCBwYW5lbCA9IG8zLmZpbmQoZWwuYXR0cignaHJlZicpKVxyXG4gICAgICAgICAgaWYgKHBhbmVsLmF0dHIoJ3JvbGUnKSAhPT0gJ3RhYnBhbmVsJykge1xyXG4gICAgICAgICAgICBwYW5lbC5hdHRyKHtcclxuICAgICAgICAgICAgICByb2xlOiAndGFicGFuZWwnLFxyXG4gICAgICAgICAgICAgICdhcmlhLWhpZGRlbic6ICd0cnVlJ1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgLy8gTWFrZSB0aGUgZmlyc3QgY2hpbGQgb2YgdGhlIHRhYnBhbmVsIChvciB0aGUgdGFiIHBhbmVsIGl0c2VsZikgZm9jdXNhYmxlXHJcbiAgICAgICAgICAgIGxldCBmaXJzdEVsID0gKHBhbmVsWzBdLmNoaWxkcmVuLmxlbmd0aCA+IDApID8gbzMuZmluZChwYW5lbFswXS5jaGlsZHJlblswXSkgOiBwYW5lbFxyXG4gICAgICAgICAgICBmaXJzdEVsLmF0dHIoe1xyXG4gICAgICAgICAgICAgIHRhYmluZGV4OiAnMCdcclxuICAgICAgICAgICAgfSlcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgIHBhbmVscy5wdXNoKHBhbmVsKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIGlmIChvcHRzICE9PSAndXBkYXRlJykge1xyXG4gICAgICAgIC8vIEF1dG9tYXRpY2FsbHkgc2VsZWN0IHRoZSBmaXJzdCBvbmUgKHVubGVzcyBvdGhlcndpc2Ugc3BlY2lmaWVkKVxyXG4gICAgICAgIGxldCBzZWxlY3RlZEluZGV4ID0gKG9wdHMuc2hvdykgPyBwYXJzZUludChvcHRzLnNob3cpIDogMFxyXG4gICAgICAgIGxldCBzZWxlY3RlZFRhYiA9IHRhYmxpc3QuZmluZCgnOnNjb3BlID4gbGknKVxyXG4gICAgICAgIHNlbGVjdGVkVGFiID0gbzMuZmluZChzZWxlY3RlZFRhYltzZWxlY3RlZEluZGV4XSkuZmluZCgnOnNjb3BlID4gYScpXHJcbiAgICAgICAgc2VsZWN0ZWRUYWIuYXR0cih7XHJcbiAgICAgICAgICAnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJyxcclxuICAgICAgICAgIHRhYmluZGV4OiAnMCdcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBTaG93IHRoZSBzZWxlY3RlZCBwYW5lbFxyXG4gICAgICAgIHBhbmVsc1tzZWxlY3RlZEluZGV4XS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXHJcblxyXG4gICAgICAgIC8vIFJlZ2lzdGVyIHdpdGggdGhlIG11dGF0aW9uIG9ic2VydmVyIHRvIHdhdGNoIGZvciBjaGFuZ2VzXHJcbiAgICAgICAgaWYgKCFvcHRzLnN0YXRpYykge1xyXG4gICAgICAgICAgdGFibGlzdC5tdXRhdGlvbihgJHtjb21wb25lbnR9YCwgJ3VwZGF0ZScpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbzMuZmlyZUV2ZW50KEVWRU5ULkNPTVBMRVRFRCwgZWwsIHt9KVxyXG4gIH1cclxuXHJcblxyXG5cclxuICAvLyBSZW1vdmUgdGhlIGNvbXBvbmVudFxyXG4gIGxldCBkZXN0cm95ID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICBcclxuICAgIC8vIFNlbmQgdGhlIHN0YXJ0ZWQgZXZlbnRcclxuICAgIG8zLmZpcmVFdmVudChFVkVOVC5TVEFSVEVELCBlbCwge30pXHJcblxyXG4gICAgLy8gQ29udmVydCBlbGVtZW50IHRvIE96b25lIG9iamVjdFxyXG4gICAgbGV0IHRhYmxpc3QgPSBvMy5maW5kKGVsKVxyXG5cclxuICAgIC8vIEFzc2lnbiB0aGUgdGFibGlzdCByb2xlXHJcbiAgICB0YWJsaXN0LmF0dHIoe1xyXG4gICAgICByb2xlOiBudWxsXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIExpc3QgaXRlbXMgYXJlIHByZXNlbnRhdGlvbiBvbmx5XHJcbiAgICB0YWJsaXN0LmZpbmQoJzpzY29wZSA+IGxpJykuYXR0cih7XHJcbiAgICAgIHJvbGU6IG51bGxcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQ29ubmVjdCBlYWNoIGxpbmsgdG8gdGhlaXIgZWxlbWVudFxyXG4gICAgdGFibGlzdC5maW5kKCc6c2NvcGUgPiBsaSBhJykuZm9yRWFjaCgoZWwpID0+IHtcclxuXHJcbiAgICAgIGVsID0gbzMuZmluZChlbClcclxuXHJcbiAgICAgIGVsLmF0dHIoe1xyXG4gICAgICAgIHJvbGU6IG51bGwsXHJcbiAgICAgICAgdGFiaW5kZXg6IG51bGwsXHJcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBudWxsXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBlbC5vZmYoJ2NsaWNrJykub2ZmKCdrZXlkb3duJylcclxuXHJcbiAgICAgIC8vIFNldCB0aGUgdGFiIHBhbmVsIHJvbGVcclxuICAgICAgbGV0IHBhbmVsID0gbzMuZmluZChlbC5hdHRyKCdocmVmJykpXHJcbiAgICAgIHBhbmVsLmF0dHIoe1xyXG4gICAgICAgIHJvbGU6IG51bGxcclxuICAgICAgfSlcclxuXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIFJlbW92ZSBmcm9tIHRoZSBtdXRhdGlvbiBvYnNlcnZlclxyXG4gICAgdGFibGlzdC5yZW1vdmVNdXRhdGlvbihgJHtjb21wb25lbnR9YClcclxuICAgIFxyXG4gICAgbzMuZmlyZUV2ZW50KEVWRU5ULkRFU1RST1lFRCwgZWwsIHt9KVxyXG4gIH1cclxuXHJcbiAgLy8gUHJlcGFyZSBkYXRhIHNlbGVjdG9yXHJcbiAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLSR7c2V0dGluZ3MuZGF0YUF0dHJ9PVwiJHtjb21wb25lbnR9XCJdYFxyXG4gIGxldCBlbGVtZW50cyA9IG8zLmZpbmQoc2VsZWN0b3IpXHJcblxyXG4gIC8vIEF1dG9tYXRpY2FsbHkgc2V0dXAgYW55IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIHNlbGVjdG9yXHJcbiAgaWYgKGVsZW1lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgIG8zLmZpbmQoZWxlbWVudHMpLnRhYnMoKVxyXG4gIH1cclxuXHJcbn0pKCkiXX0=
