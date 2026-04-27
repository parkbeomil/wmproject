package com.miraenchoco.kordic.api.spellcheck.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.miraenchoco.kordic.api.global.exception.BusinessException;
import com.miraenchoco.kordic.api.global.exception.ErrorCode;
import com.miraenchoco.kordic.api.spellcheck.client.ClaudeApiClient;
import com.miraenchoco.kordic.api.spellcheck.dto.CorrectionDto;
import com.miraenchoco.kordic.api.spellcheck.dto.SpellCheckRequestDto;
import com.miraenchoco.kordic.api.spellcheck.dto.SpellCheckResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpellCheckService {

    private final ClaudeApiClient claudeApiClient;
    private final ObjectMapper objectMapper;

    public SpellCheckResponseDto check(SpellCheckRequestDto request) {
        String rawJson = claudeApiClient.callSpellCheck(request.getText());

        JsonNode root = parseJson(rawJson);

        String original = root.path("original").asText(request.getText());
        String corrected = root.path("corrected").asText(original);
        List<CorrectionDto> allCorrections = parseCorrections(root.path("corrections"));

        List<CorrectionDto> valid = new ArrayList<>();
        List<CorrectionDto> skipped = new ArrayList<>();

        for (CorrectionDto c : allCorrections) {
            if (countWithoutSpaces(c.getOriginal()) == countWithoutSpaces(c.getCorrected())) {
                valid.add(c);
            } else {
                log.warn("글자 수 불일치 교정 항목 skipped: '{}' -> '{}'", c.getOriginal(), c.getCorrected());
                skipped.add(c);
            }
        }

        return SpellCheckResponseDto.builder()
                .original(original)
                .corrected(corrected)
                .corrections(valid)
                .skipped(skipped)
                .build();
    }

    private JsonNode parseJson(String rawJson) {
        try {
            return objectMapper.readTree(rawJson);
        } catch (JsonProcessingException e) {
            log.error("Claude 응답 JSON 파싱 실패: {}", rawJson);
            throw new BusinessException(ErrorCode.JSON_PARSE_ERROR);
        }
    }

    private List<CorrectionDto> parseCorrections(JsonNode correctionsNode) {
        List<CorrectionDto> corrections = new ArrayList<>();
        if (correctionsNode.isArray()) {
            for (JsonNode node : correctionsNode) {
                corrections.add(CorrectionDto.builder()
                        .original(node.path("original").asText())
                        .corrected(node.path("corrected").asText())
                        .category(node.path("category").asText())
                        .reason(node.path("reason").asText())
                        .build());
            }
        }
        return corrections;
    }

    private long countWithoutSpaces(String text) {
        return text.chars().filter(c -> c != ' ').count();
    }
}
