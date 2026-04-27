package com.miraenchoco.kordic.api.dictionary.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.miraenchoco.kordic.api.dictionary.dto.DictionaryItemDto;
import com.miraenchoco.kordic.api.dictionary.dto.DictionaryResponseDto;
import com.miraenchoco.kordic.api.global.exception.BusinessException;
import com.miraenchoco.kordic.api.global.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class DictionaryApiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${dictionary.api.key}")
    private String apiKey;

    public DictionaryApiClient(@Qualifier("dictionaryRestClient") RestClient restClient,
                               ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    public DictionaryResponseDto search(String word) {
        try {
            String response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/search.do")
                            .queryParam("key", apiKey)
                            .queryParam("q", word)
                            .queryParam("req_type", "json")
                            .queryParam("type_search", "search")
                            .build())
                    .retrieve()
                    .body(String.class);

            return parseResponse(word, response);
        } catch (RestClientException e) {
            log.error("표준국어대사전 API 호출 실패: word={}, error={}", word, e.getMessage());
            throw new BusinessException(ErrorCode.DICT_API_ERROR, "사전 API 호출 실패: " + e.getMessage());
        }
    }

    private DictionaryResponseDto parseResponse(String word, String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode channel = root.path("channel");
            JsonNode items = channel.path("item");

            if (items.isMissingNode() || !items.isArray() || items.isEmpty()) {
                return DictionaryResponseDto.builder()
                        .word(word)
                        .items(Collections.emptyList())
                        .build();
            }

            List<DictionaryItemDto> itemDtos = new ArrayList<>();
            for (JsonNode item : items) {
                String pos = item.path("pos").asText("");
                List<String> definitions = new ArrayList<>();

                JsonNode sense = item.path("sense");
                if (sense.isArray()) {
                    for (JsonNode s : sense) {
                        String def = s.path("definition").asText("");
                        if (!def.isBlank()) {
                            definitions.add(def);
                        }
                    }
                } else if (!sense.isMissingNode()) {
                    String def = sense.path("definition").asText("");
                    if (!def.isBlank()) {
                        definitions.add(def);
                    }
                }

                if (!definitions.isEmpty()) {
                    itemDtos.add(DictionaryItemDto.builder()
                            .pos(pos)
                            .definitions(definitions)
                            .build());
                }
            }

            return DictionaryResponseDto.builder()
                    .word(word)
                    .items(itemDtos)
                    .build();
        } catch (Exception e) {
            log.error("사전 응답 파싱 실패: word={}, response={}", word, response);
            throw new BusinessException(ErrorCode.DICT_API_ERROR, "사전 응답 파싱 실패");
        }
    }
}
