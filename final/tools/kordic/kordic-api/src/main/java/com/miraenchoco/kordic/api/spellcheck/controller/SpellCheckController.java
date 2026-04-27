package com.miraenchoco.kordic.api.spellcheck.controller;

import com.miraenchoco.kordic.api.global.response.ApiResponse;
import com.miraenchoco.kordic.api.spellcheck.dto.SpellCheckRequestDto;
import com.miraenchoco.kordic.api.spellcheck.dto.SpellCheckResponseDto;
import com.miraenchoco.kordic.api.spellcheck.service.SpellCheckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SpellCheckController {

    private final SpellCheckService spellCheckService;

    @PostMapping("/spell-check")
    public ApiResponse<SpellCheckResponseDto> spellCheck(
            @Valid @RequestBody SpellCheckRequestDto request) {
        return ApiResponse.ok(spellCheckService.check(request));
    }
}
