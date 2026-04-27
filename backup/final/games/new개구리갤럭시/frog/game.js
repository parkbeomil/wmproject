(function () {
  "use strict";

  var W = 800;
  var H = 600;
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var statusEl = document.getElementById("status");
  var selectedConcept = "divisor";
  var keys = {};
  var preset = null;
  var game = null;
  var lastTime = performance.now();

  var fallbackPreset = {
    concepts: {
      divisor: {
        id: "divisor",
        name: "약수",
        description: "어떤 수를 나누어떨어지게 하는 수입니다.",
        candidates: [12, 24, 36],
        validation: "divisor",
        instruction: "{target}의 약수인 연잎만 밟으세요!"
      },
      multiple: {
        id: "multiple",
        name: "배수",
        description: "어떤 수에 자연수를 곱하여 만들 수 있는 수입니다.",
        candidates: [3, 4, 5],
        validation: "multiple",
        instruction: "{target}의 배수인 연잎만 밟으세요!"
      }
    },
    rules: {
      rows: [5, 7, 9],
      numRange: [[1, 30], [2, 60], [3, 90]],
      speed: [45, 65, 85]
    }
  };

  function loadJson(path, done) {
    if (window.fetch) {
      fetch(path).then(function (res) {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      }).then(function (json) {
        done(json, "preset.json");
      }).catch(function () {
        loadJsonByXhr(path, done);
      });
    } else {
      loadJsonByXhr(path, done);
    }
  }

  function loadJsonByXhr(path, done) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.overrideMimeType("application/json");
      xhr.open("GET", path, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 0 || xhr.status === 200) {
          try {
            done(JSON.parse(xhr.responseText), "preset.json");
          } catch (err) {
            done(fallbackPreset, "내장 프리셋");
          }
        } else {
          done(fallbackPreset, "내장 프리셋");
        }
      };
      xhr.send(null);
    } catch (err) {
      done(fallbackPreset, "내장 프리셋");
    }
  }

  function rand(min, max) { return min + Math.random() * (max - min); }
  function randi(min, max) { return Math.floor(rand(min, max + 1)); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function valid(concept, num, target) {
    if (concept.validation === "divisor") return target % num === 0;
    if (concept.validation === "multiple") return num % target === 0;
    return false;
  }
  function numberPools(concept, target, lo, hi) {
    var good = [];
    var bad = [];
    for (var n = lo; n <= hi; n += 1) {
      if (valid(concept, n, target)) good.push(n);
      else bad.push(n);
    }
    return { good: good, bad: bad };
  }
  function text(s, x, y, size, color, align, weight) {
    ctx.font = (weight || "700") + " " + (size || 20) + "px 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui";
    ctx.fillStyle = color || "#f8fafc";
    ctx.textAlign = align || "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s, x, y);
  }
  function instruction(concept, target) {
    return concept.instruction.replace(/\{target\}/g, String(target));
  }
  function closest(pads, x) {
    var alive = pads.filter(function (p) { return p.alive; });
    alive.sort(function (a, b) { return Math.abs(a.x - x) - Math.abs(b.x - x); });
    return alive[0] || null;
  }
  function neighbor(pads, x, dir) {
    var alive = pads.filter(function (p) { return p.alive; });
    alive.sort(function (a, b) { return a.x - b.x; });
    if (dir < 0) {
      var left = alive.filter(function (p) { return p.x < x - 6; });
      return left[left.length - 1] || null;
    }
    for (var i = 0; i < alive.length; i += 1) {
      if (alive[i].x > x + 6) return alive[i];
    }
    return null;
  }

  function Game(concept, rules) {
    this.concept = concept;
    this.rules = rules;
    this.level = 0;
    this.lives = 3;
    this.startLevel();
  }

  Game.prototype.startLevel = function () {
    var idx = Math.min(this.level, 2);
    this.target = this.concept.candidates[this.level % this.concept.candidates.length];
    this.rowCount = this.rules.rows[idx];
    this.range = this.rules.numRange[idx];
    this.rows = [];
    var gap = (H - 140) / (this.rowCount + 1);
    for (var i = 0; i < this.rowCount; i += 1) {
      this.rows.push(this.makeRow(H - 70 - gap * (i + 1), this.rules.speed[idx] + i * 8, i % 2 === 0 ? 1 : -1));
    }
    this.frog = { x: W / 2, y: 560, row: -1, pad: null, jumping: null, cooldown: 0, sinking: 0 };
    this.bannerUntil = performance.now() + 1700;
    this.state = "playing";
  };

  Game.prototype.makeRow = function (y, speed, dir) {
    var pads = [];
    var spacing = W / 6;
    var pools = numberPools(this.concept, this.target, this.range[0], this.range[1]);
    var safeIndex = randi(0, 4);
    for (var i = 0; i < 5; i += 1) {
      var isGood = i === safeIndex || Math.random() < 0.35;
      var list = isGood ? pools.good : pools.bad;
      if (!list.length) list = isGood ? pools.bad : pools.good;
      pads.push({ x: spacing * (i + 1), y: y, n: choice(list), good: isGood, alive: true, sinking: 0 });
    }
    return { y: y, speed: speed, dir: dir, pads: pads };
  };

  Game.prototype.update = function (dt, now) {
    if (this.state !== "playing") {
      if (keys.Enter) this.restart();
      return;
    }
    for (var i = 0; i < this.rows.length; i += 1) {
      var row = this.rows[i];
      for (var j = 0; j < row.pads.length; j += 1) {
        var p = row.pads[j];
        p.x += row.speed * row.dir * dt;
        if (p.x < -48) p.x += W + 96;
        if (p.x > W + 48) p.x -= W + 96;
        if (p.sinking > 0) {
          p.sinking += 70 * dt;
          if (p.sinking > 58) p.alive = false;
        }
      }
    }
    var f = this.frog;
    f.cooldown -= dt;
    if (f.jumping) {
      var t = Math.min(1, (now - f.jumping.start) / f.jumping.duration);
      var arc = Math.sin(t * Math.PI) * f.jumping.height;
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
      if (keys.ArrowLeft) f.x = clamp(f.x - 250 * dt, 58, W - 58);
      if (keys.ArrowRight) f.x = clamp(f.x + 250 * dt, 58, W - 58);
    }
    if (!f.jumping && f.sinking <= 0 && f.cooldown <= 0 && now > this.bannerUntil && keys.Space) {
      if (keys.ArrowUp) this.jump("up");
      else if (keys.ArrowDown) this.jump("down");
      else if (keys.ArrowLeft) this.jump("left");
      else if (keys.ArrowRight) this.jump("right");
    }
  };

  Game.prototype.jump = function (dir) {
    var f = this.frog;
    var rowIndex = f.row;
    var pad = null;
    if (dir === "up") {
      if (f.row === this.rows.length - 1) {
        this.jumpTo(f.x, 70, this.rows.length, null, 240, 30);
        return;
      }
      rowIndex = f.row + 1;
      pad = closest(this.rows[rowIndex].pads, f.x);
    } else if (dir === "down") {
      if (f.row <= -1) return;
      if (f.row === 0) {
        this.jumpTo(f.x, 560, -1, null, 240, 24);
        return;
      }
      rowIndex = f.row - 1;
      pad = closest(this.rows[rowIndex].pads, f.x);
    } else if (dir === "left" || dir === "right") {
      if (f.row < 0) {
        this.jumpTo(clamp(f.x + (dir === "left" ? -72 : 72), 58, W - 58), 560, -1, null, 200, 15);
        return;
      }
      pad = neighbor(this.rows[f.row].pads, f.x, dir === "left" ? -1 : 1);
      rowIndex = f.row;
    }
    if (pad) this.jumpTo(pad.x, pad.y - 6, rowIndex, pad, 260, 32);
  };

  Game.prototype.jumpTo = function (x, y, row, pad, duration, height) {
    var f = this.frog;
    f.cooldown = 0.18;
    f.pad = null;
    f.jumping = {
      x0: f.x,
      y0: f.y,
      x1: x,
      y1: y,
      row: row,
      pad: pad,
      start: performance.now(),
      duration: duration,
      height: height
    };
  };

  Game.prototype.land = function () {
    var f = this.frog;
    if (f.row === this.rows.length) {
      this.clearLevel();
      return;
    }
    if (!f.pad) return;
    if (f.pad.good) return;
    f.pad.sinking = 1;
    this.lives -= 1;
    f.sinking = 0.75;
    if (this.lives <= 0) this.state = "gameover";
  };

  Game.prototype.clearLevel = function () {
    this.level += 1;
    if (this.level >= 3) {
      this.state = "won";
      return;
    }
    this.lives = 3;
    this.startLevel();
  };

  Game.prototype.restart = function () {
    this.level = 0;
    this.lives = 3;
    this.startLevel();
  };

  Game.prototype.draw = function (now) {
    ctx.fillStyle = "#1d6f8f";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#256d7c";
    ctx.fillRect(0, 42, W, H - 112);
    drawRipples(now);
    ctx.fillStyle = "#47784a";
    ctx.fillRect(0, 0, W, 100);
    ctx.fillRect(0, H - 70, W, 70);
    ctx.fillStyle = "rgba(14, 14, 48, 0.94)";
    ctx.fillRect(0, 0, W, 42);
    text("LEVEL " + (this.level + 1), 12, 22, 18, "#fde047", "left");
    text("목표: " + this.target, 138, 22, 18, "#22d3ee", "left");
    text("목숨: " + "♥ ".repeat(Math.max(0, this.lives)), 260, 22, 18, "#ef4444", "left");
    for (var i = 0; i < this.rows.length; i += 1) {
      for (var j = 0; j < this.rows[i].pads.length; j += 1) {
        var p = this.rows[i].pads[j];
        if (p.alive) drawPad(p);
      }
    }
    drawFrog(W / 2, 75, true);
    drawFrog(this.frog.x, this.frog.y, false);
    ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
    ctx.fillRect(0, H - 34, W, 34);
    text(instruction(this.concept, this.target) + "  |  Space + 방향키 점프", 12, H - 17, 16, "#f8fafc", "left", "600");
    if (now < this.bannerUntil) this.overlay("LEVEL " + (this.level + 1), instruction(this.concept, this.target));
    if (this.state === "gameover") this.overlay("GAME OVER", "Enter로 다시 시작");
    if (this.state === "won") this.overlay("ALL CLEAR!", "Enter로 다시 시작");
  };

  Game.prototype.overlay = function (a, b) {
    ctx.fillStyle = "rgba(0,0,0,0.66)";
    ctx.fillRect(0, H / 2 - 74, W, 148);
    text(a, W / 2, H / 2 - 24, 36, "#fde047");
    text(b, W / 2, H / 2 + 24, 22, "#f8fafc");
  };

  function drawRipples(now) {
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    for (var i = 0; i < 10; i += 1) {
      var x = (i * 97 + now * 0.018) % W;
      var y = 130 + (i * 43) % 350;
      ctx.beginPath();
      ctx.ellipse(x, y, 38, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawPad(p) {
    var y = p.y + p.sinking;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(p.x + 4, y + 10, 48, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.sinking > 0 ? "#28713f" : "#35a852";
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
    text(String(p.n), p.x, y + 1, 21);
  }

  function drawFrog(x, y, small) {
    var s = small ? 0.86 : 1;
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
    ctx.fillStyle = "#f8fafc";
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

  function drawMenu() {
    var c = preset.concepts[selectedConcept];
    ctx.fillStyle = "#1d6f8f";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#47784a";
    ctx.fillRect(0, 0, W, 110);
    ctx.fillRect(0, H - 80, W, 80);
    drawRipples(performance.now());
    text("개구리 연못 건너기", W / 2, 176, 42, "#fde047");
    text(c.name + " 학습", W / 2, 232, 28, "#bbf7d0");
    text(c.description, W / 2, 274, 20, "#f0fdf4", "center", "500");
    text("상단에서 개념을 고르고 시작하세요", W / 2, 340, 20, "#f8fafc", "center", "500");
    text("바닥 좌우 이동, Space + 방향키 점프", W / 2, 380, 18, "#dcfce7", "center", "500");
    drawFrog(W / 2, 460, false);
  }

  function startGame() {
    game = new Game(preset.concepts[selectedConcept], preset.rules);
  }

  function setActive() {
    document.getElementById("divisorBtn").classList.toggle("active", selectedConcept === "divisor");
    document.getElementById("multipleBtn").classList.toggle("active", selectedConcept === "multiple");
    statusEl.textContent = preset.concepts[selectedConcept].name + " 학습";
  }

  function loop(now) {
    var dt = Math.min(0.04, (now - lastTime) / 1000);
    lastTime = now;
    if (game) {
      game.update(dt, now);
      game.draw(now);
    } else {
      drawMenu();
    }
    requestAnimationFrame(loop);
  }

  document.getElementById("divisorBtn").onclick = function () {
    selectedConcept = "divisor";
    game = null;
    setActive();
  };
  document.getElementById("multipleBtn").onclick = function () {
    selectedConcept = "multiple";
    game = null;
    setActive();
  };
  document.getElementById("startBtn").onclick = startGame;
  window.addEventListener("keydown", function (event) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].indexOf(event.code) >= 0) event.preventDefault();
    keys[event.code] = true;
    if (!game && event.code === "Enter") startGame();
  });
  window.addEventListener("keyup", function (event) {
    keys[event.code] = false;
  });

  loadJson("./preset.json", function (json, source) {
    preset = json;
    statusEl.textContent = source + " 로드";
    setActive();
    requestAnimationFrame(loop);
  });
})();
