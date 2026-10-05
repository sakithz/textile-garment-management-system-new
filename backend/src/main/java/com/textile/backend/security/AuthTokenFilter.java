package com.textile.backend.security;

import com.textile.backend.entity.Customer;
import com.textile.backend.entity.User;
import com.textile.backend.repository.CustomerRepository;
import com.textile.backend.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;


@Component
public class AuthTokenFilter
        extends OncePerRequestFilter {


    private final AuthTokenService tokenService;

    private final UserRepository userRepository;

    private final CustomerRepository customerRepository;


    public AuthTokenFilter(
            AuthTokenService tokenService,
            UserRepository userRepository,
            CustomerRepository customerRepository
    ) {

        this.tokenService =
                tokenService;

        this.userRepository =
                userRepository;

        this.customerRepository =
                customerRepository;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    )
            throws ServletException, IOException {


        /*
         * Always start with a clean security context
         * for the current request.
         */
        SecurityContextHolder.clearContext();


        String header =
                request.getHeader(
                        HttpHeaders.AUTHORIZATION
                );


        /*
         * Expected format:
         *
         * Authorization: Bearer <token>
         */
        if (header != null &&
                header.startsWith("Bearer ")) {


            String token =
                    header
                            .substring(7)
                            .trim();


            /*
             * =====================================================
             * CUSTOMER TOKEN
             * =====================================================
             *
             * Customer tokens start with C:<customerId>
             */
            Long customerId =
                    tokenService.getCustomerId(
                            token
                    );


            if (customerId != null) {


                customerRepository
                        .findById(customerId)


                        .filter(
                                customer ->
                                        customer.getStatus() != null
                                                &&
                                                customer.getStatus()
                                                        .name()
                                                        .equals("ACTIVE")
                        )


                        .ifPresent(
                                this::authenticateCustomer
                        );


            } else {


                /*
                 * =================================================
                 * INTERNAL EMPLOYEE / USER TOKEN
                 * =================================================
                 *
                 * Employee tokens start with U:<userId>
                 */
                Long userId =
                        tokenService.getUserId(
                                token
                        );


                if (userId != null) {


                    userRepository
                            .findById(userId)


                            /*
                             * Only active internal users
                             * can authenticate.
                             */
                            .filter(
                                    user ->
                                            Boolean.TRUE.equals(
                                                    user.getActive()
                                            )
                            )


                            .ifPresent(
                                    this::authenticateUser
                            );
                }
            }
        }


        filterChain.doFilter(
                request,
                response
        );
    }


    /*
     * ============================================================
     * INTERNAL USER AUTHENTICATION
     * ============================================================
     */
    private void authenticateUser(
            User user
    ) {


        /*
         * Example:
         *
         * ADMIN
         *      -> ROLE_ADMIN
         *
         * SALES
         *      -> ROLE_SALES
         *
         * OPERATIONS
         *      -> ROLE_OPERATIONS
         */
        var authorities =
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_"
                                        + user.getRole()
                                        .name()
                        )
                );


        var authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getId().toString(),
                        null,
                        authorities
                );


        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        authentication
                );
    }


    /*
     * ============================================================
     * CUSTOMER AUTHENTICATION
     * ============================================================
     *
     * Customers are deliberately given ROLE_CUSTOMER.
     *
     * They must NOT receive ADMIN / SALES / OPERATIONS roles.
     */
    private void authenticateCustomer(
            Customer customer
    ) {


        var authorities =
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_CUSTOMER"
                        )
                );


        var authentication =
                new UsernamePasswordAuthenticationToken(
                        customer.getId().toString(),
                        null,
                        authorities
                );


        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        authentication
                );
    }
}