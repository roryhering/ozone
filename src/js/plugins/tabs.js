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
          fit: false,
          show: 0
        }
        */
      }
    }
  })

  // Create the component
  let create = function (el, opts) {

    let panels = []

    // Send the started event
    o3.fireEvent(EVENT.STARTED, el, {})
    console.log('tab', el, opts)

    // Convert element to Ozone object
    let tablist = o3.find(el)

    if (tablist.attr('role') !== 'tablist') {
    
      // Assign the tablist role
      tablist.attr({
        role: 'tablist'
      })

      // List items are presentation only
      tablist.find(':scope > li').attr({
        role: 'presentation'
      })

      // Connect each link to their element
      tablist.find(':scope > li a').forEach((el) => {

        el = o3.find(el)
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
            'aria-selected': true
          })

          // Reset the panels
          for (let i = 0, imax = panels.length; i < imax; ++i) {
            let panel = o3.find(panels[i])
            panel.attr({
              'aria-hidden': true
            })
          }

          // Show the correct panel
          o3.find(el.attr('href')).attr({
            'aria-hidden': null
          })

        })

        // Keyboard interaction
        el.on('keydown', (event) => {
          let target = undefined
          let selected = o3.find(event.target).closest('[role="tablist"]').find('[aria-selected="true"]')
          let prev = selected.closest('li').prev().find('[role="tab"]')
          let next = selected.closest('li').next().find('[role="tab"]')
          
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
        panel.attr({
          role: 'tabpanel'
        })

        // Make the first child of the tabpanel focusable
        let firstEl = (panel[0].children.length > 0) ? o3.find(panel[0].children[0]) : panel
        firstEl.attr({
          tabindex: '0'
        })

        // Save for later
        panels.push(panel)
      })

      // Automatically select the first one
      let selectedIndex = 0
      let selectedTab = tablist.find(':scope > li') //:eq(' + selectedIndex + ') a')
      selectedTab = o3.find(selectedTab[selectedIndex]).find(':scope > a')
      selectedTab.attr({
        'aria-selected': 'true',
        tabindex: '0'
      })

      // Hide all panels (except for the selected panel)
      for (let i = 0, imax = panels.length; i < imax; ++i) {
        let panel = o3.find(panels[i])
        if (i !== selectedIndex) {
          panel.attr({
            'aria-hidden': true
          })
        }
      }
    }

    if (settings.showConsole) {
      console.log('%cTabs created', settings.style.log)
    }

    o3.fireEvent(EVENT.COMPLETED, el, {})
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