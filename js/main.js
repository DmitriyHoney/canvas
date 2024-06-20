import { EventEmitter } from './libs/eventemitter3.esm.js';

// const EE = new EventEmitter();
// const context = { foo: 'bar' };

// function emitted() {
//   console.log('emitted');
// }

// EE.on('event-name', emitted, context);
// EE.removeListener('another-event', emitted, context);

// window.EE = EE;


class MoveLogic {
  constructor(canvas, redrawCb, updateInitialCoordsCb) {
    this.emitter = new EventEmitter();
    this.emitterContext = { foo: Math.random() };


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
    this.scale = 1;

    this.canvas.addEventListener("dblclick", (e) => {
      e.ctrlKey ? this.ctx.scale(0.8, 0.8, this.canvas.width / 2, this.canvas.height / 2) : this.ctx.scale(1.2, 1.2, this.canvas.width / 2, this.canvas.height / 2);
      if (!e.ctrlKey) {
        this.scale += 0.2;
        var widthNew = e.offsetX / 2;
        var heightNew = e.offsetY / 2;
        game.ctx.setTransform(this.scale,0,0,this.scale,-(this.scale-1)*widthNew,-(this.scale-1)*heightNew);
      } else {
        this.scale -= 0.2;
        var widthNew = e.offsetX / 2;
        var heightNew = e.offsetY / 2;
        game.ctx.setTransform(this.scale,0,0,this.scale,-(this.scale-1)*widthNew,-(this.scale-1)*heightNew);
      }
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
    this.type = 'rect'
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.lineFill = this.settings.lineFill;
    this.ctx.strokeStyle = this.settings.strokeStyle;
    this.ctx.lineWidth = this.settings.lineWidth;
    const [x, y] = this.currentCoords;
    this.ctx.roundRect(x, y, this.width, this.height, 24);
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

class CircleNodePoint extends NodePoint {
  constructor(...args) {
    console.log(1111, args);
    super(...args);
    this.type = 'arc';
    this.radius = 20;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.lineFill = this.settings.lineFill;
    this.ctx.strokeStyle = this.settings.strokeStyle;
    this.ctx.fillStyle = this.settings.fillStyle;
    this.ctx.lineWidth = this.settings.lineWidth;
    const [x, y] = this.currentCoords;
    this.settings.draw === "fill"
      ? this.ctx.fill()
      : this.ctx[this.settings.draw]();
    this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    this.ctx.fill()
    this.ctx.closePath();

    // Это нужно для окраски бордера по умолчанию
    this.ctx.beginPath();
    this.ctx.lineFill = this.settings.lineFill;
    this.ctx.strokeStyle = 'white';
    this.ctx.fillStyle = this.settings.fillStyle;
    this.ctx.lineWidth = '2';
    this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fill()
    this.ctx.closePath();
  }
  hoverBorder() {
    this.ctx.beginPath();
    this.ctx.lineFill = this.settings.lineFill;
    this.ctx.strokeStyle = 'red';
    this.ctx.fillStyle = this.settings.fillStyle;
    this.ctx.lineWidth = '2';
    const [x, y] = this.currentCoords;
    this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fill()
    this.ctx.closePath();
  }
  hoverColor() {
    this.ctx.beginPath();
    this.ctx.lineFill = this.settings.lineFill;
    this.ctx.strokeStyle = this.settings.strokeStyle;
    this.ctx.fillStyle = '#9CA3AF';
    this.ctx.lineWidth = this.settings.lineWidth;
    const [x, y] = this.currentCoords;
    this.settings.draw === "fill"
      ? this.ctx.fill()
      : this.ctx[this.settings.draw]();
    this.ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    this.ctx.fill()
    this.ctx.closePath();
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
    this.initHoverLogicOnPoint();

    // temp
    this.nodes = [];
  }
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = canvas.getContext("2d");
    this.scaleInstance = new ScaleLogic(this.canvas, this.ctx, this.redrawAllNodes);
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
  initHoverLogicOnPoint() {
    this.canvas.addEventListener('mousemove', (e) => {
      const findNode = this.nodes.filter((n) => n?.type === 'arc').find((n) => {
        n.draw();
        const [nX, nY] = n.currentCoords;
        const [mX, mY] = [e.offsetX, e.offsetY];
        return Math.pow((mX - nX), 2) + Math.pow((mY - nY), 2) <= Math.pow(20, 2);
      })
      if (findNode) findNode.hoverColor();
    })
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
  addCircle(x, y, w, h) {
    const point = new CircleNodePoint(this.ctx, x, y, w, h, {
      draw: "fill",
      fillStyle: "white",
    });
    point.draw();
    this.nodes.push(point);
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
    const gapCol = (cols - 1) * 12;
    const gapRow = (rows - 1) * 12;
    const height = seatSize * rows + gapRow + padding;
    const width = seatSize * cols + gapCol + padding;
    const sector = new NodePoint(this.ctx, 0, 0, width, height, {
      draw: "stroke",
      strokeStyle: "red",
    });
    sector.draw();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let col = (seatSize + 12) * r + padding;
        let row = (seatSize + 12) * c + padding;
        this.addCircle(row, col, seatSize, seatSize);
      }
    }
    this.nodes.push(sector);
  }
}

const game = new HallCanvas("canvas");
window.game = game;