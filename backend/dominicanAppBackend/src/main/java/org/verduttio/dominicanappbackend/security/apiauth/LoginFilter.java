package org.verduttio.dominicanappbackend.security.apiauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.verduttio.dominicanappbackend.dto.auth.LoginRequest;
import org.verduttio.dominicanappbackend.domain.AuthProvider;
import org.verduttio.dominicanappbackend.domain.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.service.exception.ApiAuthAuthenticationProcessingException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

public class LoginFilter extends AbstractAuthenticationProcessingFilter {

    private final ObjectMapper mapper;
    private final UserRepository userRepository;

    public LoginFilter(ObjectMapper mapper, AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository,
                       SessionAuthenticationStrategy sessionAuthenticationStrategy, ApiAuthAuthenticationSuccessHandler successHandler,
                       ApiAuthAuthenticationFailureHandler failureHandler, UserRepository userRepository) {
        super(new AntPathRequestMatcher("/api/users/login", "POST"));
        this.mapper = mapper;
        this.userRepository = userRepository;
        setAuthenticationManager(authenticationManager);
        setSecurityContextRepository(securityContextRepository);
        setSessionAuthenticationStrategy(sessionAuthenticationStrategy);
        setAuthenticationSuccessHandler(successHandler);
        setAuthenticationFailureHandler(failureHandler);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {
        LoginRequest loginRequest = mapper.readValue(request.getInputStream(), LoginRequest.class);
        request.setAttribute("username", loginRequest.getEmail());

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            if(!user.getProvider().equals(AuthProvider.LOCAL)) {
                throw new ApiAuthAuthenticationProcessingException("Looks like you're signed up with " +
                        user.getProvider() + " account. Please use your " + user.getProvider() +
                        " account to login.");
            }

            if (user.getLockTime() != null && user.getLockTime().isAfter(LocalDateTime.now().minusMinutes(Configuration.LOCK_ACCOUNT_DURATION_MINUTES))) {
                throw new LockedException("User account is locked due to too many failed attempts. Please try again later.");
            }
            if (user.getLockTime() != null && user.getLockTime().isBefore(LocalDateTime.now())) {
                user.setFailedLoginAttempts(0);
                user.setLockTime(null);
                userRepository.save(user);
            }

        }

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