/* =========================================================
   수학 빈칸 채우기 튜터 – app.js
   ========================================================= */

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

// ── API 키 (dashboard와 공유: localStorage 'anthropic_api_key') ─
function getApiKey() { return localStorage.getItem('anthropic_api_key') || ''; }

function openApiKeyModal() {
  document.getElementById('apiKeyInput').value = getApiKey();
  document.getElementById('apiKeyModal').style.display = 'flex';
  setTimeout(() => document.getElementById('apiKeyInput').focus(), 50);
}
function closeApiKeyModal() { document.getElementById('apiKeyModal').style.display = 'none'; }
function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) localStorage.setItem('anthropic_api_key', key);
  else localStorage.removeItem('anthropic_api_key');
  closeApiKeyModal();
  updateApiKeyStatus();
}
function toggleKeyVisibility() {
  const input = document.getElementById('apiKeyInput');
  input.type = input.type === 'password' ? 'text' : 'password';
}
function updateApiKeyStatus() {
  const btn = document.getElementById('apiKeyStatusBtn');
  if (!btn) return;
  btn.textContent = getApiKey() ? '🔑 API 키 등록됨' : '🔑 API 키 설정';
  btn.style.color = getApiKey() ? '#0E9A77' : '#D85A57';
}

// ── 프롬프트 ──────────────────────────────────────────────
const PARSE_SYSTEM = `너는 수학 문제지 파싱 전문가야.
PDF에서 빈칸 채우기 문제를 추출해 JSON 배열만 반환해. 마크다운 코드블록 없이 순수 JSON만.
형식: [{"id":1,"question":"문제 텍스트, 빈칸은 ___ 로","blanks":[{"id":"b1","label":"빈칸 설명","answer":"정답"}],"hint":"힌트"}]
규칙: 빈칸 없는 문제 제외. 빈칸 개수만큼 blanks 추가. answer는 문자열. 최대 10개. JSON 외 텍스트 출력 금지.`;

const TUTOR_SYSTEM = `너는 초등학교 4~5학년 학생을 가르치는 친근한 수학 튜터야. 페르소나 이름은 "AI티처"야.
말투는 편하고 따뜻하게. 마치 옆에서 알려주는 과외선선생님 느낌으로.


# 첫 대화시작 규칙
- 가볍게 자기소개하면서, 학생이 쓴 답을 자연스럽게 언급하면서 시작해.
 
# 소크라테스 교육 규칙
- 절대로 정답을 바로 알려주지 마세요.
- 매 답변은 반드시 생각을 유도하는 질문 1~2개로 끝내세요.
- 힌트는 아주 조금씩, 단계적으로만 주세요.
- 학생이 맞는 방향으로 가면 "오! 좋은 생각이야~", "맞아, 거의 다 왔어!" 같이 격려하세요.
- 학생이 완전히 정답을 말하면 그때 "정답이야! 🎉" 하고 확인 후 간단히 보충 설명해주세요.
- "그냥 정답 알려줘", "빨리 알려줘" 라고 해도 절대 정답을 말하지 말고 "선생님도 규칙이 있어서~ 같이 생각해보자!" 로 부드럽게 유도하세요.

말투 규칙:
- 존댓말 금지. 반말로 친구처럼 말해.
- 어려운 단어 금지. 쉽고 짧게.
- 이모지 한두 개 가끔 써도 좋아.
- 두 문장 이내로 짧게.

절대 금지:
- 정답이나 정답과 유사한 단어/숫자를 직접 말하지 마.
- 정답 방향을 암시하는 선택지를 주지 마.
- 계산 결과나 숫자를 직접 언급하지 마.
- 개념을 직접 설명하지 마.
- 한 번에 질문 두 개 이상 금지.
- 부정적 평가 금지.

학생이 모르겠다고 할 때: "괜찮아~" 하고 더 쉬운 개념부터 물어봐.
학생이 정답을 말하면: 바로 칭찬하고 [STATUS:SOLVED] 반환.
아직 못 찾으면: 자연스럽게 다음 질문 하나. [STATUS:ONGOING] 반환.

응답 마지막 줄에 반드시: [STATUS:ONGOING] 또는 [STATUS:SOLVED]`;

// ── 상태 ──────────────────────────────────────────────────
let problems = [];
let current = 0;
let inputs = {};       // blankId → value
let submitted = false;
let wrongBlanks = [];
let chatMsgs = [];
let aiLoading = false;
let showAnswers = false;

// ── 화면 전환 ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("screen-" + id).classList.add("active");
}

// ── Claude API ────────────────────────────────────────────
async function callClaude(system, messages, maxTokens = 1000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: maxTokens, system, messages }),
  });
  const data = await res.json();
  const block = data.content?.find(b => b.type === "text");
  return block ? block.text : "";
}

function readFileAsBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function parseReply(raw) {
  const solved = raw.includes("[STATUS:SOLVED]");
  const text = raw.replace(/\[STATUS:(ONGOING|SOLVED)\]/g, "").trim();
  return { text, solved };
}

// ── 파싱 ──────────────────────────────────────────────────
async function handleFile(file) {
  if (!file) return;
  if (!getApiKey()) {
    openApiKeyModal();
    return;
  }
  showScreen("parsing");
  try {
    const b64 = await readFileAsBase64(file);
    const raw = await callClaude(PARSE_SYSTEM, [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
        { type: "text", text: "이 PDF에서 빈칸 채우기 문제들을 파싱해줘. 순수 JSON 배열만 반환해. 마크다운 없이." }
      ]
    }], 4000);
    const start = raw.indexOf("["), end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("JSON을 찾지 못했어요.");
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed) || !parsed.length) throw new Error("빈칸 채우기 문제를 찾지 못했어요.");
    problems = parsed;
    renderReview();
    showScreen("review");
  } catch (e) {
    const el = document.getElementById("parseError");
    el.textContent = "⚠️ 문제를 읽지 못했어요: " + (e.message || "다시 시도해주세요.");
    el.style.display = "block";
    showScreen("upload");
  }
}

// ── 검토 화면 렌더 ────────────────────────────────────────
function renderReview() {
  document.getElementById("reviewSubtitle").textContent =
    `총 ${problems.length}개 문제가 준비됐어요! 정답을 확인하고 시작해 주세요 😊`;

  const list = document.getElementById("reviewList");
  list.innerHTML = "";

  problems.forEach((p, pi) => {
    const card = document.createElement("div");
    card.className = "review-problem";
    card.innerHTML = `
      <div class="review-problem-num">📝 ${pi + 1}번 문제</div>
      <div class="review-question">${escHtml(p.question)}</div>
      <div class="blank-rows" id="blankRows-${pi}"></div>
      <button class="btn-add-blank" data-pi="${pi}">+ 빈칸 추가</button>
      <details open>
        <summary>문제 텍스트 수정</summary>
        <textarea class="question-edit" data-pi="${pi}" rows="3">${escHtml(p.question)}</textarea>
      </details>
    `;
    list.appendChild(card);
    renderBlankRows(pi);
  });

  // 이벤트: 빈칸 추가
  list.querySelectorAll(".btn-add-blank").forEach(btn => {
    btn.addEventListener("click", () => {
      const pi = +btn.dataset.pi;
      problems[pi].blanks.push({ id: "b" + Date.now(), label: "새 빈칸", answer: "" });
      renderBlankRows(pi);
    });
  });

  // 이벤트: 문제 텍스트 수정
  list.querySelectorAll("textarea.question-edit").forEach(ta => {
    ta.addEventListener("input", () => {
      problems[+ta.dataset.pi].question = ta.value;
    });
  });
}

function renderBlankRows(pi) {
  const container = document.getElementById("blankRows-" + pi);
  container.innerHTML = "";
  problems[pi].blanks.forEach((b, bi) => {
    const row = document.createElement("div");
    row.className = "blank-row";
    row.innerHTML = `
      <div class="blank-label-box">
        <b>${escHtml(b.label || "빈칸 " + (bi + 1))}</b>
        <span class="answer-reveal ${showAnswers ? "visible" : ""}">→ ${escHtml(String(b.answer))}</span>
      </div>
      <input class="answer-input" type="text" value="${escHtml(String(b.answer))}"
             data-pi="${pi}" data-bi="${bi}" placeholder="정답 입력">
      <button class="btn-remove-blank" data-pi="${pi}" data-bi="${bi}">✕</button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("input.answer-input").forEach(inp => {
    inp.addEventListener("input", () => {
      problems[+inp.dataset.pi].blanks[+inp.dataset.bi].answer = inp.value;
      // answer-reveal 갱신
      const span = inp.closest(".blank-row").querySelector(".answer-reveal");
      span.textContent = "→ " + inp.value;
    });
  });

  container.querySelectorAll(".btn-remove-blank").forEach(btn => {
    btn.addEventListener("click", () => {
      problems[+btn.dataset.pi].blanks.splice(+btn.dataset.bi, 1);
      renderBlankRows(+btn.dataset.pi);
    });
  });
}

// ── 풀기 화면 ─────────────────────────────────────────────
function startSolve() {
  current = 0;
  resetSolveState();
  showScreen("solve");
  renderSolve();
}

function resetSolveState() {
  inputs = {};
  submitted = false;
  wrongBlanks = [];
  chatMsgs = [];
  aiLoading = false;
}

function renderSolve() {
  if (current >= problems.length) { showScreen("done"); return; }
  resetSolveState();
  const p = problems[current];

  // 진행 점
  document.getElementById("progressLabel").textContent = `${current + 1}번 / 총 ${problems.length}문제`;
  const dots = document.getElementById("progressDots");
  dots.innerHTML = "";
  problems.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "dot" + (i === current ? " current" : i < current ? " done" : "");
    dots.appendChild(d);
  });

  document.getElementById("problemNum").textContent = `✏️ ${current + 1}번`;

  // 문제 텍스트 (인라인 빈칸 input)
  renderQuestionBox(p);

  // 빈칸 목록
  const blankList = document.getElementById("blankList");
  blankList.innerHTML = "";
  p.blanks.forEach(b => {
    const row = document.createElement("div");
    row.className = "blank-item";
    row.innerHTML = `
      <span class="blank-item-label">${escHtml(b.label || b.id)}</span>
      <input class="solve-blank" id="si-${b.id}" type="text" placeholder="?" maxlength="10">
      <span class="mark" id="mk-${b.id}"></span>
    `;
    blankList.appendChild(row);
  });

  // solve-blank ↔ q-blank 동기화
  blankList.querySelectorAll(".solve-blank").forEach(inp => {
    const bid = inp.id.replace("si-", "");
    inp.addEventListener("input", () => {
      if (submitted) return;
      inputs[bid] = inp.value;
      const qInp = document.getElementById("qi-" + bid);
      if (qInp) qInp.value = inp.value;
    });
  });

  // 버튼 초기화
  document.getElementById("btnSubmit").style.display = "";
  document.getElementById("btnRetry").style.display = "none";
  const resultMsg = document.getElementById("resultMsg");
  resultMsg.style.display = "none";
  resultMsg.className = "result-msg";

  // 채팅 숨기기
  document.getElementById("chatCard").style.display = "none";
  document.getElementById("chatMessages").innerHTML = "";
  document.getElementById("chatSolved").style.display = "none";
  document.getElementById("chatInputArea").style.display = "flex";
  document.getElementById("chatInput").value = "";
}

function renderQuestionBox(p) {
  const box = document.getElementById("questionBox");
  box.innerHTML = "";
  const normalized = p.question.replace(/→/g, "\n→");
  const lines = normalized.split("\n").filter(l => l.trim());
  let blankIdx = 0;

  lines.forEach(line => {
    const lineDiv = document.createElement("div");
    lineDiv.style.marginBottom = "8px";
    const parts = line.split("___");
    parts.forEach((seg, si) => {
      lineDiv.appendChild(document.createTextNode(seg));
      if (si < parts.length - 1 && p.blanks[blankIdx]) {
        const b = p.blanks[blankIdx++];
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "q-blank";
        inp.id = "qi-" + b.id;
        inp.placeholder = "?";
        inp.maxLength = 10;
        inp.addEventListener("input", () => {
          if (submitted) return;
          inputs[b.id] = inp.value;
          const si2 = document.getElementById("si-" + b.id);
          if (si2) si2.value = inp.value;
        });
        lineDiv.appendChild(inp);
      }
    });
    box.appendChild(lineDiv);
  });
}

// ── 제출 ──────────────────────────────────────────────────
async function handleSubmit() {
  if (submitted) return;
  const p = problems[current];
  submitted = true;

  wrongBlanks = p.blanks.filter(b => (inputs[b.id] || "").trim() !== String(b.answer).trim());

  // 색상 표시
  p.blanks.forEach(b => {
    const isWrong = wrongBlanks.some(w => w.id === b.id);
    ["qi-", "si-"].forEach(pfx => {
      const el = document.getElementById(pfx + b.id);
      if (el) {
        el.classList.add(isWrong ? "wrong" : "correct");
        el.disabled = true;
      }
    });
    const mk = document.getElementById("mk-" + b.id);
    if (mk) { mk.textContent = isWrong ? "✗" : "✓"; mk.className = "mark " + (isWrong ? "wrong" : "correct"); }
  });

  document.getElementById("btnSubmit").style.display = "none";
  document.getElementById("btnRetry").style.display = "";

  const resultMsg = document.getElementById("resultMsg");
  resultMsg.style.display = "block";

  if (!wrongBlanks.length) {
    // 정답
    resultMsg.className = "result-msg correct";
    resultMsg.innerHTML = `
      <div class="result-emoji">🎉</div>
      <div class="result-text">정답이야! 정말 잘했어!</div>
      ${current < problems.length - 1
        ? `<button class="btn-next" id="btnNext">다음 문제 →</button>`
        : `<div style="color:#16a34a;margin-top:12px;font-weight:bold;font-size:18px">🏆 모든 문제 완료!</div>`}
    `;
    document.getElementById("btnNext")?.addEventListener("click", () => { current++; renderSolve(); });
  } else {
    resultMsg.className = "result-msg wrong";
    resultMsg.innerHTML = `
      <div class="result-text">🤔 다시 생각해보자!</div>
      <div class="result-sub">빨간 칸을 잘 봐봐. 바두기가 도와줄게 →</div>
    `;
    openChat();
  }
}

// ── 채팅 ──────────────────────────────────────────────────
async function openChat() {
  document.getElementById("chatCard").style.display = "flex";
  const p = problems[current];
  const wrongLabels = wrongBlanks.map(b =>
    `"${b.label}": 학생 답="${inputs[b.id] || "빈칸"}", 정답="${b.answer}"`
  ).join(", ");

  const initPrompt = `문제: "${p.question}"
틀린 빈칸: ${wrongLabels}

첫 마디 규칙:
- 학생이 쓴 답을 자연스럽게 언급하면서 시작해.
- 숫자면: '아, X라고 했구나~ 어떻게 계산했어?'
- 단어면: 'X라고 생각했어? 왜 그렇게 떠올랐어?'
- 비워뒀으면: '이 부분이 좀 막혔어? 어디서 헷갈렸어?'
- 절대 힌트나 방향 제시 금지. 한 문장으로 짧게.`;

  aiLoading = true;
  appendTyping();
  try {
    const raw = await callClaude(TUTOR_SYSTEM, [{ role: "user", content: initPrompt }]);
    const { text, solved } = parseReply(raw);
    removeTyping();
    chatMsgs = [{ role: "assistant", content: text }];
    appendMsg("assistant", text);
    if (solved) showChatSolved();
  } catch {
    removeTyping();
    appendMsg("assistant", "앗, 연결이 안 됐어. 다시 눌러볼래?");
  }
  aiLoading = false;
}

async function sendChat() {
  const inp = document.getElementById("chatInput");
  const msg = inp.value.trim();
  if (!msg || aiLoading) return;
  inp.value = "";
  chatMsgs.push({ role: "user", content: msg });
  appendMsg("user", msg);

  aiLoading = true;
  document.getElementById("btnSend").disabled = true;
  appendTyping();

  try {
    const p = problems[current];
    const wrongLabels = wrongBlanks.map(b =>
      `"${b.label}": 학생 답="${inputs[b.id] || "빈칸"}", 정답="${b.answer}"`
    ).join(", ");
    const ctx = TUTOR_SYSTEM + `\n\n[현재 문제]\n문제: "${p.question}"\n틀린 빈칸: ${wrongLabels}\n정답은 절대 직접 말하지 마.`;
    const raw = await callClaude(ctx, chatMsgs);
    const { text, solved } = parseReply(raw);
    removeTyping();
    chatMsgs.push({ role: "assistant", content: text });
    appendMsg("assistant", text);
    if (solved) showChatSolved();
  } catch {
    removeTyping();
    appendMsg("assistant", "앗, 연결 오류야");
  }
  aiLoading = false;
  document.getElementById("btnSend").disabled = false;
}

function appendMsg(role, text) {
  const msgs = document.getElementById("chatMessages");
  const row = document.createElement("div");
  row.className = "msg-row " + role;
  if (role === "assistant") {
    row.innerHTML = `<div class="msg-avatar">🐶</div><div class="msg-bubble">${escHtml(text)}</div>`;
  } else {
    row.innerHTML = `<div class="msg-bubble">${escHtml(text)}</div>`;
  }
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

function appendTyping() {
  const msgs = document.getElementById("chatMessages");
  const row = document.createElement("div");
  row.className = "msg-row assistant";
  row.id = "typingRow";
  row.innerHTML = `<div class="msg-avatar">🐶</div><div class="msg-bubble typing">생각하는 중...</div>`;
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  document.getElementById("typingRow")?.remove();
}

function showChatSolved() {
  document.getElementById("chatInputArea").style.display = "none";
  document.getElementById("chatSolved").style.display = "block";
  const btn = document.getElementById("btnNextFromChat");
  btn.textContent = current < problems.length - 1 ? "다음 문제 →" : "완료 🏆";
  btn.onclick = () => {
    if (current < problems.length - 1) { current++; renderSolve(); }
    else showScreen("done");
  };
}

// ── 유틸 ──────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── 이벤트 바인딩 ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // 업로드
  const fileInput = document.getElementById("fileInput");
  const dropZone  = document.getElementById("dropZone");

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));
  dropZone.addEventListener("dragover", e => e.preventDefault());
  dropZone.addEventListener("drop", e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });

  // 검토
  document.getElementById("btnToggleAnswers").addEventListener("click", () => {
    showAnswers = !showAnswers;
    document.getElementById("btnToggleAnswers").textContent = showAnswers ? "🔒 정답 숨기기" : "🔑 정답 보기";
    document.querySelectorAll(".answer-reveal").forEach(el => el.classList.toggle("visible", showAnswers));
  });
  document.getElementById("btnStartSolve").addEventListener("click", startSolve);

  // 풀기
  document.getElementById("btnSubmit").addEventListener("click", handleSubmit);
  document.getElementById("btnRetry").addEventListener("click", () => renderSolve());

  // 채팅
  document.getElementById("btnSend").addEventListener("click", sendChat);
  document.getElementById("chatInput").addEventListener("keydown", e => { if (e.key === "Enter") sendChat(); });

  // 완료
  document.getElementById("btnNewFile").addEventListener("click", () => {
    problems = []; current = 0;
    document.getElementById("parseError").style.display = "none";
    document.getElementById("fileInput").value = "";
    showScreen("upload");
  });
  document.getElementById("btnRestart").addEventListener("click", () => { current = 0; startSolve(); });

  showScreen("upload");
});
