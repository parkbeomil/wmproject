package com.miraenchoco.kordic.api.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    INVALID_REQUEST("INVALID_REQUEST", "입력값이 올바르지 않습니다."),
    CLAUDE_API_ERROR("CLAUDE_API_ERROR", "맞춤법 검사 서비스에 오류가 발생했습니다."),
    JSON_PARSE_ERROR("JSON_PARSE_ERROR", "응답 파싱 중 오류가 발생했습니다."),
    DICT_API_ERROR("DICT_API_ERROR", "사전 조회 서비스에 오류가 발생했습니다.");

    private final String code;
    private final String message;
}
