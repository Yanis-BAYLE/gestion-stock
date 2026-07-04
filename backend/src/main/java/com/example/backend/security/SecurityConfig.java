package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";
    private static final String GESTIONNAIRE = "GESTIONNAIRE";
    private static final String LECTEUR = "LECTEUR";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/products.html",
                                "/css/**",
                                "/js/**"
                        ).permitAll()

                        .requestMatchers("/api/me").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/products/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE, LECTEUR)

                        .requestMatchers(HttpMethod.POST, "/api/products/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE)

                        .requestMatchers(HttpMethod.PUT, "/api/products/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE)

                        .requestMatchers(HttpMethod.DELETE, "/api/products/**")
                        .hasRole(ADMIN)

                        .requestMatchers(HttpMethod.GET, "/api/categories/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE, LECTEUR)

                        .requestMatchers(HttpMethod.POST, "/api/categories/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE)

                        .requestMatchers(HttpMethod.GET, "/api/suppliers/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE, LECTEUR)

                        .requestMatchers(HttpMethod.POST, "/api/suppliers/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE)

                        .requestMatchers(HttpMethod.GET, "/api/stock-movements/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE, LECTEUR)

                        .requestMatchers(HttpMethod.POST, "/api/stock-movements/**")
                        .hasAnyRole(ADMIN, GESTIONNAIRE)

                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults())
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}