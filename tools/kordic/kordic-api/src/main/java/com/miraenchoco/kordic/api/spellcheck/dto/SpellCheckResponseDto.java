package com.miraenchoco.kordic.api.spellcheck.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SpellCheckResponseDto {

    private String original;
    private String corrected;
    private List<CorrectionDto> corrections;
    private List<CorrectionDto> skipped;
}
