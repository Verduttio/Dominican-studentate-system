package org.verduttio.dominicanappbackend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.session.ConcurrentSessionControlAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.savedrequest.NullRequestCache;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.session.Session;
import org.springframework.session.jdbc.JdbcIndexedSessionRepository;
import org.springframework.session.security.SpringSessionBackedSessionRegistry;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.verduttio.dominicanappbackend.repository.UserRepository;
import org.verduttio.dominicanappbackend.security.apiauth.ApiAuthAuthenticationFailureHandler;
import org.verduttio.dominicanappbackend.security.apiauth.ApiAuthAuthenticationSuccessHandler;
import org.verduttio.dominicanappbackend.security.apiauth.LoginFilter;
import org.verduttio.dominicanappbackend.security.oauth2.CustomOAuth2UserService;
import org.verduttio.dominicanappbackend.security.oauth2.OAuth2AuthenticationFailureHandler;
import org.verduttio.dominicanappbackend.security.oauth2.OAuth2AuthenticationSuccessHandler;
import org.verduttio.dominicanappbackend.util.EnvUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@Profile({"!integration_tests"})   // To work tests
public class SecurityConfig {
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final JdbcIndexedSessionRepository jdbcIndexedSessionRepository;
    private final ObjectMapper mapper;
    private final UserRepository userRepository;
    private final EnvUtils envUtils;

    public SecurityConfig(UserDetailsServiceImpl userDetailsServiceImpl, BCryptPasswordEncoder bCryptPasswordEncoder,
                          CustomOAuth2UserService customOAuth2UserService, JdbcIndexedSessionRepository jdbcIndexedSessionRepository, ObjectMapper mapper, UserRepository userRepository, EnvUtils envUtils) {
        this.userDetailsServiceImpl = userDetailsServiceImpl;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.customOAuth2UserService = customOAuth2UserService;
        this.jdbcIndexedSessionRepository = jdbcIndexedSessionRepository;
        this.mapper = mapper;
        this.userRepository = userRepository;
        this.envUtils = envUtils;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .addFilterBefore(loginFilter(), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/api/users/login").permitAll()
                        .requestMatchers("/api/users/register").permitAll()
                        .requestMatchers("/api/users/current/check").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers("api/users/{userId}/verification/assignRoles").hasRole("ADMIN")
//                        .requestMatchers("api/users/{userId}/password").hasRole("ADMIN") || user.id == loggedInUser.id  // done in service
//                        .requestMatchers("api/users/{userId}/name_surname").hasRole("ADMIN") || user.id == loggedInUser.id  // done in service
                        .requestMatchers("api/schedules/forWholePeriod").hasRole("FUNKCYJNY")
                        .requestMatchers("api/schedules/forDailyPeriod").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.DELETE, "api/users/{userId}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "api/users/{userId}/roles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "api/users/{userId}/verification/assignRoles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "api/obstacles").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "api/obstacles").hasRole("ADMIN")
//                        .requestMatchers(HttpMethod.GET, "api/obstacles/{obstacleId}").hasRole("ADMIN")   || obstacle.user.id == loggedInUser.id --> check in service
//                        .requestMatchers(HttpMethod.DELETE, "api/obstacles/{obstacleId}").hasRole("ADMIN") || obstacle.user.id == loggedInUser.id --> check in service
                        .requestMatchers(HttpMethod.PATCH, "api/obstacles/{obstacleId}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "api/tasks/{taskId}").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.POST, "api/tasks").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.POST, "api/conflicts").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.PUT, "api/conflicts/{conflictId}").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.DELETE, "api/conflicts/{conflictId}").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.POST, "api/roles").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.DELETE, "api/roles/{roleId}").hasRole("FUNKCYJNY")
                        .requestMatchers(HttpMethod.PUT, "api/roles/{roleId}").hasRole("FUNKCYJNY")
                        .anyRequest().authenticated()
                )
                .sessionManagement((sessionManagement) -> sessionManagement
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .securityContext((securityContext) -> securityContext
                        .securityContextRepository(securityContextRepository())
                )
                .anonymous(AbstractHttpConfigurer::disable)
                .requestCache((cache) -> cache.requestCache(new NullRequestCache()))
                .logout((logout) -> logout
                        .logoutUrl("/api/users/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("SESSION")
                        .permitAll()
                )
                .exceptionHandling((exceptionHandling) -> exceptionHandling
                        .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                )
                .oauth2Login((oauth2Login) -> oauth2Login
                        .successHandler(oAuth2AuthenticationSuccessHandler())
                        .failureHandler(oAuth2AuthenticationFailureHandler())
                        .userInfoEndpoint((userInfoEndpoint) -> userInfoEndpoint
                                .userService(customOAuth2UserService)
                        )
                        .permitAll())
                .cors((cors) -> cors
                        .configurationSource(corsConfigurationSource())
                )
                .csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public LoginFilter loginFilter() {
        return new LoginFilter(mapper, authenticationManager(), securityContextRepository(),
                sessionAuthenticationStrategy(), apiAuthAuthenticationSuccessHandler(), apiAuthAuthenticationFailureHandler(),
                userRepository);
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public ApiAuthAuthenticationSuccessHandler apiAuthAuthenticationSuccessHandler() {
        return new ApiAuthAuthenticationSuccessHandler(userRepository);
    }

    @Bean
    public ApiAuthAuthenticationFailureHandler apiAuthAuthenticationFailureHandler() {
        return new ApiAuthAuthenticationFailureHandler(userRepository);
    }

    @Bean
    public SpringSessionBackedSessionRegistry<? extends Session> sessionRegistry() {
        return new SpringSessionBackedSessionRegistry<>(jdbcIndexedSessionRepository);
    }

    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsServiceImpl);
        authenticationProvider.setPasswordEncoder(bCryptPasswordEncoder);

        ProviderManager providerManager = new ProviderManager(authenticationProvider);
        providerManager.setEraseCredentialsAfterAuthentication(false);

        return providerManager;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost", envUtils.getAppEnvVariable("FRONTEND_URL")));
        configuration.setAllowedMethods(Arrays.asList("GET","POST", "PUT", "PATCH", "DELETE"));
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler() {
        return new OAuth2AuthenticationSuccessHandler(securityContextRepository(), envUtils);
    }

    @Bean
    public OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler() {
        return new OAuth2AuthenticationFailureHandler(envUtils);
    }

    @Bean
    public SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        ConcurrentSessionControlAuthenticationStrategy sessionControlAuthenticationStrategy = new ConcurrentSessionControlAuthenticationStrategy(sessionRegistry());
        sessionControlAuthenticationStrategy.setMaximumSessions(1);
//        TODO: Catch exception and then remove last session to allow new login
        sessionControlAuthenticationStrategy.setExceptionIfMaximumExceeded(false);
        return sessionControlAuthenticationStrategy;
    }

    @Bean
    public FilterRegistrationBean<LoginFilter> loginFilterRegistration() {
        FilterRegistrationBean<LoginFilter> registration = new FilterRegistrationBean<LoginFilter>(loginFilter());
        registration.setEnabled(false);
        return registration;
    }

}
