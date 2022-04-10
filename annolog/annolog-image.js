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

const DEFAULT_PADDING = 20;

class AnnologImage extends HTMLCanvasElement {
  static get observedAttributes() {
    return ["padding"];
  }

  constructor() {
    super();
    this.$image = null;
    this.context = this.getContext("2d");
  }

  get image() {
    this.$image;
  }

  set image(value) {
    this.$image = value;
  }

  get padding() {
    return this.getAttribute("padding") || DEFAULT_PADDING;
  }

  set padding(newPadding) {
    this.setAttribute("padding", newPadding);
  }

  #dispatch(name, detail) {
    const event = new CustomEvent(name, { detail });
    this.dispatchEvent(event, detail);
  }

  #render() {
    const img = this.$image;
    const context = this.context;
    context.clearRect(0, 0, this.width, this.height);

    if (!img) {
      this.drawImage();
      return;
    }

    if (img.height < this.height && img.width < this.width) {
      // Do not resize image since it is smaller than the canvas
      this.drawImage(
        img,
        (this.width - img.width) / 2,
        (this.height - img.height) / 2,
        img.width,
        img.height
      );
      return;
    }

    // Add padding to the canvas so the image is not close to the edge
    const padding = parseFloat(this.padding);
    const start = padding / 2;
    const canvasWidth = this.width - padding;
    const canvasHeight = this.height - padding;
    const imgRatio = img.height / img.width;
    const canvasRatio = canvasHeight / canvasWidth;

    if (imgRatio < canvasRatio) {
      // Image is too wide, resize it to fit the width
      const h = canvasWidth * imgRatio;
      const y = (canvasHeight - h) / 2;
      this.drawImage(img, start, y, canvasWidth, h);
      return;
    }
    if (imgRatio > canvasRatio) {
      // Image is too tall, resize it to fit the height
      const w = (canvasWidth * canvasRatio) / imgRatio;
      const x = (canvasWidth - w) / 2;
      this.drawImage(img, x, start, w, canvasHeight);
      return;
    }
    this.drawImage(img, start, start, canvasWidth, canvasHeight);
  }

  drawImage(img, x, y, w, h) {
    if (img) {
      this.context.drawImage(img, x, y, w, h);
    }
    requestAnimationFrame(this.#render.bind(this));
  }

  connectedCallback() {
    this.#render();
  }
}

customElements.define("avn-annolog-image", AnnologImage, {
  extends: "canvas",
});
