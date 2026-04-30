const MODEL = "claude-sonnet-4-6"; //"claude-haiku-4-5-20251001";

function getApiKey() {
  const param = new URLSearchParams(window.location.search).get('api-key');
  if (param) return 'sk-ant-api' + param;
  return localStorage.getItem('anthropic_api_key') || '';
}

const PROBLEMS = [
  {
    id: 1,
    question: "바르게 설명한 친구의 이름을 써 보세요.\n유찬: 두 수의 공약수는 두 수의 최대공약수의 배수야.\n은정: 1은 모든 자연수의 약수야.\n-> 바르게 설명한 친구는 ___",
    blanks: [{ id: "p1b1", label: "친구 이름", answer: "은정" }]
  },
  {
    id: 2,
    question: "12와 30의 공약수에 대해 바르게 말한 친구는 누구인가요?\n서아: 12와 30의 공약수 중에서 가장 작은 수는 2야.\n예지: 12와 30의 공약수 중에서 가장 큰 수는 3이야.\n대현: 12와 30의 공약수는 두 수를 모두 나누어떨어지게 해.\n-> 바르게 말한 친구는 ___",
    blanks: [{ id: "p2b1", label: "친구 이름", answer: "대현" }]
  },
  {
    id: 3,
    question: "어떤 두 수의 최대공약수가 14입니다. 이 두 수의 공약수를 모두 고르세요.\n보기: 1번 3  2번 4  3번 7  4번 9  5번 14\n-> 정답 번호 두 개: ___, ___",
    blanks: [
      { id: "p3b1", label: "첫 번째 번호", answer: "3" },
      { id: "p3b2", label: "두 번째 번호", answer: "5" }
    ]
  },
  {
    id: 4,
    question: "두 수의 최대공약수가 큰 것부터 차례로 기호를 써 보세요.\nㄱ. 28, 16   ㄴ. 24, 36   ㄷ. 18, 60   ㄹ. 35, 77\n-> 큰 것부터: ___, ___, ___, ___",
    blanks: [
      { id: "p4b1", label: "1번째 (가장 큼)", answer: "ㄴ" },
      { id: "p4b2", label: "2번째", answer: "ㄷ" },
      { id: "p4b3", label: "3번째", answer: "ㄹ" },
      { id: "p4b4", label: "4번째 (가장 작음)", answer: "ㄱ" }
    ]
  },
  {
    id: 5,
    question: "두 수의 공약수와 최대공약수를 각각 구해 보세요.\n18, 27\n-> 공약수: ___, ___, ___\n-> 최대공약수: ___",
    blanks: [
      { id: "p5b1", label: "공약수 (작은 수)", answer: "1" },
      { id: "p5b2", label: "공약수 (중간)", answer: "3" },
      { id: "p5b3", label: "공약수 (큰 수)", answer: "9" },
      { id: "p5b4", label: "최대공약수", answer: "9" }
    ]
  },
  {
    id: 6,
    question: "42와 56의 공약수를 구해 보세요.\n42의 약수: 1, 2, 3, 6, 7, 14, 21, 42\n56의 약수: 1, 2, 4, 7, 8, 14, 28, 56\n-> 공약수: ___, ___, ___, ___",
    blanks: [
      { id: "p6b1", label: "1번째", answer: "1" },
      { id: "p6b2", label: "2번째", answer: "2" },
      { id: "p6b3", label: "3번째", answer: "7" },
      { id: "p6b4", label: "4번째", answer: "14" }
    ]
  },
  {
    id: 7,
    question: "40과 52의 공약수를 모두 쓰세요.\n-> ___, ___, ___",
    blanks: [
      { id: "p7b1", label: "1번째", answer: "1" },
      { id: "p7b2", label: "2번째", answer: "2" },
      { id: "p7b3", label: "3번째", answer: "4" }
    ]
  },
  {
    id: 8,
    question: "두 수의 최대공약수를 구한 후 두 수의 공약수를 구해 보세요.\n두 수: 48, 88\n-> 최대공약수: ___\n-> 공약수: ___, ___, ___, ___",
    blanks: [
      { id: "p8b1", label: "최대공약수", answer: "8" },
      { id: "p8b2", label: "공약수 1번째", answer: "1" },
      { id: "p8b3", label: "공약수 2번째", answer: "2" },
      { id: "p8b4", label: "공약수 3번째", answer: "4" },
      { id: "p8b5", label: "공약수 4번째", answer: "8" }
    ]
  },
  {
    id: 9,
    question: "24와 30의 약수를 모두 써 보세요.\n-> 24의 약수: ___, ___, ___, ___, ___, ___, ___, ___\n-> 30의 약수: ___, ___, ___, ___, ___, ___, ___, ___",
    blanks: [
      { id: "p9b1",  label: "24의 약수 1번째", answer: "1"  },
      { id: "p9b2",  label: "24의 약수 2번째", answer: "2"  },
      { id: "p9b3",  label: "24의 약수 3번째", answer: "3"  },
      { id: "p9b4",  label: "24의 약수 4번째", answer: "4"  },
      { id: "p9b5",  label: "24의 약수 5번째", answer: "6"  },
      { id: "p9b6",  label: "24의 약수 6번째", answer: "8"  },
      { id: "p9b7",  label: "24의 약수 7번째", answer: "12" },
      { id: "p9b8",  label: "24의 약수 8번째", answer: "24" },
      { id: "p9b9",  label: "30의 약수 1번째", answer: "1"  },
      { id: "p9b10", label: "30의 약수 2번째", answer: "2"  },
      { id: "p9b11", label: "30의 약수 3번째", answer: "3"  },
      { id: "p9b12", label: "30의 약수 4번째", answer: "5"  },
      { id: "p9b13", label: "30의 약수 5번째", answer: "6"  },
      { id: "p9b14", label: "30의 약수 6번째", answer: "10" },
      { id: "p9b15", label: "30의 약수 7번째", answer: "15" },
      { id: "p9b16", label: "30의 약수 8번째", answer: "30" }
    ]
  },
  {
    id: 10,
    question: "사탕 48개와 초콜릿 60개를 최대한 많은 사람에게 남김없이 똑같이 나누어 주려고 합니다.\n-> 사탕 ___ 개\n-> 초콜릿 ___ 개",
    blanks: [
      { id: "p10b1", label: "사탕 개수",    answer: "4" },
      { id: "p10b2", label: "초콜릿 개수",  answer: "5" }
    ]
  }
];

const TUTOR_SYSTEM =
  "너는 초등학교 3~4학년 학생을 가르치는 친근한 수학 튜터야. 이름은 AI티처야.\n" +
  "반말로 친근하게, 짧게(두 문장 이내), 이모지 가끔 사용.\n" +
  "절대 금지: 정답/숫자 직접 언급, 방향 암시, 개념 직접 설명, 질문 두 개 이상.\n" +
  "정답이면 칭찬 후 [STATUS:SOLVED], 아니면 질문 하나 후 [STATUS:ONGOING].\n" +
  "마지막 줄 반드시: [STATUS:ONGOING] 또는 [STATUS:SOLVED]";

// ── 상태 ──────────────────────────────────────────────────────
const S = {
  current: 0,
  inputs: {},
  submitted: false,
  wrongBlanks: [],
  allCorrect: false,
  chatOpen: false,
  chatMsgs: [],
  chatSolved: false,
  aiLoading: false,
  done: false
};

function setState(patch) {
  Object.assign(S, patch);
  draw();
}

// ── 유틸 ──────────────────────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseReply(raw) {
  const solved = raw.includes("[STATUS:SOLVED]");
  const text = raw.replace(/\[STATUS:(ONGOING|SOLVED)\]/g, "").trim();
  return { text, solved };
}

function isWrongBlank(id) {
  return S.wrongBlanks.some(function(b) { return b.id === id; });
}

// ── API 호출 ───────────────────────────────────────────────────
function callAI(system, messages, onSuccess, onError) {
  console.log('%c[Claude 📤 송신]', 'color:#4A9EFF;font-weight:bold;', { model: MODEL, max_tokens: 800, system: system, messages: messages });
  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      system: system,
      messages: messages
    })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      const block = (data.content || []).find(function(b) { return b.type === "text"; });
      const reply = block ? block.text : "";
      console.log('%c[Claude 📥 수신]', 'color:#27AE60;font-weight:bold;', reply);
      onSuccess(parseReply(reply));
    })
    .catch(function(err) {
      console.error(err);
      onError();
    });
}

// ── 이벤트 핸들러 ──────────────────────────────────────────────
function doInput(id, val) {
  S.inputs[id] = val;
}

function doSubmit() {
  const prob = PROBLEMS[S.current];
  const wrong = prob.blanks.filter(function(b) {
    return (S.inputs[b.id] || "").trim() !== String(b.answer).trim();
  });
  const allCorrect = wrong.length === 0;
  setState({ submitted: true, wrongBlanks: wrong, allCorrect: allCorrect, chatOpen: !allCorrect });

  if (!allCorrect) {
    const parts = wrong.map(function(b) {
      return '"' + b.label + '": 학생답="' + (S.inputs[b.id] || "빈칸") + '", 정답="' + b.answer + '"';
    });
    const prompt =
      "문제: " + prob.question + "\n" +
      "틀린 빈칸: " + parts.join(", ") + "\n" +
      "첫 마디: 학생 답 언급하며 짧게 생각만 물어봐. 힌트 금지.";
    setState({ aiLoading: true });
    callAI(
      TUTOR_SYSTEM,
      [{ role: "user", content: prompt }],
      function(r) { setState({ chatMsgs: [{ role: "assistant", content: r.text }], aiLoading: false }); },
      function()  { setState({ chatMsgs: [{ role: "assistant", content: "앗, 연결이 안 됐어. 다시 눌러볼래?" }], aiLoading: false }); }
    );
  }
}

function doSend() {
  const el = document.getElementById("ci");
  if (!el) return;
  const msg = el.value.trim();
  if (!msg || S.aiLoading) return;
  el.value = "";

  const newMsgs = S.chatMsgs.concat([{ role: "user", content: msg }]);
  setState({ chatMsgs: newMsgs, aiLoading: true });

  const prob = PROBLEMS[S.current];
  const parts = S.wrongBlanks.map(function(b) {
    return '"' + b.label + '": 정답="' + b.answer + '"';
  });
  const ctx =
    TUTOR_SYSTEM + "\n" +
    "[문제] " + prob.question + "\n" +
    "틀린 빈칸: " + parts.join(", ") + "\n" +
    "정답 직접 말하지 마.";

  callAI(
    ctx,
    newMsgs,
    function(r) {
      setState({
        chatMsgs: newMsgs.concat([{ role: "assistant", content: r.text }]),
        aiLoading: false,
        chatSolved: r.solved
      });
    },
    function() {
      setState({
        chatMsgs: newMsgs.concat([{ role: "assistant", content: "앗, 연결 오류야" }]),
        aiLoading: false
      });
    }
  );
}

function doRetry() {
  setState({ inputs: {}, submitted: false, wrongBlanks: [], allCorrect: false, chatOpen: false, chatMsgs: [], chatSolved: false, aiLoading: false });
}

function doNext() {
  if (S.current < PROBLEMS.length - 1) {
    setState({ current: S.current + 1, inputs: {}, submitted: false, wrongBlanks: [], allCorrect: false, chatOpen: false, chatMsgs: [], chatSolved: false, aiLoading: false });
  } else {
    setState({ done: true });
  }
}

function doRestart() {
  setState({ current: 0, inputs: {}, submitted: false, wrongBlanks: [], allCorrect: false, chatOpen: false, chatMsgs: [], chatSolved: false, aiLoading: false, done: false });
}

// ── 렌더링 ──────────────────────────────────────────────────────
function draw() {
  const app = document.getElementById("app");
  if (!app) return;

  if (S.done) {
    app.innerHTML =
      '<div class="done-screen"><div class="done-card">' +
        '<div class="trophy">&#127942;</div>' +
        '<h1>모든 문제 완료!</h1>' +
        '<p>정말 수고했어! &#127881;</p>' +
        '<button class="btn-restart" onclick="doRestart()">다시 풀기</button>' +
      '</div></div>';
    return;
  }

  const prob = PROBLEMS[S.current];

  // 진행 점
  let dotH = '<span>' + (S.current + 1) + '번 / 총 ' + PROBLEMS.length + '문제</span>';
  for (let i = 0; i < PROBLEMS.length; i++) {
    const cls = i === S.current ? "active" : i < S.current ? "done" : "";
    dotH += '<div class="dot ' + cls + '"></div>';
  }

  // 답 입력 행
  let rowH = "";
  for (let i = 0; i < prob.blanks.length; i++) {
    const b   = prob.blanks[i];
    const val  = esc(S.inputs[b.id] || "");
    const wrong = S.submitted && isWrongBlank(b.id);
    const right = S.submitted && !wrong;
    const cls  = !S.submitted ? "" : wrong ? "wrong" : "correct";
    const mark = right ? '<span class="check-mark ok">&#10003;</span>'
               : wrong ? '<span class="check-mark ng">&#10007;</span>' : "";
    const dis  = S.submitted ? " disabled" : "";
    rowH +=
      '<div class="answer-row">' +
        '<label>' + esc(b.label) + '</label>' +
        '<input class="big-input ' + cls + '" value="' + val + '" placeholder="?" maxlength="10"' + dis +
          ' oninput="doInput(\'' + b.id + '\', this.value)">' +
        mark +
      '</div>';
  }

  // 결과 메시지
  let resH = "";
  if (S.submitted && S.allCorrect) {
    const nb = S.current < PROBLEMS.length - 1
      ? '<button class="btn-next" onclick="doNext()">다음 문제 &rarr;</button>'
      : '<button class="btn-fin"  onclick="doNext()">완료 &#127942;</button>';
    resH =
      '<div class="result-ok">' +
        '<div class="r-emoji">&#127881;</div>' +
        '<div class="r-msg">정답이야! 정말 잘했어!</div>' +
        nb +
      '</div>';
  } else if (S.submitted) {
    resH =
      '<div class="result-ng">' +
        '<div class="rng-t">&#129300; 다시 생각해보자!</div>' +
        '<div class="rng-s">빨간 칸을 잘 봐봐. AI티처가 도와줄게 &rarr;</div>' +
      '</div>';
  }

  // 채팅 패널
  let chatH = "";
  if (S.chatOpen) {
    let bubblesH = "";
    for (let i = 0; i < S.chatMsgs.length; i++) {
      const m      = S.chatMsgs[i];
      const isUser = m.role === "user";
      const avH    = isUser ? "" : '<div class="avatar sm">&#128054;</div>';
      bubblesH +=
        '<div class="msg-row' + (isUser ? " user" : "") + '">' +
          avH +
          '<div class="bubble' + (isUser ? " user" : "") + '">' + esc(m.content) + '</div>' +
        '</div>';
    }
    if (S.aiLoading) {
      bubblesH +=
        '<div class="msg-row">' +
          '<div class="avatar sm">&#128054;</div>' +
          '<div class="bubble loading">생각하는 중...</div>' +
        '</div>';
    }

    let botH;
    if (S.chatSolved) {
      const nb2 = S.current < PROBLEMS.length - 1
        ? '<button class="btn-next" onclick="doNext()">다음 문제 &rarr;</button>'
        : '<button class="btn-fin"  onclick="doNext()">완료 &#127942;</button>';
      botH =
        '<div class="chat-solved">' +
          '<div class="cs-emoji">&#127881;</div>' +
          '<div class="cs-msg">스스로 알아냈어! 정말 잘했어!</div>' +
          nb2 +
        '</div>';
    } else {
      const disB = S.aiLoading ? " disabled" : "";
      botH =
        '<div class="chat-input-area">' +
          '<input id="ci" placeholder="AI티처한테 대답해봐..."' + disB +
            ' onkeydown="if(event.keyCode===13) doSend()">' +
          '<button onclick="doSend()"' + disB + '>&#10148;</button>' +
        '</div>';
    }

    chatH =
      '<div class="chat-card">' +
        '<div class="chat-header">' +
          '<div class="avatar">&#128054;</div>' +
          '<div>' +
            '<div class="chat-name">AI티처 &#128062;</div>' +
            '<div class="chat-status">&#9679; 같이 생각해 보자!</div>' +
          '</div>' +
        '</div>' +
        '<div class="chat-msgs" id="cm">' + bubblesH + '<div id="ce"></div></div>' +
        botH +
      '</div>';
  }

  const btnH = S.submitted
    ? '<button class="btn-retry" onclick="doRetry()">다시 풀기 &#128260;</button>'
    : '<button class="btn-submit" onclick="doSubmit()">제출하기 &#9989;</button>';

  app.innerHTML =
    '<div class="wrap">' +
      '<div class="progress-bar">' + dotH + '</div>' +
      '<div class="columns">' +
        '<div class="card">' +
          '<div class="q-label">&#9999;&#65039; ' + (S.current + 1) + '번</div>' +
          '<div class="q-box">' + esc(prob.question) + '</div>' +
          '<div class="answer-label">&#128071; 여기에 답을 써봐!</div>' +
          rowH +
          '<div style="margin-top:16px">' + btnH + '</div>' +
          resH +
        '</div>' +
        chatH +
      '</div>' +
    '</div>';

  const ce = document.getElementById("ce");
  if (ce) ce.scrollIntoView({ behavior: "smooth" });
}

// ── 초기 실행 ──────────────────────────────────────────────────
draw();
