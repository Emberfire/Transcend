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
  displayTemp = "block";            // String: The temporary container for the display property of the context menu (in case the user changed it to something else).

  settings = {                      // Object: The default settings for the context menu.
    triggerContainer: window,       // HTMLElement: The element for the context menu to be opened when right clicked.
    innerContextMenu: false,        // Bool: Whether right-clicking on the context menu should open the default context menu.
    scrollFit: true,                // Bool: Whether the context menu should shrink to fit the viewport and add a scrollbar to access all the options in it.
    closeOnScroll: true,            // Bool: Whether the context menu should close if the user scrolls the page. Scrolling on the element does not close it.
    persistent: false               // Bool: Whether the context menu should remain open if the user clicks on it.
  };

  constructor (element, inputSettings) {
    //console.time("constructor");
    if (element && element instanceof HTMLElement) {
      this.contextMenuElement = element;
    } else {
      throw "Error: Context menu element is not defined!"
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

      if (inputSettings.innerContextMenu != undefined && typeof inputSettings.innerContextMenu === "boolean") {
        this.settings.innerContextMenu = inputSettings.innerContextMenu;
      }

      if (inputSettings.scrollFit != undefined && typeof inputSettings.scrollFit === "boolean") {
        this.settings.scrollFit = inputSettings.scrollFit;
      }

      if (inputSettings.closeOnScroll != undefined && typeof inputSettings.closeOnScroll === "boolean") {
        this.settings.closeOnScroll = inputSettings.closeOnScroll;
      }

      if (inputSettings.persistent != undefined && typeof inputSettings.persistent === "boolean") {
        this.settings.persistent = inputSettings.persistent;
      }
    }

    this.expanded = false;
    this.scrollable = false;

    this.calculateScales();
    this.setEventListeners();
    //console.timeEnd("constructor");
  }

  expand (x = 0, y = 0) {
    console.time("expand");
    this.collapse();

    // First remove the display property (inserting the context menu back into the DOM)
    if (this.displayTemp !== "block") {
      this.contextMenuElement.style.display = this.displayTemp;
    } else {
      this.contextMenuElement.style.removeProperty("display");
    }

    // Handle changes to the context menu content.
    this.calculateScales();

    // Calculate context menu position relative to the viewport, so that it always is in view.
    let { normalizedX, normalizedY } = this.calculatePosition(x, y);

    this.contextMenuElement.style.left = normalizedX;
    this.contextMenuElement.style.top = normalizedY;

    if (this.scrollable) {
      this.contextMenuElement.scrollTo(0, 0);
    }

    this.contextMenuElement.style.height = `${this.expandedHeight}px`;
    this.contextMenuElement.classList.add("context-menu-expanded");

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

    this.expanded = true;
    console.timeEnd("expand");
  }

  collapse () {
    //console.time("setEventListeners");
    this.contextMenuElement.style.removeProperty("height");
    this.contextMenuElement.classList.remove("context-menu-expanded");

    this.expanded = false;
    //console.timeEnd("setEventListeners");
  }

  calculateScales () {
    //console.time("calculateScales");
    if (this.expandedHeight !== this.contextMenuElement.offsetHeight) {
      let temp = this.contextMenuElement.style.height;
      this.contextMenuElement.style.height = "auto";

      let height = this.contextMenuElement.offsetHeight;

      // If the element is too long to fit in the viewport.
      if (this.settings.scrollFit && document.documentElement.clientHeight < height) {
        height = document.documentElement.clientHeight - 25;
        this.contextMenuElement.style.overflowY = "scroll";

        this.scrollable = true;
      }

      this.expandedHeight = height;

      if (temp) {
        this.contextMenuElement.style.height = `${height}px`;
      } else {
        this.contextMenuElement.style.removeProperty("height");
      }
    }

    this.expandedWidth = this.contextMenuElement.offsetWidth;
    //console.timeEnd("calculateScales");
  }

  calculatePosition (x, y) {
    //console.time("calculatePosition");
    let normalizedX;
    let normalizedY;

    // Open menu upwards if pointer is below half of the screen
    if (y > (document.documentElement.clientHeight / 2)) {
      let overShootUp = Math.min(15, y - this.expandedHeight);

      normalizedY = `${Math.max(0, y - this.expandedHeight - overShootUp)}px`;
    } else {
      // If the dropdown would overshoot the viewport and remain partially hidden, offset it up
      let overShootDown = Math.max(-5, (y + this.expandedHeight + 15) - document.documentElement.clientHeight);

      normalizedY = `${Math.max(0, y - 10 - overShootDown) + 5}px`;
    }

    // If the element would overshoot on the right side of the viewport.
    if (x + this.expandedWidth > document.documentElement.clientWidth) {
      let overshootRight = Math.max(0, x + this.expandedWidth - document.documentElement.clientWidth);

      normalizedX = `${x - 5 - overshootRight}px`
    } else if (x < 6) {
      // Add a little space between the left side of the viewport and the context menu.
      normalizedX = `${x + 5}px`;
    } else {
      normalizedX = `${x + 2}px`;
    }

    //console.timeEnd("calculatePosition");
    return { normalizedX, normalizedY };
  }

  /**
   * Manually add elements to the context menu.
   * @method add
   * @param  {HTMLElement, string} element Supports HTMLElement or html strings.
   */
  add (element) {
    //console.time("add");
    if (typeof element == "object") {
      this.contextMenuElement.appendChild(element);
      this.calculateScales();
    } else if (typeof element == "string") {
      this.contextMenuElement.innerHTML += element;
      this.calculateScales();
    }
    //console.timeEnd("add");
  }

  setEventListeners() {
    //console.time("setEventListeners");
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

    // this.contextMenuElement.addEventListener('transitionstart', function (event) {
    //   if (event.propertyName == "height") {
    //
    //   }
    // });

    // Remove the element from the DOM to prevent it messing up the flow and click events.
    this.contextMenuElement.addEventListener('transitionend', function (event) {
      if (event.propertyName == "height" && !self.expanded) {
        self.displayTemp = self.contextMenuElement.style.display;
        self.contextMenuElement.style.display = "none";
      }
    });
    //console.timeEnd("setEventListeners");
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
