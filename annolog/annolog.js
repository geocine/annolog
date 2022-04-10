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

import { htmlToElement } from "./utils.js";
import "./annolog-image.js";
import "./annolog-overlay.js";
import "./annolog-tag.js";

class AnnologCanvas extends HTMLElement {
  constructor() {
    super();
    this._image = "";

    this.$root = this.attachShadow({ mode: "open" });

    const content = htmlToElement`
      <div class="canvas-wrapper">
        <canvas class="canvas-tag" is="avn-annolog-tag"></canvas>
        <canvas class="canvas-overlay" is="avn-annolog-overlay"></canvas>
        <canvas class="canvas-image" is="avn-annolog-image" scale></canvas>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
      }
      canvas {
        position: absolute;
      }
      .canvas-wrapper {
        position: relative;
      }
      .canvas-image {
        z-index: -1;
        background: white;
      }
      textarea.annolog-input::-webkit-input-placeholder {
        color: #dbdbdb;
      }
      textarea.annolog-input {
        position: relative;
        border: none;
        background: transparent;
        outline: none;
        color: white;
        font: 14px sans-serif;
        resize: none;
        overflow: hidden;
      }
    `;

    this.$root.appendChild(style);
    this.$root.appendChild(content);

    this.$wrapper = this.$root.querySelector(".canvas-wrapper");
    this.$overlayCanvas = this.$root.querySelector(".canvas-overlay");
    this.$tagCanvas = this.$root.querySelector(".canvas-tag");
    this.$imageCanvas = this.$root.querySelector(".canvas-image");

    this.overlayCreated = this.overlayCreated.bind(this);
    this.overlayMousemove = this.overlayMousemove.bind(this);
  }

  connectedCallback() {
    this.#setElementDimensions();

    this.$overlayCanvas.addEventListener(
      "overlay.created",
      this.overlayCreated
    );
    this.$overlayCanvas.addEventListener(
      "overlay.mousemove",
      this.overlayMousemove
    );
  }

  disconnectedCallback() {
    this.$overlayCanvas.removeEventListener(
      "overlay.created",
      this.overlayCreated
    );
    this.$overlayCanvas.removeEventListener(
      "overlay.mousemove",
      this.overlayMousemove
    );
  }

  #setElementDimensions() {
    this.#setDimensions(this.$wrapper);
    this.#setDimensions(this.$overlayCanvas);
    this.#setDimensions(this.$tagCanvas);
    this.#setDimensions(this.$imageCanvas);
  }

  overlayCreated(e) {
    this.$tagCanvas.pushRect(e.detail);
  }

  overlayMousemove(e) {
    this.$tagCanvas.mouseMove(e.detail);
  }

  tagRemove(rect) {
    this.$tagCanvas.removeRect(rect);
  }

  tagHighlight(rect) {
    this.$tagCanvas.highlightRect(rect);
  }

  loadTags(tags) {
    this.$tagCanvas.loadRects(tags);
  }

  #setDimensions(element) {
    element.width = this.clientWidth;
    element.height = this.clientHeight;
  }

  #dispatch(name, detail) {
    const event = new CustomEvent(name, { detail });
    this.dispatchEvent(event, detail);
  }

  get image() {
    this._image;
  }

  loadImage(dataURL, load) {
    const image = new Image();
    image.onload = () => {
      if(!load){
        this.$tagCanvas.reset();
      }
      this.$imageCanvas.image = image;
      this._image = dataURL;
      this.#dispatch("image.loaded", { detail: dataURL });
    };
    image.src = dataURL;
  }

  set image(dataURL) {
    if (!dataURL) return;
    this.loadImage(dataURL);
  }

  clear() {
    this.$tagCanvas.reset();
  }

  removeImage() {
    this.$imageCanvas.image = null;
  }
}

customElements.define("avn-annolog", AnnologCanvas);
