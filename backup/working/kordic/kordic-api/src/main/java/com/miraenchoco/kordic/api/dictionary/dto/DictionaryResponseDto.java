package com.miraenchoco.kordic.api.dictionary.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DictionaryResponseDto {

    private String word;
    private List<DictionaryItemDto> items;
}
