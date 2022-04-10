const http = require('https'); // or 'https' for https:// URLs
const Matrix = require('./matrix.js');
const EnumColor = require('./colors.js');

class Scraper {
  constructor() {
    this.colors = new EnumColor();
    this.canvas = null;

    return this;
  }

  downloadCanvas(x, y) {
    const ORIGIN = 'https://pixelcanvas.io';
    const headers = {
      'User-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
      'Origin': ORIGIN,
      'Referer': ORIGIN
    };
    return new Promise((res, rej) => {
      console.log(`/api/bigchunk/${x}.${y}.bmp`);
      const request = http.get({ hostname: "pixelcanvas.io", path: `/api/bigchunk/${x}.${y}.bmp`, headers: headers }, function (response) {
        let data = [];

        var headerDate;
        if (response.headers) {
          if (response.headers.date) {
            headerDate = response.headers.date;
          } else {
            headerDate = "No response date given";
          }
        }
        console.log('Status Code:', response.statusCode);
        console.log('Date in Response header:', headerDate);

        response.on('data', chunk => {
          data.push(chunk);
        });

        response.on('end', () => {
          const result = Buffer.concat(data);
          res(result);
        });
      }).on("error", err => {
        rej(err);
      });
    });
  }

  get() {
    return new Promise(async (res, rej) => {
      const x = -497; // start coords
      const y = 2796;

      const h = 32;
      const w = 32;

      const canvas = new Matrix(x, y, w, h);

      let wc = Math.floor((x + w + 448) / 960);
      let hc = Math.floor((y + h + 448) / 960);
      let xc = Math.floor((x + 448) / 960);
      let yc = Math.floor((y + 448) / 960);

      for (let iy = yc; iy < (hc + 1); iy++) {
        for (let ix = xc; ix < (wc + 1); ix++) {
          const data = await this.downloadCanvas(ix * 15, iy * 15);
          let i = 0;
          let offX = ix * 960 - 448;
          let offY = iy * 960 - 448;
          data.forEach((b) => {
            let tx = offX + (Math.floor(i / (64 * 64)) % 15) * 64 + (i % (64 * 64)) % 64;
            let ty = offY + Math.floor(i / (64 * 64 * 15)) * 64 + Math.floor((i % (64 * 64)) / 64);
            let c = b >> 4;
            canvas.update(tx, ty, colors.index(c));
            i += 1;
            tx = offX + (Math.floor(i / (64 * 64)) % 15) * 64 + (i % (64 * 64)) % 64;
            ty = offY + Math.floor(i / (64 * 64 * 15)) * 64 + Math.floor((i % (64 * 64)) / 64);
            c = b & 0xF;
            canvas.update(tx, ty, colors.index(c));
            i += 1;
          });
        }
      }
      this.canvas = canvas;
      res(canvas);
    });
  }
}

module.exports = Scraper;
