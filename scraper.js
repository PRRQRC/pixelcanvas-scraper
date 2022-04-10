const http = require('https'); // or 'http' for http:// URLs
const Matrix = require('./matrix.js');
const EnumColor = require('./colors.js');
const events = require("events");
const EventSource = require("eventsource");
const { threadId } = require('worker_threads');

class Scraper {
  constructor(fingerprint, coords) {
    this.colors = new EnumColor();
    this.canvas = null;

    this.coords = coords;
    this.x = coords.x;
    this.y = coords.y;
    this.w = coords.w;
    this.h = coords.h;

    this.eventEmitter = new events.EventEmitter();

    this.eventUrl = "https://pixelcanvas.io/";

    this.fingerprint = fingerprint;

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
      const x = this.x; // start coords
      const y = this.y;

      const h = this.h;
      const w = this.w;

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
            canvas.update(tx, ty, this.colors.index(c));
            i += 1;
            tx = offX + (Math.floor(i / (64 * 64)) % 15) * 64 + (i % (64 * 64)) % 64;
            ty = offY + Math.floor(i / (64 * 64 * 15)) * 64 + Math.floor((i % (64 * 64)) / 64);
            c = b & 0xF;
            canvas.update(tx, ty, this.colors.index(c));
            i += 1;
          });
        }
      }
      this.eventEmitter.emit("ready", canvas);
      this.canvas = canvas;
      res(canvas);
    });
  }

  getColor(x, y) {
    return this.canvas.getColor(x, y);
  }

  emit(event, data) {
    this.eventEmitter.emit(event, data);
  }
  on(event, callback) {
    this.eventEmitter.on(event, callback);
  }
  once(event, callback) {
    this.eventEmitter.once(event, callback);
  }

  connectEventSource() {
    this.source = new EventSource(this.eventUrl + "events?fingerprint=" + this.fingerprint);

    this.source.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.x >= this.x && data.x <= this.x + this.w) {
        if (data.y >= this.y && data.y <= this.y + this.h) {
          this.canvas.update(data.x, data.y, this.colors.index(data.color));
          data.color = this.colors.index(data.color);
          this.emit("update", data);
        }
      }
    }
    this.source.onopen = (e) => {
      this.eventEmitter.emit("connectionReady", e);
    }

    this.source.onerror = (e) => {
      console.log("EventSource error: ". e);
    };
  }
}

/*const scraper = new Scraper("57406ac14592dae5e720e0e68d0f4583", { x: -513, y: 2780, w: 32, h: 32 });
scraper.get().then(canvas => {
  console.log(canvas.getColor(-500, 2797));
});
scraper.connectEventSource();
scraper.on("update", (data) => {
  console.log(data);
});
scraper.on("connectionReady", (e) => {
  console.log("EventSource connection ready!");
});*/

module.exports = Scraper;
