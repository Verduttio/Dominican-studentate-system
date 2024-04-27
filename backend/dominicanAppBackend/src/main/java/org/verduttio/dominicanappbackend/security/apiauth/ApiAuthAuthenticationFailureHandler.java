package org.verduttio.dominicanappbackend.security.apiauth;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;

import java.io.IOException;
import java.time.LocalDateTime;

public class ApiAuthAuthenticationFailureHandler implements AuthenticationFailureHandler {
    private final UserRepository userRepository;

    @Autowired
    public ApiAuthAuthenticationFailureHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String email = request.getAttribute("username").toString();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && user.isEnabled()) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() == Configuration.MAX_LOGIN_ATTEMPTS) {
                user.setLockTime(LocalDateTime.now());
            }
            userRepository.save(user);
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        if (exception instanceof BadCredentialsException) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain");
            response.getWriter().write("Niepoprawne dane logowania");
        } else if (exception instanceof DisabledException) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain");
            response.getWriter().write("Konto pomyslnie zarejestrowane. Czeka na weryfikacje przez administratora.");
        } else if (exception instanceof LockedException) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain");
            response.getWriter().write("Konto tymczasowo zablokowane. Zbyt wiele nieudanych prób logowania. Spróbuj ponownie za pare minut.");
        } else {
            response.setContentType("text/plain");
            response.getWriter().write(exception.getLocalizedMessage());
        }
    }
}
