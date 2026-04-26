const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const scoreEl = document.querySelector("#score");
const missionTextEl = document.querySelector("#missionText");
const levelEl = document.querySelector("#level");
const footerProgressEl = document.querySelector("#footerProgress");
const livesEl = document.querySelector("#lives");
const numberInput = document.querySelector("#numberInput");
const numberLabel = document.querySelector('label[for="numberInput"]');
const startButton = document.querySelector("#startButton");
const startOverlay = document.querySelector("#startOverlay");
const messageOverlay = document.querySelector("#messageOverlay");
const messageTitle = document.querySelector("#messageTitle");
const messageText = document.querySelector("#messageText");
const messageButton = document.querySelector("#messageButton");

const TILE = {
  WALL: "#",
  PATH: ".",
  PLAYER: "P",
  ENEMY: "E",
  POWER: "O",
};

const DIRS = {
  ArrowUp: { x: 0, y: -1, angle: -Math.PI / 2 },
  ArrowDown: { x: 0, y: 1, angle: Math.PI / 2 },
  ArrowLeft: { x: -1, y: 0, angle: Math.PI },
  ArrowRight: { x: 1, y: 0, angle: 0 },
};

const ENEMY_COLORS = ["#ff3b4f", "#ff72c6", "#55e6ff", "#ff9f2a"];

const MAZES = {
  small: [
    "###############",
    "#P....#....O..#",
    "#.###.#.###.#.#",
    "#.....#.....#.#",
    "#.###.###.#.#.#",
    "#...#.....#...#",
    "###.#.###.###.#",
    "#...#..E..#...#",
    "#.#####.#####.#",
    "#O............#",
    "###############",
  ],
  medium: [
    "#####################",
    "#P....#......#.....O#",
    "#.###.#.####.#.###..#",
    "#...#...#....#...#..#",
    "###.###.#.######.#.##",
    "#.....#.#....#...#..#",
    "#.###.#.####.#.####.#",
    "#.#...#....#.#......#",
    "#.#.######.#.######.#",
    "#...#....E.#....#...#",
    "#.###.#######.###.#.#",
    "#O....#.....#.....#.#",
    "#####################",
  ],
  large: [
    "###########################",
    "#P....#.......#.......#..O#",
    "#.###.#.#####.#.#####.#.#.#",
    "#...#...#...#...#...#...#.#",
    "###.#####.#.#####.#.#####.#",
    "#.....#...#...#...#.....#.#",
    "#.###.#.#####.#.#####.#.#.#",
    "#.#...#.....#.#.....#.#...#",
    "#.#.#######.#.#####.#.###.#",
    "#...#.....#...#...#.#...#.#",
    "#.###.###.#####.#.#.###.#.#",
    "#.....#.#...E...#.#.....#.#",
    "#.#####.#########.#####.#.#",
    "#O....#...............#...#",
    "###########################",
  ],
};

const state = {
  mode: "ready",
  targetNumber: 12,
  level: 1,
  lives: 3,
  score: 0,
  eaten: 0,
  goal: 5,
  maze: [],
  mazeName: "small",
  dots: new Set(),
  pellets: new Map(),
  powers: new Set(),
  player: null,
  enemies: [],
  direction: DIRS.ArrowRight,
  lastTick: 0,
  enemyTimer: 0,
  powerUntil: 0,
  messageUntil: 0,
};

function clampNumber(value) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return 12;
  return Math.min(100, Math.max(1, number));
}

function readUrlNumber() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("number")) return null;
  return clampNumber(params.get("number"));
}

function goalForLevel(level) {
  return 5 + Math.floor((level - 1) / 2);
}

function mazeNameForLevel(level) {
  if (level <= 2) return "small";
  if (level <= 4) return "medium";
  return "large";
}

function enemyStepMs(level) {
  return Math.max(130, 420 - (level - 1) * 32);
}

function keyFor(pos) {
  return `${pos.x},${pos.y}`;
}

function parseMaze(level) {
  const mazeName = mazeNameForLevel(level);
  const rows = MAZES[mazeName];
  const maze = rows.map((row) => row.split(""));
  const enemies = [];
  let player = { x: 1, y: 1 };
  const powers = new Set();

  maze.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === TILE.PLAYER) {
        player = { x, y };
        maze[y][x] = TILE.PATH;
      }
      if (tile === TILE.ENEMY) {
        enemies.push({
          x,
          y,
          startX: x,
          startY: y,
          dir: DIRS.ArrowLeft,
          color: ENEMY_COLORS[enemies.length % ENEMY_COLORS.length],
        });
        maze[y][x] = TILE.PATH;
      }
      if (tile === TILE.POWER) {
        powers.add(keyFor({ x, y }));
        maze[y][x] = TILE.PATH;
      }
    });
  });

  const extraEnemies = Math.min(3, Math.floor((level - 1) / 2));
  const openTiles = getOpenTiles(maze).filter((pos) => distance(pos, player) > 8);
  for (let i = 0; i < extraEnemies && openTiles.length; i += 1) {
    const pos = openTiles[(i * 11 + level * 7) % openTiles.length];
    enemies.push({
      x: pos.x,
      y: pos.y,
      startX: pos.x,
      startY: pos.y,
      dir: DIRS.ArrowRight,
      color: ENEMY_COLORS[enemies.length % ENEMY_COLORS.length],
    });
  }

  return { mazeName, maze, player, enemies, powers };
}

function getOpenTiles(maze) {
  const tiles = [];
  maze.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile !== TILE.WALL) tiles.push({ x, y });
    });
  });
  return tiles;
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function isWall(x, y) {
  return state.maze[y]?.[x] === TILE.WALL || state.maze[y]?.[x] === undefined;
}

function isCorrectNumber(value) {
  return state.targetNumber % value === 0 || value % state.targetNumber === 0;
}

function makeCorrectNumbers() {
  const numbers = [];
  for (let i = 1; i <= 100; i += 1) {
    if (state.targetNumber % i === 0 || i % state.targetNumber === 0) {
      numbers.push(i);
    }
  }
  return numbers;
}

function makeWrongNumbers() {
  const numbers = [];
  for (let i = 1; i <= 100; i += 1) {
    if (!isCorrectNumber(i)) numbers.push(i);
  }
  return numbers;
}

function pickFrom(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function placePellets() {
  const openTiles = getOpenTiles(state.maze)
    .filter((pos) => distance(pos, state.player) > 1)
    .filter((pos) => !state.enemies.some((enemy) => enemy.x === pos.x && enemy.y === pos.y))
    .filter((pos) => !state.powers.has(keyFor(pos)));

  const correctNumbers = makeCorrectNumbers();
  const wrongNumbers = makeWrongNumbers();
  const wrongCount = Math.min(4, 2 + Math.floor((state.level - 1) / 3));
  const correctCount = Math.min(openTiles.length, state.goal + 2);
  const totalCount = Math.min(openTiles.length, correctCount + wrongCount);
  const pellets = new Map();

  for (let i = 0; i < totalCount; i += 1) {
    const tileIndex = (i * 7 + state.level * 13 + state.targetNumber) % openTiles.length;
    const pos = openTiles.splice(tileIndex, 1)[0];
    const isCorrect = i < correctCount;
    const list = isCorrect ? correctNumbers : wrongNumbers;
    const value = pickFrom(list, i * 17 + state.level * 5 + state.targetNumber);
    pellets.set(keyFor(pos), { value, correct: isCorrectNumber(value) });
  }

  state.pellets = pellets;
}

function placeDots() {
  const dots = new Set();
  getOpenTiles(state.maze).forEach((pos) => {
    const key = keyFor(pos);
    const isPlayerStart = pos.x === state.player.x && pos.y === state.player.y;
    const isEnemyStart = state.enemies.some((enemy) => enemy.x === pos.x && enemy.y === pos.y);
    if (!isPlayerStart && !isEnemyStart && !state.powers.has(key)) {
      dots.add(key);
    }
  });
  state.dots = dots;
}

function startGame() {
  state.targetNumber = clampNumber(numberInput.value);
  state.level = 1;
  state.lives = 3;
  state.score = 0;
  state.mode = "playing";
  startOverlay.classList.add("hidden");
  messageOverlay.classList.add("hidden");
  setupLevel();
}

function setupLevel() {
  const parsed = parseMaze(state.level);
  state.mazeName = parsed.mazeName;
  state.maze = parsed.maze;
  state.player = parsed.player;
  state.enemies = parsed.enemies;
  state.powers = parsed.powers;
  state.goal = goalForLevel(state.level);
  state.eaten = 0;
  state.direction = DIRS.ArrowRight;
  state.powerUntil = 0;
  state.enemyTimer = 0;
  placeDots();
  placePellets();
  updateHud();
}

function updateHud() {
  scoreEl.textContent = `점수 : ${String(state.score).padStart(2, "0")}`;
  missionTextEl.textContent = `미션 : ${state.targetNumber}의 배수 및 약수를 찾아보아요.`;
  levelEl.textContent = state.level;
  footerProgressEl.textContent = `${state.eaten}/${state.goal}`;
  livesEl.innerHTML = "";
  for (let i = 0; i < state.lives; i += 1) {
    const icon = document.createElement("span");
    icon.className = "life-icon";
    livesEl.append(icon);
  }
}

function tryMove(actor, dir) {
  const next = { x: actor.x + dir.x, y: actor.y + dir.y };
  if (isWall(next.x, next.y)) return false;
  actor.x = next.x;
  actor.y = next.y;
  return true;
}

function movePlayer(dir) {
  if (state.mode !== "playing") return;
  state.direction = dir;
  if (!tryMove(state.player, dir)) return;
  eatAtPlayerTile();
  checkEnemyCollision();
}

function eatAtPlayerTile() {
  const key = keyFor(state.player);
  if (state.dots.has(key)) {
    state.dots.delete(key);
    state.score += 5;
  }

  if (state.powers.has(key)) {
    state.powers.delete(key);
    state.powerUntil = performance.now() + 6500;
    state.score += 50;
  }

  const pellet = state.pellets.get(key);
  if (!pellet) return;

  state.pellets.delete(key);
  if (pellet.correct) {
    state.score += 100;
    state.eaten += 1;
    if (state.eaten >= state.goal) {
      updateHud();
      completeLevel();
      return;
    }
  } else {
    state.score = Math.max(0, state.score - 25);
    loseLife("틀린 숫자를 먹었어요.");
  }
  updateHud();
}

function completeLevel() {
  state.mode = "level-clear";
  state.level += 1;
  showMessage("레벨 완료", "잘했어요! 다음 미로로 갑니다.", "계속", () => {
    state.mode = "playing";
    messageOverlay.classList.add("hidden");
    setupLevel();
  });
}

function loseLife(reason) {
  if (state.mode !== "playing") return;
  state.lives -= 1;
  updateHud();
  if (state.lives <= 0) {
    state.mode = "game-over";
    showMessage("게임 끝", `${reason} 다시 도전해 볼까요?`, "다시 시작", () => {
      startOverlay.classList.remove("hidden");
      messageOverlay.classList.add("hidden");
      state.mode = "ready";
    });
    return;
  }

  const parsed = parseMaze(state.level);
  state.player = parsed.player;
  state.enemies.forEach((enemy, index) => {
    const fresh = parsed.enemies[index % parsed.enemies.length];
    enemy.x = fresh.startX;
    enemy.y = fresh.startY;
    enemy.dir = fresh.dir;
  });
  state.messageUntil = performance.now() + 900;
}

function moveEnemies() {
  state.enemies.forEach((enemy) => {
    const options = Object.values(DIRS).filter((dir) => !isWall(enemy.x + dir.x, enemy.y + dir.y));
    const forwardWorks = !isWall(enemy.x + enemy.dir.x, enemy.y + enemy.dir.y);
    const shouldTurn = !forwardWorks || Math.random() < 0.28;
    if (shouldTurn && options.length) {
      enemy.dir = options[Math.floor(Math.random() * options.length)];
    }
    tryMove(enemy, enemy.dir);
  });
  checkEnemyCollision();
}

function checkEnemyCollision() {
  if (state.mode !== "playing") return;
  const hit = state.enemies.find((enemy) => enemy.x === state.player.x && enemy.y === state.player.y);
  if (!hit) return;

  if (performance.now() < state.powerUntil) {
    state.score += 200;
    hit.x = hit.startX;
    hit.y = hit.startY;
    updateHud();
  } else {
    loseLife("방해꾼과 부딪혔어요.");
  }
}

function showMessage(title, text, buttonText, onClick) {
  messageTitle.textContent = title;
  messageText.textContent = text;
  messageButton.textContent = buttonText;
  messageButton.onclick = onClick;
  messageOverlay.classList.remove("hidden");
}

function togglePause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    showMessage("잠깐 멈춤", "Space를 누르면 다시 움직입니다.", "계속", () => {
      state.mode = "playing";
      messageOverlay.classList.add("hidden");
    });
  } else if (state.mode === "paused") {
    state.mode = "playing";
    messageOverlay.classList.add("hidden");
  }
}

function update(now) {
  const delta = now - state.lastTick;
  state.lastTick = now;

  if (state.mode === "playing") {
    state.enemyTimer += delta;
    if (state.enemyTimer >= enemyStepMs(state.level)) {
      state.enemyTimer = 0;
      moveEnemies();
    }
  }

  draw(now);
  requestAnimationFrame(update);
}

function getBoardMetrics() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(rect.width * dpr);
  const height = Math.floor(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const rows = state.maze.length || MAZES.small.length;
  const cols = state.maze[0]?.length || MAZES.small[0].length;
  const cell = Math.floor(Math.min(width / cols, height / rows));
  const boardWidth = cell * cols;
  const boardHeight = cell * rows;
  return {
    dpr,
    width,
    height,
    rows,
    cols,
    cell,
    offsetX: Math.floor((width - boardWidth) / 2),
    offsetY: Math.floor((height - boardHeight) / 2),
  };
}

function draw(now) {
  const m = getBoardMetrics();
  ctx.clearRect(0, 0, m.width, m.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, m.width, m.height);

  if (!state.maze.length) return;

  drawMaze(m);
  drawDots(m);
  drawPowers(m, now);
  drawPellets(m);
  drawEnemies(m, now);
  drawPlayer(m, now);

  if (state.messageUntil > now && state.mode === "playing") {
    drawCenterText("조심!", m, "#ff3b4f");
  }
}

function cellRect(pos, m) {
  return {
    x: m.offsetX + pos.x * m.cell,
    y: m.offsetY + pos.y * m.cell,
    size: m.cell,
  };
}

function drawMaze(m) {
  const lineWidth = Math.max(2, Math.floor(m.cell * 0.08));
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#162dff";
  ctx.shadowColor = "#315cff";
  ctx.shadowBlur = Math.max(4, m.cell * 0.12);

  state.maze.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile !== TILE.WALL) return;
      const r = cellRect({ x, y }, m);
      const leftOpen = state.maze[y]?.[x - 1] !== TILE.WALL;
      const rightOpen = state.maze[y]?.[x + 1] !== TILE.WALL;
      const topOpen = state.maze[y - 1]?.[x] !== TILE.WALL;
      const bottomOpen = state.maze[y + 1]?.[x] !== TILE.WALL;

      ctx.beginPath();
      if (topOpen) {
        ctx.moveTo(r.x + lineWidth, r.y + lineWidth);
        ctx.lineTo(r.x + r.size - lineWidth, r.y + lineWidth);
      }
      if (bottomOpen) {
        ctx.moveTo(r.x + lineWidth, r.y + r.size - lineWidth);
        ctx.lineTo(r.x + r.size - lineWidth, r.y + r.size - lineWidth);
      }
      if (leftOpen) {
        ctx.moveTo(r.x + lineWidth, r.y + lineWidth);
        ctx.lineTo(r.x + lineWidth, r.y + r.size - lineWidth);
      }
      if (rightOpen) {
        ctx.moveTo(r.x + r.size - lineWidth, r.y + lineWidth);
        ctx.lineTo(r.x + r.size - lineWidth, r.y + r.size - lineWidth);
      }
      ctx.stroke();
    });
  });
  ctx.restore();
}

function drawDots(m) {
  ctx.fillStyle = "#ffc6a1";
  state.dots.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    const r = cellRect({ x, y }, m);
    ctx.beginPath();
    ctx.arc(r.x + r.size / 2, r.y + r.size / 2, Math.max(2, r.size * 0.07), 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPellets(m) {
  state.pellets.forEach((pellet, key) => {
    const [x, y] = key.split(",").map(Number);
    const r = cellRect({ x, y }, m);
    const cx = r.x + r.size / 2;
    const cy = r.y + r.size / 2;
    const hideAnswer = state.level >= 2;
    const showAsCorrect = pellet.correct || hideAnswer;
    const radius = Math.max(9, r.size * 0.33);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = showAsCorrect ? "#ffd928" : "#08080f";
    ctx.fill();
    ctx.strokeStyle = showAsCorrect ? "#fff25b" : "#ff3156";
    ctx.lineWidth = Math.max(2, r.size * 0.055);
    ctx.stroke();

    ctx.fillStyle = showAsCorrect ? "#111" : "#ffccd4";
    ctx.font = `900 ${Math.max(9, r.size * 0.31)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pellet.value, cx, cy);
  });
}

function drawPowers(m, now) {
  state.powers.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    const r = cellRect({ x, y }, m);
    const pulse = 0.78 + Math.sin(now / 130) * 0.18;
    ctx.beginPath();
    ctx.arc(r.x + r.size / 2, r.y + r.size / 2, r.size * 0.24 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#55e6ff";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawPlayer(m, now) {
  const r = cellRect(state.player, m);
  const cx = r.x + r.size / 2;
  const cy = r.y + r.size / 2;
  const radius = r.size * 0.42;
  const mouth = 0.18 + Math.abs(Math.sin(now / 110)) * 0.22;
  const angle = state.direction.angle;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, angle + mouth * Math.PI, angle + (2 - mouth) * Math.PI);
  ctx.closePath();
  ctx.fillStyle = "#ffd928";
  ctx.fill();
}

function drawEnemies(m, now) {
  const scared = now < state.powerUntil;
  state.enemies.forEach((enemy) => {
    const r = cellRect(enemy, m);
    const x = r.x + r.size * 0.16;
    const y = r.y + r.size * 0.18;
    const w = r.size * 0.68;
    const h = r.size * 0.68;

    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.38, w / 2, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    for (let i = 2; i >= 0; i -= 1) {
      ctx.lineTo(x + w * (i + 0.5) / 3, y + h * 0.8);
      ctx.lineTo(x + w * i / 3, y + h);
    }
    ctx.closePath();
    ctx.fillStyle = scared ? "#233bff" : enemy.color;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x + w * 0.34, y + h * 0.38, w * 0.12, 0, Math.PI * 2);
    ctx.arc(x + w * 0.66, y + h * 0.38, w * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a1565";
    ctx.beginPath();
    ctx.arc(x + w * 0.36, y + h * 0.38, w * 0.055, 0, Math.PI * 2);
    ctx.arc(x + w * 0.68, y + h * 0.38, w * 0.055, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCenterText(text, m, color) {
  ctx.fillStyle = color;
  ctx.font = `900 ${Math.max(24, m.cell * 1.3)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, m.width / 2, m.height / 2);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }
  if (DIRS[event.key]) {
    event.preventDefault();
    if (event.repeat) return;
    movePlayer(DIRS[event.key]);
  }
});

startButton.addEventListener("click", startGame);
numberInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") startGame();
});

const urlNumber = readUrlNumber();
if (urlNumber) {
  numberInput.value = urlNumber;
  state.targetNumber = urlNumber;
  numberInput.hidden = true;
  numberLabel.hidden = true;
  startButton.textContent = "시작하기";
  startOverlay.classList.add("param-start");
}

setupLevel();
state.mode = "ready";
updateHud();
requestAnimationFrame((now) => {
  state.lastTick = now;
  update(now);
});
