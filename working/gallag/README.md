# 🎮 수학 게임 런처

초등학생을 위한 인터랙티브 수학 학습 게임 플랫폼입니다. Streamlit 웹 인터페이스로 게임을 선택하고, Pygame으로 실제 게임을 플레이합니다.

## ✨ 주요 기능

### 🕹️ 프리셋 게임
- **✈️ 수학 갤러그** - 슈팅 게임 형식으로 약수/배수 학습
- **🐸 개구리 연못 건너기** - 플랫폼 게임 형식으로 숫자 판별

### 🤖 AI 커스텀 게임 생성
OpenAI API를 사용하여 교육 목표에 맞는 맞춤형 게임 자동 생성:
- **5가지 학습 목표**: 약수 구하기, 배수 이해하기, 공약수 찾기, 최대공약수 구하기, 공배수와 최소공배수
- **3가지 난이도**: 쉬움, 보통, 어려움
- **추가 요청사항**: 완전한 커스터마이징 가능

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 의존성 설치
pip install -r requirements.txt

# OpenAI API 키 설정 (.env 파일 생성)
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### 2. 실행

#### Streamlit 웹 인터페이스 (권장)
```bash
streamlit run streamlit_app.py
```
→ 브라우저에서 `http://localhost:8501` 자동 오픈

#### 기존 Pygame 런처
```bash
python main.py
```

## 📖 게임 소개

### 1. 수학 갤러그 ✈️

적 우주선들이 숫자를 달고 내려옵니다. 목표 숫자의 약수(또는 배수)를 가진 적은 피하고, 나머지 적을 모두 격파하세요!

**조작법**
- `← →` 좌우 이동
- `SPACE` 총알 발사
- `ESC` 일시정지

**게임 규칙**
- 피해야 할 숫자를 가진 적에게 맞으면 목숨 -1
- 적 총알에 맞아도 목숨 -1
- 적이 화면 하단에 도달하면 게임오버
- 피해야 할 숫자가 아닌 적을 모두 격파하면 클리어

**레벨 구성**
- 총 3레벨, 레벨마다 목표 숫자가 달라짐
- 레벨이 올라갈수록 적의 속도와 수가 증가

### 2. 개구리 연못 건너기 🐸

연못 위에 숫자가 적힌 연잎들이 떠 있습니다. 목표 숫자의 약수(또는 배수)인 연잎만 밟아 반대편 둑까지 건너세요!

**조작법**
- `SPACE + ↑` 앞 줄로 점프
- `SPACE + ↓` 뒷 줄로 후퇴
- `SPACE + ← / →` 같은 줄의 왼쪽/오른쪽 연잎으로 이동
- `← / →` 바닥(출발점)에서 좌우 이동
- `ESC` 일시정지

**게임 규칙**
- 틀린 연잎을 밟으면 연잎이 가라앉으며 목숨 -1
- 반대편 둑(여자 개구리)에 도달하면 클리어
- 목숨 3개에서 시작

**레벨 구성**

| 레벨 | 연잎 줄 수 | 숫자 범위 | 이동 속도 |
|------|-----------|----------|----------|
| 1 | 5줄 | 1~30 | 느림 |
| 2 | 7줄 | 2~60 | 보통 |
| 3 | 9줄 | 3~90 | 빠름 |

## 🎨 커스텀 게임 생성 방법

### 기본 사용

1. Streamlit 앱에서 **"커스텀 게임 생성"** 클릭
2. 드롭다운에서 옵션 선택:
   - **학습 목표** 선택 (약수, 배수, 공약수 등)
   - **게임 유형** 선택 (수학 갤러그 or 개구리 연못)
   - **난이도** 선택 (쉬움/보통/어려움)
3. **"게임 생성"** 클릭 → AI가 자동 생성 (10~20초)
4. **"게임 시작!"** 클릭

### 추가 요청사항 활용

모든 기본 설정을 오버라이드할 수 있습니다:

```
# 게임 모드 변경
"eliminate_mode를 true로 설정하고, 배수를 모두 제거하는 게임으로 만들어주세요"

# 숫자 범위 지정
"숫자 범위를 1부터 100까지로 설정해주세요"

# 난이도 세부 조정
"레벨을 5개로 늘리고, 각 레벨마다 적을 30개씩 출현시켜주세요"

# 특정 숫자 지정
"12, 18, 24, 30, 36의 약수를 찾는 게임으로 만들어주세요"
```

## 📁 프로젝트 구조

```
wm/
├── streamlit_app.py          # Streamlit 웹 UI (메인)
├── streamlit_launcher.py     # Pygame 실행 헬퍼
├── game_runner.py            # Subprocess 게임 스크립트
├── main.py                   # 간단한 Pygame 런처 (프리셋 게임만)
├── requirements.txt          # 의존성
├── .env                      # API 키 (직접 생성)
│
├── airplane/                 # 수학 갤러그
│   ├── main.py              # 게임 루프
│   ├── settings.py          # 설정
│   ├── entities.py          # 게임 객체
│   ├── levels.py            # 레벨 생성
│   └── screens.py           # 화면 UI
│
├── frog/                     # 개구리 연못
│   ├── main.py
│   ├── settings.py
│   ├── entities.py
│   ├── levels.py
│   └── screens.py
│
├── shared/                   # 공유 모듈
│   ├── concepts.py          # 프리셋 개념
│   ├── dynamic_concept.py   # AI 생성 개념
│   └── llm_generator.py     # OpenAI 생성기
│
└── prompts/                  # LLM 프롬프트 템플릿
    ├── base_prompt.txt
    ├── airplane_rules.txt
    ├── frog_rules.txt
    └── examples.json
```

## 🛠️ 기술 스택

- **Frontend**: Streamlit 1.56+
- **Game Engine**: Pygame 2.6+
- **AI**: OpenAI GPT-4o (via DSPy)
- **Language**: Python 3.11+

### 아키텍처

```
Streamlit Web UI (Port 8501)
         ↓
    subprocess.run()
         ↓
   game_runner.py
   (JSON 로드 → DynamicConcept 생성)
         ↓
   Pygame Window
   (airplane/main.py or frog/main.py)
```

**Subprocess 방식 사용 이유:**
- macOS의 NSWindow 스레딩 제약 우회
- 프로세스 격리로 안정성 향상

## 🔧 트러블슈팅

### Q: 게임이 바로 클리어됨

**해결:**
1. Streamlit에서 **"🔍 게임 정의 상세 보기"** 펼치기
2. JSON에서 `candidates`가 비어있지 않은지 확인
3. 추가 요청사항에 더 구체적인 지시 추가:
   ```
   "candidates는 [12, 18, 24, 30, 36]으로 설정하고,
   validation_logic은 'lambda num, target: target % num == 0'으로 작성해주세요."
   ```

### Q: OPENAI_API_KEY 오류

```bash
# .env 파일 생성
echo "OPENAI_API_KEY=sk-proj-..." > .env
```

API 키는 https://platform.openai.com/api-keys 에서 발급

### Q: Pygame 창이 안 열림

- Pygame 설치 확인: `pip install pygame`
- macOS: 시스템 환경설정 → 보안 → 화면 기록 권한 확인

### Q: Streamlit이 느림

`.env` 파일에서 더 빠른 모델 사용:
```bash
OPENAI_MODEL=gpt-4o-mini
```

## 📝 환경 변수 (.env)

```bash
# 필수
OPENAI_API_KEY=sk-proj-...

# 선택 (기본값 표시)
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=2048
```

## 🎯 게임 개념 예시

### 약수 게임 JSON
```json
{
  "concept": {
    "name": "12의 약수",
    "validation_logic": {
      "function": "lambda num, target: target % num == 0"
    },
    "candidates": [12, 18, 24, 30],
    "eliminate_mode": false,
    "instruction": "{target}의 약수가 아닌 수를 모두 격파하세요!"
  }
}
```

### 배수 게임 JSON
```json
{
  "concept": {
    "name": "3의 배수",
    "validation_logic": {
      "function": "lambda num, target: num % target == 0"
    },
    "candidates": [3, 4, 5, 6, 7],
    "eliminate_mode": false,
    "instruction": "{target}의 배수가 아닌 수를 모두 격파하세요!"
  }
}
```

## 📦 의존성

```txt
pygame>=2.6.1
dspy-ai>=3.1.3
openai>=2.24.0
python-dotenv>=1.0.1
streamlit>=1.30.0
```

## 🔗 참고 문서

- [Streamlit](https://docs.streamlit.io/)
- [Pygame](https://www.pygame.org/docs/)
- [OpenAI API](https://platform.openai.com/docs/)
- [DSPy](https://dspy-docs.vercel.app/)

---

**제작:** Claude Code + Python
**버전:** 2.0 (Streamlit + Pygame Hybrid)
**목적:** 초등학생 수학 교육
