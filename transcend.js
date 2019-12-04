class Dropdown {
  constructor() {
    this.dropdownButton = document.querySelector(".dropdown-button");
    this.dropdownElement = document.querySelector(".dropdown");
    this.dropdownContents = document.querySelector(".dropdown .dropdown-content");
    this.expanded = false;

    this.calculateScales();

    this.setEventListeners();
  }

  calculateScales() {
    this.dropdownContents.style.height = "auto";
    console.log(this.dropdownContents.offsetHeight);

    this.expandedHeight = this.dropdownContents.offsetHeight;
    this.dropdownContents.style.height = "0px";
    this.collapsedHeight = 0;
  }

  expand (event) {
    this.dropdownContents.classList.remove("dropdown-expanded");

    this.dropdownContents.style.left = `${event.pageX}px`;
    this.dropdownContents.style.top = `${event.pageY}px`;

    this.dropdownContents.style.height = `${this.expandedHeight}px`;
    this.dropdownContents.classList.add("dropdown-expanded");

    this.expanded = true;
  }

  collapse () {
    this.dropdownContents.classList.remove("dropdown-expanded");

    this.dropdownContents.style.height = this.collapsedHeight;
  }

  setEventListeners() {
    let self = this;
    window.addEventListener("contextmenu", function (event) {
      event.preventDefault();
      self.collapse();
      self.expand(event);

    });

    window.addEventListener("click", function (event) {
      self.collapse();
    });
  }
}

new Dropdown();
