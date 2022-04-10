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
import "../components/avn-image-input.js";
import "../components/avn-navigation.js";
import "../components/avn-tag-list.js";

class AvnAnnologContainer extends HTMLElement {
  static get observedAttributes() {
    return ["label"];
  }

  constructor() {
    super();
    this.$root = this.attachShadow({ mode: "open" });

    const content = htmlToElement`
      <div class="container">
        <div class="annolog">
          <slot></slot>
          <div class="canvas-details">
              <div class="canvas-details-label">
                <h1 class="image-name">Image 1</h1>
                <avn-navigation total="4" page="1"></avn-navigation>
              </div>
              <div class="canvas-details-buttons">
                <avn-image-input label="Add Image"></avn-image-input>
                <button class="button delete-button">Delete Image</button>
                <button class="button clear-button">Clear Tags</button>
              </div>
          </div>
        </div>
        <avn-tag-list></avn-tag-list>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
      }
      ::slotted(avn-annolog)  {
        border: #bec4ca solid 1px;
      }
      button {
        background-color: #BCA371;
        color: white;
        font-size: 14px;
        font-weight: 500;
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
      h1 {
        margin: 0;
        font-size: 16px;
        text-transform: uppercase;
      }
      .canvas-details-label {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        min-height: 30px;
      }
      .canvas-details-buttons {
        display: flex;
        flex-direction: row;
        justify-content: right;
      }
      .canvas-details-buttons *{
        margin-left: 10px;
      }
      .container {
        display: grid;
        grid-template-columns: 700px auto;
        grid-gap: 2px;
      }
    `;

    this.$root.appendChild(style);
    this.$root.appendChild(content);

    this.$input = this.$root.querySelector("avn-image-input");
    this.$annolog = this.$root
      .querySelector("slot")
      .assignedNodes({ flatten: true })[1];

    this.$clearButton = this.$root.querySelector(".clear-button");
    this.$deleteButton = this.$root.querySelector(".delete-button");
    this.$navigation = this.$root.querySelector("avn-navigation");
    this.$imageName = this.$root.querySelector(".image-name");
    this.$tagList = this.$root.querySelector("avn-tag-list");

    this.imageLoad = this.imageLoad.bind(this);
    this.clear = this.clear.bind(this);
    this.delete = this.delete.bind(this);
    this.pageChanged = this.pageChanged.bind(this);
    this.totalChanged = this.totalChanged.bind(this);
    this.tagRemove = this.tagRemove.bind(this);
    this.tagHighlight = this.tagHighlight.bind(this);
    this.tagCreate = this.tagCreate.bind(this);

    this.data = [];
  }

  connectedCallback() {
    this.$input.addEventListener("change", this.imageLoad);
    this.$clearButton.addEventListener("click", this.clear);
    this.$deleteButton.addEventListener("click", this.delete);
    this.$navigation.addEventListener("nav.pageChanged", this.pageChanged);
    this.$navigation.addEventListener("nav.totalChanged", this.totalChanged);
    this.$annolog.addEventListener("tag.created", this.tagCreate);
    this.$tagList.addEventListener("list.remove", this.tagRemove);
    this.$tagList.addEventListener("list.mouseover", this.tagHighlight);

    this.showHideNav(this.$navigation.total);

    this.loadData(1);
    this.id = null;
  }

  disconnectedCallback() {
    this.$input.removeEventListener("change", this.imageLoad);
    this.$clearButton.removeEventListener("click", this.clear);
    this.$deleteButton.removeEventListener("click", this.delete);
    this.$navigation.removeEventListener("nav.pageChanged", this.pageChanged);
    this.$navigation.removeEventListener("nav.totalChanged", this.totalChanged);
    this.$annolog.removeEventListener("tag.created", this.tagCreate);
    this.$tagList.removeEventListener("list.remove", this.tagRemove);
    this.$tagList.removeEventListener("list.mouseover", this.tagHighlight);  
  }

  showHideNav(total) {
    if (total < 1) {
      this.$navigation.style.display = "none";
      this.$imageName.style.display = "none";
    } else {
      this.$navigation.style.display = "block";
      this.$imageName.style.display = "block";
    }
  }

  pageChanged(e) {
    this.$imageName.innerText = `Image ${e.detail}`;
    this.movePage(e.detail);
  }

  imageLoad(e) {
    this.$annolog.image = e.detail;
    this.$tagList.tags = [];
    this.setData(null, e.detail, []);
  }

  clear() {
    this.$annolog.clear();
    this.$tagList.tags = [];
    this.setData(this.id, this.$annolog.image, this.$tagList.tags);
  }

  delete() {
    this.removeData(this.id);
  }

  tagRemove(tag) {
    this.$annolog.tagRemove(tag.detail);
    this.setData(this.id, this.$annolog.image, this.$tagList.tags);
  }

  tagHighlight(tag) {
    this.$annolog.tagHighlight(tag.detail);
  }

  tagCreate(tag) {
    this.$tagList.tags = [...this.$tagList.tags, tag.detail];
    this.setData(this.id, this.$annolog.image, this.$tagList.tags);
  }

  totalChanged(e) {
    this.showHideNav(e.detail);
  }

  nextAvailablePage() {
    if (this.$navigation.page > this.$navigation.total) {
      this.$navigation.page = this.$navigation.total;
    }
    if (this.$navigation.page < 1) {
      this.$navigation.page = 1;
    }
    this.movePage(this.$navigation.page);
  }

  removeData(id) {
    this.data = this.data.filter((item) => item.id != id);
    this.$navigation.total = this.data.length;
    // save data to localStorage
    localStorage.setItem("annolog", JSON.stringify(this.data));
    if(this.$navigation.total < 1){
      this.$annolog.removeImage();
      this.$annolog.clear();
      this.$tagList.tags = [];
    }
    this.nextAvailablePage();
  }

  // load data from local storage
  loadData(page) {
    this.data = JSON.parse(localStorage.getItem("annolog")) ?? [];
    this.$navigation.total = this.data?.length ?? 0;
    if (this.$navigation.total > 0 && this.data[page - 1]?.id !== this.id) {
      this.$annolog.loadImage(this.data[page - 1]?.image, true);
      this.$tagList.tags = this.data[page - 1]?.tags;
      this.$annolog.loadTags(this.$tagList.tags);
      this.id = this.data[page - 1]?.id;
    }
  }

  movePage(page) {
    this.$navigation.page = page;
    this.loadData(page);
  }

  setData(id, image, tags) {
    const newId = new Date().valueOf();
    const data = this.data.find((item) => item.id == id);
    if (data) {
      data.tags = tags;
      // save data to local storage
      localStorage.setItem("annolog", JSON.stringify(this.data));
    } else {
      this.data = [
        ...this.data,
        {
          id: newId,
          image,
          tags,
        },
      ];
      this.id = newId;

      this.$navigation.total = this.data.length;
      // save data to local storage
      localStorage.setItem("annolog", JSON.stringify(this.data));
      // move to the last page
      this.movePage(this.data.length);
    }
  }
}

customElements.define("avn-annolog-container", AvnAnnologContainer);
