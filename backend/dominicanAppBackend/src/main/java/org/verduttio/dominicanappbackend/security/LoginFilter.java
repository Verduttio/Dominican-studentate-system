package org.verduttio.dominicanappbackend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.verduttio.dominicanappbackend.dto.LoginRequest;

import java.io.IOException;

public class LoginFilter extends AbstractAuthenticationProcessingFilter {

    private final ObjectMapper mapper;

    public LoginFilter(ObjectMapper mapper, AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository,
                       SessionAuthenticationStrategy sessionAuthenticationStrategy) {
        super(new AntPathRequestMatcher("/api/users/login", "POST"));
        this.mapper = mapper;
        setAuthenticationManager(authenticationManager);
        setSecurityContextRepository(securityContextRepository);
        setSessionAuthenticationStrategy(sessionAuthenticationStrategy);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {
        LoginRequest loginRequest = mapper.readValue(request.getInputStream(), LoginRequest.class);
        UsernamePasswordAuthenticationToken authRequest = UsernamePasswordAuthenticationToken.unauthenticated(loginRequest.getEmail(),
                loginRequest.getPassword());
        // Allow subclasses to set the "details" property
        setDetails(request, authRequest);

        return getAuthenticationManager().authenticate(authRequest);
    }

    protected void setDetails(HttpServletRequest request, UsernamePasswordAuthenticationToken authRequest) {
        authRequest.setDetails(this.authenticationDetailsSource.buildDetails(request));
    }
}