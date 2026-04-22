# 프롬프트 관리 가이드

이 디렉토리는 LLM 기반 게임 생성을 위한 프롬프트와 예시를 관리합니다.

## 파일 구조

```
prompts/
├── base_prompt.txt      # 기본 시스템 프롬프트
├── airplane_rules.txt   # Airplane 게임 규칙
├── frog_rules.txt       # Frog 게임 규칙
├── examples.json        # Few-shot learning 예시
└── README.md           # 이 파일
```

## 프롬프트 편집

### base_prompt.txt
- 수학 개념 카테고리
- Lambda 함수 작성 가이드
- 안전성 및 제약 조건
- 모든 게임 타입에 공통으로 적용

### airplane_rules.txt / frog_rules.txt
- 게임별 JSON 스키마
- 게임 규칙 설명
- eliminate_mode 가이드
- instruction 작성 가이드

### examples.json
Few-shot learning을 위한 예시 데이터:
```json
[
  {
    "user_prompt": "사용자 요청",
    "game_definition": { /* 게임 정의 JSON */ }
  }
]
```

## DSPy 통합

### 기본 사용
```python
from shared.llm_generator import GameGenerator

generator = GameGenerator()
definition = generator.generate_game_definition("airplane", "소수를 피하는 게임")
```

### 고급: BootstrapFewShot 최적화
```python
# 학습 프롬프트로 최적화
training_prompts = [
    "짝수를 찾는 게임",
    "3의 배수 게임",
    "완전제곱수 게임"
]

generator.optimize_with_bootstrap("airplane", training_prompts)
```

## 새로운 예시 추가

1. `examples.json` 편집
2. 다음 형식으로 예시 추가:

**target을 사용하는 경우 (약수, 배수):**
```json
{
  "user_prompt": "12의 약수 게임",
  "game_definition": {
    "concept": {
      "name": "약수",
      "uses_target": true,
      "candidates": [12, 24, 36],
      "validation_logic": {
        "function": "lambda num, target: target % num == 0"
      }
    }
  }
}
```

**target을 사용하지 않는 경우 (소수, 짝수):**
```json
{
  "user_prompt": "소수 게임",
  "game_definition": {
    "concept": {
      "name": "소수",
      "uses_target": false,
      "validation_logic": {
        "function": "lambda num, target: num in [2,3,5,7,11,...]"
      }
    }
  }
}
```

## 프롬프트 수정 시 주의사항

1. **JSON 스키마 변경 금지**: 스키마를 변경하면 기존 코드가 깨질 수 있음
2. **수학적 정확성**: 수학 개념 설명이 정확해야 함
3. **일관성 유지**: 모든 게임 타입에서 일관된 용어 사용
4. **캐싱**: 프롬프트 파일은 자동으로 캐싱됨 (재시작 시 적용)
5. **uses_target 올바른 사용**:
   - 약수, 배수 등 특정 숫자와의 관계: `uses_target: true` + `candidates` 필수
   - 소수, 짝수 등 숫자 자체의 속성: `uses_target: false` + `candidates` 생략

## 성능 최적화

### Few-shot 예시 개수
현재 기본값: 상위 3개 예시 사용
```python
# llm_generator.py에서 조정 가능
prediction = self.predictor(
    system_context=system_context,
    user_prompt=user_prompt,
    demos=examples[:3]  # 이 숫자를 조정
)
```

### 모델 설정
`.env` 파일에서 설정:
```env
OPENAI_MODEL=gpt-4o
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_TOKENS=2048
```

## 트러블슈팅

### JSON 파싱 오류
- examples.json이 유효한 JSON인지 확인
- 프롬프트에서 JSON 형식 예시가 정확한지 확인

### 프롬프트가 반영되지 않음
- 애플리케이션 재시작 (캐싱 때문)
- 또는 `generator._prompt_cache.clear()` 호출

### 응답 품질 개선
1. `examples.json`에 더 많은 예시 추가
2. `base_prompt.txt`에서 가이드라인 강화
3. `optimize_with_bootstrap()` 실행하여 최적화
