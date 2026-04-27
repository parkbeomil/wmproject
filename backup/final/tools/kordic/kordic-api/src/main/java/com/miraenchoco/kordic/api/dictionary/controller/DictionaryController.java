package com.miraenchoco.kordic.api.dictionary.controller;

import com.miraenchoco.kordic.api.dictionary.dto.DictionaryResponseDto;
import com.miraenchoco.kordic.api.dictionary.service.DictionaryService;
import com.miraenchoco.kordic.api.global.response.ApiResponse;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/dictionary")
    public ApiResponse<DictionaryResponseDto> dictionary(
            @RequestParam @NotBlank(message = "단어를 입력해주세요.") String word) {
        return ApiResponse.ok(dictionaryService.search(word));
    }
}
