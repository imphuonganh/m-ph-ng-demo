const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Atom {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 18;
    this.dragging = false;
  }

  update() {
    if (!this.dragging) {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
    }
  }
}

class Bond {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.len = 60;
  }

  apply() {
    const dx = this.b.x - this.a.x;
    const dy = this.b.y - this.a.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const diff = (d - this.len) / d;

    const ox = dx * diff * 0.5;
    const oy = dy * diff * 0.5;

    if (!this.a.dragging) { this.a.x += ox; this.a.y += oy; }
    if (!this.b.dragging) { this.b.x -= ox; this.b.y -= oy; }
  }
}

const atoms = [
  new Atom("H", 300, 300),
  new Atom("H", 380, 300),
  new Atom("O", 340, 200)
];

const bonds = [new Bond(atoms[0], atoms[2]), new Bond(atoms[1], atoms[2])];

let selected = null;

canvas.addEventListener("mousedown", e => {
  const x = e.clientX, y = e.clientY;
  selected = atoms.find(a => Math.hypot(a.x-x,a.y-y) < a.radius);
  if (selected) selected.dragging = true;
});

canvas.addEventListener("mousemove", e => {
  if (selected) {
    selected.x = e.clientX;
    selected.y = e.clientY;
  }
});

canvas.addEventListener("mouseup", () => {
  if (selected) selected.dragging = false;
  selected = null;
});

function update() {
  atoms.forEach(a => a.update());
  bonds.forEach(b => b.apply());

  // simple reaction: if H2 + O close -> reset
  const h1 = atoms[0], h2 = atoms[1], o = atoms[2];
  const d = Math.hypot(h1.x-o.x, h1.y-o.y);
  if (d < 80) {
    h1.x += 50; h2.x += 50;
  }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "#888";
  bonds.forEach(b => {
    ctx.beginPath();
    ctx.moveTo(b.a.x,b.a.y);
    ctx.lineTo(b.b.x,b.b.y);
    ctx.stroke();
  });

  atoms.forEach(a => {
    ctx.beginPath();
    ctx.arc(a.x,a.y,a.radius,0,Math.PI*2);
    ctx.fillStyle = a.type === "O" ? "#ff5555" : "#66ccff";
    ctx.fill();
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
