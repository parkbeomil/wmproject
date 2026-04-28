// ─── DATA ───────────────────────────────────────────────────────
const QUESTIONS = [
  {tag:'개념 이해', text:'12의 약수가 아닌 것은 무엇인가요?', opts:['1','3','5','12'], ans:2, concept:'약수'},
  {tag:'공약수', text:'8과 12의 공약수를 모두 고른 것은?', opts:['1, 2, 4','1, 2, 3, 4','2, 4, 8','1, 4, 8'], ans:0, concept:'공약수'},
  {tag:'최대공약수', text:'18과 24의 최대공약수는 무엇인가요?', opts:['3','6','9','12'], ans:1, concept:'최대공약수'},
  {tag:'적용', text:'사탕 12개와 초콜릿 18개를 남김없이 똑같이 나눌 수 있는 최대 묶음 수는?', opts:['3묶음','6묶음','9묶음','12묶음'], ans:1, concept:'최대공약수 활용'},
  {tag:'개념', text:'두 수의 공약수와 최대공약수의 관계로 올바른 것은?', opts:['공약수는 최대공약수의 약수이다','최대공약수는 공약수의 약수이다','공약수와 최대공약수는 같다','공약수의 합이 최대공약수이다'], ans:0, concept:'공약수와 최대공약수 관계'},
];

const BINGO_QS = [
  {text:'12의 약수를 모두 골라 빙고를 완성하세요', ans:[1,2,3,4,6,12]},
  {text:'16의 약수를 모두 골라 빙고를 완성하세요', ans:[1,2,4,8,16]},
  {text:'20의 약수를 모두 골라 빙고를 완성하세요', ans:[1,2,4,5,10,20]},
];

const MATCH_QS = [
  {q:'12와 18의 공약수', nums:[1,2,3,4,5,6,7,8,9,10,11,12], ans:[1,2,3,6]},
  {q:'16과 24의 공약수', nums:[1,2,3,4,5,6,7,8,9,10,11,12], ans:[1,2,4,8]},
  {q:'20과 30의 공약수', nums:[1,2,3,4,5,6,7,8,9,10,11,12], ans:[1,2,5,10]},
];

const SPEED_QS = [
  {q:'24와 36의 최대공약수는?', opts:['6','8','12','18'], ans:2},
  {q:'15와 25의 최대공약수는?', opts:['3','5','10','15'], ans:1},
  {q:'18과 27의 최대공약수는?', opts:['3','6','9','18'], ans:2},
  {q:'16과 20의 최대공약수는?', opts:['2','4','8','16'], ans:1},
  {q:'12와 30의 최대공약수는?', opts:['3','6','12','30'], ans:1},
];

const OCR_RESULTS = [
  {q:'12의 약수가 아닌 것은?', student:'5', correct:'5', ok:true},
  {q:'8과 12의 공약수를 모두 고른 것은?', student:'1, 2, 3, 4', correct:'1, 2, 4', ok:false},
  {q:'18과 24의 최대공약수는?', student:'9', correct:'6', ok:false},
  {q:'사탕 나누기 최대 묶음 수는?', student:'6묶음', correct:'6묶음', ok:true},
  {q:'공약수와 최대공약수 관계는?', student:'③', correct:'①', ok:false},
];

// ─── API KEY ────────────────────────────────────────────────────
function getApiKey() { return localStorage.getItem('anthropic_api_key') || ''; }

function openApiKeyModal() {
  document.getElementById('apiKeyInput').value = getApiKey();
  document.getElementById('apiKeyModal').style.display = 'flex';
  setTimeout(() => document.getElementById('apiKeyInput').focus(), 50);
}
function closeApiKeyModal() { document.getElementById('apiKeyModal').style.display = 'none'; }
function handleModalOverlayClick(e) { if (e.target === e.currentTarget) closeApiKeyModal(); }
function toggleApiKeyVisibility() {
  const input = document.getElementById('apiKeyInput');
  input.type = input.type === 'password' ? 'text' : 'password';
}
function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) localStorage.setItem('anthropic_api_key', key);
  else localStorage.removeItem('anthropic_api_key');
  closeApiKeyModal();
  updateApiKeyStatus();
}
function updateApiKeyStatus() {
  const btn = document.getElementById('apiKeyBtn');
  const label = document.getElementById('apiKeyBtnLabel');
  if (getApiKey()) {
    btn.classList.add('has-key');
    label.textContent = 'API 키 등록됨';
  } else {
    btn.classList.remove('has-key');
    label.textContent = 'API 키 설정';
  }
}
function requireApiKey() {
  if (!getApiKey()) { openApiKeyModal(); return false; }
  return true;
}

// ─── STATE ─────────────────────────────────────────────────────
let selectedTile = -1;
let currentQ = 0;
let userAnswers = [];
let wrongList = [];
let wrongIdx = 0;
let chatHistory = [];
let isWaiting = false;
let bingoQIdx = 0;
let bingoScore = 0;
let matchIdx = 0;
let matchSelected = new Set();
let speedIdx = 0;
let speedScore = 0;
let speedTimer = null;
let speedSecs = 300;

// ─── NAVIGATION ─────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  const nav = document.getElementById('nav-' + page);
  if(nav) nav.classList.add('active');
  const titles = {game:'게임형 수업', custom:'게임형 수업', online:'사고형 수업', offline:'사고형 수업', report:'수업 리포트'};
  document.getElementById('topbarTitle').textContent = titles[page] || '';
  if(page === 'report') initReport();
}

// ─── GAME SELECTION ─────────────────────────────────────────────
function selectTile(n) {
  selectedTile = n;
  document.querySelectorAll('.game-tile').forEach((t,i) => {
    t.classList.remove('selected');
    if(i===n) t.classList.add('selected');
  });
  document.getElementById('gameStartBtn').disabled = false;
}

const GAME_SRCS = [
  { src: '../games/galaga/index.html', title: '수학 갤러그' },
  { src: '../games/packman/index.html', title: '배수 팩맨' },
  { src: '../games/mole/index.html',   title: '약수 두더지' },
];

function startSelectedGame() {
  if(selectedTile <= 2) { openGameModal(selectedTile); }
  else if(selectedTile === 3) { showGameSub('game-bingo'); initBingo(); }
  else if(selectedTile === 4) { showGameSub('game-match'); initMatch(); }
  else if(selectedTile === 5) { showGameSub('game-speed'); initSpeed(); }
}

function openGameModal(idx) {
  const game = GAME_SRCS[idx];
  document.getElementById('galagaModalTitle').textContent = '🎮 ' + game.title;
  document.getElementById('galagaFrame').src = game.src;
  document.getElementById('galagaModal').style.display = 'flex';
}

function closeGalagaModal() {
  document.getElementById('galagaFrame').src = '';
  document.getElementById('galagaModal').style.display = 'none';
}

function handleGalagaOverlayClick(e) {
  if(e.target === e.currentTarget) closeGalagaModal();
}

function showGameList() {
  if(speedTimer) { clearInterval(speedTimer); speedTimer = null; }
  showGameSub('game-list');
}

function showGameSub(id) {
  ['game-list','game-bingo','game-match','game-speed'].forEach(s => {
    document.getElementById(s).style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

// ─── BINGO ──────────────────────────────────────────────────────
function initBingo() {
  bingoScore = 0; bingoQIdx = 0;
  document.getElementById('bScore').textContent = '0';
  renderBingo();
}

function renderBingo() {
  const q = BINGO_QS[bingoQIdx];
  document.getElementById('bQuestion').textContent = q.text;
  document.getElementById('bMsg').textContent = '약수라고 생각하는 숫자를 선택하세요';
  document.getElementById('bMsg').style.color = 'var(--text2)';
  document.getElementById('bProg').style.width = '0%';
  document.getElementById('bProgText').textContent = '0개 선택';
  const all = [1,2,3,4,5,6,7,8,9,10,12,14,15,16,18,20,21,24,25,27].sort(()=>Math.random()-0.5).slice(0,20);
  if(!all.includes(q.ans[0])) { all.splice(0,q.ans.length,...q.ans); }
  const display = all.sort(()=>Math.random()-0.5).slice(0,20);
  q.ans.forEach(a => { if(!display.includes(a)) display[Math.floor(Math.random()*20)] = a; });
  const grid = document.getElementById('bingoGrid');
  grid.innerHTML = '';
  display.forEach(n => {
    const c = document.createElement('div');
    c.className = 'bingo-cell';
    c.textContent = n;
    c.onclick = () => toggleBingoCell(c, n);
    grid.appendChild(c);
  });
}

function toggleBingoCell(cell, n) {
  cell.classList.toggle('marked');
  const q = BINGO_QS[bingoQIdx];
  const marked = [...document.querySelectorAll('.bingo-cell.marked')].map(c=>parseInt(c.textContent));
  const correct = marked.filter(m => q.ans.includes(m)).length;
  const pct = Math.round((correct/q.ans.length)*100);
  document.getElementById('bProg').style.width = pct + '%';
  document.getElementById('bProgText').textContent = correct + '/' + q.ans.length + '개';
  if(correct === q.ans.length && marked.length === q.ans.length) {
    document.getElementById('bMsg').textContent = '정답! 모든 약수를 찾았어요 +10점';
    document.getElementById('bMsg').style.color = 'var(--teal)';
    bingoScore += 10;
    document.getElementById('bScore').textContent = bingoScore;
  }
}

function nextBingo() {
  bingoQIdx = (bingoQIdx + 1) % BINGO_QS.length;
  renderBingo();
}

// ─── MATCH ──────────────────────────────────────────────────────
function initMatch() { matchIdx = 0; matchSelected = new Set(); renderMatch(); }

function renderMatch() {
  const p = MATCH_QS[matchIdx];
  document.getElementById('mQuestion').textContent = p.q;
  document.getElementById('mQNum').textContent = (matchIdx+1)+'/'+MATCH_QS.length;
  document.getElementById('mMsg').textContent = '공약수 카드를 모두 골라보세요';
  document.getElementById('mMsg').style.color = 'var(--text2)';
  matchSelected = new Set();
  const grid = document.getElementById('matchGrid');
  grid.innerHTML = '';
  [...p.nums].sort(()=>Math.random()-0.5).forEach(n => {
    const c = document.createElement('div');
    c.className = 'match-card';
    c.textContent = n;
    c.onclick = () => { c.classList.toggle('picked'); if(matchSelected.has(n)) matchSelected.delete(n); else matchSelected.add(n); };
    grid.appendChild(c);
  });
}

function checkMatch() {
  const p = MATCH_QS[matchIdx];
  const ok = p.ans.every(a=>matchSelected.has(a)) && matchSelected.size===p.ans.length;
  document.getElementById('mMsg').textContent = ok ? '정답! 공약수: '+p.ans.join(', ') : '다시 확인해보세요. '+p.ans.length+'개의 공약수가 있어요';
  document.getElementById('mMsg').style.color = ok ? 'var(--teal)' : 'var(--red)';
}

function nextMatch() { matchIdx = (matchIdx+1)%MATCH_QS.length; renderMatch(); }

// ─── SPEED ──────────────────────────────────────────────────────
function initSpeed() {
  speedIdx = 0; speedScore = 0; speedSecs = 300;
  document.getElementById('spScore').textContent = '0';
  renderSpeed();
  if(speedTimer) clearInterval(speedTimer);
  speedTimer = setInterval(() => {
    speedSecs--;
    const m = Math.floor(speedSecs/60);
    const s = speedSecs % 60;
    document.getElementById('speedTimer').textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    if(speedSecs <= 0) { clearInterval(speedTimer); document.getElementById('spMsg').textContent = '시간 종료! 최종 점수: '+speedScore+'점'; }
  }, 1000);
}

function renderSpeed() {
  if(speedIdx >= SPEED_QS.length) {
    if(speedTimer) clearInterval(speedTimer);
    document.getElementById('spMsg').textContent = '완료! 최종 점수: '+speedScore+'점';
    return;
  }
  const q = SPEED_QS[speedIdx];
  document.getElementById('spQNum').textContent = '문제 '+(speedIdx+1)+'/'+SPEED_QS.length;
  document.getElementById('spQuestion').textContent = q.q;
  document.getElementById('spMsg').textContent = '';
  const grid = document.getElementById('spOpts');
  grid.innerHTML = '';
  q.opts.forEach((opt,i) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.cssText = 'width:100%;padding:16px;font-size:16px;font-family:"DM Mono",monospace;font-weight:700;justify-content:center;';
    btn.textContent = opt;
    btn.onclick = () => {
      const ok = i === q.ans;
      btn.style.background = ok ? 'var(--teal-light)' : 'var(--red-light)';
      btn.style.borderColor = ok ? 'var(--teal)' : 'var(--red)';
      btn.style.color = ok ? 'var(--teal)' : 'var(--red)';
      if(ok) speedScore += 20;
      document.getElementById('spScore').textContent = speedScore;
      document.querySelectorAll('#spOpts .btn').forEach(b => b.disabled = true);
      setTimeout(() => { speedIdx++; renderSpeed(); }, 800);
    };
    grid.appendChild(btn);
  });
}

// ─── CUSTOM GAME GENERATION ─────────────────────────────────────
async function generateGame() {
  if (!requireApiKey()) return;
  const concept = document.getElementById('cgConcept').value;
  const type = document.getElementById('cgType').value;
  const level = document.getElementById('cgLevel').value;
  const time = document.getElementById('cgTime').value;
  const extra = document.getElementById('cgExtra').value;

  const resultEl = document.getElementById('cgResult');
  resultEl.innerHTML = '<div style="padding:24px;text-align:center;"><div style="font-size:13px;color:var(--text2);margin-bottom:12px;">AI가 게임을 생성하고 있어요...</div><div class="prog-bar"><div class="prog-fill prog-blue" style="width:100%;animation:none;"></div></div></div>';

  const prompt = `초등학교 5학년 수학 교사입니다. 아래 조건으로 수업용 미니 게임을 설계해주세요.

- 학습 목표: ${concept}
- 게임 유형: ${type}
- 난이도: ${level}
- 제한 시간: ${time}
${extra ? '- 추가 요청: ' + extra : ''}

다음 형식으로 응답해주세요:
1. 게임 제목
2. 게임 규칙 (3~4줄)
3. 예시 문제 3개
4. 진행 팁 (교사용)

초등학생이 재미있게 참여할 수 있도록 구체적으로 작성해주세요.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': getApiKey(), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content.map(c=>c.text||'').join('').replace(/\n/g,'<br>');
    resultEl.innerHTML = `<div style="font-size:13px;line-height:1.8;color:var(--text);">${text}</div><div style="margin-top:16px;display:flex;gap:8px;"><button class="btn btn-teal btn-sm">이 게임으로 시작하기</button><button class="btn btn-sm">다시 생성하기</button></div>`;
  } catch(e) {
    resultEl.innerHTML = '<div style="color:var(--red);font-size:13px;">생성 중 오류가 발생했어요. 다시 시도해주세요.</div>';
  }
}

// ─── ONLINE QUIZ ─────────────────────────────────────────────────
function startOnlineQuiz() {
  currentQ = 0; userAnswers = [];
  document.getElementById('online-intro').style.display = 'none';
  document.getElementById('online-quiz').style.display = 'block';
  renderOnlineQ();
}

function renderOnlineQ() {
  const q = QUESTIONS[currentQ];
  document.getElementById('qCounter').textContent = (currentQ+1)+' / '+QUESTIONS.length;
  document.getElementById('qProg').style.width = Math.round(((currentQ+1)/QUESTIONS.length)*100)+'%';
  document.getElementById('qTag').textContent = q.tag;
  document.getElementById('qNum').textContent = (currentQ+1)+'번';
  document.getElementById('qMeta').textContent = q.concept;
  document.getElementById('qText').textContent = q.text;
  document.getElementById('qFb').textContent = '';
  document.getElementById('nextQBtn').disabled = true;
  const area = document.getElementById('qOpts');
  area.innerHTML = '';
  q.opts.forEach((opt,i) => {
    const d = document.createElement('div');
    d.className = 'opt-item';
    d.innerHTML = `<span class="opt-num">${i+1}</span><span>${opt}</span>`;
    d.onclick = () => pickOnlineOpt(i, d, q);
    area.appendChild(d);
  });
}

function pickOnlineOpt(i, el, q) {
  if(!document.getElementById('nextQBtn').disabled) return;
  document.querySelectorAll('.opt-item').forEach(o => o.classList.remove('selected','correct','wrong'));
  el.classList.add('selected');
  const ok = i === q.ans;
  el.classList.add(ok ? 'correct' : 'wrong');
  if(!ok) document.querySelectorAll('.opt-item')[q.ans].classList.add('correct');
  const fb = document.getElementById('qFb');
  fb.textContent = ok ? '정답이에요!' : '오답이에요. 정답을 확인하세요.';
  fb.style.color = ok ? 'var(--teal)' : 'var(--red)';
  userAnswers[currentQ] = i;
  document.getElementById('nextQBtn').disabled = false;
  document.querySelectorAll('.opt-item').forEach(o => o.style.pointerEvents='none');
}

function nextOnlineQ() {
  if(currentQ < QUESTIONS.length - 1) { currentQ++; renderOnlineQ(); }
  else showOnlineResult();
}

function showOnlineResult() {
  document.getElementById('online-quiz').style.display = 'none';
  document.getElementById('online-result').style.display = 'block';
  wrongList = [];
  let correct = 0;
  QUESTIONS.forEach((q,i) => { if(userAnswers[i]===q.ans) correct++; else wrongList.push(i); });
  const score = Math.round((correct/QUESTIONS.length)*100);
  document.getElementById('rScore').textContent = score+'점';
  document.getElementById('rCorrect').textContent = correct+'개';
  document.getElementById('rWrong').textContent = wrongList.length+'개';
  document.getElementById('resultSubtitle').textContent = score>=80 ? '훌륭해요! 개념을 잘 이해했어요' : '틀린 문항을 소크라테스 문답으로 복습해볼게요';
  const rows = document.getElementById('rRows');
  rows.innerHTML = '';
  QUESTIONS.forEach((q,i) => {
    const ok = userAnswers[i]===q.ans;
    rows.innerHTML += `<div class="result-item"><div><div style="font-weight:500;">${i+1}번. ${q.concept}</div><div style="font-size:12px;color:var(--text3);margin-top:2px;">${q.tag}</div></div><span class="badge ${ok?'badge-teal':'badge-red'}">${ok?'정답':'오답'}</span></div>`;
  });
  if(wrongList.length > 0) {
    document.getElementById('rWrongAlert').style.display = 'block';
    document.getElementById('rPerfect').style.display = 'none';
    document.getElementById('rWrongHint').textContent = '틀린 문항: ' + wrongList.map(i=>(i+1)+'번('+QUESTIONS[i].concept+')').join(', ') + ' — 소크라테스 문답으로 개념을 다시 익혀봐요';
  } else {
    document.getElementById('rWrongAlert').style.display = 'none';
    document.getElementById('rPerfect').style.display = 'block';
  }
}

// ─── SOCRATES ───────────────────────────────────────────────────
function startSocrates() {
  wrongIdx = 0;
  chatHistory = [];
  document.getElementById('online-result').style.display = 'none';
  document.getElementById('online-socrates').style.display = 'block';
  loadWrongQ();
}

function loadWrongQ() {
  const qi = wrongList[wrongIdx];
  const q = QUESTIONS[qi];
  document.getElementById('socInfo').textContent = (wrongIdx+1)+' / '+wrongList.length+'번째 오답 · '+q.concept;
  document.getElementById('socBadge').textContent = (qi+1)+'번 문항';
  chatHistory = [];
  document.getElementById('chatArea').innerHTML = '';
  document.getElementById('chatInput').value = '';
  const nav = document.getElementById('socNav');
  nav.style.display = wrongList.length > 1 ? 'flex' : 'none';
  if(document.getElementById('socPrev')) document.getElementById('socPrev').disabled = wrongIdx===0;
  if(document.getElementById('socNext')) document.getElementById('socNext').disabled = wrongIdx===wrongList.length-1;
  callSocrates(qi, null, 'chatArea', 'chatInput');
}

function prevWrong() { if(wrongIdx>0){ wrongIdx--; chatHistory=[]; loadWrongQ(); } }
function nextWrong() { if(wrongIdx<wrongList.length-1){ wrongIdx++; chatHistory=[]; loadWrongQ(); } }

async function callSocrates(qi, userMsg, chatAreaId, inputId) {
  if (!requireApiKey()) return;
  if(isWaiting) return;
  isWaiting = true;
  document.getElementById('chatSendBtn') && (document.getElementById('chatSendBtn').disabled = true);
  document.getElementById('chatSendBtn2') && (document.getElementById('chatSendBtn2').disabled = true);

  const q = QUESTIONS[qi] || QUESTIONS[0];
  const wrongOpt = q.opts[userAnswers[qi]] || OCR_RESULTS.find(r=>!r.ok)?.student || '(알 수 없음)';
  const correctOpt = q.opts[q.ans];

  const sys = `당신은 초등학교 5학년 수학 선생님입니다. 소크라테스식 문답법으로 학생이 스스로 개념을 깨닫도록 돕습니다.

규칙:
- 절대 정답을 직접 알려주지 마세요
- 한 번에 하나의 짧은 질문만 하세요 (2~3문장 이내)
- 학생이 이미 아는 것에서 출발해 모르는 것으로 자연스럽게 이끄세요
- 비판하지 말고 격려하며 다음 단계 생각을 유도하세요
- 올바른 개념에 도달하면 칭찬하고 정리해주세요
- 초등학생 수준의 쉬운 말을 사용하세요

문제: ${q.text}
정답: ${correctOpt} (${q.concept})
학생의 오답: ${wrongOpt}`;

  const msgs = [...chatHistory];
  if(userMsg) {
    chatHistory.push({role:'user', content:userMsg});
    msgs.push({role:'user', content:userMsg});
  } else {
    msgs.push({role:'user', content:`이 문제를 틀렸어요. "${wrongOpt}"라고 답했는데 왜 틀렸는지 잘 모르겠어요. 도와주세요.`});
  }

  addBubble('...', 'ai', chatAreaId, true);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':getApiKey(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, system:sys, messages:msgs })
    });
    const data = await res.json();
    const reply = data.content.map(c=>c.text||'').join('');
    removeTyping(chatAreaId);
    addBubble(reply, 'ai', chatAreaId, false);
    chatHistory.push({role:'assistant', content:reply});
  } catch(e) {
    removeTyping(chatAreaId);
    addBubble('연결에 문제가 생겼어요. 다시 시도해주세요.', 'ai', chatAreaId, false);
  }
  isWaiting = false;
  document.getElementById('chatSendBtn') && (document.getElementById('chatSendBtn').disabled = false);
  document.getElementById('chatSendBtn2') && (document.getElementById('chatSendBtn2').disabled = false);
}

function addBubble(text, role, areaId, isTyping) {
  const area = document.getElementById(areaId);
  const row = document.createElement('div');
  row.className = 'chat-row ' + role;
  if(isTyping) row.id = 'typing-'+areaId;
  const inner = document.createElement('div');
  if(role === 'ai') {
    const label = document.createElement('div');
    label.className = 'ai-label';
    label.textContent = 'AI 선생님';
    row.appendChild(label);
  }
  inner.className = 'bubble ' + role;
  if(isTyping) {
    inner.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  } else {
    inner.textContent = text;
  }
  row.appendChild(inner);
  area.appendChild(row);
  row.scrollIntoView({behavior:'smooth', block:'end'});
}

function removeTyping(areaId) {
  const el = document.getElementById('typing-'+areaId);
  if(el) el.remove();
}

function sendChat() {
  const inp = document.getElementById('chatInput');
  const text = inp.value.trim();
  if(!text || isWaiting) return;
  addBubble(text, 'user', 'chatArea', false);
  inp.value = '';
  callSocrates(wrongList[wrongIdx], text, 'chatArea', 'chatInput');
}

document.addEventListener('keydown', e => {
  if(e.key==='Enter' && !e.shiftKey) {
    const online = document.getElementById('page-online');
    const offline = document.getElementById('page-offline');
    if(online.classList.contains('active') && document.getElementById('online-socrates').style.display!=='none') {
      e.preventDefault(); sendChat();
    }
    if(offline.classList.contains('active') && document.getElementById('offline-socrates').style.display!=='none') {
      e.preventDefault(); sendChat2();
    }
  }
});

// ─── OFFLINE ────────────────────────────────────────────────────
function simulateOCR() {
  document.getElementById('uploadDefault').style.display = 'none';
  document.getElementById('uploadProcess').style.display = 'block';
  const steps = ['이미지 분석 중...','손글씨 인식 중...','답안 추출 중...','채점 중...','오답 분류 중...'];
  let i = 0;
  const iv = setInterval(()=>{
    i++;
    document.getElementById('uploadProg').style.width = Math.round((i/steps.length)*100)+'%';
    if(i < steps.length) {
      document.getElementById('uploadMsg').textContent = steps[i];
      document.getElementById('uploadStep').textContent = steps[i];
    }
    if(i >= steps.length) {
      clearInterval(iv);
      setTimeout(()=>{
        document.getElementById('offline-upload').style.display = 'none';
        document.getElementById('offline-result').style.display = 'block';
        renderOCRResult();
      }, 400);
    }
  }, 700);
}

function renderOCRResult() {
  const rows = document.getElementById('ocrRows');
  rows.innerHTML = '';
  const wrong = OCR_RESULTS.filter(r=>!r.ok);
  OCR_RESULTS.forEach((r,i) => {
    rows.innerHTML += `<div class="result-item"><div style="flex:1;"><div style="font-weight:500;font-size:13px;">${i+1}번. ${r.q}</div><div style="font-size:12px;color:var(--text3);margin-top:2px;">인식된 답: <strong style="font-family:'DM Mono',monospace;">${r.student}</strong> → 정답: <strong style="font-family:'DM Mono',monospace;">${r.correct}</strong></div></div><span class="badge ${r.ok?'badge-teal':'badge-red'}">${r.ok?'정답':'오답'}</span></div>`;
  });
  document.getElementById('ocrAlert').textContent = '틀린 문항 '+wrong.length+'개 — 소크라테스 문답으로 개념을 다시 익혀봐요: '+wrong.map(r=>r.q.slice(0,10)+'…').join(', ');
}

function resetOffline() {
  document.getElementById('offline-result').style.display = 'none';
  document.getElementById('offline-socrates').style.display = 'none';
  document.getElementById('offline-upload').style.display = 'block';
  document.getElementById('uploadDefault').style.display = 'block';
  document.getElementById('uploadProcess').style.display = 'none';
  document.getElementById('uploadProg').style.width = '0%';
}

function showOfflineResult() {
  document.getElementById('offline-socrates').style.display = 'none';
  document.getElementById('offline-result').style.display = 'block';
}

let offlineWrongIdx = 0;
let offlineChatHistory = [];
const OCR_WRONG_QS = [1,2,4]; // indices in QUESTIONS for offline wrong

function startOfflineSocrates() {
  offlineWrongIdx = 0;
  offlineChatHistory = [];
  document.getElementById('offline-result').style.display = 'none';
  document.getElementById('offline-socrates').style.display = 'block';
  const qi = OCR_WRONG_QS[offlineWrongIdx];
  const q = QUESTIONS[qi];
  document.getElementById('socBadge2').textContent = (qi+1)+'번 문항';
  document.getElementById('chatArea2').innerHTML = '';
  document.getElementById('chatInput2').value = '';
  callSocrates2(qi, null);
}

async function callSocrates2(qi, userMsg) {
  if (!requireApiKey()) return;
  if(isWaiting) return;
  isWaiting = true;
  document.getElementById('chatSendBtn2').disabled = true;
  const q = QUESTIONS[qi];
  const wrongOpt = OCR_RESULTS[qi]?.student || '(알 수 없음)';
  const correctOpt = q.opts[q.ans];

  const sys = `당신은 초등학교 5학년 수학 선생님입니다. 소크라테스식 문답법으로 학생이 스스로 개념을 깨닫도록 돕습니다.
규칙: 절대 정답을 직접 알려주지 마세요. 한 번에 하나의 짧은 질문만 하세요. 초등학생 수준의 쉬운 말을 사용하세요. 격려하며 이끌어 주세요.
문제: ${q.text}
정답: ${correctOpt} (${q.concept})
학생의 오답: ${wrongOpt}`;

  const msgs = [...offlineChatHistory];
  if(userMsg) { offlineChatHistory.push({role:'user',content:userMsg}); msgs.push({role:'user',content:userMsg}); }
  else msgs.push({role:'user', content:`학습지에서 이 문제를 "${wrongOpt}"라고 답했는데 틀렸어요. 어떻게 생각해야 하나요?`});

  addBubble('...','ai','chatArea2',true);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':getApiKey(),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sys,messages:msgs})});
    const data = await res.json();
    const reply = data.content.map(c=>c.text||'').join('');
    removeTyping('chatArea2');
    addBubble(reply,'ai','chatArea2',false);
    offlineChatHistory.push({role:'assistant',content:reply});
  } catch(e) {
    removeTyping('chatArea2');
    addBubble('연결 오류. 다시 시도해주세요.','ai','chatArea2',false);
  }
  isWaiting = false;
  document.getElementById('chatSendBtn2').disabled = false;
}

function sendChat2() {
  const inp = document.getElementById('chatInput2');
  const text = inp.value.trim();
  if(!text || isWaiting) return;
  addBubble(text,'user','chatArea2',false);
  inp.value = '';
  callSocrates2(OCR_WRONG_QS[offlineWrongIdx], text);
}

// ─── REPORT ─────────────────────────────────────────────────────
function initReport() {
  const items = ['약수의 의미','공약수 찾기','최대공약수 구하기','두 수의 관계','실생활 적용'];
  const rates = [92,85,58,71,64];
  const bars = document.getElementById('reportBars');
  if(!bars || bars.dataset.init) return;
  bars.dataset.init = '1';
  bars.innerHTML = '';
  items.forEach((item,i) => {
    const color = rates[i]>=80 ? 'var(--teal)' : rates[i]>=65 ? 'var(--amber)' : 'var(--red)';
    bars.innerHTML += `<div class="report-row"><div class="report-label">${item}</div><div class="report-bar"><div class="report-fill" style="width:${rates[i]}%;background:${color};"></div></div><div class="report-pct">${rates[i]}%</div></div>`;
  });

  const students = [
    {name:'김민준', pct:45, tag:'최대공약수 오개념', cls:'badge-red'},
    {name:'이서연', pct:52, tag:'약수 개념 미흡', cls:'badge-amber'},
    {name:'박준호', pct:60, tag:'공약수 혼동', cls:'badge-amber'},
    {name:'최지아', pct:40, tag:'최대공약수 오개념', cls:'badge-red'},
  ];
  const srows = document.getElementById('studentRows');
  if(!srows) return;
  srows.innerHTML = '';
  students.forEach(s => {
    srows.innerHTML += `<div class="student-row"><div style="display:flex;align-items:center;gap:10px;flex:1;"><div class="student-avatar">${s.name[0]}</div><div><div style="font-size:13px;font-weight:500;">${s.name}</div><div style="font-size:12px;color:var(--text3);margin-top:1px;">정답률 ${s.pct}%</div></div></div><div style="display:flex;align-items:center;gap:8px;"><span class="badge ${s.cls}">${s.tag}</span><button class="btn btn-sm btn-teal" onclick="navigate('online')">소크라테스 시작</button></div></div>`;
  });
  srows.innerHTML += `<div class="student-row" style="border:none;"><span style="color:var(--text3);font-size:13px;">외 2명</span><button class="btn btn-sm" onclick="navigate('online')">전체 소크라테스 시작 →</button></div>`;
}

document.addEventListener('DOMContentLoaded', updateApiKeyStatus);
