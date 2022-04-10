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

class Rectangle {
  constructor(id, position, width, height, style) {
    this.id = id;
    this.position = position;
    this.width = width;
    this.height = height;
    this.style = style;
    this.selected = false;
    this.text = "";
    this.font = "14px sans-serif";
  }

  getLines(context, text, maxWidth) {
    let words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      let word = words[i];
      let width = context.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  drawText(context) {
    let x = this.position.x;
    let y = this.position.y;

    if (this.width < 0) {
      x = x - Math.abs(this.width);
    }

    if (this.height < 0) {
      y = y - Math.abs(this.height);
    }

    context.textBaseline = "top";
    context.textAlign = "left";
    context.font = this.font;
    context.fillStyle = "black";
    let counter = 0;
    for (let line of this.getLines(
      context,
      this.text,
      Math.abs(this.width) - 2
    )) {
      context.fillText(line, x + 2, y + 3 + counter * 16);
      counter++;
    }
  }

  render(context) {
    context.beginPath();
    context.rect(this.position.x, this.position.y, this.width, this.height);
    context.lineWidth = this.style.lineWidth;
    context.strokeStyle = this.style.strokeStyle;
    if (this.selected) {
      context.fillStyle = this.style.fillStyle;
      context.fill();
    }
    if (this.text) {
      this.drawText(context);
    }
    context.stroke();
  }
}

class AnnologCanvasTag extends HTMLCanvasElement {
  constructor() {
    super();
    this.context = this.getContext("2d");
    this.rectStyle = {
      fillStyle: "rgba(70, 70, 70, 0.5)",
      strokeStyle: "rgba(70, 70, 70, 0.5)",
      lineWidth: 2,
    };
    this.rectangles = [];
    this.currentRect = null;

  }

  connectedCallback() {
    this.#render();
  }

  #render() {
    this.context.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.rectangles.length; i++) {
      this.rectangles[i].render(this.context);
    }

    requestAnimationFrame(this.#render.bind(this));
  }

  loadRects(rectangles) {
    this.rectangles = [];
    // recreate rectangles
    for (let i = 0; i < rectangles.length; i++) {
      let rect = rectangles[i];
      let rectItem = new Rectangle(
        rect.id,
        rect.position,
        rect.width,
        rect.height,
        rect.style
      );
      rectItem.selected = rect.selected;
      rectItem.text = rect.text;
      this.rectangles.push(rectItem);
    }
  }

  pushRect(rect) {
    const { text, x, y, width, height } = rect;
    const rectangle = new Rectangle(
      new Date().valueOf(),
      { x, y },
      width,
      height,
      this.rectStyle
    );
    rectangle.text = text;
    this.rectangles.push(rectangle);
    this.dispatchEvent(
      new CustomEvent("tag.created", { detail: rectangle, composed: true })
    );
  }

  removeRect(rect) {
    this.rectangles = this.rectangles.filter((r) => r.id !== rect.id);
  }

  highlightRect(rect) {
    // clear selection of all rectangles
    this.rectangles.forEach((r) => (r.selected = false));
    // find rect with id and select
    this.rectangles.find((r) => r.id === rect.id).selected = true;
  }

  #pointInRect(mouseX, mouseY, rect) {
    // Check if the mouse is inside the rectangle
    let xCollision = false;
    let yCollision = true;

    if (rect.width < 0) {
      xCollision =
        mouseX > rect.position.x + rect.width && mouseX < rect.position.x;
    } else {
      xCollision =
        mouseX > rect.position.x && mouseX < rect.position.x + rect.width;
    }

    if (rect.height < 0) {
      yCollision =
        mouseY > rect.position.y + rect.height && mouseY < rect.position.y;
    } else {
      yCollision =
        mouseY > rect.position.y && mouseY < rect.position.y + rect.height;
    }
    return xCollision && yCollision;
  }

  #rectCollision(mousePosition, rectangles) {
    for (let i = 0; i < rectangles.length; i++) {
      if (this.#pointInRect(mousePosition.x, mousePosition.y, rectangles[i])) {
        rectangles[i].selected = true;
      } else {
        rectangles[i].selected = false;
      }
    }

    // Decide which rectangle is selected
    const selected = rectangles.filter((rect) => rect.selected);
    if (selected.length == 1) {
      this.currentRect = selected[0].id;
    }
    if (selected.length > 1) {
      rectangles.forEach((rect) => {
        rect.selected = false;
      });
      const notCurrent = selected.filter(
        (rect) => rect.id !== this.currentRect
      );
      notCurrent[0].selected = true;
    }

    return null;
  }

  mouseMove(e) {
    const bounds = this.getBoundingClientRect();
    const mousePosition = {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    };
    this.#rectCollision(mousePosition, this.rectangles);
  }

  reset() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.rectangles = [];
  }
}

customElements.define("avn-annolog-tag", AnnologCanvasTag, {
  extends: "canvas",
});
