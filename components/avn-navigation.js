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

class AvnNavigation extends HTMLElement {
  static get observedAttributes() {
    return ["total", "page"];
  }

  constructor() {
    super();
    this.$root = this.attachShadow({ mode: "closed" });

    const content = htmlToElement`
      <div>
        <a href="#" class="back">‹</a>
        <span class="label">1 of 1</span>
        <a href="#" class="next">›</a>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
      }
      span {
        font-size: 14px;
      }
      a {
        text-decoration: none;
        display: inline-block;
        line-height: 30px;
        height: 30px;
        font-family: Verdana,sans-serif ;
        font-size: 16px;
        font-weight: bold;
        padding: 0 16px;
        border: none;
        border-radius: 2px;
      }
      a:visited {
        color: black;
      }
      a:hover {
        background-color: #464646;
        color: white;
      }
      
      .back {
        background-color: #d9d9d9;
        color: black;
      }
      
      .next {
        background-color: #d9d9d9;
        color: black;
      }
    `;

    this.$root.appendChild(style);
    this.$root.appendChild(content);

    this.$label = this.$root.querySelector(".label");
    this.$back = this.$root.querySelector(".back");
    this.$next = this.$root.querySelector(".next");

    this.back = this.back.bind(this);
    this.next = this.next.bind(this);
  }

  connectedCallback() {
    this.$back.addEventListener("click", this.back);
    this.$next.addEventListener("click", this.next);
  }

  disconnectedCallback() {
    this.$back.removeEventListener("click", this.back);
    this.$next.removeEventListener("click", this.next);
  }

  back(e) {
    e.preventDefault();
    if (parseInt(this.page) > 1) {
      this.page = parseInt(this.page) - 1;
    }
    this.dispatchEvent(new CustomEvent("nav.pageChanged", { detail: this.page }));
  }

  next(e) {
    e.preventDefault();
    if (parseInt(this.page) < parseInt(this.total)) {
      this.page = parseInt(this.page) + 1;
    }
    this.dispatchEvent(new CustomEvent("nav.pageChanged", { detail: this.page }));
  }

  get total() {
    return this.getAttribute("total");
  }

  set total(newTotal) {
    this.setAttribute("total", newTotal);
  }

  get page() {
    return this.getAttribute("page");
  }

  set page(newPage) {
    this.setAttribute("page", newPage);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "total") {
      this.$label.textContent = `${this.page} of ${this.total}`;
      // dispatch total page
      this.dispatchEvent(new CustomEvent("nav.totalChanged", { detail: this.total }));
    } else if (name === "page") {
      this.$label.textContent = `${this.page} of ${this.total}`;
    }
  }
}

customElements.define("avn-navigation", AvnNavigation);
