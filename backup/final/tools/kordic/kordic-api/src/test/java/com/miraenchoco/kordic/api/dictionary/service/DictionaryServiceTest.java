package com.miraenchoco.kordic.api.dictionary.service;

import com.miraenchoco.kordic.api.dictionary.client.DictionaryApiClient;
import com.miraenchoco.kordic.api.dictionary.dto.DictionaryItemDto;
import com.miraenchoco.kordic.api.dictionary.dto.DictionaryResponseDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class DictionaryServiceTest {

    @InjectMocks
    private DictionaryService dictionaryService;

    @Mock
    private DictionaryApiClient dictionaryApiClient;

    @Test
    void 단어_조회_결과를_반환한다() {
        DictionaryResponseDto mockResponse = DictionaryResponseDto.builder()
                .word("좋다")
                .items(List.of(
                        DictionaryItemDto.builder()
                                .pos("형용사")
                                .definitions(List.of("어떤 것이 훌륭하거나 만족스럽다."))
                                .build()
                ))
                .build();
        given(dictionaryApiClient.search("좋다")).willReturn(mockResponse);

        DictionaryResponseDto result = dictionaryService.search("좋다");

        assertThat(result.getWord()).isEqualTo("좋다");
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getPos()).isEqualTo("형용사");
    }

    @Test
    void 검색_결과가_없으면_빈_items를_반환한다() {
        DictionaryResponseDto emptyResponse = DictionaryResponseDto.builder()
                .word("없는단어")
                .items(Collections.emptyList())
                .build();
        given(dictionaryApiClient.search("없는단어")).willReturn(emptyResponse);

        DictionaryResponseDto result = dictionaryService.search("없는단어");

        assertThat(result.getItems()).isEmpty();
    }
}
