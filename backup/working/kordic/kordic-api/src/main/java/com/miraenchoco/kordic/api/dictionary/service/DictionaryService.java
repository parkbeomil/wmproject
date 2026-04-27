package com.miraenchoco.kordic.api.dictionary.service;

import com.miraenchoco.kordic.api.dictionary.client.DictionaryApiClient;
import com.miraenchoco.kordic.api.dictionary.dto.DictionaryResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final DictionaryApiClient dictionaryApiClient;

    public DictionaryResponseDto search(String word) {
        log.debug("사전 조회: word={}", word);
        return dictionaryApiClient.search(word);
    }
}
