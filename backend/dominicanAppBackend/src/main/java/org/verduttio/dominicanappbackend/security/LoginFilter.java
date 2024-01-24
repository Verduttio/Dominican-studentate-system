package org.verduttio.dominicanappbackend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.log.LogMessage;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.event.InteractiveAuthenticationSuccessEvent;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.dto.LoginRequest;

import java.io.IOException;

@Component
public class LoginFilter extends AbstractAuthenticationProcessingFilter {

    private final ObjectMapper mapper;

    @Autowired
    public LoginFilter(ObjectMapper mapper) {
        super(new AntPathRequestMatcher("/api/users/login", "POST"));
        this.mapper = mapper;
    }

    @Autowired
    public void setAuthenticationManager(@Lazy AuthenticationManager authenticationManager) {
        super.setAuthenticationManager(authenticationManager);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {
        logger.trace("attemptAuthentication");
        System.out.println("attemptAuthentication");
        LoginRequest loginRequest = mapper.readValue(request.getInputStream(), LoginRequest.class);
        UsernamePasswordAuthenticationToken authRequest = UsernamePasswordAuthenticationToken.unauthenticated(loginRequest.getEmail(),
                loginRequest.getPassword());
        // Allow subclasses to set the "details" property
        setDetails(request, authRequest);

        System.out.println("attemptAuthentication: " + authRequest.getPrincipal());  // shows email address from login request

        return getAuthenticationManager().authenticate(authRequest);
    }

//    @Override
//    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
//        System.out.println("successfulAuthentication");
//    }

    protected void setDetails(HttpServletRequest request, UsernamePasswordAuthenticationToken authRequest) {
        authRequest.setDetails(this.authenticationDetailsSource.buildDetails(request));
    }
}