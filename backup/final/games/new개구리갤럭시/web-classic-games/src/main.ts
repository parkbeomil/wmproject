const W = 800;
const H = 600;
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");

const keys = new Set();
let presets;
let selectedGame = "airplane";
let selectedConcept = "divisor";
let game = null;
let lastTime = performance.now();

const colors = {
  white: "#f8fafc",
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#fde047",
  cyan: "#22d3ee",
  orange: "#fb923c",
  purple: "#a855f7",
  navy: "#0f172a",
  water: "#1d6f8f",
  bank: "#47784a",
  leaf: "#35a852"
};

const rand = (min, max) => min + Math.random() * (max - min);
const randi = (min, max) => Math.floor(rand(min, max + 1));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rectsHit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function isValid(concept, num, target) {
  if (concept.validation === "divisor") return target % num === 0;
  if (concept.validation === "multiple") return num % target === 0;
  return false;
}

function fillText(text, x, y, size = 20, color = colors.white, align = "center", weight = "700") {
  ctx.font = `${weight} ${size}px "Apple SD Gothic Neo", "Noto Sans KR", system-ui`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function instruction(concept, gameId, target) {
  return concept.instructions[gameId].replaceAll("{target}", String(target));
}

function numbersFor(concept, target, lo, hi) {
  const good = [];
  const bad = [];
  for (let n = lo; n <= hi; n += 1) {
    (isValid(concept, n, target) ? good : bad).push(n);
  }
  return { good, bad };
}

function drawButtonHint(lines) {
  ctx.fillStyle = "rgba(2, 6, 23, 0.68)";
  ctx.fillRect(0, H - 34, W, 34);
  fillText(lines, 12, H - 17, 16, colors.cyan, "left", "600");
}

function drawMenu() {
  const concept = presets.concepts[selectedConcept];
  const title = selectedGame === "airplane" ? "수학 갤러그" : "개구리 연못 건너기";
  ctx.fillStyle = "#0b1026";
  ctx.fillRect(0, 0, W, H);
  drawStars(0.4);
  fillText(title, W / 2, 170, 44, colors.yellow);
  fillText(`${concept.name} 학습`, W / 2, 224, 28, colors.cyan);
  fillText(concept.description, W / 2, 264, 20, "#dbeafe", "center", "500");
  fillText("상단에서 게임과 개념을 고르고 시작하세요", W / 2, 330, 20, colors.white, "center", "500");
  fillText("키보드: 방향키, Space, Enter", W / 2, 370, 18, "#bfdbfe", "center", "500");
}

function drawStars(alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 73) % W;
    const y = (i * 151 + performance.now() * 0.018 * ((i % 4) + 1)) % H;
    ctx.fillStyle = `rgba(255,255,255,${0.35 + (i % 5) * 0.12})`;
    ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }
  ctx.restore();
}

class AirplaneGame {
  constructor(concept, rules) {
    this.concept = concept;
    this.rules = rules;
    this.level = 0;
    this.score = 0;
    this.lives = 3;
    this.player = { x: W / 2, y: H - 70, w: 42, h: 42, cooldown: 0, inv: 0 };
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.state = "banner";
    this.messageUntil = 0;
    this.startLevel();
  }

  startLevel() {
    const target = this.concept.candidates[this.level % this.concept.candidates.length];
    const range = this.rules.numRange[Math.min(this.level, 2)];
    const maxTotal = this.rules.maxTotal[Math.min(this.level, 2)];
    const { good, bad } = numbersFor(this.concept, target, range[0], range[1]);
    const avoidCount = Math.min(good.length, Math.max(3, Math.round(maxTotal * 0.4)));
    const hitCount = Math.min(bad.length, maxTotal - avoidCount);
    const pool = [...shuffle(good).slice(0, avoidCount).map((n) => ({ n, good: true })), ...shuffle(bad).slice(0, hitCount).map((n) => ({ n, good: false }))];
    this.target = target;
    this.enemies = shuffle(pool).map((item, i) => {
      const cols = 6;
      const c = i % cols;
      const r = Math.floor(i / cols);
      return {
        n: item.n,
        isAvoid: item.good,
        x: 170 + c * 92 + (r % 2) * 34,
        baseX: 170 + c * 92 + (r % 2) * 34,
        y: 92 + r * 58,
        baseY: 92 + r * 58,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.8, 1.2) * this.rules.speedScale[Math.min(this.level, 2)],
        alive: true
      };
    });
    this.bullets = [];
    this.enemyBullets = [];
    this.levelStarted = performance.now();
    this.bannerUntil = performance.now() + 1800;
    this.enemyShootAt = performance.now() + 1900;
    this.state = "playing";
  }

  update(dt, now) {
    if (this.state !== "playing") {
      if (keys.has("Enter")) this.restart();
      return;
    }

    const p = this.player;
    if (now > this.bannerUntil) {
      if (keys.has("ArrowLeft")) p.x -= 300 * dt;
      if (keys.has("ArrowRight")) p.x += 300 * dt;
      if (keys.has("ArrowUp")) p.y -= 260 * dt;
      if (keys.has("ArrowDown")) p.y += 260 * dt;
      p.x = clamp(p.x, 32, W - 32);
      p.y = clamp(p.y, 70, H - 48);
      p.cooldown -= dt;
      if (keys.has("Space") && p.cooldown <= 0) {
        this.bullets.push({ x: p.x, y: p.y - 26, w: 6, h: 18 });
        p.cooldown = 0.22;
      }
    }

    const elapsed = (now - this.levelStarted) / 1000;
    const descent = elapsed * this.rules.descentRate[Math.min(this.level, 2)];
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.x = e.baseX + Math.sin(elapsed * e.speed + e.phase) * 34;
      e.y = e.baseY + descent;
      if (e.y > H - 92) this.gameOver();
    }

    if (now > this.bannerUntil && now > this.enemyShootAt) {
      const alive = this.enemies.filter((e) => e.alive);
      if (alive.length) {
        const e = choice(alive);
        this.enemyBullets.push({ x: e.x, y: e.y + 24, w: 7, h: 14 });
      }
      this.enemyShootAt = now + Math.max(900, 2300 - this.level * 420);
    }

    this.bullets.forEach((b) => b.y -= 560 * dt);
    this.enemyBullets.forEach((b) => b.y += 250 * dt);
    this.bullets = this.bullets.filter((b) => b.y > -30);
    this.enemyBullets = this.enemyBullets.filter((b) => b.y < H + 30);

    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (!e.alive || b.dead) continue;
        if (rectsHit({ x: b.x - 3, y: b.y - 9, w: b.w, h: b.h }, { x: e.x - 27, y: e.y - 20, w: 54, h: 40 })) {
          b.dead = true;
          e.alive = false;
          const wrongHit = e.isAvoid;
          if (wrongHit) this.loseLife(e.x, e.y, `${e.n}! -1`);
          else {
            this.score += 10;
            this.burst(e.x, e.y, colors.green, "+10");
          }
        }
      }
    }
    this.bullets = this.bullets.filter((b) => !b.dead);

    for (const b of this.enemyBullets) {
      if (b.dead || now < p.inv) continue;
      if (rectsHit({ x: b.x - 3, y: b.y - 7, w: b.w, h: b.h }, { x: p.x - 13, y: p.y - 22, w: 26, h: 42 })) {
        b.dead = true;
        this.loseLife(p.x, p.y - 20, "목숨 -1");
      }
    }
    this.enemyBullets = this.enemyBullets.filter((b) => !b.dead);

    this.particles.forEach((fx) => {
      fx.y += fx.vy * dt;
      fx.x += fx.vx * dt;
      fx.life -= dt;
    });
    this.particles = this.particles.filter((fx) => fx.life > 0);

    if (!this.enemies.some((e) => e.alive && !e.isAvoid)) this.clearLevel();
  }

  loseLife(x, y, label) {
    this.lives -= 1;
    this.player.inv = performance.now() + 1400;
    this.burst(x, y, colors.red, label);
    if (this.lives <= 0) this.gameOver();
  }

  burst(x, y, color, label) {
    for (let i = 0; i < 16; i += 1) {
      this.particles.push({ x, y, vx: rand(-120, 120), vy: rand(-170, 60), color, life: rand(0.35, 0.8), label: i === 0 ? label : "" });
    }
  }

  clearLevel() {
    this.level += 1;
    if (this.level >= 3) {
      this.state = "won";
      return;
    }
    this.player.x = W / 2;
    this.player.y = H - 70;
    this.lives = 3;
    this.startLevel();
  }

  gameOver() {
    this.state = "gameover";
  }

  restart() {
    this.level = 0;
    this.score = 0;
    this.lives = 3;
    this.player = { x: W / 2, y: H - 70, w: 42, h: 42, cooldown: 0, inv: 0 };
    this.startLevel();
  }

  draw(now) {
    ctx.fillStyle = "#090b2d";
    ctx.fillRect(0, 0, W, H);
    drawStars(1);
    ctx.fillStyle = "rgba(14, 14, 48, 0.96)";
    ctx.fillRect(0, 0, W, 48);
    fillText(`점수: ${this.score}`, 12, 24, 18, colors.yellow, "left");
    fillText(`목숨: ${"♥ ".repeat(Math.max(0, this.lives))}`, 170, 24, 18, colors.red, "left");
    fillText(`LEVEL ${this.level + 1}`, W - 78, 24, 18, "#cbd5e1");

    for (const e of this.enemies) {
      if (!e.alive) continue;
      ctx.fillStyle = colors.purple;
      roundRect(e.x - 27, e.y - 20, 54, 40, 8, true);
      ctx.strokeStyle = "#e9d5ff";
      ctx.stroke();
      fillText(String(e.n), e.x, e.y + 1, 23);
    }
    ctx.fillStyle = colors.yellow;
    this.bullets.forEach((b) => roundRect(b.x - 3, b.y - 9, b.w, b.h, 3, true));
    ctx.fillStyle = colors.orange;
    this.enemyBullets.forEach((b) => roundRect(b.x - 3, b.y - 7, b.w, b.h, 3, true));

    for (const fx of this.particles) {
      ctx.globalAlpha = Math.min(1, fx.life * 2);
      ctx.fillStyle = fx.color;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 4, 0, Math.PI * 2);
      ctx.fill();
      if (fx.label) fillText(fx.label, fx.x, fx.y - 22, 16, fx.color);
      ctx.globalAlpha = 1;
    }

    drawShip(this.player.x, this.player.y, now < this.player.inv && Math.floor(now / 80) % 2 === 0);
    drawButtonHint(`목표: ${instruction(this.concept, "airplane", this.target)}  |  방향키 이동, Space 발사`);

    if (now < this.bannerUntil) this.overlay(`LEVEL ${this.level + 1}`, instruction(this.concept, "airplane", this.target));
    if (this.state === "gameover") this.overlay("GAME OVER", "Enter로 다시 시작");
    if (this.state === "won") this.overlay("ALL CLEAR!", `최종 점수 ${this.score}점 - Enter로 다시 시작`);
  }

  overlay(a, b) {
    ctx.fillStyle = "rgba(0,0,0,0.68)";
    ctx.fillRect(0, H / 2 - 74, W, 148);
    fillText(a, W / 2, H / 2 - 24, 38, colors.yellow);
    fillText(b, W / 2, H / 2 + 26, 22, colors.white);
  }
}

class FrogGame {
  constructor(concept, rules) {
    this.concept = concept;
    this.rules = rules;
    this.level = 0;
    this.lives = 3;
    this.frog = { x: W / 2, y: 560, row: -1, pad: null, jumping: null, cooldown: 0, sinking: 0 };
    this.startLevel();
  }

  startLevel() {
    this.target = this.concept.candidates[this.level % this.concept.candidates.length];
    this.rowCount = this.rules.rows[Math.min(this.level, 2)];
    this.range = this.rules.numRange[Math.min(this.level, 2)];
    this.rows = [];
    const gap = (H - 140) / (this.rowCount + 1);
    for (let i = 0; i < this.rowCount; i += 1) {
      const y = H - 70 - gap * (i + 1);
      const speed = this.rules.speed[Math.min(this.level, 2)] + i * 8;
      this.rows.push(this.makeRow(y, speed, i % 2 === 0 ? 1 : -1));
    }
    this.frog = { x: W / 2, y: 560, row: -1, pad: null, jumping: null, cooldown: 0, sinking: 0 };
    this.bannerUntil = performance.now() + 1700;
    this.state = "playing";
  }

  makeRow(y, speed, dir) {
    const pads = [];
    const spacing = W / 6;
    const { good, bad } = numbersFor(this.concept, this.target, this.range[0], this.range[1]);
    const safeIndex = randi(0, 4);
    for (let i = 0; i < 5; i += 1) {
      const valid = i === safeIndex || Math.random() < 0.35;
      const n = valid ? choice(good) : choice(bad);
      pads.push({ x: spacing * (i + 1), y, n, good: valid, alive: true, sinking: 0 });
    }
    return { y, speed, dir, pads };
  }

  update(dt, now) {
    if (this.state !== "playing") {
      if (keys.has("Enter")) this.restart();
      return;
    }

    for (const row of this.rows) {
      for (const p of row.pads) {
        p.x += row.speed * row.dir * dt;
        if (p.x < -48) p.x += W + 96;
        if (p.x > W + 48) p.x -= W + 96;
        if (p.sinking > 0) {
          p.sinking += 70 * dt;
          if (p.sinking > 58) p.alive = false;
        }
      }
    }

    const f = this.frog;
    f.cooldown -= dt;

    if (f.jumping) {
      const t = Math.min(1, (now - f.jumping.start) / f.jumping.dur);
      const arc = Math.sin(t * Math.PI) * f.jumping.height;
      f.x = f.jumping.x0 + (f.jumping.x1 - f.jumping.x0) * t;
      f.y = f.jumping.y0 + (f.jumping.y1 - f.jumping.y0) * t - arc;
      if (t >= 1) {
        f.row = f.jumping.row;
        f.pad = f.jumping.pad;
        f.jumping = null;
        this.land();
      }
    } else if (f.sinking > 0) {
      f.sinking -= dt;
      f.y += 90 * dt;
      if (f.sinking <= 0) {
        f.x = W / 2;
        f.y = 560;
        f.row = -1;
        f.pad = null;
      }
    } else if (f.pad) {
      f.x = f.pad.x;
      f.y = f.pad.y - 6 + f.pad.sinking;
    } else if (f.row === -1 && now > this.bannerUntil) {
      if (keys.has("ArrowLeft")) f.x = clamp(f.x - 250 * dt, 58, W - 58);
      if (keys.has("ArrowRight")) f.x = clamp(f.x + 250 * dt, 58, W - 58);
    }

    if (!f.jumping && f.sinking <= 0 && f.cooldown <= 0 && now > this.bannerUntil && keys.has("Space")) {
      if (keys.has("ArrowUp")) this.jump("up");
      else if (keys.has("ArrowDown")) this.jump("down");
      else if (keys.has("ArrowLeft")) this.jump("left");
      else if (keys.has("ArrowRight")) this.jump("right");
    }
  }

  jump(dir) {
    const f = this.frog;
    let pad = null;
    let rowIndex = f.row;
    if (dir === "up") {
      if (f.row === this.rows.length - 1) return this.jumpTo(f.x, 70, this.rows.length, null);
      rowIndex = f.row + 1;
      pad = closest(this.rows[rowIndex].pads, f.x);
    } else if (dir === "down") {
      if (f.row <= -1) return;
      if (f.row === 0) return this.jumpTo(f.x, 560, -1, null);
      rowIndex = f.row - 1;
      pad = closest(this.rows[rowIndex].pads, f.x);
    } else if (dir === "left" || dir === "right") {
      if (f.row < 0) return this.jumpTo(clamp(f.x + (dir === "left" ? -72 : 72), 58, W - 58), 560, -1, null, 200, 15);
      pad = neighbor(this.rows[f.row].pads, f.x, dir === "left" ? -1 : 1);
      rowIndex = f.row;
    }
    if (pad) this.jumpTo(pad.x, pad.y - 6, rowIndex, pad);
  }

  jumpTo(x, y, row, pad, dur = 260, height = 32) {
    const f = this.frog;
    f.cooldown = 0.18;
    f.pad = null;
    f.jumping = { x0: f.x, y0: f.y, x1: x, y1: y, row, pad, start: performance.now(), dur, height };
  }

  land() {
    const f = this.frog;
    if (f.row === this.rows.length) return this.clearLevel();
    if (!f.pad) return;
    if (f.pad.good) return;
    f.pad.sinking = 1;
    this.lives -= 1;
    f.sinking = 0.75;
    if (this.lives <= 0) this.state = "gameover";
  }

  clearLevel() {
    this.level += 1;
    if (this.level >= 3) this.state = "won";
    else {
      this.lives = 3;
      this.startLevel();
    }
  }

  restart() {
    this.level = 0;
    this.lives = 3;
    this.startLevel();
  }

  draw(now) {
    ctx.fillStyle = colors.water;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#256d7c";
    ctx.fillRect(0, 42, W, H - 112);
    ctx.fillStyle = colors.bank;
    ctx.fillRect(0, 0, W, 100);
    ctx.fillRect(0, H - 70, W, 70);
    ctx.fillStyle = "rgba(14, 14, 48, 0.94)";
    ctx.fillRect(0, 0, W, 42);
    fillText(`LEVEL ${this.level + 1}`, 12, 22, 18, colors.yellow, "left");
    fillText(`목표: ${this.target}`, 138, 22, 18, colors.cyan, "left");
    fillText(`목숨: ${"♥ ".repeat(Math.max(0, this.lives))}`, 260, 22, 18, colors.red, "left");

    for (const row of this.rows) {
      for (const p of row.pads) {
        if (!p.alive) continue;
        drawPad(p);
      }
    }
    drawFrog(W / 2, 75, true);
    drawFrog(this.frog.x, this.frog.y, false);
    drawButtonHint(`${instruction(this.concept, "frog", this.target)}  |  Space + 방향키 점프`);
    if (now < this.bannerUntil) this.overlay(`LEVEL ${this.level + 1}`, instruction(this.concept, "frog", this.target));
    if (this.state === "gameover") this.overlay("GAME OVER", "Enter로 다시 시작");
    if (this.state === "won") this.overlay("ALL CLEAR!", "Enter로 다시 시작");
  }

  overlay(a, b) {
    ctx.fillStyle = "rgba(0,0,0,0.66)";
    ctx.fillRect(0, H / 2 - 74, W, 148);
    fillText(a, W / 2, H / 2 - 24, 36, colors.yellow);
    fillText(b, W / 2, H / 2 + 24, 22, colors.white);
  }
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function closest(pads, x) {
  return pads.filter((p) => p.alive).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
}

function neighbor(pads, x, dir) {
  const sorted = pads.filter((p) => p.alive).sort((a, b) => a.x - b.x);
  if (dir < 0) return sorted.filter((p) => p.x < x - 6).at(-1) || null;
  return sorted.find((p) => p.x > x + 6) || null;
}

function roundRect(x, y, w, h, r, fill = false) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) ctx.fill();
}

function drawShip(x, y, hidden) {
  if (hidden) return;
  ctx.fillStyle = colors.cyan;
  ctx.beginPath();
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x - 25, y + 22);
  ctx.lineTo(x + 25, y + 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#0891b2";
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 20);
  ctx.lineTo(x - 34, y + 6);
  ctx.lineTo(x - 6, y + 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 20);
  ctx.lineTo(x + 34, y + 6);
  ctx.lineTo(x + 6, y + 4);
  ctx.fill();
  ctx.fillStyle = colors.yellow;
  ctx.beginPath();
  ctx.arc(x, y + 1, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawPad(p) {
  const y = p.y + p.sinking;
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(p.x + 4, y + 10, 48, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.sinking > 0 ? "#28713f" : colors.leaf;
  ctx.beginPath();
  ctx.ellipse(p.x, y, 48, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#14532d";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = "#4ade80";
  ctx.beginPath();
  ctx.moveTo(p.x - 28, y);
  ctx.lineTo(p.x + 32, y - 6);
  ctx.stroke();
  fillText(String(p.n), p.x, y + 1, 21, colors.white);
}

function drawFrog(x, y, small) {
  const s = small ? 0.86 : 1;
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 12 * s, 22 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#22a447";
  ctx.beginPath();
  ctx.ellipse(x, y, 20 * s, 19 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5fd17c";
  ctx.beginPath();
  ctx.ellipse(x, y + 5 * s, 12 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.white;
  ctx.beginPath();
  ctx.arc(x - 9 * s, y - 16 * s, 5 * s, 0, Math.PI * 2);
  ctx.arc(x + 9 * s, y - 16 * s, 5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(x - 9 * s, y - 16 * s, 2 * s, 0, Math.PI * 2);
  ctx.arc(x + 9 * s, y - 16 * s, 2 * s, 0, Math.PI * 2);
  ctx.fill();
}

function setActive() {
  document.querySelector("#airplaneBtn").classList.toggle("active", selectedGame === "airplane");
  document.querySelector("#frogBtn").classList.toggle("active", selectedGame === "frog");
  document.querySelector("#divisorBtn").classList.toggle("active", selectedConcept === "divisor");
  document.querySelector("#multipleBtn").classList.toggle("active", selectedConcept === "multiple");
  statusText.textContent = `${selectedGame === "airplane" ? "수학 갤러그" : "개구리 연못"} · ${presets.concepts[selectedConcept].name}`;
}

function startGame() {
  const concept = presets.concepts[selectedConcept];
  if (selectedGame === "airplane") game = new AirplaneGame(concept, presets.gameRules.airplane);
  else game = new FrogGame(concept, presets.gameRules.frog);
}

function loop(now) {
  const dt = Math.min(0.04, (now - lastTime) / 1000);
  lastTime = now;
  if (game) {
    game.update(dt, now);
    game.draw(now);
  } else {
    drawMenu();
  }
  requestAnimationFrame(loop);
}

async function boot() {
  presets = await fetch("./data/presets.json").then((res) => res.json());
  document.querySelector("#airplaneBtn").addEventListener("click", () => {
    selectedGame = "airplane";
    game = null;
    setActive();
  });
  document.querySelector("#frogBtn").addEventListener("click", () => {
    selectedGame = "frog";
    game = null;
    setActive();
  });
  document.querySelector("#divisorBtn").addEventListener("click", () => {
    selectedConcept = "divisor";
    game = null;
    setActive();
  });
  document.querySelector("#multipleBtn").addEventListener("click", () => {
    selectedConcept = "multiple";
    game = null;
    setActive();
  });
  document.querySelector("#startBtn").addEventListener("click", startGame);
  addEventListener("keydown", (event) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) event.preventDefault();
    keys.add(event.code);
    if (!game && event.code === "Enter") startGame();
  });
  addEventListener("keyup", (event) => keys.delete(event.code));
  setActive();
  requestAnimationFrame(loop);
}

boot();
