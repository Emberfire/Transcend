class Transcend {
  contextMenus;                      // Object: The main context menu element functionality.

  constructor () {
    this.contextMenus = [];
  }

  ContextMenu(options) {
    this.contextMenus.push(new ContextMenu(options));
  }
}

class ContextMenu {
  parentElement;                    // HTMLElement: The element for the context menu to be opened when right clicked.
  contextMenuElement;               // HTMLElement: The context menu element that is to be shown.
  expanded;                         // Bool: The state of the context menu.
  scrollable;                       // Bool: If the context menu is too large to be displayed.
  expandedHeight;                   // Int: The height of the context menu when it is expanded.
  expandedWidth;                    // Int: The width of the context menu when it is expanded.

  settings = {                      // Object: The settings for the context menu. See the Default Settings section for more information.
    /* Default Settings */
    parentElement: window,
    preventInnerContext: true
  };

  constructor (inputSettings) {
    if (inputSettings) {
      if (inputSettings.parentElement) {
        this.parentElement = document.querySelector(inputSettings.parentElement);
      } else {
        this.parentElement = window;
      }

      if (inputSettings.preventInnerContext !== undefined && inputSettings.preventInnerContext !== null) {
        this.settings.preventInnerContext = inputSettings.preventInnerContext;
      }
    }

    this.contextMenuElement = document.querySelector(".context-menu");
    this.expanded = false;
    this.scrollable = false;

    this.calculateScales();
    this.setEventListeners();
  }

  expand (x = 0, y = 0) {
    this.collapse();

    // Handle changes to the context menu contents.
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

    // Don't close the context menu if clicked inside it.
    window.addEventListener("scroll", function (event) {
      if (event.target !== self.contextMenu && self.expanded) {
        self.collapse();
      }

      // Event listener is removed when it's fired once to prevent firing on every scroll. Passive is because
      // it won't prevent default actions.
    }, { once: true, passive: true });

    this.expanded = true;
  }

  collapse () {
    this.contextMenuElement.style.removeProperty("height");
    this.contextMenuElement.classList.remove("context-menu-expanded");

    this.expanded = false;
  }

  calculateScales () {
    let temp = this.contextMenuElement.style.height;
    this.contextMenuElement.style.height = "auto";

    let height = this.contextMenuElement.offsetHeight;
    let width = this.contextMenuElement.offsetWidth;

    // If the element is too long to fit in the viewport.
    if (document.documentElement.clientHeight < height) {
      height = document.documentElement.clientHeight - 25;
      this.contextMenuElement.style.overflowY = "scroll";

      this.scrollable = true;
    }

    this.expandedHeight = height;
    this.expandedWidth = width;

    if (temp) {
      this.contextMenuElement.style.height = `${height}px`;
    } else {
      this.contextMenuElement.style.removeProperty("height");
    }
  }

  calculatePosition (x, y) {
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

    return { normalizedX, normalizedY };
  }

  /**
   * Manually add elements to the context menu.
   * @method add
   * @param  {HTMLElement, string} element Supports HTMLElement or html strings.
   */
  add (element) {
    if (typeof element == "object") {
      this.contextMenuElement.appendChild(element);
      this.calculateScales();
    } else if (typeof element == "string") {
      this.contextMenuElement.innerHTML += element;
      this.calculateScales();
    }
  }

  setEventListeners() {
    let self = this;

    window.addEventListener("contextmenu", function (event) {
      if (self.expanded && event.target !== self.parentElement && event.target !== self.contextMenuElement) {
        self.collapse();
      }
    });

    this.parentElement.addEventListener("contextmenu", function (event) {
      if (event.target !== self.contextMenuElement) {
        event.preventDefault();

        self.expand(event.clientX, event.clientY);
      }
    });

    this.contextMenuElement.addEventListener("contextmenu", function (event) {
      if (self.settings.preventInnerContext) {
        event.preventDefault();
      }
    });

    window.addEventListener("click", function (event) {
      if (self.expanded && event.target !== self.contextMenuElement) {
        self.collapse();
      }
    });
  }
}

let ts = new Transcend();
ts.ContextMenu({
  preventInnerContext: true,
  //parentElement: ".test"
});
