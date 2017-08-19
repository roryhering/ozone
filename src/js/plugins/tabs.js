(function () {
  /**
   * TABS
   */

  // Keep it simple
  let o3 = window.o3
  let settings = o3.settings()
  let component = settings.dataAttrTabs

  // Component events
  const EVENT = {
    STARTED: `${settings.eventPrefix}.${component}.started`,
    COMPLETED: `${settings.eventPrefix}.${component}.completed`,
    CREATED: `${settings.eventPrefix}.${component}.created`,
    DESTROYED: `${settings.eventPrefix}.${component}.destroyed`,
    SHOW: `${settings.eventPrefix}.${component}.show`
  }

  // Add the extension: 'this' is inherited from the Ozone prototype (not o3)
  o3.ext(`${component}`, function (opts = 'create') {
    let elms = this
    for (let i = 0; i < elms.length; ++i) {
      let el = elms[i]

      if (typeof opts === 'string') {
        // Create or destroy
        switch (opts) {
          case 'create':
          case 'update':
            create(el, opts)
            break
          case 'destroy':
            destroy(el)
            break
        }
      } else {
        create(el, opts)
      }
    }

    return this
  })

  // Create the component
  let create = function (el, opts) {

    let panels = []

    // Send the started event
    o3.fireEvent(EVENT.STARTED, el, {})

    // Convert element to Ozone object
    let tablist = o3.find(el)

    // Look for any data options in the element to override the default
    let options = tablist.attr('data-ozone-options')
    opts = (options !== null) ? o3.optionsToJSON(options) : opts

    if (tablist.attr('role') !== 'tablist' || opts === 'update') {

      // Assign the tablist role
      tablist.attr({
        role: 'tablist'
      })

      // List items are presentation only
      tablist.find(':scope > li').attr({
        role: 'presentation'
      })

      // Connect each link to their element
      tablist.find(':scope > li a:not([role="tab"]').forEach((el) => {

        el = o3.find(el)

        if (el.attr('role') !== 'tab' || opts === 'update') {

          el.attr({
            role: 'tab',
            tabindex: '-1',
            'aria-controls': el.attr('href').substring(1)
          })

          el.on('click', (event) => {

            event.preventDefault()
            let tab = o3.find(event.target)
            
            // Reset the tabs
            tablist.find(':scope > li [role="tab"]').attr({
              tabindex: '-1',
              'aria-selected': null
            })

            // Set the current one
            tab.attr({
              tabindex: '0',
              'aria-selected': 'true'
            })

            // Show the correct panel
            let current = o3.find(el.attr('href'))
            current.attr({
              'aria-hidden': null
            })
            
            // Hide the siblings
            current.siblings().attr({
              'aria-hidden': 'true'
            })

          })

          // Keyboard interaction
          el.on('keydown', (event) => {
            let target = undefined
            let selected = o3.find(event.target).closest('[role="tablist"]').find('[aria-selected="true"]')
            let closest = selected.closest('li')
            let prev = closest.prev().find('[role="tab"]')
            let next = closest.next().find('[role="tab"]')
            
            // Determine the direction
            switch (event.keyCode) {
              case 37:
              case 38:
                target = prev
                break
              case 39:
              case 40:
                target = next
                break
              default:
                target = undefined
                break
            }

            if (target && target.length) {
              event.preventDefault()
              target.focus().trigger('click')
            }
          })

          // Set the tab panel role
          let panel = o3.find(el.attr('href'))
          if (panel.attr('role') !== 'tabpanel') {
            panel.attr({
              role: 'tabpanel',
              'aria-hidden': 'true'
            })

            // Make the first child of the tabpanel (or the tab panel itself) focusable
            let firstEl = (panel[0].children.length > 0) ? o3.find(panel[0].children[0]) : panel
            firstEl.attr({
              tabindex: '0'
            })

            // Save for later
            panels.push(panel)
          }
        }
      })

      if (opts !== 'update') {
        // Automatically select the first one (unless otherwise specified)
        let selectedIndex = (opts.show) ? parseInt(opts.show) : 0
        let selectedTab = tablist.find(':scope > li')
        selectedTab = o3.find(selectedTab[selectedIndex]).find(':scope > a')
        selectedTab.attr({
          'aria-selected': 'true',
          tabindex: '0'
        })

        // Show the selected panel
        panels[selectedIndex].attr('aria-hidden', 'false')

        // Register with the mutation observer to watch for changes
        if (!opts.static) {
          tablist.mutation(`${component}`, 'update')
        }
      }
    }

    o3.fireEvent(EVENT.COMPLETED, el, {})
  }



  // Remove the component
  let destroy = function (el) {
    
    // Send the started event
    o3.fireEvent(EVENT.STARTED, el, {})

    // Convert element to Ozone object
    let tablist = o3.find(el)

    // Assign the tablist role
    tablist.attr({
      role: null
    })

    // List items are presentation only
    tablist.find(':scope > li').attr({
      role: null
    })

    // Connect each link to their element
    tablist.find(':scope > li a').forEach((el) => {

      el = o3.find(el)

      el.attr({
        role: null,
        tabindex: null,
        'aria-controls': null
      })

      el.off('click').off('keydown')

      // Set the tab panel role
      let panel = o3.find(el.attr('href'))
      panel.attr({
        role: null
      })

    })

    // Remove from the mutation observer
    tablist.removeMutation(`${component}`)
    
    o3.fireEvent(EVENT.DESTROYED, el, {})
  }

  // Prepare data selector
  let selector = `[data-${settings.dataAttr}="${component}"]`
  let elements = o3.find(selector)

  // Automatically setup any element matching the selector
  if (elements.length > 0) {
    o3.find(elements).tabs()
  }

})()