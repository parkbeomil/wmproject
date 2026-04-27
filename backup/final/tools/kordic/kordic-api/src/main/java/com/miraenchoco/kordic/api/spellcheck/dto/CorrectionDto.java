package com.miraenchoco.kordic.api.spellcheck.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrectionDto {

    private String original;
    private String corrected;
    private String category;
    private String reason;
}
