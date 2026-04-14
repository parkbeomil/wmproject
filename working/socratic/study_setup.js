// 초기 설정 및 세션 확인
document.addEventListener('DOMContentLoaded', () => {
  const apiKey = sessionStorage.getItem('anthropic_api_key');
  if (!apiKey) {
    window.location.href = 'auth.html';
    return;
  }

  // 선택기 로직
  setupSelector('grade-selector');
  setupSelector('semester-selector');

  const startBtn = document.getElementById('start-study');
  const unitInput = document.getElementById('unit-input');

  startBtn.addEventListener('click', () => {
    const grade = document.querySelector('#grade-selector .choice-btn.active').dataset.value;
    const semester = document.querySelector('#semester-selector .choice-btn.active').dataset.value;
    const unit = unitInput.value.trim();

    if (!unit) {
      alert('공부할 단원명을 입력해주세요!');
      unitInput.focus();
      return;
    }

    // 세션 스토리지에 저장
    sessionStorage.setItem('study_grade', grade);
    sessionStorage.setItem('study_semester', semester);
    sessionStorage.setItem('study_unit', unit);

    // 메인 페이지로 이동
    window.location.href = 'socratic_math_demo2.html';
  });
});

function setupSelector(containerId) {
  const container = document.getElementById(containerId);
  const buttons = container.querySelectorAll('.choice-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 기존 활성화 제거
      container.querySelector('.choice-btn.active').classList.remove('active');
      // 현재 버튼 활성화
      btn.classList.add('active');
    });
  });
}

// 카메라 및 이미지 처리 로직
document.addEventListener('DOMContentLoaded', () => {
  const cameraFab = document.getElementById('camera-fab');
  const cameraInput = document.getElementById('camera-input');
  const loadingOverlay = document.getElementById('loading-overlay');
  const apiKey = sessionStorage.getItem('anthropic_api_key');

  if (cameraFab && cameraInput) {
    cameraFab.addEventListener('click', () => {
      cameraInput.click();
    });

    cameraInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        loadingOverlay.style.display = 'flex';

        // 1. 이미지를 Base64로 변환
        const base64Image = await fileToBase64(file);
        const base64Data = base64Image.split(',')[1];
        const mediaType = file.type;

        // 2. Anthropic Vision API 호출 (문제 분석)
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: mediaType,
                      data: base64Data
                    }
                  },
                  {
                    type: 'text',
                    text: `이 이미지에서 수학 문제를 추출해서 분석해줘. 
                    결과는 반드시 아래의 JSON 형식으로만 응답해줘. 다른 설명은 필요 없어.
                    
                    {
                      "problem_text": "추출된 문제 내용 전체",
                      "grade": "학년 (1~6 중 숫자만)",
                      "semester": "학기 (1 또는 2 중 숫자만)",
                      "unit": "해당 문제가 속한 단원명"
                    }`
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) throw new Error('API 호출 실패');

        const data = await response.json();
        const resultString = data.content[0].text;
        const result = JSON.parse(resultString.match(/\{.*\}/s)[0]);

        // 3. 추출된 정보를 세션 스토리지에 저장
        sessionStorage.setItem('study_grade', result.grade || '5');
        sessionStorage.setItem('study_semester', result.semester || '1');
        sessionStorage.setItem('study_unit', result.unit || '수학');
        sessionStorage.setItem('extracted_problem', result.problem_text);

        // (선택사항) 이미지를 미리보기용으로 저장 - 용량 제한 주의
        if (base64Image.length < 2 * 1024 * 1024) { // 2MB 미만일 때만
          sessionStorage.setItem('problem_image', base64Image);
        }

        // 4. 학습 페이지로 이동
        window.location.href = 'socratic_math_demo2.html';

      } catch (error) {
        console.error('이미지 처리 중 오류:', error);
        alert('이미지를 분석하는 도중 문제가 생겼어요. 직접 입력해서 시작해볼까요?');
      } finally {
        loadingOverlay.style.display = 'none';
        cameraInput.value = ''; // 초기화
      }
    });
  }
});

// File to Base64 helper
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
