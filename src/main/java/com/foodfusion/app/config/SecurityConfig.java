package com.foodfusion.app.config;

import com.foodfusion.app.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public AuthenticationSuccessHandler roleBasedAuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            String redirectUrl = "/app#/home";
            for (GrantedAuthority auth : authentication.getAuthorities()) {
                String authority = auth.getAuthority();
                if ("ROLE_ADMIN".equals(authority)) {
                    redirectUrl = "/app#/dashboard";
                    break;
                } else if ("ROLE_OWNER".equals(authority)) {
                    redirectUrl = "/app#/dashboard";
                    break;
                } else if ("ROLE_DELIVERY".equals(authority)) {
                    redirectUrl = "/app#/dashboard";
                    break;
                }
            }
            response.sendRedirect(redirectUrl);
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Configure Session Security Context Repository
        http.securityContext(context -> context.securityContextRepository(securityContextRepository()));

        // H2 Console frame options
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));

        // CSRF Configuration for H2 Console & Cookie repository for SPA API calls
        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        // Defer resolution of token
        requestHandler.setCsrfRequestAttributeName(null);

        http.csrf(csrf -> csrf
                .csrfTokenRepository(tokenRepository)
                .csrfTokenRequestHandler(requestHandler)
                .ignoringRequestMatchers("/h2-console/**")
        );

        // Add filter to resolve and push CSRF token into cookie for each request
        http.addFilterAfter(new CsrfCookieFilter(), UsernamePasswordAuthenticationFilter.class);

        // Path authorization
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/",
                        "/app",
                        "/app/**",
                        "/landing.html",
                        "/index.html",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/favicon.ico",
                        "/api/auth/**",
                        "/h2-console/**"
                ).permitAll()
                .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/owner/**", "/api/owner/**").hasRole("OWNER")
                .requestMatchers("/delivery/**", "/api/delivery/**").hasRole("DELIVERY")
                .requestMatchers("/cart/**", "/api/cart/**").hasRole("CUSTOMER")
                .requestMatchers("/orders/**", "/api/orders/**").hasRole("CUSTOMER")
                .requestMatchers("/restaurant/**", "/restaurants/**", "/api/restaurant/**", "/api/restaurants/**", "/api/features/**").authenticated()
                .anyRequest().authenticated()
        );

        // Login & Logout Configuration
        http.formLogin(form -> form
                .loginPage("/landing.html")
                .loginProcessingUrl("/api/auth/login-form")
                .successHandler(roleBasedAuthenticationSuccessHandler())
                .permitAll()
        );

        http.logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\": \"Logged out successfully\"}");
                })
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
        );

        // Custom REST Exception Handling
        http.exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                        (req, res, authException) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\": \"Unauthorized access. Please log in.\"}");
                        },
                        PathPatternRequestMatcher.pathPattern("/api/**")
                )
                .defaultAccessDeniedHandlerFor(
                        (req, res, accessDeniedException) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json");
                            res.getWriter().write("{\"error\": \"Access denied. Insufficient permissions.\"}");
                        },
                        PathPatternRequestMatcher.pathPattern("/api/**")
                )
        );

        return http.build();
    }

    private static class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                csrfToken.getToken(); // Forces resolution and cookie generation
            }
            filterChain.doFilter(request, response);
        }
    }
}
