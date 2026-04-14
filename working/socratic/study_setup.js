// ── 세션 확인 ──────────────────────────────────────────────
const apiKey = sessionStorage.getItem('anthropic_api_key');
if (!apiKey) {
  window.location.href = 'auth.html';
}

// ── DOM 참조 ──────────────────────────────────────────────
const uploadZone = document.getElementById('upload-zone');
const cameraInput = document.getElementById('camera-input');
const previewWrap = document.getElementById('image-preview-wrap');
const previewImg = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image');
const unitInput = document.getElementById('unit-input');
const startBtn = document.getElementById('start-study');
const loadingOverlay = document.getElementById('loading-overlay');
const errorMsg = document.getElementById('error-msg');

let selectedFile = null; // 현재 선택된 이미지 파일

// ── 시작 버튼 활성화 조건 ───────────────────────────────
function updateStartBtn() {
  // 이미지가 있거나 텍스트 단원이 입력된 경우 활성화
  startBtn.disabled = !selectedFile && !unitInput.value.trim();
}

unitInput.addEventListener('input', updateStartBtn);

// ── 업로드 존 클릭 → 파일 선택 ─────────────────────────
uploadZone.addEventListener('click', () => cameraInput.click());
uploadZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') cameraInput.click();
});

// ── 드래그 앤 드롭 ──────────────────────────────────────
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleFileSelected(file);
  }
});

// ── 파일 선택 (input change) ────────────────────────────
cameraInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFileSelected(file);
});

// ── 이미지 선택 처리 ────────────────────────────────────
function handleFileSelected(file) {
  selectedFile = file;
  hideError();

  const reader = new FileReader();
  reader.onload = (ev) => {
    previewImg.src = ev.target.result;
    previewWrap.classList.add('visible');
  };
  reader.readAsDataURL(file);

  updateStartBtn();
}

// ── 이미지 제거 ─────────────────────────────────────────
removeImageBtn.addEventListener('click', () => {
  selectedFile = null;
  previewImg.src = '';
  previewWrap.classList.remove('visible');
  cameraInput.value = '';
  updateStartBtn();
});

// ── 오류 메시지 ─────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = 'block';
}
function hideError() {
  errorMsg.style.display = 'none';
}

// ── 시작 버튼 클릭 ──────────────────────────────────────
startBtn.addEventListener('click', async () => {
  hideError();

  if (selectedFile) {
    // 이미지가 있으면 Claude Vision으로 분석
    await analyzeImageAndStart(selectedFile);
  } else {
    // 텍스트 직접 입력 모드
    const unit = unitInput.value.trim();
    if (!unit) {
      showError('단원명을 입력하거나 문제 이미지를 올려주세요.');
      return;
    }
    sessionStorage.removeItem('extracted_problem');
    sessionStorage.removeItem('problem_image');
    sessionStorage.setItem('study_grade', '5');
    sessionStorage.setItem('study_semester', '1');
    sessionStorage.setItem('study_unit', unit);
    window.location.href = 'socratic_math_demo2.html';
  }
});

// ── Claude Vision 이미지 분석 ───────────────────────────
async function analyzeImageAndStart(file) {
  loadingOverlay.classList.add('show');
  startBtn.disabled = true;

  try {
    const base64Image = await fileToBase64(file);
    const base64Data = base64Image.split(',')[1];
    const mediaType = file.type || 'image/jpeg';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Data }
              },
              {
                type: 'text',
                text: `이 이미지에 있는 수학 문제를 분석해줘.
반드시 아래 JSON 형식으로만 응답해. 설명이나 마크다운 코드블록 없이 JSON만 작성해.

{
  "problem_text": "이미지에서 추출한 문제 전체 내용",
  "grade": "예상 학년 (숫자 1~6)",
  "semester": "예상 학기 (1 또는 2)",
  "unit": "해당 단원명 (예: 분수의 덧셈)"
}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `API 오류 (${response.status})`);
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    // JSON 파싱 — 마크다운 코드블록도 처리
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('응답에서 JSON을 찾을 수 없어요.');

    const result = JSON.parse(jsonMatch[0]);

    sessionStorage.setItem('study_grade', result.grade || '5');
    sessionStorage.setItem('study_semester', result.semester || '1');
    sessionStorage.setItem('study_unit', result.unit || '수학');
    sessionStorage.setItem('extracted_problem', result.problem_text || '');

    // 이미지 미리보기 저장 (sessionStorage 제한 고려: ~5MB)
    if (base64Image.length < 4 * 1024 * 1024) {
      sessionStorage.setItem('problem_image', base64Image);
    } else {
      sessionStorage.removeItem('problem_image');
    }

    window.location.href = 'socratic_math_demo2.html';

  } catch (err) {
    console.error('[Vision Error]', err);
    loadingOverlay.classList.remove('show');
    startBtn.disabled = false;
    showError(`분석 중 오류가 발생했어요: ${err.message}`);
  }
  // 성공 시 finally에서 오버레이를 끄지 않음 → 페이지 이동까지 유지
}

// ── FileReader 헬퍼 ─────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
