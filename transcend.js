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

    let dimensions = this.contextMenu.getBoundingClientRect();
    if (window.innerHeight - 10 < dimensions.height) {
      dimensions.height = window.innerHeight - 15;
      this.contextMenu.style.overflowY = "scroll";
      this.scrollable = true;
    }

    this.expandedHeight = dimensions.height;
    this.expandedWidth = dimensions.width;

    if (temp) {
      this.contextMenu.style.height = temp;
    } else {
      this.contextMenu.style.removeProperty("height");
    }
  }

  calculatePosition (event) {
    let x;
    let y;

    // Open menu upwards if pointer is below half of the screen
    if (event.pageY >= (window.innerHeight / 2)) {
      let overShootUp = Math.min(0, event.pageY - this.expandedHeight)

      y = `${event.pageY - overShootUp - this.expandedHeight - 15}px`;
    } else {
      // If the dropdown would overshoot the viewport and remain partially hidden, offset it up
      let overShootDown = Math.max(0, (event.pageY + this.expandedHeight) - window.innerHeight);

      y = `${event.pageY - overShootDown - 15}px`;
    }

    if (event.pageX + this.expandedWidth + 10 >= window.innerWidth) {
      x = `${event.pageX - ((event.pageX + this.expandedWidth) - window.innerWidth) - 10}px`
    } else {
      x = `${event.pageX + 3}px`;
    }

    return { x, y };
  }

  expand (event) {
    this.contextMenu.classList.remove("context-menu-expanded");

    let { x, y } = this.calculatePosition(event);
    this.contextMenu.style.left = x;
    this.contextMenu.style.top = y;

    if (this.scrollable) {
      this.contextMenu.scrollTo(0, 0);
    }

    this.contextMenu.style.height = `${this.expandedHeight}px`;
    this.contextMenu.classList.add("context-menu-expanded");

    this.expanded = true;
  }

  collapse () {
    //this.contextMenu.style.height = "0px";
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

    if (this.expanded) {
      this.contextMenu.style.height = `${this.expandedHeight}px`;
    }
  }

  remove (element) {

  }

  setEventListeners() {
    let self = this;

    this.parentElement.addEventListener("contextmenu", function (event) {
      event.preventDefault();

      self.collapse();
      self.expand(event);
    });

    window.addEventListener("click", function (event) {
      if (self.expanded) {
        self.collapse();
      }
    });

    // Don't close the context menu if clicked inside it
    this.contextMenu.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }
}

let ts = new Transcend();
