class Matrix {
  constructor(startX, startY, w, h) {
    this.x = startX;
    this.y = startY;
    this.w = w;
    this.h = h;

    this.matrix = {};

    for (let i = startX; i < (startX + w); i++) {
      this.matrix[i] = {};
      for (let j = startY; j < (startY + h); j++) {
        this.matrix[i][j] = null;
      }
    };

    return this;
  }

  update(x, y, color) {
    if (!this.matrix[x]) return false;
    this.matrix[x][y] = color;
    return true;
  }

  getColor(x, y) {
    if (!this.matrix[x]) return false;
    if (!this.matrix[x][y]) return false;
    return this.matrix[x][y];
  }
}

module.exports = Matrix;
