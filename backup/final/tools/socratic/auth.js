const keyInput = document.getElementById('key-input');
const keySubmit = document.getElementById('key-submit');
const keyError = document.getElementById('key-error');

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
  if (!val) {
    showKeyError('API 키를 입력해주세요.');
    return;
  }

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
      // 인증 성공 시 세션 스토리지에 저장하고 설정 페이지로 이동
      sessionStorage.setItem('anthropic_api_key', val);
      window.location.href = 'study_setup.html';
    }
  } catch (e) {
    showKeyError('❌ 네트워크 오류. 인터넷 연결을 확인해주세요.');
  }

  keySubmit.disabled = false;
  keySubmit.textContent = '키 확인 후 시작';
}

keySubmit.addEventListener('click', verifyAndStart);
keyInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') verifyAndStart();
});
keyInput.addEventListener('input', clearKeyError);
