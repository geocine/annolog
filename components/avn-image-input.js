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

import { htmlToElement } from "../annolog/utils.js";

class AvnImageInput extends HTMLElement {
  static get observedAttributes() {
    return ["label"];
  }

  constructor() {
    super();
    this.$root = this.attachShadow({ mode: "open" });

    const content = htmlToElement`
      <div>
        <input type="file" accept="image/*" capture="environment" id="image-input" hidden>
        <label for="image-input" class="image-input-label"></label>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: inline-block;
      }
      label {
        background-color: #BCA371;
        color: white;
        font-size: 14px;
        font-weight: 500;
        line-height: 30px;
        overflow: hidden;
        outline: none;
        cursor: pointer;
        text-transform: uppercase;
        line-height: 30px;
        position: relative;
        display: inline-block;
        box-sizing: border-box;
        border: none;
        border-radius: 2px;
        padding: 0 16px;
        min-width: 64px;
        height: 30px;
        vertical-align: middle;
        text-align: center;
        text-overflow: ellipsis;
        text-transform: uppercase;
        font-family: "Roboto", "Segoe UI", BlinkMacSystemFont, system-ui, -apple-system;
      }
    `;

    this.$root.appendChild(style);
    this.$root.appendChild(content);

    this.$input = this.$root.querySelector("#image-input");
    this.$label = this.$root.querySelector(".image-input-label");

    this.onChange = this.onChange.bind(this);
  }

  get label() {
    return this.getAttribute('label');
  }
  
  set label(newLabel) {
    this.setAttribute('label', newLabel);
  }

  onChange() {
    const file = this.$input.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = (e) => {
      var dataURL = e.target.result;
      this.dispatchEvent(new CustomEvent("change", { detail: dataURL }));
    };
    reader.readAsDataURL(file);
  }

  connectedCallback() {
    this.$label.textContent = this.label;
    this.$input.addEventListener("change", this.onChange);
    this.$input.addEventListener("click", function(){
      this.value = null;
    });
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (name === 'label') {
      this.$label.textContent = newValue;
    }
  }

  disconnectedCallback(){
    this.$input.removeEventListener("change", this.onChange);
  }

}

customElements.define("avn-image-input", AvnImageInput);
