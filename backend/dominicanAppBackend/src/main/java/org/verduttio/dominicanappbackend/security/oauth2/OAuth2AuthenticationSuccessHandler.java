package org.verduttio.dominicanappbackend.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.verduttio.dominicanappbackend.security.UserDetailsImpl;
import org.verduttio.dominicanappbackend.util.EnvUtils;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final SecurityContextRepository securityContextRepository;
    private final EnvUtils envUtils;

    public OAuth2AuthenticationSuccessHandler(SecurityContextRepository securityContextRepository, EnvUtils envUtils) {
        this.securityContextRepository = securityContextRepository;
        this.envUtils = envUtils;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String redirectUrl = determineTargetUrl(request, response, authentication);
        if(authentication.getPrincipal() instanceof UserDetailsImpl) {
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            securityContextRepository.saveContext(context, request, response);
        } else {
            System.out.println("[ERROR]: Principal is not an instance of UserDetailsImpl");
        }

        new DefaultRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }


    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        String redirectUri = envUtils.getAppEnvVariable("FRONTEND_URL");
        redirectUri = redirectUri + "/home/logged";

        System.out.println("Redirect URI: " + redirectUri);

        return UriComponentsBuilder.fromUriString(redirectUri)
                .build().toUriString();
    }
}
