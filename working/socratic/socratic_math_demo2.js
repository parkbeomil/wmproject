const SYSTEM = `당신은 초등학교 5학년 수학 중 "배수와 약수" 단원을 가르치는 소크라테스식 선생님입니다.
대화 상대는 초등학교 5학년 학생입니다.
선생님 이름은 "미래엔 소크라테스 선생님"입니다.

# 첫 대화시작 규칙
- 시작되면 "안녕 반가워~ 나는 미래엔 소크라테스 선생님이야 😊 우리 친구는 이름이 뭐야?" 라고 인사겸 학생이름에 대한 질문을 표시하게 해놨어.
- 학생이 이름을 입력하면 그때부터는 "친구" 대신 학생 이름을 불러서 대답해줘.
- 인사후에는 "배수랑 약수에 대해 궁금한 게 있으면 뭐든 물어봐. 같이 생각해보자!" 라고 말해줘.

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
- 오직 초등 5학년 수학의 "배수와 약수" 단원 관련 질문에만 답하세요.
- 다른 수학 단원(분수, 도형, 방정식 등) 질문은 "우리 오늘은 배수랑 약수 공부하는 날이야! 그것부터 같이 해보자 😊" 로 리다이렉트하세요.
- 수학 외 다른 과목(과학, 국어, 영어 등) 질문도 동일하게 리다이렉트하세요.
- 게임, 연예인, 유행어 등 학습과 무관한 주제는 "선생님은 수학만 알아요~😅 배수랑 약수 얘기 해보자!" 로 응답하세요.

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
- 칭찬은 구체적으로: "잘했어!" 보다 "3의 배수를 정확하게 찾았네, 대단한데?" 처럼 말해주세요.

══════════════════════════════════
[5. 말투 규칙]
══════════════════════════════════
- 초등학생에게 말하듯 쉽고 친근하게
- 문장은 짧게, 이모지 가끔 사용
- "~야", "~해봐", "~어떨까?" 같은 친근한 말투
- 어려운 수학 용어는 쉬운 말로 먼저 설명 후 용어 소개

══════════════════════════════════
[6. 가르칠 수 있는 내용 범위]
══════════════════════════════════
- 배수의 정의와 구하는 법
- 약수의 정의와 구하는 법
- 공배수와 최소공배수(LCM)
- 공약수와 최대공약수(GCD)
- 소수와의 관계
- 실생활 응용 문제`;

let apiKey = '';
let history = [];

const keyScreen = document.getElementById('key-screen');
const appScreen = document.getElementById('app');
const keyInput = document.getElementById('key-input');
const keySubmit = document.getElementById('key-submit');
const keyError = document.getElementById('key-error');
const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function showKeyError(msg) {
  keyError.textContent = msg;
  keyError.style.display = 'block';
  keyInput.style.borderColor = '#E24B4A';
}
function clearKeyError() {
  keyError.style.display = 'none';
  keyInput.style.borderColor = '';
}

async function verifyAndStart() {
  const val = keyInput.value.trim();
  if (!val) { showKeyError('API 키를 입력해주세요.'); return; }

  clearKeyError();
  keySubmit.disabled = true;
  keySubmit.textContent = '확인 중...';

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': val,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }]
      })
    });

    const data = await res.json();

    if (res.status === 401) {
      showKeyError('❌ 유효하지 않은 API 키입니다. 콘솔에서 키를 다시 확인해주세요.');
    } else if (res.status === 403) {
      showKeyError('❌ 접근 권한이 없는 키입니다.');
    } else if (res.status === 429) {
      showKeyError('❌ 요청 한도 초과입니다. 잠시 후 다시 시도해주세요.');
    } else if (!res.ok) {
      showKeyError('❌ 오류 ' + res.status + ': ' + (data?.error?.message || '알 수 없는 오류'));
    } else {
      apiKey = val;
      keyScreen.style.display = 'none';
      appScreen.style.display = 'flex';
    }
  } catch (e) {
    showKeyError('❌ 네트워크 오류. 인터넷 연결을 확인해주세요.');
  }

  keySubmit.disabled = false;
  keySubmit.textContent = '키 확인 후 시작';
}

keySubmit.addEventListener('click', verifyAndStart);
keyInput.addEventListener('keydown', e => { if (e.key === 'Enter') verifyAndStart(); });
keyInput.addEventListener('input', clearKeyError);

document.getElementById('reset-key').addEventListener('click', () => {
  apiKey = '';
  history = [];
  keyInput.value = '';
  clearKeyError();
  appScreen.style.display = 'none';
  keyScreen.style.display = 'block';
  chatArea.innerHTML = `
    <div class="msg-row ai">
      <div class="msg-avatar ai-av">🦉</div>
      <div class="bubble">안녕! 나는 미래엔 소크라테스 선생님이야 😊<br>우리 친구 이름은 뭐야?</div>
    </div>`;
  document.getElementById('chips').style.display = 'flex';
});

function setInput(text) {
  userInput.value = text;
  userInput.focus();
}

function addBubble(role, text, isLoading) {
  const row = document.createElement('div');
  row.className = 'msg-row ' + role;
  const av = document.createElement('div');
  av.className = 'msg-avatar ' + (role === 'ai' ? 'ai-av' : 'user-av');
  av.textContent = role === 'ai' ? '🦉' : '🧒';
  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (isLoading ? ' loading' : '');
  bubble.innerHTML = text.replace(/\n/g, '<br>');
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
  document.getElementById('chips').style.display = 'none';

  addBubble('user', text);
  history.push({ role: 'user', content: text });
  const loadingBubble = addBubble('ai', '답변을 작성중이에요~', true);

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
        system: SYSTEM,
        messages: history
      })
    });

    const data = await res.json();
    if (!res.ok) {
      loadingBubble.classList.remove('loading');
      loadingBubble.classList.add('error');
      loadingBubble.textContent = '앗! 문제가 생겼어요: ' + (data?.error?.message || res.status);
    } else {
      const reply = data.content?.[0]?.text || '음... 대답을 못 찾겠어. 다시 한 번 말해줄래?';
      loadingBubble.classList.remove('loading');
      loadingBubble.innerHTML = reply.replace(/\n/g, '<br>');
      history.push({ role: 'assistant', content: reply });
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
  // if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); }
});
userInput.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});
