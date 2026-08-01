/* VideoFrame Studio - Canvas Annotator Module */
class Annotator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.currentTool = 'brush';
    this.currentColor = '#ef4444';
    this.lineWidth = 4;

    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;

    this.history = [];
    this.bgImage = null;
    this.timestampStr = '';

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
  }

  loadImage(dataUrl, timestampStr = '') {
    this.timestampStr = timestampStr;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.bgImage = img;
      this.canvas.width = img.naturalWidth || img.width;
      this.canvas.height = img.naturalHeight || img.height;
      this.history = [];
      this.saveState();
      this.redraw();
    };
    img.src = dataUrl;
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  saveState() {
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    if (this.history.length > 20) this.history.shift();
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      const lastState = this.history[this.history.length - 1];
      this.ctx.putImageData(lastState, 0, 0);
    }
  }

  clear() {
    if (this.bgImage) {
      this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
      this.history = [];
      this.saveState();
    }
  }

  onMouseDown(e) {
    if (!this.bgImage) return;
    this.isDrawing = true;
    const pos = this.getPos(e);
    this.startX = pos.x;
    this.startY = pos.y;

    if (this.currentTool === 'text') {
      const text = prompt('请输入要印在图片上的文字：');
      if (text) {
        this.drawText(text, pos.x, pos.y);
        this.saveState();
      }
      this.isDrawing = false;
      return;
    }

    if (this.currentTool === 'brush') {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing || !this.bgImage) return;
    const pos = this.getPos(e);

    if (this.currentTool === 'brush') {
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    } else {
      // Preview shape by restoring last state
      const lastState = this.history[this.history.length - 1];
      if (lastState) this.ctx.putImageData(lastState, 0, 0);

      this.ctx.strokeStyle = this.currentColor;
      this.ctx.fillStyle = this.currentColor;
      this.ctx.lineWidth = this.lineWidth;

      if (this.currentTool === 'rect') {
        this.ctx.strokeRect(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
      } else if (this.currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - this.startX, 2) + Math.pow(pos.y - this.startY, 2));
        this.ctx.beginPath();
        this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
      } else if (this.currentTool === 'arrow') {
        this.drawArrow(this.startX, this.startY, pos.x, pos.y);
      } else if (this.currentTool === 'mosaic') {
        this.drawMosaic(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
      }
    }
  }

  onMouseUp() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  drawArrow(fromx, fromy, tox, toy) {
    const headlen = 16 * (this.lineWidth / 4);
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);

    this.ctx.beginPath();
    this.ctx.moveTo(fromx, fromy);
    this.ctx.lineTo(tox, toy);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(tox, toy);
    this.ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawText(text, x, y) {
    const fontSize = Math.max(16, this.lineWidth * 5);
    this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    this.ctx.fillStyle = this.currentColor;
    this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
    this.ctx.shadowBlur = 6;
    this.ctx.fillText(text, x, y);
    this.ctx.shadowBlur = 0;
  }

  drawMosaic(x, y, w, h) {
    if (w === 0 || h === 0) return;
    const startX = Math.min(x, x + w);
    const startY = Math.min(y, y + h);
    const absW = Math.abs(w);
    const absH = Math.abs(h);

    const size = 10;
    for (let i = startX; i < startX + absW; i += size) {
      for (let j = startY; j < startY + absH; j += size) {
        const pixelData = this.ctx.getImageData(i, j, 1, 1).data;
        this.ctx.fillStyle = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        this.ctx.fillRect(i, j, size, size);
      }
    }
  }

  redraw() {
    if (this.bgImage) {
      this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }
}

window.Annotator = Annotator;
