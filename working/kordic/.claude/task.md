# Tasks - 맞춤법 검사 백엔드 API 개발
> 생성일: 2026-04-27
> 요청: 기존 프론트엔드(spell-checker.html)가 사용할 Spring Boot 백엔드 API 서비스 구현

## 플랜
- `kordic-api/` 서브디렉토리에 Spring Boot 3.5 프로젝트 구성
- mrn-backend-guide v2.0 표준 적용 (ApiResponse<T>, ErrorCode, BusinessException, GlobalExceptionHandler)
- DB 없음 — Claude API(맞춤법 교정) + 표준국어대사전 API(사전 조회) 순수 프록시
- 백엔드 ApiResponse 래퍼 적용에 맞춰 프론트엔드 응답 접근 경로 수정

## 태스크
- [x] 1. `kordic-api/` Gradle 프로젝트 초기화 (`build.gradle`, `settings.gradle`)
- [x] 2. `application.yml` 작성 (Claude API 키, 사전 API 키, 포트 등)
- [x] 3. `KordicApiApplication.java` 생성
- [x] 4. `global/response/ApiResponse.java` 생성 (mrn 표준 래퍼)
- [x] 5. `global/exception/` 생성 (`ErrorCode`, `BusinessException`, `GlobalExceptionHandler`)
- [x] 6. `global/config/` 생성 (`WebConfig` CORS, `RestClientConfig` RestClient 빈)
- [x] 7. `spellcheck/dto/` 생성 (`SpellCheckRequestDto`, `SpellCheckResponseDto`, `CorrectionDto`)
- [x] 8. `spellcheck/client/ClaudeApiClient.java` 생성 (Claude API 호출, 마크다운 제거, JSON 추출)
- [x] 9. `spellcheck/service/SpellCheckService.java` 생성 (교정 항목 글자 수 검증, valid/skipped 분리)
- [x] 10. `spellcheck/controller/SpellCheckController.java` 생성 (`POST /api/spell-check`)
- [x] 11. `dictionary/dto/` 생성 (`DictionaryResponseDto`, `DictionaryItemDto`)
- [x] 12. `dictionary/client/DictionaryApiClient.java` 생성 (표준국어대사전 API 호출 및 파싱)
- [x] 13. `dictionary/service/DictionaryService.java` 생성
- [x] 14. `dictionary/controller/DictionaryController.java` 생성 (`GET /api/dictionary?word=`)
- [x] 15. `SpellCheckServiceTest.java` 작성 (교정 반환, 빈 배열, 글자 수 불일치 skipped, JSON 파싱 오류)
- [x] 16. `DictionaryServiceTest.java` 작성 (조회 성공, 빈 결과)
- [x] 17. `spell-checker.html` 프론트엔드 수정 — ApiResponse 래퍼 경로 (`raw.data.corrections` 등)
- [x] 18. Gradle Wrapper 복사 (gradle-8.10.2-bin, Spring Boot 3.5 호환 확인)
- [x] 19. `./gradlew build` 빌드 및 테스트 통과 확인 (BUILD SUCCESSFUL, 7 tasks)
- [ ] 20. `./gradlew bootRun` 서버 기동 후 curl로 API 동작 검증

## 완료
- 1~19 완료 (소스 코드 전체 생성, 프론트엔드 수정, 빌드·테스트 통과)
- 20 대기 중 — CLAUDE_API_KEY, DICT_API_KEY 환경변수 설정 후 실제 API 동작 검증 필요
