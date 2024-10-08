package org.verduttio.dominicanappbackend.integrationtest.utility;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.NullSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.session.Session;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.session.security.SpringSessionBackedSessionRegistry;
import org.verduttio.dominicanappbackend.security.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@Profile("integration_tests")
public class TestSecurityConfig {
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JdbcIndexedSessionRepository jdbcIndexedSessionRepository;

    public TestSecurityConfig(UserDetailsServiceImpl userDetailsServiceImpl, BCryptPasswordEncoder bCryptPasswordEncoder, JdbcIndexedSessionRepository jdbcIndexedSessionRepository) {
        this.userDetailsServiceImpl = userDetailsServiceImpl;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jdbcIndexedSessionRepository = jdbcIndexedSessionRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .anyRequest().permitAll()
                )
                .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsServiceImpl);
        authenticationProvider.setPasswordEncoder(bCryptPasswordEncoder);

        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new NullSecurityContextRepository();
    }

    @Bean
    public SpringSessionBackedSessionRegistry<? extends Session> sessionRegistry() {
        return new SpringSessionBackedSessionRegistry<>(jdbcIndexedSessionRepository);
    }
}

