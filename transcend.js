class Transcend {
  constructor () {
    this.contextMenu = new ContextMenu(document.querySelector(".test1"));
  }
}

class ContextMenu {
  constructor (parentElement) {
    if (parentElement && typeof parentElement === "object") {
      this.parentElement = parentElement;
    } else {
      this.parentElement = window;
    }

    this.contextMenu = document.querySelector(".context-menu");
    this.expanded = false;
    this.scrollable = false;

    this.calculateScales();
    this.setEventListeners();
  }

  calculateScales () {
    let temp = this.contextMenu.style.height;
    this.contextMenu.style.height = "auto";

    let height = this.contextMenu.offsetHeight;
    let width = this.contextMenu.offsetWidth;
    if (window.innerHeight < height) {
      height = document.documentElement.clientHeight - 25;
      this.contextMenu.style.overflowY = "scroll";
      this.scrollable = true;
    }

    this.expandedHeight = height;
    this.expandedWidth = width;

    if (temp) {
      this.contextMenu.style.height = `${height}px`;
    } else {
      this.contextMenu.style.removeProperty("height");
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
      let overShootDown = Math.max(-4, (y + this.expandedHeight + 15) - document.documentElement.clientHeight);

      normalizedY = `${Math.max(0, y - 10 - overShootDown)}px`;
    }

    if (x + this.expandedWidth > document.documentElement.clientWidth) {
      let overshootRight = Math.max(0, x + this.expandedWidth - document.documentElement.clientWidth);

      normalizedX = `${x - 5 - overshootRight}px`
    } else {
      normalizedX = `${x + 1}px`;
    }

    return { normalizedX, normalizedY };
  }

  expand (x = 0, y = 0) {
    this.collapse();
    this.calculateScales();
    let { normalizedX, normalizedY } = this.calculatePosition(x, y);

    this.contextMenu.style.left = normalizedX;
    this.contextMenu.style.top = normalizedY;

    if (this.scrollable) {
      this.contextMenu.scrollTo(0, 0);
    }

    this.contextMenu.style.height = `${this.expandedHeight}px`;
    this.contextMenu.classList.add("context-menu-expanded");

    let self = this;
    window.addEventListener("scroll", function (event) {
      if (event.target !== self.contextMenu && self.expanded) {
        self.collapse();
      }
    }, { once: true, passive: true });

    this.expanded = true;
  }

  collapse () {
    this.contextMenu.style.removeProperty("height");
    this.contextMenu.classList.remove("context-menu-expanded");

    this.expanded = false;
  }

  add (element) {
    if (typeof element == "object") {
      this.contextMenu.appendChild(element);
      this.calculateScales();
    } else if (typeof element == "string") {
      this.contextMenu.innerHTML += element;
      this.calculateScales();
    }
  }

  remove (element) {

  }

  setEventListeners() {
    let self = this;

    this.parentElement.addEventListener("contextmenu", function (event) {
      event.preventDefault();

      self.collapse();
      self.expand(event.clientX, event.clientY);
    });

    this.contextMenu.addEventListener("contextmenu", function (event) {
       event.preventDefault();
    });

    window.addEventListener("click", function (event) {
      if (event.target !== self.contextMenu && self.expanded) {
        self.collapse();
      }
    });

    // Don't close the context menu if clicked inside it
    // this.contextMenu.addEventListener("click", function (event) {
    //   event.stopPropagation();
    // });
  }
}

let ts = new Transcend();
