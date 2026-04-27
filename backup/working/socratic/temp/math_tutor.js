'use strict';

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

const PARSE_SYSTEM = [
  "너는 수학 문제지 파싱 전문가야.",
  "PDF에서 빈칸 채우기 문제를 추출해 JSON 배열만 반환해. 마크다운 코드블록 없이 순수 JSON만.",
  '형식: [{"id":1,"question":"문제 텍스트, 빈칸은 ___ 로","blanks":[{"id":"b1","label":"빈칸 설명","answer":"정답"}],"hint":"힌트"}]',
  "규칙: 빈칸 없는 문제 제외. 빈칸 개수만큼 blanks 추가. answer는 문자열. 최대 10개. JSON 외 텍스트 출력 금지."
].join("\n");

const TUTOR_SYSTEM = `
너는 초등학교 3~6학년 학생을 가르치는 친근한 소크라테스식 수학 선생님이야.
이름은 ** AI수학쌤 ** 이고, 학생이 문제를 풀 때 힌트를 주면서 스스로 답을 찾도록 도와줘.

# 첫 대화시작 규칙
- 시작되면 인사겸 같이풀어볼까? 정도의 가벼운멘트로 대화를 시작하도록 유도.
- 학생이 이름이나 별명을 입력하면 그때부터는 "친구" 대신 학생 이름 또는 별명을 불러서 대답해줘.

══════════════════════════════════
[1. 소크라테스 교육 규칙]
══════════════════════════════════
- 절대로 정답을 바로 알려주지 마세요.
- 매 답변은 반드시 생각을 유도하는 질문 1~2개로 끝내세요.
- 힌트는 아주 조금씩, 단계적으로만 주세요.
- 학생이 맞는 방향으로 가면 "오! 좋은 생각이야~", "맞아, 거의 다 왔어!" 같이 격려하세요. 상태값으로 줄의 마지막에 [STATUS:ONGOING] 반환.
- 학생이 완전히 정답을 말하면 그때 "정답이야! 🎉" 하고 확인 후 간단히 보충 설명해주세요. 상태값으로 줄의 마지막에 [STATUS:SOLVED]을 반환.
- 응답 마지막 줄에 반드시: [STATUS:ONGOING] 또는 [STATUS:SOLVED]
- "그냥 정답 알려줘", "빨리 알려줘" 라고 해도 절대 정답을 말하지 말고 "선생님도 규칙이 있어서~ 같이 생각해보자!" 로 부드럽게 유도하세요.

══════════════════════════════════
[2. 주제 이탈 방지 규칙]
══════════════════════════════════
- 오직 초등학교 수학 관련 질문에만 답하세요.
- 현재 풀고있는 문제와 다른 질문은 "지금 하고있는것 먼저 해보자 😊" 로 리다이렉트하세요.
- 수학 외 다른 과목 질문도 동일하게 리다이렉트하세요.
- 학습과 무관한 주제는 "선생님은 수학만 알아요~😅 수학문제만 얘기해 보자!" 로 응답하세요.

══════════════════════════════════
[3. 언어 및 안전 규칙]
══════════════════════════════════
- 학생이 욕설, 비속어, 혐오 표현을 사용하면 해당 단어를 절대 반복하거나 따라 쓰지 말고, "앗, 그런 말은 쓰지 말자! 다시 질문해줄래? 😊" 로만 응답하세요.
- 폭력, 자해, 위험한 행동, 범죄와 관련된 내용은 일절 응답하지 마세요.
- 학생의 이름, 학교, 전화번호, 주소 등 개인정보를 묻거나 요청하지 마세요.
- 학생이 개인정보를 말하면 "개인 정보는 여기서 말하지 않아도 돼! 수학 얘기만 하자 😊" 로 응답하세요.
- 성인 콘텐츠, 정치, 종교 관련 주제는 일절 언급하지 마세요.

══════════════════════════════════
[4. 감정 보호 규칙]
══════════════════════════════════
- "나 멍청해", "나는 못해", "포기할래" 같은 자책 표현이 나오면 먼저 충분히 격려한 뒤 힌트를 주세요.
  예: "아니야, 전혀! 틀려도 괜찮아, 틀리면서 배우는 거야 😊 다시 한번 해볼까?"
- 학생이 좌절하거나 반복적으로 틀리면 힌트를 조금 더 구체적으로 줘서 성공 경험을 만들어주세요.
- 칭찬은 구체적으로: "잘했어!" 보다 "핵심을 정확하게 찾았네, 대단한데?" 처럼 말해주세요.

══════════════════════════════════
[5. 말투 규칙]
══════════════════════════════════
- 초등학생에게 말하듯 쉽고 친근하게
- 문장은 짧게, 이모지 가끔 사용
- "~야", "~해봐", "~어떨까?" 같은 친근한 말투
- 어려운 수학 용어는 쉬운 말로 먼저 설명 후 용어 소개
`;

// ── State ──
const state = {
  apiKey: localStorage.getItem("anthropic_api_key") || "",
  apiKeySaved: !!localStorage.getItem("anthropic_api_key"),
  phase: "upload",
  problems: [],
  current: 0,
  inputs: {},
  submitted: false,
  wrongBlanks: [],
  allCorrect: false,
  chatMsgs: [],
  chatOpen: false,
  chatSolved: false,
  userMsg: "",
  aiLoading: false,
  parseError: "",
  showAnswers: false
};

function setState(updates) {
  Object.assign(state, updates);
  render();
}

// ── API ──
async function callClaude(system, messages, maxTokens) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": state.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: maxTokens || 1000, system, messages })
  });
  if (!res.ok) {
    const e = await res.json();
    throw new Error(e.error?.message || "API 오류");
  }
  const data = await res.json();
  const block = data.content && data.content.find(b => b.type === "text");
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
  const solved = raw.indexOf("[STATUS:SOLVED]") !== -1;
  const text = raw.replace(/\[STATUS:(ONGOING|SOLVED)\]/g, "").trim();
  return { text, solved };
}

// ── Actions ──
function saveApiKey() {
  const input = document.getElementById("api-key-input");
  if (input) state.apiKey = input.value;
  localStorage.setItem("anthropic_api_key", state.apiKey);
  setState({ apiKeySaved: true });
}

function clearApiKey() {
  localStorage.removeItem("anthropic_api_key");
  setState({ apiKey: "", apiKeySaved: false });
}

function resetProblemState() {
  Object.assign(state, {
    inputs: {}, submitted: false, wrongBlanks: [],
    chatMsgs: [], chatOpen: false, allCorrect: false, chatSolved: false
  });
  render();
}

async function handleFile(file) {
  if (!file) return;
  if (!state.apiKeySaved) {
    setState({ parseError: "먼저 API 키를 저장해주세요." });
    return;
  }
  setState({ phase: "parsing", parseError: "" });
  try {
    const b64 = await readFileAsBase64(file);
    const text = await callClaude(PARSE_SYSTEM, [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
        { type: "text", text: "이 PDF에서 빈칸 채우기 문제들을 파싱해줘. 순수 JSON 배열만 반환해. 마크다운 없이." }
      ]
    }], 4000);
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1) throw new Error("JSON을 찾지 못했어요.");
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("빈칸 채우기 문제를 찾지 못했어요.");
    setState({ problems: parsed, phase: "review" });
  } catch (e) {
    setState({ parseError: "학습지확인 실패: " + (e.message || "다시 시도해주세요."), phase: "upload" });
  }
}

function updateBlank(pi, bi, field, val) {
  state.problems = state.problems.map((p, i) =>
    i !== pi ? p : { ...p, blanks: p.blanks.map((b, j) => j !== bi ? b : { ...b, [field]: val }) }
  );
}

function updateQuestion(pi, val) {
  state.problems = state.problems.map((p, i) => i !== pi ? p : { ...p, question: val });
}

function addBlank(pi) {
  state.problems = state.problems.map((p, i) =>
    i !== pi ? p : { ...p, blanks: [...p.blanks, { id: "b" + Date.now(), label: "새 빈칸", answer: "" }] }
  );
  render();
}

function removeBlank(pi, bi) {
  state.problems = state.problems.map((p, i) =>
    i !== pi ? p : { ...p, blanks: p.blanks.filter((_, j) => j !== bi) }
  );
  render();
}

function startSolve() {
  state.current = 0;
  Object.assign(state, {
    inputs: {}, submitted: false, wrongBlanks: [],
    chatMsgs: [], chatOpen: false, allCorrect: false, chatSolved: false
  });
  setState({ phase: "solve" });
}

function goToReview() {
  setState({ phase: "review" });
}

function nextProblem() {
  state.current += 1;
  Object.assign(state, {
    inputs: {}, submitted: false, wrongBlanks: [],
    chatMsgs: [], chatOpen: false, allCorrect: false, chatSolved: false
  });
  render();
}

function restartSolve() {
  state.current = 0;
  Object.assign(state, {
    inputs: {}, submitted: false, wrongBlanks: [],
    chatMsgs: [], chatOpen: false, allCorrect: false, chatSolved: false
  });
  setState({ phase: "solve" });
}

function finishAll() {
  setState({ current: state.problems.length });
}

async function handleSubmit() {
  const prob = state.problems[state.current];
  if (!prob) return;
  const wrong = prob.blanks.filter(b => (state.inputs[b.id] || "").trim() !== String(b.answer).trim());
  state.wrongBlanks = wrong;
  state.submitted = true;
  if (wrong.length === 0) {
    state.allCorrect = true;
    render();
  } else {
    state.chatOpen = true;
    state.aiLoading = true;
    render();
    const wrongLabels = wrong.map(b => `"${b.label}": 학생이 "${state.inputs[b.id] || "빈칸"}"라고 답함 (정답: "${b.answer}")`).join(", ");
    const initPrompt = `문제: "${prob.question}"\n틀린 빈칸: ${wrongLabels}\n\n정답은 절대 직접 말하지 마. 학생 생각을 가볍게 물어봐. 두 문장 이내로.`;
    try {
      const raw = await callClaude(TUTOR_SYSTEM, [{ role: "user", content: initPrompt }]);
      const result = parseReply(raw);
      state.chatMsgs = [{ role: "assistant", content: result.text }];
    } catch (e) {
      state.chatMsgs = [{ role: "assistant", content: "앗, 연결이 안 됐어. 다시 눌러볼래?" }];
    }
    state.aiLoading = false;
    render();
    scrollChatToBottom();
  }
}

async function handleSend() {
  const chatInput = document.getElementById("chat-user-input");
  if (chatInput) state.userMsg = chatInput.value;
  if (!state.userMsg.trim() || state.aiLoading) return;
  const prob = state.problems[state.current];
  const newMsgs = [...state.chatMsgs, { role: "user", content: state.userMsg.trim() }];
  state.chatMsgs = newMsgs;
  state.userMsg = "";
  state.aiLoading = true;
  render();
  try {
    const wrongLabels = state.wrongBlanks.map(b => `"${b.label}": 정답: "${b.answer}"`).join(", ");
    const ctx = TUTOR_SYSTEM + `\n\n[현재 문제]\n문제: "${prob.question}"\n틀린 빈칸: ${wrongLabels}\n정답은 절대 직접 말하지 마.`;
    const raw = await callClaude(ctx, newMsgs);
    const result = parseReply(raw);
    state.chatMsgs = [...state.chatMsgs, { role: "assistant", content: result.text }];
    if (result.solved) state.chatSolved = true;
  } catch (e) {
    state.chatMsgs = [...state.chatMsgs, { role: "assistant", content: "앗, 연결 오류야 😢" }];
  }
  state.aiLoading = false;
  render();
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const el = document.getElementById("chat-end");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ── Helpers ──
function escapeHtml(str) {
  if (typeof str !== "string") str = String(str == null ? "" : str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getBlankClass(id) {
  if (!state.submitted) return "blank-input";
  return state.wrongBlanks.some(b => b.id === id) ? "blank-input wrong" : "blank-input correct";
}

// ── Templates ──
function tplApiKeyBanner() {
  if (state.apiKeySaved) {
    return `<div class="api-banner">
      <span class="banner-label">🔑 API 키</span>
      <span class="banner-saved">저장됨 ✓</span>
      <button class="btn-change" onclick="clearApiKey()">변경</button>
    </div>`;
  }
  return `<div class="api-banner">
    <span class="banner-label">🔑 API 키</span>
    <input type="password" id="api-key-input" class="banner-input" value="${escapeHtml(state.apiKey)}" placeholder="sk-ant-..."/>
    <button class="btn-save" onclick="saveApiKey()" ${state.apiKey.startsWith("sk-") ? "" : "disabled"}>저장</button>
    <span class="banner-hint">키는 브라우저 localStorage에만 저장됩니다</span>
  </div>`;
}

function tplUpload() {
  return `<div class="screen">
    ${tplApiKeyBanner()}
    <div class="center-flex">
      <div class="upload-card">
        <div class="upload-icon">📄</div>
        <h1 class="upload-title">수학 문제지 업로드</h1>
        <p class="upload-desc">PDF를 올리면 AI가 빈칸 문제를 생성해요</p>
        <label class="drop-zone" id="drop-zone">
          <input type="file" id="file-input" accept="application/pdf" style="display:none"/>
          <div style="font-size:48px">📤</div>
          <div class="drop-zone-text">클릭하거나 파일을 드래그하세요</div>
          <div class="drop-zone-hint">PDF 파일만 지원</div>
        </label>
        ${state.parseError ? `<div class="parse-error">⚠️ ${escapeHtml(state.parseError)}</div>` : ""}
      </div>
    </div>
  </div>`;
}

function tplParsing() {
  return `<div class="screen">
    ${tplApiKeyBanner()}
    <div class="center-flex">
      <div style="text-align:center">
        <div class="spin-icon">⚙️</div>
        <div class="parsing-title">AI가 학습지를 확인하고 있어요!</div>
        <div class="parsing-desc">잠깐만 기다려주세요 😊</div>
      </div>
    </div>
  </div>`;
}

function tplReview() {
  const problemsHtml = state.problems.map((p, pi) => `
    <div class="problem-card">
      <div class="problem-num">문제 ${pi + 1}</div>
      <div class="problem-question">${escapeHtml(p.question)}</div>
      <div class="blanks-list">
        ${p.blanks.map((b, bi) => `
          <div class="blank-row">
            <div class="blank-label-box">
              <b>${escapeHtml(b.label || "빈칸 " + (bi + 1))}</b>
              ${state.showAnswers ? `<span class="answer-reveal">→ ${escapeHtml(b.answer)}</span>` : ""}
            </div>
            <input class="review-blank-input" value="${escapeHtml(b.answer)}"
              onchange="updateBlank(${pi},${bi},'answer',this.value)" placeholder="정답 입력"/>
            <button class="btn-remove-blank" onclick="removeBlank(${pi},${bi})">✕</button>
          </div>
        `).join("")}
        <button class="btn-add-blank" onclick="addBlank(${pi})">+ 빈칸 추가</button>
      </div>
      <details>
        <summary class="edit-summary">문제 텍스트 수정</summary>
        <textarea class="edit-textarea" rows="3" onchange="updateQuestion(${pi},this.value)">${escapeHtml(p.question)}</textarea>
      </details>
    </div>
  `).join("");

  return `<div class="screen">
    ${tplApiKeyBanner()}
    <div class="review-content">
      <div class="review-inner">
        <div class="review-header">
          <div>
            <h1 class="review-title">📋 이제 풀어볼까요? (1~10번)</h1>
            <p class="review-sub">총 ${state.problems.length}개 문제 · 정답 확인 후 시작하세요</p>
          </div>
          <div>
            <button class="btn-start" onclick="startSolve()">풀기 시작 →</button>
          </div>
        </div>
        ${problemsHtml}
      </div>
    </div>
  </div>`;
}

function tplSolveComplete() {
  return `<div class="screen">
    ${tplApiKeyBanner()}
    <div class="center-flex">
      <div class="complete-card">
        <div style="font-size:80px">🏆</div>
        <h1 class="complete-title">모든 문제 완료!</h1>
        <div style="display:flex;gap:14px;justify-content:center;margin-top:24px">
          <button class="btn-primary" onclick="location.reload()">새 문제지 올리기</button>
          <button class="btn-secondary" onclick="restartSolve()">다시 풀기</button>
        </div>
      </div>
    </div>
  </div>`;
}

function tplChat() {
  const initLoading = state.chatMsgs.length === 0 && state.aiLoading
    ? `<div class="chat-msg-wrap ai"><span class="chat-owl">🦉</span><div class="chat-bubble ai">생각하는 중...</div></div>`
    : "";

  const msgsHtml = state.chatMsgs.map(m => `
    <div class="chat-msg-wrap ${m.role === "user" ? "user" : "ai"}">
      ${m.role === "assistant" ? `<span class="chat-owl">🦉</span>` : ""}
      <div class="chat-bubble ${m.role === "user" ? "user" : "ai"}">${escapeHtml(m.content)}</div>
    </div>
  `).join("");

  const tailLoading = state.aiLoading && state.chatMsgs.length > 0
    ? `<div class="chat-msg-wrap ai"><span class="chat-owl">🦉</span><div class="chat-bubble ai">생각하는 중...</div></div>`
    : "";

  const bottom = state.chatSolved
    ? `<div class="chat-solved">
        <div style="font-size:40px;margin-bottom:8px">🎉</div>
        <div class="chat-solved-text">스스로 알아냈군요! 정말 잘했어요!</div>
        ${state.current < state.problems.length - 1
          ? `<button class="btn-next" onclick="nextProblem()">다음 문제 →</button>`
          : `<button class="btn-primary" onclick="finishAll()">완료 🏆</button>`
        }
      </div>`
    : `<div class="chat-input-row">
        <input id="chat-user-input" class="chat-input" value="${escapeHtml(state.userMsg)}"
          placeholder="답변을 입력하세요..." ${state.aiLoading ? "disabled" : ""}/>
        <button id="btn-send" class="btn-send${state.aiLoading ? " loading" : ""}"
          onclick="handleSend()" ${state.aiLoading ? "disabled" : ""}>➤</button>
      </div>`;

  return `<div class="chat-panel">
    <div class="chat-header">
      <div class="chat-avatar">🦉</div>
      <div>
        <div class="chat-name">우리 같이 생각해 볼까요? 🦉</div>
        <div class="chat-status">● 지금 도와주는 중</div>
      </div>
    </div>
    <div class="chat-msgs" id="chat-msgs">
      ${initLoading}
      ${msgsHtml}
      ${tailLoading}
      <div id="chat-end"></div>
    </div>
    ${bottom}
  </div>`;
}

function tplSolve() {
  const prob = state.problems[state.current];
  if (!prob) return tplSolveComplete();

  const segs = prob.question.split("___");
  const questionHtml = segs.length > 1
    ? segs.map((seg, i) => {
        if (i >= segs.length - 1) return `<span>${escapeHtml(seg)}</span>`;
        const blank = prob.blanks[i];
        const blankHtml = blank
          ? `<input class="${getBlankClass(blank.id)}"
               value="${escapeHtml(state.inputs[blank.id] || "")}"
               ${state.submitted ? "disabled" : ""}
               placeholder="?" maxlength="10"
               data-blank-id="${escapeHtml(blank.id)}"/>`
          : "";
        return `<span>${escapeHtml(seg)}${blankHtml}</span>`;
      }).join("")
    : escapeHtml(prob.question);

  const blanksHtml = prob.blanks.map((b, bi) => `
    <div class="blank-answer-row">
      <span class="blank-answer-label">${escapeHtml(b.label || "빈칸 " + (bi + 1))}</span>
      <input class="${getBlankClass(b.id)} lg"
        value="${escapeHtml(state.inputs[b.id] || "")}"
        ${state.submitted ? "disabled" : ""}
        placeholder="?" maxlength="10"
        data-blank-id="${escapeHtml(b.id)}"/>
      ${state.submitted && !state.wrongBlanks.some(w => w.id === b.id) ? `<span class="correct-mark">✓</span>` : ""}
      ${state.submitted && state.wrongBlanks.some(w => w.id === b.id) ? `<span class="wrong-mark">✗</span>` : ""}
    </div>
  `).join("");

  const resultHtml = state.submitted && state.allCorrect
    ? `<div class="result-correct">
        <div style="font-size:44px">🎉</div>
        <div class="result-correct-text">정답! 정말 잘했어요!</div>
        ${state.current < state.problems.length - 1
          ? `<button class="btn-next" onclick="nextProblem()">다음 문제 →</button>`
          : `<div class="all-done-text">🏆 모든 문제 완료!</div>`
        }
      </div>`
    : state.submitted && !state.allCorrect
    ? `<div class="result-wrong">
        <div class="result-wrong-title">🤔 다시 생각해볼까요?</div>
        <div class="result-wrong-desc">빨간 칸을 잘 봐주세요. 선생님이 도와줄게요 →</div>
      </div>`
    : "";

  const dotsHtml = state.problems.map((_, i) =>
    `<div class="progress-dot${i === state.current ? " active" : i < state.current ? " done" : ""}"></div>`
  ).join("");

  return `<div class="screen">
    ${tplApiKeyBanner()}
    <div class="solve-content">
      <div class="solve-inner">
        <div class="solve-header">
          <button class="btn-back" onclick="goToReview()">← 문제 목록으로</button>
          <div style="display:flex;gap:8px;align-items:center">
            <span class="solve-progress">${state.current + 1}번 / 총 ${state.problems.length}문제</span>
            ${dotsHtml}
          </div>
        </div>
        <div class="solve-panels">
          <div class="question-card">
            <div class="question-num">✏️ ${state.current + 1}번</div>
            <div class="question-text">${questionHtml}</div>
            <div class="answer-section">
              <div class="answer-title">👇 여기에 답을 써주세요!</div>
              <div class="blanks-answer-list">${blanksHtml}</div>
            </div>
            <div style="display:flex;gap:12px;margin-top:4px">
              ${!state.submitted
                ? `<button class="btn-submit" onclick="handleSubmit()">제출하기 ✅</button>`
                : `<button class="btn-retry" onclick="resetProblemState()">다시 풀기 🔄</button>`
              }
            </div>
            ${resultHtml}
          </div>
          ${state.chatOpen ? tplChat() : ""}
        </div>
      </div>
    </div>
  </div>`;
}

// ── Render ──
function render() {
  const root = document.getElementById("root");
  if (state.phase === "upload") root.innerHTML = tplUpload();
  else if (state.phase === "parsing") root.innerHTML = tplParsing();
  else if (state.phase === "review") root.innerHTML = tplReview();
  else if (state.phase === "solve") root.innerHTML = tplSolve();
  attachEvents();
}

function attachEvents() {
  const apiInput = document.getElementById("api-key-input");
  if (apiInput) {
    apiInput.addEventListener("input", e => {
      state.apiKey = e.target.value;
      const btn = document.querySelector(".btn-save");
      if (btn) btn.disabled = !state.apiKey.startsWith("sk-");
    });
    apiInput.addEventListener("keydown", e => {
      if (e.key === "Enter") saveApiKey();
    });
  }

  const fileInput = document.getElementById("file-input");
  if (fileInput) {
    fileInput.addEventListener("change", e => handleFile(e.target.files[0]));
  }

  const dropZone = document.getElementById("drop-zone");
  if (dropZone) {
    dropZone.addEventListener("dragover", e => e.preventDefault());
    dropZone.addEventListener("drop", e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });
  }

  document.querySelectorAll("[data-blank-id]").forEach(input => {
    input.addEventListener("input", e => {
      state.inputs[e.target.dataset.blankId] = e.target.value;
    });
  });

  const chatInput = document.getElementById("chat-user-input");
  if (chatInput) {
    chatInput.addEventListener("input", e => { state.userMsg = e.target.value; });
    chatInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.isComposing) handleSend();
    });
    chatInput.focus();
  }
}

// ── Init ──
render();
