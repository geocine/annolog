<h1 align="center">
  <br>
  <a href="https://github.com/geocine/annolog#readme"><img src="https://user-images.githubusercontent.com/507464/162486113-cab5432a-4900-4cb5-8f84-19bc849d27c1.svg" alt="header" width="600"/></a>
  <br>
  &lt;avn-annolog/&gt;
  <br>
</h1>


A reusable canvas-based image annotation editor that can easily be integrated into an existing application through the `<avn-annolog/>` custom element.

> ℹ️ Rendering concepts demonstrated herein require no third-party libraries. Features used are built into JavaScript and the Web browser. 

[See demo](https://annolog.vercel.app)

![demo](https://user-images.githubusercontent.com/507464/162627074-7816fef0-fcbf-4ac0-a69f-ff8bdb958552.gif)

## Overview

The [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) is extended using [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) and is exposed using the [`is` global attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/is) which allows it to behave as a defined [Custom Built-in Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#customized_built-in_elements). The [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) is used for the render loop.

> ℹ️ All Canvas related interaction logic are implemented using the Canvas API except for text input where a custom textarea is used.

These are the three (3) core Canvas inside `<avn-annolog/>`. 
- **`<avn-annolog-image/>`** - handles loading/scaling of an image
- **`<avn-annolog-tag/>`** - handles rendering of tag inputs
- **`<avn-annolog-overlay/>`** - handles rendering of selection previews

The source for the `<avn-annolog/>` custom element can be found on the `annolog` directory.

## Disclaimer

**Custom Built-in Elements** is not supported in Safari. 
The use of polyfill [custom-elements-builtin](https://github.com/WebReflection/custom-elements-builtin) is not implemented in the demo.

The experience is the same as every other modern browser should the polyfill be used with proper feature detection.

> ⚠️ Everything is stored on local storage, do not use big images to prevent exceeding local storage qouta.

## License
[<img src="https://www.gnu.org/graphics/gplv3-127x51.png" alt="GPLv3" >](http://www.gnu.org/licenses/gpl-3.0.html)

_**annolog**_ is licensed under the GNU General Public License v3.0 (GPLv3). See [LICENSE](LICENSE) file for more details.
