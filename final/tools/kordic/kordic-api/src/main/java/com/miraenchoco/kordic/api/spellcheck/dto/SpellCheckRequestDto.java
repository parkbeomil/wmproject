package com.miraenchoco.kordic.api.spellcheck.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SpellCheckRequestDto {

    @NotBlank(message = "텍스트를 입력해주세요.")
    private String text;
}
