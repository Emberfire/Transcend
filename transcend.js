class Transcend {
  contextMenus;                      // Object: The main context menu element functionality.

  constructor () {
    this.contextMenus = [];
  }

  static ContextMenu(element, options) {
    ts.contextMenus.push(new ContextMenu(element, options));
  }
}

let ts = new Transcend();

class ContextMenu {
  contextMenuElement;               // HTMLElement: The context menu element that is to be shown.
  expanded = false;                 // Bool: The state of the context menu.
  scrollable = false;               // Bool: If the context menu is too large to be displayed.
  expandedHeight;                   // Int: The height of the context menu when it is expanded.
  expandedWidth;                    // Int: The width of the context menu when it is expanded.

  settings = {                      // Object: The default settings for the context menu.
    triggerContainer: window,       // HTMLElement: The element for the context menu to be opened when right clicked.
    innerContextMenu: false,        // Bool: Whether right-clicking on the context menu should open the default context menu.
    scrollFit: true,                // Bool: Whether the context menu should shrink to fit the viewport and add a scrollbar to access all the options in it.
    closeOnScroll: true,            // Bool: Whether the context menu should close if the user scrolls the page. Scrolling on the element does not close it.
    persistent: false,              // Bool: Whether the context menu should remain open if the user clicks on it.
    debug: false                    // Bool: Initializes in debug mode, printing every function time to the console.
  };

  constructor (element, inputSettings) {
    if (this.settings.debug) {
      console.time("init");
    }

    if (element && element instanceof HTMLElement) {
      this.contextMenuElement = element;
    } else {
      throw new TypeError("Context menu element is not defined!");
    }

    if (inputSettings) {
      if (inputSettings.triggerContainer && inputSettings.triggerContainer instanceof HTMLElement) {
        // Check if there is a specified trigger container in the input settings. Highest priority.
        this.settings.triggerContainer = inputSettings.triggerContainer;
      } else if ("target" in this.contextMenuElement.dataset) {
        // Next, check if a trigger container is specified through the data-trigger attribute.
        let containmentElement = document.getElementById(this.contextMenuElement.dataset.target);
        if (containmentElement) {
          this.settings.triggerContainer = containmentElement;
        }
      } else if (this.contextMenuElement.parentElement && this.contextMenuElement.parentElement !== document.body) {
        // Finally, check if the context menu is in another element and use that element as a trigger container.
        this.settings.triggerContainer = this.contextMenuElement.parentElement;
      }

      if (inputSettings.innerContextMenu !== undefined && typeof inputSettings.innerContextMenu === "boolean") {
        this.settings.innerContextMenu = inputSettings.innerContextMenu;
      }

      if (inputSettings.scrollFit !== undefined && typeof inputSettings.scrollFit === "boolean") {
        this.settings.scrollFit = inputSettings.scrollFit;
      }

      if (inputSettings.closeOnScroll !== undefined && typeof inputSettings.closeOnScroll === "boolean") {
        this.settings.closeOnScroll = inputSettings.closeOnScroll;
      }

      if (inputSettings.persistent !== undefined && typeof inputSettings.persistent === "boolean") {
        this.settings.persistent = inputSettings.persistent;
      }
    }

    this.expandedHeight = this.contextMenuElement.clientHeight;
    this.expandedWidth = this.contextMenuElement.clientWidth;
    this.contextMenuElement.classList.add("context-menu-collapsed", "removed");
    this.setEventListeners();

    if (this.settings.debug) {
      console.timeEnd("init");
    }
  }

  expand (x = 0, y = 0) {
    if (this.settings.debug) {
      console.time("expand");
    }

    // Calculate context menu position relative to the viewport, so that it always is in view.
    let { top, left, bottom, right } = this.calculatePosition(x, y);

    if (top !== -1) {
      this.contextMenuElement.style.removeProperty("bottom");
      this.contextMenuElement.style.top = `${top}px`;
    } else {
      this.contextMenuElement.style.removeProperty("top");
      this.contextMenuElement.style.bottom = `${bottom}px`;
    }

    if (left !== -1) {
      this.contextMenuElement.style.removeProperty("right");
      this.contextMenuElement.style.left = `${left}px`;
    } else {
      this.contextMenuElement.style.removeProperty("left");
      this.contextMenuElement.style.right = `${right}px`;
    }

    if (this.expandedHeight >= document.documentElement.clientHeight - 10) {
      this.expandedHeight = document.documentElement.clientHeight - 10;
      this.contextMenuElement.style.height = `${document.documentElement.clientHeight - 20}px`;
      this.contextMenuElement.style.overflowY = "scroll";
      this.scrollable = true;
    }

    this.contextMenuElement.classList.remove("context-menu-collapsed", "removed");
    this.contextMenuElement.classList.add("context-menu-expanded");
    this.expanded = true;

    if (this.scrollable) {
      this.contextMenuElement.scrollTo(0, 0);
    }

    let self = this;

    if (this.settings.closeOnScroll) {
      // Don't close the context menu if clicked inside it.
      window.addEventListener("scroll", function (event) {
        if (event.target !== self.contextMenu && self.expanded) {
          self.collapse();
        }

        // Event listener is removed when it's fired once to prevent firing on every scroll. Passive is because it won't prevent default actions.
      }, { once: true, passive: true });
    }

    if (this.settings.debug) {
      console.timeEnd("expand");
    }
  }

  collapse () {
    if (this.settings.debug) {
      console.time("setEventListeners");
    }

    this.contextMenuElement.classList.remove("context-menu-expanded");
    this.contextMenuElement.classList.add("context-menu-collapsed");
    this.expanded = false;

    let self = this;
    this.contextMenuElement.addEventListener('animationend', function (event) {
      if (!self.expanded) {
        self.contextMenuElement.classList.add("removed");
      }
    }, { once: true });

    if (this.settings.debug) {
      console.timeEnd("setEventListeners");
    }
  }

  calculatePosition (x, y) {
    if (this.settings.debug) {
      console.time("calculatePosition");
    }

    let coordinates = { top: -1, left: -1, bottom: -1, right: -1 };

    // Open menu upwards if pointer is below half of the screen
    if (y > (document.documentElement.clientHeight / 2)) {
      if (y - this.expandedHeight < 5) {
        coordinates.top = 5;
      } else {
        coordinates.top = y - this.expandedHeight;
      }
    } else {
      // If the dropdown would overshoot the viewport and remain partially hidden, offset it up
      if (y + this.expandedHeight > document.documentElement.clientHeight - 5) {
        coordinates.bottom = 5;
      } else if (y < 5) {
        coordinates.top = 5;
      } else {
        coordinates.top = y;
      }
    }

    // If the element would overshoot on the right side of the viewport.
    if (x + this.expandedWidth > document.documentElement.clientWidth - 5) {
      coordinates.right = 5;
    } else if (x < 5) {
      // Add a little space between the left side of the viewport and the context menu.
      coordinates.left = 5;
    } else {
      coordinates.left = x;
    }

    if (this.settings.debug) {
      console.timeEnd("calculatePosition");
    }

    return coordinates;
  }

  /**
   * Manually add elements to the context menu.
   * @method add
   * @param  {HTMLElement, string} element Supports HTMLElement or html strings.
   */
  add (element) {
    if (this.settings.debug) {
      console.time("add");
    }

    if (typeof element == "object") {
      this.contextMenuElement.appendChild(element);
      this.calculateScales();
    } else if (typeof element == "string") {
      this.contextMenuElement.innerHTML += element;
      this.calculateScales();
    }

    if (this.settings.debug) {
      console.timeEnd("add");
    }
  }

  setEventListeners() {
    if (this.settings.debug) {
      console.time("setEventListeners");
    }

    let self = this;

    window.addEventListener("contextmenu", function (event) {
      if (self.expanded && event.target !== self.settings.triggerContainer && event.target !== self.contextMenuElement) {
        self.collapse();
      }
    });

    this.settings.triggerContainer.addEventListener("contextmenu", function (event) {
      if (event.target !== self.contextMenuElement) {
        event.preventDefault();

        self.expand(event.clientX, event.clientY);
      }
    });

    this.contextMenuElement.addEventListener("contextmenu", function (event) {
      if (!self.settings.innerContextMenu) {
        event.preventDefault();
      }
    });

    // Collapse the context menu if the user clicks on the page.
    window.addEventListener("click", function (event) {
      if (self.expanded) {
        // Check if the context menu is set to persistent and if it is then don't close the menu.
        if (event.target === self.contextMenuElement) {
          if (!self.settings.persistent) {
            self.collapse();
          }
        } else {
          self.collapse();
        }
      }
    });

    if (this.settings.debug) {
      console.timeEnd("setEventListeners");
    }
  }
}

let initialContextMenus = document.querySelectorAll(".context-menu");
for (let contextMenu of initialContextMenus) {
  Transcend.ContextMenu(contextMenu, {
    innerContextMenu: true,
    closeOnScroll: true,
    scrollFit: true,
    //triggerContainer: document.querySelector("#test2")
  });
}
