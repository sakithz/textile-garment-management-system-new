package com.textile.backend.config;

import com.textile.backend.security.AuthTokenFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthTokenFilter authTokenFilter;

    public SecurityConfig(
            AuthTokenFilter authTokenFilter
    ) {
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =========================================================
                // CORS
                // =========================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // =========================================================
                // CSRF
                // =========================================================

                .csrf(csrf ->
                        csrf.disable()
                )


                // =========================================================
                // SESSION
                // =========================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =========================================================
                // AUTHORIZATION
                // =========================================================

                .authorizeHttpRequests(auth -> auth


                        // =================================================
                        // CORS PREFLIGHT
                        // =================================================

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()


                        // =================================================
                        // INTERNAL EMPLOYEE LOGIN
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER AUTHENTICATION
                        // =================================================

                        .requestMatchers(
                                "/api/customer-auth/**"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER QUOTATION CREATION
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/quotations"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER QUOTATION HISTORY
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/quotations/customer/**"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER ORDER HISTORY
                        // =================================================
                        //
                        // Customer Details page uses:
                        //
                        // GET /api/orders/customer/{customerId}
                        //
                        // This MUST be evaluated before the general
                        // /api/orders/** rule below.
                        //

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/customer/**"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER ORDER LOOKUP
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/number/**"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER CAMPAIGNS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/campaigns/active"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER INVOICE
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/invoices/customer/order/**"
                        )
                        .permitAll()


                        // =================================================
                        // CUSTOMER INVOICE PAYMENTS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/payments/invoice/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "FINANCE",
                                "CUSTOMER"
                        )


                        // =================================================
                        // CUSTOMER SUBMITS PAYMENT
                        // =================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/payments/customer/**"
                        )
                        .hasRole("CUSTOMER")


                        // =================================================
                        // USER MANAGEMENT
                        // =================================================

                        .requestMatchers(
                                "/api/users/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // EMPLOYEE MANAGEMENT
                        // =================================================

                        .requestMatchers(
                                "/api/employees/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "OPERATIONS"
                        )


                        // =================================================
                        // ORDER MANAGEMENT
                        // =================================================

                        // CREATE ORDER
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES"
                        )


                        // UPDATE / APPROVE ORDER
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES",
                                "OPERATIONS"
                        )


                        // DELETE ORDER
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/orders/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES"
                        )


                        // PARTIAL ORDER UPDATE
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/orders/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "OPERATIONS"
                        )


                        // =================================================
                        // GENERAL INTERNAL ORDER GET
                        // =================================================
                        //
                        // Finance Officer needs READ access to orders
                        // because the Finance & Billing page loads order
                        // information to calculate/display billing data.
                        //
                        // Finance is intentionally NOT included in POST,
                        // PUT, PATCH or DELETE permissions above.
                        //

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES",
                                "OPERATIONS",
                                "FINANCE"
                        )


                        // =================================================
                        // CUSTOMER MANAGEMENT
                        // =================================================

                        .requestMatchers(
                                "/api/customers/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "SALES"
                        )


                        // =================================================
                        // INVENTORY
                        // =================================================

                        .requestMatchers(
                                "/api/inventory/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "INVENTORY",
                                "PRODUCTION"
                        )


                        // =================================================
                        // DELIVERY ACCESS TO PRODUCTION TASKS
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/production/tasks"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "OPERATIONS",
                                "PRODUCTION",
                                "DELIVERY"
                        )


                        // =================================================
                        // PRODUCTION
                        // =================================================

                        .requestMatchers(
                                "/api/production/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "OPERATIONS",
                                "PRODUCTION"
                        )


                        // =================================================
                        // DELIVERY
                        // =================================================

                        .requestMatchers(
                                "/api/deliveries/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "OPERATIONS",
                                "DELIVERY"
                        )


                        // =================================================
                        // FINANCE / INVOICES
                        // =================================================
                        //
                        // Customer invoice endpoint is defined above.
                        //
                        // Other invoice endpoints are available to:
                        // ADMIN and FINANCE.
                        //

                        .requestMatchers(
                                "/api/invoices/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "FINANCE"
                        )


                        // =================================================
                        // MARKETING / CAMPAIGNS
                        // =================================================

                        .requestMatchers(
                                "/api/campaigns/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "MARKETING"
                        )


                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest()
                        .authenticated()
                )


                // =========================================================
                // JWT / TOKEN FILTER
                // =========================================================

                .addFilterBefore(
                        authTokenFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:8443",
                        "http://127.0.0.1:8443",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "X-Requested-With",
                        "Origin"
                )
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}