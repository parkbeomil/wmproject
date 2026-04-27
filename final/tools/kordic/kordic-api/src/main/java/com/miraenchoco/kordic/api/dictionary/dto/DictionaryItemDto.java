package com.miraenchoco.kordic.api.dictionary.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DictionaryItemDto {

    private String pos;
    private List<String> definitions;
}
