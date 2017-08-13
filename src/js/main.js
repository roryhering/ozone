if (typeof Array.prototype.indexOf !== 'function') {
  Array.prototype.indexOf = function (item) {
    for (let i = 0; i < this.length; ++i) {
      if (this[i] === item) {
        return i
      }
    }
    return -1
  }
}

(function () {

  if (typeof window.CustomEvent === 'function') return false

  function CustomEvent(event, params) {
    params = params || { 
      bubbles: false, 
      cancelable: false, 
      detail: undefined 
    }
    let evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }

  CustomEvent.prototype = window.Event.prototype

  window.CustomEvent = CustomEvent
})()

window.o3 = (function () {

  const VERSION = '0.0.1'

  let _settings = {
    showConsole: false,
    eventPrefix: 'o3',
    dataAttribute: 'layer',
    dataAttributeTabs: 'tabs'
  }

  let _system = {
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
  }

  let styles = {
    'start': 'background: blue; color: white; padding: 3px 10px; display: block;',
    'end': 'background: black; color: white; padding: 3px 10px; display: block;',
    'log': 'color: green; padding: 3px 10px; display: block;',
    'error': 'color: red; padding: 3px 10px; display: block;'
  }

  // Internal debounce handler
  let debounce = function (func, wait, immediate) {
    let timeout
    return function () {
      let context = this
      let args = arguments
      let later = () => {
        timeout = null
        if (!immediate) {
          func.apply(context, args)
        }
      }
      let callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) {
        func.apply(context, args)
      }
    }
  }

  // Window resize
  window.addEventListener('resize', debounce(() => {
    _system.browser.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    _system.browser.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  }, 250))

  let Ozone = function (els) {
    for (let i = 0; i < els.length; ++i) {
      this[i] = els[i]
    }
    this.length = els.length
  }

  /* =====
   * UTILS
   * =====
   */

  Ozone.prototype.forEach = function (callback) {
    this.map(callback)
    return this
  }

  Ozone.prototype.map = function (callback) {
    let results = []
    for (let i = 0; i < this.length; ++i) {
      results.push(callback.call(this, this[i], i))
    }
    //return results.length > 1 ? results : results[0]
    return results
  }

  Ozone.prototype.mapOne = function (callback) {
    let m = this.map(callback)
    return m.length > 1 ? m : m[0]
  }

  /* ================
   * DOM MANIPULATION
   * ================
   */

  Ozone.prototype.text = function (text) {
    if (typeof text !== 'undefined') {
      return this.forEach((el) => {
        el.innerText = text
      })
    } else {
      return this.mapOne((el) => {
        return el.innerText
      })
    }
  }

  Ozone.prototype.html = function (html) {
    if (typeof html !== 'undefined') {
      return this.forEach((el) => {
        el.innerHTML = html
      })
    } else {
      return this.mapOne((el) => {
        return el.innerHTML
      })
    }
  }
  
  Ozone.prototype.rect = function () {
    return this.mapOne((el) => {
      let rect = el.getBoundingClientRect()
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
      }
    })
  }

  Ozone.prototype.addClass = function (classes) {
    let className = ''
    if (typeof classes !== 'string') {
      for (let i = 0; i < classes.length; ++i) {
        className += ' ' + classes[i]
      }
    } else {
      className = ' ' + classes
    }
    return this.forEach((el) => {
      el.className += className
    })
  }

  Ozone.prototype.removeClass = function (cls) {
    return this.forEach((el) => {
      let cs = el.className.split(/\s+/)
      let i

      while ((i = cs.indexOf(cls)) > -1) {
        cs = cs.slice(0, i).concat(cs.slice(++i))
      }
      el.className = cs.join(' ')
    })
  }

  Ozone.prototype.attr = function (attr, val) {
    if (typeof attr === 'object') {
      // Object instead of string
      return this.forEach((el) => {
        for (let key in attr) {
          if (attr.hasOwnProperty(key)) {
            el.setAttribute(key.toString(), attr[key].toString())
          }
        }
      })
    } else {
      // String instead of object
      if (typeof val !== 'undefined') {
        return this.forEach((el) => {
          el.setAttribute(attr, val)
        })
      } else {
        return this.mapOne((el) => {
          return el.getAttribute(attr)
        })
      }
    }
  }

  Ozone.prototype.css = function (attr, val) {
    if (typeof attr === 'object') {
      // Object instead of string
      return this.forEach((el) => {
        for (let key in attr) {
          if (attr.hasOwnProperty(key)) {
            el.style[key.toString()] = attr[key]
          }
        }
      })
    } else {
      // String instead of object
      if (typeof val !== 'undefined') {
        return this.forEach((el) => {
          el.style[attr] = val
        })
      } else {
        return this.mapOne((el) => {
          const win = el.ownerDocument.defaultView
          return win.getComputedStyle(el, null)[attr]
        })
      }
    }
  }

  Ozone.prototype.append = function (els) {
    return this.forEach((parEl, i) => {
      els.forEach((childEl) => {
        parEl.appendChild((i > 0) ? childEl.cloneNode(true) : childEl)
      })
    })
  }

  Ozone.prototype.prepend = function (els) {
    return this.forEach((parEl, i) => {
      for (let j = els.length - 1; j > -1; j--) {
        parEl.insertBefore((i > 0) ? els[j].cloneNode(true) : els[j], parEl.firstChild)
      }
    })
  }

  Ozone.prototype.remove = function () {
    return this.forEach((el) => {
      return el.parentNode.removeChild(el)
    })
  }

  Ozone.prototype.on = (function () {
    if (document.addEventListener) {
      return function (evt, fn) {
        return this.forEach((el) => {
          el.addEventListener(evt, fn, false)
        })
      }
    } else if (document.attachEvent) {
      return function (evt, fn) {
        return this.forEach((el) => {
          el.attachEvent('on' + evt, fn)
        })
      }
    } else {
      return function (evt, fn) {
        return this.forEach((el) => {
          el['on' + evt] = fn
        })
      }
    }
  }())

  Ozone.prototype.off = (function () {
    if (document.removeEventListener) {
      return function (evt, fn) {
        return this.forEach((el) => {
          el.removeEventListener(evt, fn, false)
        })
      }
    } else if (document.detachEvent) {
      return function (evt, fn) {
        return this.forEach((el) => {
          el.detachEvent('on' + evt, fn)
        })
      }
    } else {
      /*eslint-disable no-unused-vars*/
      return function (evt, fn) {
        /*eslint-enable no-unused-vars*/
        return this.forEach((el) => {
          el['on' + evt] = null
        })
      }
    }
  }())

  let o3 = {
    find: (selector, context) => {
      let els
      if (typeof selector === 'string') {
        els = selector instanceof Node || selector instanceof Window ? [selector] : [].slice.call(typeof selector == 'string' ? (context || document).querySelectorAll(selector) : selector || [])
      } else if (selector.length) {
        els = selector
      } else {
        els = [selector]
      }
      return new Ozone(els)
    },
    create: (tagName, attrs) => {
      let el = new Ozone([document.createElement(tagName)])
      if (attrs) {
        if (attrs.className) {
          el.addClass(attrs.className)
          delete attrs.className
        }
        if (attrs.text) {
          el.text(attrs.text)
          delete attrs.text
        }
        for (let key in attrs) {
          if (attrs.hasOwnProperty(key)) {
            el.attr(key, attrs[key])
          }
        }
      }
      return el
    },
    settings: (opts) => {
      if (typeof opts === 'object') {
        for (let i in _settings) {
          if (_settings[i] && opts[i]) {
            _settings[i] = opts[i]
          }
        }

        if (_settings.showConsole) {
          console.log('%cOZONE: New options', styles.log)
          console.log(_settings)
        }
      }
      return _settings
    },
    ext: (name, fn) => {
      if (typeof Ozone.prototype[name] === 'undefined') {
        Ozone.prototype[name] = fn
      }
    },
    trigger: function (type, el, obj) {
      let evt = new CustomEvent(type, {
        detail: obj,
        bubbles: true,
        cancelable: false
      })
      el.dispatchEvent(evt)
    },
    ready: function(fn) {
      if (document.readyState !== 'loading') {
        fn()
      } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', fn)
      } else {
        document.attachEvent('onreadystatechange', function() {
          if (document.readyState != 'loading')
            fn()
        })
      }
    },
    system: _system,
    version: VERSION
  }

  return o3
}())
