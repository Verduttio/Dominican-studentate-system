package org.verduttio.dominicanappbackend.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.util.EnvUtils;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {
    private final EnvUtils envUtils;

    public OAuth2AuthenticationFailureHandler(EnvUtils envUtils) {
        this.envUtils = envUtils;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String redirectUri = envUtils.getAppEnvVariable("FRONTEND_URL");
        String targetUrl = redirectUri + "/login?error_oauth2=true&error_message=" + exception.getLocalizedMessage();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("text/plain");
        response.getWriter().write(exception.getLocalizedMessage());
        new DefaultRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
