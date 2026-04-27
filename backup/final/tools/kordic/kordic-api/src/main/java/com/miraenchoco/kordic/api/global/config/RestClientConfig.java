package com.miraenchoco.kordic.api.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${claude.api.base-url}")
    private String claudeBaseUrl;

    @Value("${dictionary.api.base-url}")
    private String dictBaseUrl;

    @Bean("claudeRestClient")
    public RestClient claudeRestClient() {
        return RestClient.builder()
                .baseUrl(claudeBaseUrl)
                .build();
    }

    @Bean("dictionaryRestClient")
    public RestClient dictionaryRestClient() {
        return RestClient.builder()
                .baseUrl(dictBaseUrl)
                .build();
    }
}
