(function () {
  "use strict";

  var W = 800;
  var H = 600;
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var statusEl = document.getElementById("status");
  var keys = {};
  var selectedConcept = "divisor";
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
        instruction: "{target}의 약수가 아닌 수를 격파하세요!"
      },
      multiple: {
        id: "multiple",
        name: "배수",
        description: "어떤 수에 자연수를 곱하여 만들 수 있는 수입니다.",
        candidates: [3, 4, 5],
        validation: "multiple",
        instruction: "{target}의 배수가 아닌 수를 격파하세요!"
      }
    },
    rules: {
      speedScale: [0.7, 1.0, 1.3],
      maxTotal: [12, 18, 24],
      descentRate: [10, 15, 21],
      numRange: [[1, 40], [1, 50], [1, 60]]
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
  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copy[i];
      copy[i] = copy[j];
      copy[j] = t;
    }
    return copy;
  }
  function hit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function valid(concept, num, target) {
    if (concept.validation === "divisor") return target % num === 0;
    if (concept.validation === "multiple") return num % target === 0;
    return false;
  }
  function pools(concept, target, lo, hi) {
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
  function roundRect(x, y, w, h, r, fill) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) ctx.fill();
  }
  function instruction(concept, target) {
    return concept.instruction.replace(/\{target\}/g, String(target));
  }

  function Game(concept, rules) {
    this.concept = concept;
    this.rules = rules;
    this.level = 0;
    this.score = 0;
    this.lives = 3;
    this.player = { x: W / 2, y: H - 70, cooldown: 0, inv: 0 };
    this.bullets = [];
    this.enemyBullets = [];
    this.effects = [];
    this.startLevel();
  }

  Game.prototype.startLevel = function () {
    var idx = Math.min(this.level, 2);
    this.target = this.concept.candidates[this.level % this.concept.candidates.length];
    var range = this.rules.numRange[idx];
    var pool = pools(this.concept, this.target, range[0], range[1]);
    var total = this.rules.maxTotal[idx];
    var goodCount = Math.min(pool.good.length, Math.max(3, Math.round(total * 0.4)));
    var badCount = Math.min(pool.bad.length, total - goodCount);
    var nums = shuffle(pool.good).slice(0, goodCount).map(function (n) {
      return { n: n, avoid: true };
    }).concat(shuffle(pool.bad).slice(0, badCount).map(function (n) {
      return { n: n, avoid: false };
    }));
    nums = shuffle(nums);
    this.enemies = [];
    for (var i = 0; i < nums.length; i += 1) {
      var col = i % 6;
      var row = Math.floor(i / 6);
      var x = 170 + col * 92 + (row % 2) * 34;
      this.enemies.push({
        n: nums[i].n,
        avoid: nums[i].avoid,
        x: x,
        baseX: x,
        y: 92 + row * 58,
        baseY: 92 + row * 58,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.8, 1.2) * this.rules.speedScale[idx],
        alive: true
      });
    }
    this.bullets = [];
    this.enemyBullets = [];
    this.started = performance.now();
    this.bannerUntil = this.started + 1700;
    this.enemyShootAt = this.started + 2100;
    this.state = "playing";
  };

  Game.prototype.update = function (dt, now) {
    if (this.state !== "playing") {
      if (keys.Enter) this.restart();
      return;
    }
    var p = this.player;
    if (now > this.bannerUntil) {
      if (keys.ArrowLeft) p.x -= 300 * dt;
      if (keys.ArrowRight) p.x += 300 * dt;
      if (keys.ArrowUp) p.y -= 260 * dt;
      if (keys.ArrowDown) p.y += 260 * dt;
      p.x = clamp(p.x, 32, W - 32);
      p.y = clamp(p.y, 70, H - 48);
      p.cooldown -= dt;
      if (keys.Space && p.cooldown <= 0) {
        this.bullets.push({ x: p.x, y: p.y - 26, w: 6, h: 18 });
        p.cooldown = 0.22;
      }
    }
    var idx = Math.min(this.level, 2);
    var elapsed = (now - this.started) / 1000;
    var descent = elapsed * this.rules.descentRate[idx];
    var alive = [];
    for (var i = 0; i < this.enemies.length; i += 1) {
      var e = this.enemies[i];
      if (!e.alive) continue;
      e.x = e.baseX + Math.sin(elapsed * e.speed + e.phase) * 34;
      e.y = e.baseY + descent;
      if (e.y > H - 92) this.gameOver();
      alive.push(e);
    }
    if (now > this.bannerUntil && now > this.enemyShootAt) {
      if (alive.length) {
        var shooter = choice(alive);
        this.enemyBullets.push({ x: shooter.x, y: shooter.y + 24, w: 7, h: 14 });
      }
      this.enemyShootAt = now + Math.max(900, 2300 - this.level * 420);
    }
    for (i = 0; i < this.bullets.length; i += 1) this.bullets[i].y -= 560 * dt;
    for (i = 0; i < this.enemyBullets.length; i += 1) this.enemyBullets[i].y += 250 * dt;

    for (i = 0; i < this.bullets.length; i += 1) {
      var b = this.bullets[i];
      for (var j = 0; j < this.enemies.length; j += 1) {
        e = this.enemies[j];
        if (!e.alive || b.dead) continue;
        if (hit({ x: b.x - 3, y: b.y - 9, w: b.w, h: b.h }, { x: e.x - 27, y: e.y - 20, w: 54, h: 40 })) {
          b.dead = true;
          e.alive = false;
          if (e.avoid) this.loseLife(e.x, e.y, e.n + "! -1");
          else {
            this.score += 10;
            this.burst(e.x, e.y, "#22c55e", "+10");
          }
        }
      }
    }
    for (i = 0; i < this.enemyBullets.length; i += 1) {
      b = this.enemyBullets[i];
      if (!b.dead && now >= p.inv && hit({ x: b.x - 3, y: b.y - 7, w: b.w, h: b.h }, { x: p.x - 13, y: p.y - 22, w: 26, h: 42 })) {
        b.dead = true;
        this.loseLife(p.x, p.y - 20, "목숨 -1");
      }
    }
    this.bullets = this.bullets.filter(function (b) { return !b.dead && b.y > -30; });
    this.enemyBullets = this.enemyBullets.filter(function (b) { return !b.dead && b.y < H + 30; });
    this.effects.forEach(function (fx) {
      fx.x += fx.vx * dt;
      fx.y += fx.vy * dt;
      fx.life -= dt;
    });
    this.effects = this.effects.filter(function (fx) { return fx.life > 0; });
    if (!this.enemies.some(function (e) { return e.alive && !e.avoid; })) this.clearLevel();
  };

  Game.prototype.loseLife = function (x, y, label) {
    this.lives -= 1;
    this.player.inv = performance.now() + 1400;
    this.burst(x, y, "#ef4444", label);
    if (this.lives <= 0) this.gameOver();
  };

  Game.prototype.burst = function (x, y, color, label) {
    for (var i = 0; i < 16; i += 1) {
      this.effects.push({ x: x, y: y, vx: rand(-120, 120), vy: rand(-170, 60), color: color, label: i === 0 ? label : "", life: rand(0.35, 0.8) });
    }
  };

  Game.prototype.clearLevel = function () {
    this.level += 1;
    if (this.level >= 3) {
      this.state = "won";
      return;
    }
    this.lives = 3;
    this.player.x = W / 2;
    this.player.y = H - 70;
    this.startLevel();
  };

  Game.prototype.gameOver = function () {
    this.state = "gameover";
  };

  Game.prototype.restart = function () {
    this.level = 0;
    this.score = 0;
    this.lives = 3;
    this.player = { x: W / 2, y: H - 70, cooldown: 0, inv: 0 };
    this.startLevel();
  };

  Game.prototype.draw = function (now) {
    ctx.fillStyle = "#090b2d";
    ctx.fillRect(0, 0, W, H);
    drawStars();
    ctx.fillStyle = "rgba(14, 14, 48, 0.96)";
    ctx.fillRect(0, 0, W, 48);
    text("점수: " + this.score, 12, 24, 18, "#fde047", "left");
    text("목숨: " + "♥ ".repeat(Math.max(0, this.lives)), 170, 24, 18, "#ef4444", "left");
    text("LEVEL " + (this.level + 1), W - 78, 24, 18, "#cbd5e1");
    this.enemies.forEach(function (e) {
      if (!e.alive) return;
      ctx.fillStyle = "#a855f7";
      roundRect(e.x - 27, e.y - 20, 54, 40, 8, true);
      ctx.strokeStyle = "#e9d5ff";
      ctx.stroke();
      text(String(e.n), e.x, e.y + 1, 23);
    });
    ctx.fillStyle = "#fde047";
    this.bullets.forEach(function (b) { roundRect(b.x - 3, b.y - 9, b.w, b.h, 3, true); });
    ctx.fillStyle = "#fb923c";
    this.enemyBullets.forEach(function (b) { roundRect(b.x - 3, b.y - 7, b.w, b.h, 3, true); });
    this.effects.forEach(function (fx) {
      ctx.globalAlpha = Math.min(1, fx.life * 2);
      ctx.fillStyle = fx.color;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 4, 0, Math.PI * 2);
      ctx.fill();
      if (fx.label) text(fx.label, fx.x, fx.y - 22, 16, fx.color);
      ctx.globalAlpha = 1;
    });
    drawShip(this.player.x, this.player.y, now < this.player.inv && Math.floor(now / 80) % 2 === 0);
    ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
    ctx.fillRect(0, H - 34, W, 34);
    text("목표: " + instruction(this.concept, this.target) + "  |  방향키 이동, Space 발사", 12, H - 17, 16, "#22d3ee", "left", "600");
    if (now < this.bannerUntil) this.overlay("LEVEL " + (this.level + 1), instruction(this.concept, this.target));
    if (this.state === "gameover") this.overlay("GAME OVER", "Enter로 다시 시작");
    if (this.state === "won") this.overlay("ALL CLEAR!", "최종 점수 " + this.score + "점 - Enter로 다시 시작");
  };

  Game.prototype.overlay = function (a, b) {
    ctx.fillStyle = "rgba(0,0,0,0.68)";
    ctx.fillRect(0, H / 2 - 74, W, 148);
    text(a, W / 2, H / 2 - 24, 38, "#fde047");
    text(b, W / 2, H / 2 + 26, 22, "#f8fafc");
  };

  function drawStars() {
    for (var i = 0; i < 90; i += 1) {
      var x = (i * 73) % W;
      var y = (i * 151 + performance.now() * 0.018 * ((i % 4) + 1)) % H;
      ctx.fillStyle = "rgba(255,255,255," + (0.35 + (i % 5) * 0.12) + ")";
      ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
    }
  }

  function drawShip(x, y, hidden) {
    if (hidden) return;
    ctx.fillStyle = "#22d3ee";
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
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(x, y + 1, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMenu() {
    var c = preset.concepts[selectedConcept];
    ctx.fillStyle = "#090b2d";
    ctx.fillRect(0, 0, W, H);
    drawStars();
    text("수학 갤러그", W / 2, 178, 44, "#fde047");
    text(c.name + " 학습", W / 2, 234, 28, "#22d3ee");
    text(c.description, W / 2, 276, 20, "#dbeafe", "center", "500");
    text("상단에서 개념을 고르고 시작하세요", W / 2, 342, 20, "#f8fafc", "center", "500");
    text("방향키 이동, Space 발사, Enter 다시 시작", W / 2, 382, 18, "#bfdbfe", "center", "500");
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
