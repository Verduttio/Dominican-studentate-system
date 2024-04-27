package org.verduttio.dominicanappbackend.security.apiauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.verduttio.dominicanappbackend.dto.user.UserShortInfo;
import org.verduttio.dominicanappbackend.entity.User;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.security.UserDetailsImpl;

import java.io.IOException;

@Component
public class ApiAuthAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final UserRepository userRepository;

    @Autowired
    public ApiAuthAuthenticationSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();
        UserShortInfo userShortInfo;

        if (principal instanceof UserDetails) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            User user = userDetails.getUser();
            userShortInfo = new UserShortInfo(user.getId(), user.getName(), user.getSurname());

            User userDb = userRepository.findByEmail(user.getEmail()).orElseThrow();
            userDb.setFailedLoginAttempts(0);
            userDb.setLockTime(null);
            userRepository.save(userDb);
        } else {
            userShortInfo = new UserShortInfo(0L, "Unknown", "Unknown");
        }

        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), userShortInfo);
    }
}
