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

class AvnTagList extends HTMLElement {
  static get observedAttributes() {
    return ["total", "page"];
  }

  constructor() {
    super();
    this.$root = this.attachShadow({ mode: "closed" });

    const content = htmlToElement`
      <div class="container">
        <h2>Tags</h2>
        <ul>
        </ul>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      .container {
        height: 702px;
        border-top: #bec4ca solid 1px;
        border-right: #bec4ca solid 1px;
        border-bottom: #bec4ca solid 1px;
      }
      ul {
        margin: 0;
        padding: 0;
      }

      h2 {
        margin: 0;
        padding: 10px;
        font-size: 14px;
        text-transform: uppercase;
        background: #c3c3c3;
      }
      
      ul li {
        cursor: pointer;
        position: relative;
        padding: 12px 8px 12px 15px;
        list-style-type: none;
        background: #eee;
        font-size: 16px;
        transition: 0.2s;
        
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      ul li:nth-child(odd) {
        background: #f9f9f9;
      }
      
      ul li:hover {
        background: #ddd;
      }
      
      .close {
        position: absolute;
        right: 0;
        top: 0;
        padding: 12px 16px 12px 16px;
      }
      
      .close:hover {
        background-color: #30080F;
        color: white;
      }
    `;

    this.$root.appendChild(style);
    this.$root.appendChild(content);

    this.$ul = this.$root.querySelector("ul");

    this._tags = [];
  }

  get tags() {
    return this._tags;
  }

  set tags(tags) {
    this._tags = tags;
    this.$ul.innerHTML = "";
    this._tags.forEach((tag) => {
      const li = document.createElement("li");
      li.textContent = tag.text;
      li.dataset.id = tag.id;
      const span = document.createElement("SPAN");
      const txt = document.createTextNode("\u00D7");
      span.className = "close";
      span.appendChild(txt);
      span.onclick = this.removeTag.bind(this, tag);
      li.appendChild(span);
      li.onmouseover = this.mouseOver.bind(this, tag);
      this.$ul.appendChild(li);
    });
  }

  removeTag(tag) {
    const li = this.$ul.querySelector(`li[data-id="${tag.id}"]`);
    this.$ul.removeChild(li);
    this._tags = this._tags.filter((t) => t.id !== tag.id);
    this.dispatchEvent(
      new CustomEvent("list.remove", {
        detail: tag,
      })
    );
  }

  mouseOver(tag) {
    this.dispatchEvent(
      new CustomEvent("list.mouseover", {
        detail: tag,
      })
    );
  }

}

customElements.define("avn-tag-list", AvnTagList);
