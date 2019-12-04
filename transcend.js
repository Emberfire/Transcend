class ContextMenu {
  #contextMenu;
  #expanded;
  #expandedHeight;
  #expandedWidth;

  constructor() {
    this.#contextMenu = document.querySelector(".context-menu");
    this.#expanded = false;

    this.calculateScales();
    this.setEventListeners();
  }

  calculateScales() {
    let temp = this.#contextMenu.style.height;
    this.#contextMenu.style.height = "auto";

    let dimensions = this.#contextMenu.getBoundingClientRect()
    this.#expandedHeight = dimensions.height;
    this.#expandedWidth = dimensions.width;

    this.#contextMenu.style.height = temp;
  }

  calculatePosition(event) {
    let x;
    let y;
    if (event.pageY >= (window.innerHeight / 2)) {
      y = `${event.pageY - this.#expandedHeight - 17}px`;
    } else {
      y = `${event.pageY - 17}px`;
    }

    if (event.pageX + this.#expandedWidth + 10 >= window.innerWidth) {
      x = `${event.pageX - ((event.pageX + this.#expandedWidth) - window.innerWidth) - 10}px`
    } else {
      x = `${event.pageX}px`;
    }

    return { x, y };
  }

  expand (event) {
    this.#contextMenu.classList.remove("context-menu-expanded");
    let { x, y } = this.calculatePosition(event);
    this.#contextMenu.style.left = x;
    this.#contextMenu.style.top = y;

    this.#contextMenu.style.height = `${this.#expandedHeight}px`;
    this.#contextMenu.classList.add("context-menu-expanded");

    this.#expanded = true;
  }

  collapse () {
    this.#contextMenu.style.height = "0px";
    this.#contextMenu.classList.remove("context-menu-expanded");

    this.#expanded = false;
  }

  setEventListeners() {
    let self = this;
    window.addEventListener("contextmenu", function (event) {
      event.preventDefault();
        self.expand(event);
    });

    window.addEventListener("click", function (event) {
      if (self.#expanded) {
        self.collapse();
      }
    });
  }
}

let a = new ContextMenu();
