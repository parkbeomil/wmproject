package com.miraenchoco.kordic.api.spellcheck.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.miraenchoco.kordic.api.global.exception.BusinessException;
import com.miraenchoco.kordic.api.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class ClaudeApiClient {

    private static final String SYSTEM_PROMPT = """
            당신은 한국어 맞춤법 교정 엔진입니다.
            반드시 아래 규칙을 따르세요.
            1. JSON 외 어떤 텍스트도 출력하지 마세요.
            2. 설명, 인사, 부연 없이 JSON만 반환하세요.
            3. 교정할 내용이 없으면 corrections를 빈 배열로 반환하세요.

            반환 형식:
            {"original":string,"corrected":string,"corrections":[{"original":string,"corrected":string,"category":"맞춤법"|"띄어쓰기"|"표준어"|"문장부호","reason":string}]}
            """;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.model}")
    private String model;

    @Value("${claude.api.max-tokens}")
    private int maxTokens;

    public ClaudeApiClient(@Qualifier("claudeRestClient") RestClient restClient,
                           ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    public String callSpellCheck(String text) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "temperature", 0,
                "system", SYSTEM_PROMPT,
                "messages", List.of(Map.of("role", "user", "content", "텍스트: " + text))
        );

        try {
            String response = restClient.post()
                    .uri("/v1/messages")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return extractTextFromResponse(response);
        } catch (RestClientException e) {
            log.error("Claude API 호출 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.CLAUDE_API_ERROR, "Claude API 호출 실패: " + e.getMessage());
        }
    }

    private String extractTextFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String text = root.path("content").get(0).path("text").asText();
            return stripMarkdownCodeBlock(text);
        } catch (Exception e) {
            log.error("Claude 응답 파싱 실패: {}", response);
            throw new BusinessException(ErrorCode.JSON_PARSE_ERROR);
        }
    }

    private String stripMarkdownCodeBlock(String text) {
        String stripped = text.trim();
        if (stripped.startsWith("```json")) {
            stripped = stripped.substring(7);
        } else if (stripped.startsWith("```")) {
            stripped = stripped.substring(3);
        }
        if (stripped.endsWith("```")) {
            stripped = stripped.substring(0, stripped.length() - 3);
        }
        return stripped.trim();
    }
}
