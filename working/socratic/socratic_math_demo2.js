// 학습 컨텍스트 가져오기
let apiKey = sessionStorage.getItem('anthropic_api_key');
const grade = sessionStorage.getItem('study_grade');
const semester = sessionStorage.getItem('study_semester');
const unit = sessionStorage.getItem('study_unit');
const extractedProblem = sessionStorage.getItem('extracted_problem');
const problemImage = sessionStorage.getItem('problem_image');
let history = [];

// 필수 데이터가 없으면 리다이렉트
if (!apiKey) {
  window.location.href = 'auth.html';
} else if (!grade || !semester || !unit) {
  window.location.href = 'study_setup.html';
}

// ── 유틸 함수 ────────────────────────────────────────────
function josa(word, josaSet) {
  const [withBatchim, withoutBatchim] = josaSet.split('/');
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return withoutBatchim;
  const hasBatchim = (code - 0xAC00) % 28 !== 0;
  return hasBatchim ? withBatchim : withoutBatchim;
}

function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

// ── 시스템 프롬프트 (모듈 레벨에서 한 번만 생성) ──────────
const FULL_SYSTEM = `당신은 초등학교 ${grade}학년 ${semester}학기 수학 중 "${unit}" 단원을 가르치는 소크라테스식 선생님입니다.
대화 상대는 초등학교 ${grade}학년 학생입니다.
선생님 이름은 "미래엔 소크라테스 선생님"입니다.
${extractedProblem ? `\n# 해결할 특정 문제\n학생이 사진을 찍어 보낸 문제는 다음과 같습니다: "${extractedProblem}"\n이 문제의 정답을 직접 말하지 말고, 학생이 단계적으로 풀 수 있도록 유도하세요.` : ''}

# 첫 대화시작 규칙
- 시작되면 인사겸 학생이름에 대한 질문을 표시하게 해놨어.
- 학생이 이름이나 별명을 입력하면 그때부터는 "친구" 대신 학생 이름 또는 별명을 불러서 대답해줘.
- 인사후에는 "${unit}에 대해 궁금한 게 있으면 뭐든 물어봐. 같이 생각해보자!" 라고 말해줘.
${extractedProblem ? '- 만약 학생이 이름/별명을 말하면, 바로 "이름아 반가워! 보내준 이 문제는..." 하며 문제 풀이로 유도해줘.' : ''}

══════════════════════════════════
[1. 소크라테스 교육 규칙]
══════════════════════════════════
- 절대로 정답을 바로 알려주지 마세요.
- 매 답변은 반드시 생각을 유도하는 질문 1~2개로 끝내세요.
- 힌트는 아주 조금씩, 단계적으로만 주세요.
- 학생이 맞는 방향으로 가면 "오! 좋은 생각이야~", "맞아, 거의 다 왔어!" 같이 격려하세요.
- 학생이 완전히 정답을 말하면 그때 "정답이야! 🎉" 하고 확인 후 간단히 보충 설명해주세요.
- "그냥 정답 알려줘", "빨리 알려줘" 라고 해도 절대 정답을 말하지 말고 "선생님도 규칙이 있어서~ 같이 생각해보자!" 로 부드럽게 유도하세요.

══════════════════════════════════
[2. 주제 이탈 방지 규칙]
══════════════════════════════════
- 오직 초등 ${grade}학년 수학의 "${unit}" 단원 관련 질문에만 답하세요.
${extractedProblem ? `- 또한 학생이 가져온 문제 "${extractedProblem}"를 해결하는 것에 집중하세요.` : ''}
- 다른 수학 단원 질문은 "우리 오늘은 ${unit} 공부하는 날이야! 그것부터 같이 해보자 😊" 로 리다이렉트하세요.
- 수학 외 다른 과목 질문도 동일하게 리다이렉트하세요.
- 학습과 무관한 주제는 "선생님은 수학만 알아요~😅 ${unit} 얘기 해보자!" 로 응답하세요.

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
- 어려운 수학 용어는 쉬운 말로 먼저 설명 후 용어 소개`;

// ── DOM 참조 ──────────────────────────────────────────────
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const headerSub = document.getElementById('header-sub');
const chipsContainer = document.getElementById('chips');

// UI 초기화
headerSub.textContent = `초등 ${grade}학년 · ${unit}`;

// 첫 인사 추가
function initialGreeting() {
  let greeting = `안녕! 나는 미래엔 소크라테스 선생님이야 😊<br>우리 친구 이름은 뭐야?`;

  if (extractedProblem) {
    greeting += `<br><br>가져온 문제를 확인해봤어! 같이 해결해보자.<br>
    <div style="background: rgba(99,102,241,0.05); padding: 12px; border-radius: 8px; border-left: 4px solid var(--primary); margin-top: 10px; font-size: 13px;">
      ${extractedProblem}
    </div>`;

    if (problemImage) {
      greeting += `<div style="margin-top: 10px;"><img src="${problemImage}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></div>`;
    }
  }

  addBubble('ai', greeting, false, true); // 신뢰된 HTML이므로 raw 모드

  if (extractedProblem) {
    chipsContainer.innerHTML = `
      <span class="chip" onclick="setInput('문제를 어떻게 풀면 좋을까요?')">문제 풀이 시작</span>
      <span class="chip" onclick="setInput('제일 먼저 뭘 해야 해요?')">첫 단계 알려줘</span>
    `;
  } else {
    chipsContainer.innerHTML = `
      <span class="chip" onclick="setInput('${unit}${josa(unit, '이/가')} 뭐예요?')">${unit}${josa(unit, '이/가')} 뭐예요?</span>
      <span class="chip" onclick="setInput('${unit}에서 제일 중요한 게 뭐예요?')">${unit} 핵심 내용</span>
      <span class="chip" onclick="setInput('어려워요, 도와주세요!')">도움 요청하기</span>
    `;
  }
}
initialGreeting();

// 새 문제 시작 (API 키는 유지, study 세션만 초기화)
document.getElementById('new-problem-btn').addEventListener('click', () => {
  ['study_grade', 'study_semester', 'study_unit', 'extracted_problem', 'problem_image']
    .forEach(k => sessionStorage.removeItem(k));
  window.location.href = 'study_setup.html';
});

// 키 변경 (전체 세션 초기화)
document.getElementById('reset-key').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = 'auth.html';
});

function setInput(text) {
  userInput.value = text;
  userInput.focus();
}

function addBubble(role, text, isLoading, isRaw = false) {
  const row = document.createElement('div');
  row.className = 'msg-row ' + role;
  const av = document.createElement('div');
  av.className = 'msg-avatar ' + (role === 'ai' ? 'ai-av' : 'user-av');
  av.textContent = role === 'ai' ? '👩‍🏫' : '🧒';
  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (isLoading ? ' loading' : '');
  bubble.innerHTML = isRaw ? text : renderMarkdown(text);
  row.appendChild(av);
  row.appendChild(bubble);
  chatArea.appendChild(row);
  chatArea.scrollTop = chatArea.scrollHeight;
  return bubble;
}

async function send() {
  const text = userInput.value.trim();
  if (!text || sendBtn.disabled) return;
  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;
  chipsContainer.style.display = 'none';

  addBubble('user', text);
  history.push({ role: 'user', content: text });
  const loadingBubble = addBubble('ai', '답변을 작성중이에요~', true);

  // 최대 20턴(40개 항목) 트리밍
  const MAX_HISTORY = 40;
  const trimmedHistory = history.length > MAX_HISTORY ? history.slice(-MAX_HISTORY) : history;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        stream: true,
        system: FULL_SYSTEM,
        messages: trimmedHistory
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      loadingBubble.classList.remove('loading');
      loadingBubble.classList.add('error');
      loadingBubble.textContent = '앗! 문제가 생겼어요: ' + (data?.error?.message || res.status);
      sendBtn.disabled = false;
      return;
    }

    // 스트리밍 처리
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = '';
    loadingBubble.classList.remove('loading');
    loadingBubble.innerHTML = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullReply += parsed.delta.text;
            loadingBubble.innerHTML = renderMarkdown(fullReply);
            chatArea.scrollTop = chatArea.scrollHeight;
          }
        } catch { /* JSON 파싱 실패 무시 */ }
      }
    }

    if (fullReply) {
      history.push({ role: 'assistant', content: fullReply });
    }

  } catch (e) {
    loadingBubble.classList.remove('loading');
    loadingBubble.classList.add('error');
    loadingBubble.textContent = '네트워크가 불안정한 것 같아. 연결을 확인해볼래?';
  }

  sendBtn.disabled = false;
  chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
}

sendBtn.addEventListener('click', send);
userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); }
});
userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});
