(function () {
  /**
   * TABS
   */

  // Keep it simple
  let o3 = window.o3
  let settings = o3.settings()

  // Component events
  const EVENT = {
    STARTED: `${settings.eventPrefix}.${settings.dataAttributeTabs}.started`,
    COMPLETED: `${settings.eventPrefix}.${settings.dataAttributeTabs}.completed`,
    CREATED: `${settings.eventPrefix}.${settings.dataAttributeTabs}.created`,
    REMOVED: `${settings.eventPrefix}.${settings.dataAttributeTabs}.removed`,
    SHOW: `${settings.eventPrefix}.${settings.dataAttributeTabs}.show`,
    HIDE: `${settings.eventPrefix}.${settings.dataAttributeTabs}.hide`,
  }

  // Add the tabs extension: 'this' is inherited from the Ozone prototype (not o3)
  o3.ext('tabs', function (opts = 'create') {
    let elms = this
    for (let i = 0; i < elms.length; ++i) {
      let el = elms[i]

      if (typeof opts === 'string') {
        // Create or destroy
        switch (opts) {
          case 'create':
            create(el, opts)
            break
          case 'destroy':
            destroy(el)
            break
        }
      } else {
        // Create with/change options
        console.log('create with/change options', opts)

        /*
        {
          fit: false
        }
        */
      }
    }
  })

  // Create the component
  let create = function (el, opts) {

    o3.trigger(EVENT.STARTED, el, {})
    console.log('tab', el, opts)

    if (settings.showConsole) {
      console.log('%cTabs created', settings.style.log)
    }

    o3.trigger(EVENT.COMPLETED, el, {})
  }

  // Remove the component
  let destroy = function (el) {
    console.log('destroy', el)
  }

  // Prepare data selector
  let selector = `[data-${settings.dataAttribute}="${settings.dataAttributeTabs}"]`
  let elements = o3.find(selector)

  // Automatically setup any element matching the selector
  if (elements.length > 0) {
    o3.find(elements).tabs()
  }

})()