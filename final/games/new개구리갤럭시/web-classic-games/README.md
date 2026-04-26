# 수학 클래식 게임 Web

Python/Pygame 프로젝트의 프리셋 게임을 브라우저 Canvas 앱으로 먼저 옮긴 버전입니다.

## 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:4173`으로 접속합니다.

## 구현 범위

- 수학 갤러그
  - 방향키 이동
  - Space 발사
  - 약수/배수에 해당하는 적은 피하고, 아닌 적을 격파
  - 3레벨, 점수, 목숨, 적 탄환, 클리어/게임오버

- 개구리 연못 건너기
  - 바닥에서 좌우 이동
  - Space + 방향키 점프
  - 약수/배수인 연잎만 밟기
  - 3레벨, 목숨, 연잎 이동, 침몰, 클리어/게임오버

## 원본 자산 재사용 방식

- `data/presets.json`은 기존 `prompts/examples.json`의 `concept`/`game_rules` 구조를 브라우저용으로 정리한 프리셋입니다.
- Python `lambda` 문자열은 브라우저에서 `eval`하지 않고 `validation: "divisor" | "multiple"` 키로 치환했습니다.
- 이후 AI 커스텀 생성 기능을 붙일 때는 서버 API에서 기존 `prompts/base_prompt.txt`, `airplane_rules.txt`, `frog_rules.txt`를 재사용하고, 출력 스키마만 브라우저 안전형으로 맞추면 됩니다.
