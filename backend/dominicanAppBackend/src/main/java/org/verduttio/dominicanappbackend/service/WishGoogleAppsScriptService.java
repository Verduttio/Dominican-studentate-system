package org.verduttio.dominicanappbackend.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.verduttio.dominicanappbackend.util.EnvUtils;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.List;

@Service
public class WishGoogleAppsScriptService {

    private final EnvUtils envUtils;
    private final RestClient restClient;

    public WishGoogleAppsScriptService(EnvUtils envUtils) {
        this.envUtils = envUtils;

        HttpClient httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(15))
                .build();

        JdkClientHttpRequestFactory requestFactory =
                new JdkClientHttpRequestFactory(httpClient);

        requestFactory.setReadTimeout(Duration.ofSeconds(300));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    public DispatchResponse dispatch(
            String mode,
            String title,
            String testRecipient,
            List<DispatchItem> items
    ) {
        String url = envUtils.getAppEnvVariable("WISHES_GAS_URL");
        String secret = envUtils.getAppEnvVariable("WISHES_GAS_SECRET");

        if (url == null || url.isBlank()
                || secret == null || secret.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Brak konfiguracji Google Apps Script. Ustaw WISHES_GAS_URL i WISHES_GAS_SECRET."
            );
        }

        DispatchRequest request = new DispatchRequest(
                secret,
                mode,
                title,
                testRecipient,
                items
        );

        try {
            DispatchResponse response = restClient.post()
                    .uri(url.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(DispatchResponse.class);

            if (response == null || !Boolean.TRUE.equals(response.ok())) {
                String error = response == null
                        ? "Google Apps Script zwrócił pustą odpowiedź"
                        : response.error();

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        error == null || error.isBlank()
                                ? "Google Apps Script nie potwierdził wykonania wysyłki"
                                : error
                );
            }

            return response;

        } catch (ResponseStatusException e) {
            throw e;
        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Nie udało się połączyć z Google Apps Script: " + e.getMessage()
            );
        }
    }

    public record DispatchRequest(
            String secret,
            String mode,
            String title,
            String testRecipient,
            List<DispatchItem> items
    ) {}

    public record DispatchItem(
            Long wishId,
            String recipient,
            String email,
            String message
    ) {}

    public record DispatchResponse(
            Boolean ok,
            List<DispatchItemResult> results,
            String error
    ) {}

    public record DispatchItemResult(
            Long wishId,
            Boolean success,
            String error
    ) {}
}