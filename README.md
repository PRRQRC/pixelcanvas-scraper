# Pixelcanvas.io Scraper

This package allows it to scrape a specific area of [pixelcanvas](https://pixelcavas.io)' canvas in an easy way without complex parsing.

Have Fun :)

## Installation

Just execute `npm install pixelcanvas-scraper` and require it like this:

```JS
const Scraper = require('pixelcanvas-scraper');
```

## Quickstart

Start right away with this example:

```JS
const Scraper = require("pixelcanvas-scraper");

const scraper = new Scraper("your-fingerprint", { x: -513, y: 2780, w: 32, h: 32 });

var canvas;

scraper.get().then(canvasMatrix => { // initially get the whole area
  canvas = canvasMatrix;
});

scraper.connectEventSource(); // connect to pixelcanvas
scraper.on("update", data => { 
  console.log("Pixel updated: ", data);
  canvas.update(data.x, data.y, data.color);
});

// The newest data is available in the getColor method
setTimeout(() => {
  console.log(scraper.getColor(-513, 2780));
}, 2000);
```

For a whole api server look into the [index.js](index.js) and [index.html](index.html) file.

## API

### `new Scraper(fingerprint, area)`

Creates a new Scraper object.

Parameters:

- `fingerprint`: Your pixelcanvas.io fingerprint. [How to aquire a fingerprint](#aquire-a-fingerprint)
- `area`: The area to scrape. Containing the top left corner (x, y) and the width and the height of the area (w, h).

Example:

```JS
const area = {
  x: -513,
  y: 2780,
  w: 32,
  h: 32
}
const scraper = new Scraper("fingerprint", area);
```

### `scraper.get()`

This function will scrape the current state of the area along with some pixels around it.

- Returns: `Promise`
- Data on resolve: [`PixelMatrix`](#pixelmatrix)

### `scraper.getColor(x, y)`

This function returns the color of the pixel at the given coordinates. This will always contain the newest version of the color data.

Returns: [`Color`](#color)

### `scraper.connectEventSource()`

Connect to the pixelcanvas eventSource. If you don't call this function, the scraper will not receive any events and will not update the pixels.

### `scraper.on(event, callback)`

Lets you listen to events. Available events are:

- `update`: This event is triggered, when a pixel in the area has been changed. It will 
  be triggered with the following data:
  - `x`: The x position of the pixel
  - `y`: The y position of the pixel
  - `color`: The color of the pixel
- `connectionReady`: This event will fire when the eventSource connects to pixelcanvas. It delivers the event object provided by the EventSource package.
- `connectionError`: This event will fire when the eventSource fails to connect to pixelcanvas. It delivers the event object provided by the EventSource package.

## Types

### PixelMatrix

An object that contains data about pixels and their color.

Functions:

- `getColor(x, y)`: Returns the [color](#color) of the pixel at the given coordinates. 

Advanced use:

You can access pixels of the matrix manually by accessing the `.matrix` property. It's a 2-dimensional array where the first index is the x coordinate of a pixel and the second index is the y coordinate of a pixel.

Example:
```JS
matrix.matrix[20][10]; // this will return the pixel at the coordinates x = 20 and y = 10
```

Also you can update a specific pixel by calling the `.update(x, y, color)` function. This won't work if the pixel is not in the area specified on constructing.

### EnumColor

An utility class that deals with the colors needed for pixelcanas

Properties/Methods: 

- `EnumColor.ENUM`: An array of all colors that are valid for pixelcanvas.
- `EnumColor.index(i)`: Returns the color that has the same pixelcanvas index like `i`.

### Color

A color object that contains the color information.

Properties:

- `.name`: The name of the color
- `.index`: The index of the color as it is indexed on pixelcanvas
- `.rgb`: The rgb values of the color.

### Aquire a Fingerprint

Please look at [this](https://github.com/RogerioBlanco/PixelCanvasBot#geting-yours-fingerprint-chrome-or-chromium).

### Terms of Usage

You can use this for free of course.
I'd love to see modifications of this.

Just credit me, ShadowLp174, as the author :)
