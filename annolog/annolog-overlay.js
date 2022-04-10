/*---------------------------------------------------------------------------------------------
 *
 *  Copyright (C) 2022 Aivan Monceller
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *--------------------------------------------------------------------------------------------*/

class AnnologCanvasOverlay extends HTMLCanvasElement {
  constructor() {
    super();
    this.context = this.getContext("2d");

    this.startRect = { x: 0, y: 0 };
    this.previewRect = { x: 0, y: 0, width: 0, height: 0 };

    this.text = "";

    this.dragAction = false;
    this.clickAction = false;

    this.hasInput = false;
    this.$input = null;

    this.start = this.start.bind(this);
    this.move = this.move.bind(this);
    this.stop = this.stop.bind(this);

    this.$parent = this.parentNode;

  }

  connectedCallback() {
    this.addEventListener("mousedown", this.start);
    this.addEventListener("mousemove", this.move);
    this.addEventListener("mouseup", this.stop);
    this.addEventListener("mouseout", this.stop);
  }

  #getMousePosition(mouseEvent) {
    const bounds = this.getBoundingClientRect();
    let mouseX = mouseEvent.clientX - bounds.left;
    let mouseY = mouseEvent.clientY - bounds.top;
    return { x: mouseX, y: mouseY };
  }

  //Function to dynamically add a textarea
  addInput() {
    let { x, y } = this.previewRect;

    if (this.previewRect.width < 0) {
      x = x - Math.abs(this.previewRect.width);
    }

    if (this.previewRect.height < 0) {
      y = y - Math.abs(this.previewRect.height);
    }

    this.$input = document.createElement("textarea");
    this.$input.className = "annolog-input";
    this.$input.placeholder = "Enter Tag";
    this.$input.spellcheck = false;
    this.$input.style.width = Math.abs(this.previewRect.width) - 2 + "px";
    this.$input.style.height = Math.abs(this.previewRect.height) + "px";
    this.$input.style.left = x + "px";
    this.$input.style.top = y + "px";

    this.$input.onkeydown = this.handleEnter.bind(this);
    this.$input.onblur = this.setText.bind(this);
    this.$input.oninput = () => {
      while (this.clientHeight < this.scrollHeight) {
        this.value = this.value.substr(0, this.value.length - 1);
      }
    };

    this.$parent.appendChild(this.$input);

    this.$input.focus();

    this.hasInput = true;

    this.#drawRectangle(
      this.previewRect.x,
      this.previewRect.y,
      this.previewRect.width,
      this.previewRect.height,
      "rgba(70, 70, 70, 0.5)",
      "rgba(70, 70, 70, 0.5)"
    );
  }

  handleEnter(e) {
    let keyCode = e.keyCode;
    if (keyCode === 13) {
      this.setText();
    }
    // Escape clear the input
    if (keyCode === 27) {
      this.$input.value = "";
      this.setText();
    }
  }

  #drawRectangle(x, y, width, height, stroke, fill) {
    // Set rectangle style
    this.context.strokeStyle = stroke;
    this.context.fillStyle = fill;
    this.context.lineWidth = 2;

    // Clear the canvas before draw a rectangle
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.strokeRect(x, y, width, height);
    this.context.fillRect(x, y, width, height);
  }

  setText() {
    this.$input.onblur = null;
    this.text = this.$input.value;
    this.$parent.removeChild(this.$input);
    this.hasInput = false;
    this.context.clearRect(0, 0, this.width, this.height);
    this.$input.onblur = this.setText.bind(this);
    let { x, y, width, height } = this.previewRect;
    if (this.text) {
      this.#dispatch("overlay.created", {
        text: this.text,
        x,
        y,
        width,
        height,
      });
      this.text = "";
    }
  }

  #dispatch(name, detail) {
    const event = new CustomEvent(name, { detail });
    this.dispatchEvent(event, detail);
  }

  start(e) {
    e.preventDefault();
    e.stopPropagation();

    let mouse = this.#getMousePosition(e);
    this.startRect = {
      x: mouse.x,
      y: mouse.y,
    };

    this.clickAction = true;

    if (this.hasInput) {
      this.$input.blur();
    }
  }

  move(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.clickAction) {
      this.#dispatch("overlay.mousemove", e );
      return;
    }

    this.dragAction = true;

    // get the current mouse position
    let mouse = this.#getMousePosition(e);

    // calculate the rectangle width/height based
    // on starting vs current mouse position
    let width = mouse.x - this.startRect.x;
    let height = mouse.y - this.startRect.y;

    if (Math.abs(height) < 16 || Math.abs(width) < 63) {
      this.#drawRectangle(
        this.startRect.x,
        this.startRect.y,
        width,
        height,
        "rgba(200, 0, 0, 0.5)",
        "rgba(200, 0, 0, 0.5)"
      );
    } else {
      this.#drawRectangle(
        this.startRect.x,
        this.startRect.y,
        width,
        height,
        "rgba(0, 0, 200, 0.5)",
        "rgba(0, 0, 200, 0.5)"
      );
    }

    this.previewRect.x = this.startRect.x;
    this.previewRect.y = this.startRect.y;

    this.previewRect.width = width;
    this.previewRect.height = height;
  }

  stop(e) {
    e.preventDefault();
    e.stopPropagation();

    this.clickAction = false;

    if (!this.dragAction) {
      return;
    }
    this.dragAction = false;
    if (
      Math.abs(this.previewRect.height) < 17 ||
      Math.abs(this.previewRect.width) < 63
    ) {
      this.context.clearRect(0, 0, this.width, this.height);
      return;
    }
    this.addInput();
  }

  disconnectedCallback() {
    this.removeEventListener("mousedown", this.start);
    this.removeEventListener("mousemove", this.move);
    this.removeEventListener("mouseup", this.stop);
    this.removeEventListener("mouseout", this.stop);
  }
}

customElements.define("avn-annolog-overlay", AnnologCanvasOverlay, {
  extends: "canvas",
});
