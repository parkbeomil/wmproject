package com.miraenchoco.kordic.api.spellcheck.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.miraenchoco.kordic.api.global.exception.BusinessException;
import com.miraenchoco.kordic.api.global.exception.ErrorCode;
import com.miraenchoco.kordic.api.spellcheck.client.ClaudeApiClient;
import com.miraenchoco.kordic.api.spellcheck.dto.SpellCheckRequestDto;
import com.miraenchoco.kordic.api.spellcheck.dto.SpellCheckResponseDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class SpellCheckServiceTest {

    @InjectMocks
    private SpellCheckService spellCheckService;

    @Mock
    private ClaudeApiClient claudeApiClient;

    @Spy
    private ObjectMapper objectMapper;

    @Test
    void 교정_항목이_있을_때_올바르게_반환된다() {
        String responseJson = """
                {
                  "original": "오늘 날씨가 조습니다.",
                  "corrected": "오늘 날씨가 좋습니다.",
                  "corrections": [
                    {
                      "original": "조습니다",
                      "corrected": "좋습니다",
                      "category": "맞춤법",
                      "reason": "'좋다'의 올바른 합쇼체 활용형은 '좋습니다'"
                    }
                  ]
                }
                """;
        given(claudeApiClient.callSpellCheck("오늘 날씨가 조습니다.")).willReturn(responseJson);

        SpellCheckResponseDto result = spellCheckService.check(new SpellCheckRequestDto("오늘 날씨가 조습니다."));

        assertThat(result.getOriginal()).isEqualTo("오늘 날씨가 조습니다.");
        assertThat(result.getCorrected()).isEqualTo("오늘 날씨가 좋습니다.");
        assertThat(result.getCorrections()).hasSize(1);
        assertThat(result.getSkipped()).isEmpty();
        assertThat(result.getCorrections().get(0).getCategory()).isEqualTo("맞춤법");
    }

    @Test
    void 교정_항목이_없을_때_빈_배열을_반환한다() {
        String responseJson = """
                {
                  "original": "오늘 날씨가 좋습니다.",
                  "corrected": "오늘 날씨가 좋습니다.",
                  "corrections": []
                }
                """;
        given(claudeApiClient.callSpellCheck("오늘 날씨가 좋습니다.")).willReturn(responseJson);

        SpellCheckResponseDto result = spellCheckService.check(new SpellCheckRequestDto("오늘 날씨가 좋습니다."));

        assertThat(result.getCorrections()).isEmpty();
        assertThat(result.getSkipped()).isEmpty();
    }

    @Test
    void 글자_수_불일치_항목은_skipped로_분리된다() {
        // 원문 "안녕"(2자) → 교정 "안녕하세요"(5자): 공백 제외 글자 수 불일치
        String responseJson = """
                {
                  "original": "안녕",
                  "corrected": "안녕하세요",
                  "corrections": [
                    {
                      "original": "안녕",
                      "corrected": "안녕하세요",
                      "category": "맞춤법",
                      "reason": "테스트용 불일치 항목"
                    }
                  ]
                }
                """;
        given(claudeApiClient.callSpellCheck("안녕")).willReturn(responseJson);

        SpellCheckResponseDto result = spellCheckService.check(new SpellCheckRequestDto("안녕"));

        assertThat(result.getCorrections()).isEmpty();
        assertThat(result.getSkipped()).hasSize(1);
    }

    @Test
    void Claude_응답이_유효하지_않은_JSON이면_예외가_발생한다() {
        given(claudeApiClient.callSpellCheck("테스트")).willReturn("유효하지 않은 JSON");

        assertThatThrownBy(() -> spellCheckService.check(new SpellCheckRequestDto("테스트")))
                .isInstanceOf(BusinessException.class)
                .satisfies(e -> assertThat(((BusinessException) e).getErrorCode())
                        .isEqualTo(ErrorCode.JSON_PARSE_ERROR));
    }
}
