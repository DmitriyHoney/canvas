class MoveLogic {
  constructor(canvas, redrawCb, updateInitialCoordsCb) {
    this.startPointMove = null;
    this.redrawCb = redrawCb;
    this.updateInitialCoordsCb = updateInitialCoordsCb;

    canvas.addEventListener("mousedown", this.mouseDownCanvas);
    canvas.addEventListener("mouseup", () => {
      this.updateInitialCoordsCb();
      canvas.removeEventListener("mousemove", this.mouseMoveCanvas);
      this.startPointMove = null;
    });
  }
  mouseDownCanvas = (e) => {
    this.startPointMove = [e.offsetX, e.offsetY];
    canvas.addEventListener("mousemove", this.mouseMoveCanvas);
  };
  mouseMoveCanvas = (e) => {
    const newX = e.offsetX - this.startPointMove[0];
    const newY = e.offsetY - this.startPointMove[1];
    this.redrawCb(newX, newY);
  };
}

class ScaleLogic {
  constructor(canvas, ctx, redrawCb) {
    this.ctx = ctx;
    this.canvas = canvas;

    this.canvas.addEventListener("dblclick", (e) => {
      e.ctrlKey ? this.ctx.scale(0.8, 0.8) : this.ctx.scale(1.2, 1.2);
      redrawCb();
    });
  }
}

class NodePoint {
  constructor(
    ctx,
    x = 50,
    y = 50,
    w = 50,
    h = 50,
    settings = {
      draw: "fill",
      lineWidth: "2",
      lineFill: "#000",
      strokeStyle: "pink",
    }
  ) {
    this.currentCoords = [x, y];
    this.initialCoords = [x, y];
    this.width = w;
    this.height = h;
    this.ctx = ctx;
    this.settings = settings;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.lineFill = this.settings.lineFill;
    this.ctx.strokeStyle = this.settings.strokeStyle;
    this.ctx.lineWidth = this.settings.lineWidth;
    const [x, y] = this.currentCoords;
    this.ctx.rect(x, y, this.width, this.height);
    this.settings.draw === "fill"
      ? this.ctx.fill()
      : this.ctx[this.settings.draw]();
    this.ctx.closePath();
  }
  redraw(newX = this.currentCoords[0], newY = this.currentCoords[1]) {
    this.currentCoords = [newX, newY];
    this.draw();
  }
  updateInitialCoords(
    newX = this.initialCoords[0],
    newY = this.initialCoords[1]
  ) {
    this.initialCoords = [newX, newY];
  }
}

class HallCanvas {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.moveInstance = null;
    this.scaleInstance = null;
    this.init(canvasId);

    // temp
    this.nodes = [];
  }
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = canvas.getContext("2d");
    this.scaleInstance = new ScaleLogic(
      this.canvas,
      this.ctx,
      this.redrawAllNodes
    );
    this.moveInstance = new MoveLogic(
      this.canvas,
      (x, y) => {
        this.clearCanvas();
        this.nodes.forEach((n) => {
          n.redraw(x + n.initialCoords[0], y + n.initialCoords[1]);
        });
      },
      () => {
        this.nodes.forEach((n) => {
          n.updateInitialCoords(n.currentCoords[0], n.currentCoords[1]);
        });
      }
    );
  }
  redrawAllNodes = () => {
    this.clearCanvas();
    this.nodes.forEach((n) => {
      n.redraw(n.initialCoords[0], n.initialCoords[1]);
    });
  };
  clearCanvas() {
    this.ctx.clearRect(
      -100000000,
      -100000000,
      this.canvas.width * 1000000000,
      this.canvas.height * 1000000000
    );
  }
  addNode(x, y, w, h) {
    const point = new NodePoint(this.ctx, x, y, w, h);
    point.draw();
    this.nodes.push(point);
  }
  addSector({ title, rows, cols }) {
    // TODO constant
    const seatSize = 40;
    const padding = 40;
    const addedCols = 2; // Доп колонки по бокам
    const gapCol = (cols + 2) * 12;
    const gapRow = (rows + 2) * 12;
    const height = seatSize * rows + gapRow + padding;
    const width = seatSize * cols + gapCol + padding;
    const sector = new NodePoint(this.ctx, 0, 0, width, height, {
      draw: "stroke",
      strokeStyle: "white",
    });
    sector.draw();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let col = (seatSize + 12) * r + padding;
        let row = (seatSize + 12) * c + padding;
        this.addNode(row, col, seatSize, seatSize);
      }
    }
    this.nodes.push(sector);
  }
}

const game = new HallCanvas("canvas");
