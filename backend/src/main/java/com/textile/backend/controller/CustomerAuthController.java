package com.textile.backend.controller;

import com.textile.backend.dto.CustomerRequest;
import com.textile.backend.entity.Customer;
import com.textile.backend.entity.CustomerStatus;
import com.textile.backend.security.AuthTokenService;
import com.textile.backend.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/customer-auth")
@CrossOrigin(origins = "*")
public class CustomerAuthController {


    private final CustomerService customerService;

    private final AuthTokenService authTokenService;


    public CustomerAuthController(
            CustomerService customerService,
            AuthTokenService authTokenService
    ) {

        this.customerService =
                customerService;

        this.authTokenService =
                authTokenService;
    }


    // ============================================================
    // CUSTOMER REGISTER
    // ============================================================

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(
            @Valid @RequestBody CustomerRequest request
    ) {

        try {

            Customer customer =
                    customerService.registerCustomer(
                            request
                    );


            /*
             * Create customer authentication token
             * immediately after registration.
             */
            String token =
                    authTokenService.createCustomerToken(
                            customer.getId()
                    );


            Map<String, Object> response =
                    createSafeCustomerResponse(
                            customer
                    );


            response.put(
                    "token",
                    token
            );


            response.put(
                    "message",
                    "Registration successful"
            );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);


        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            createErrorResponse(
                                    e.getMessage()
                            )
                    );
        }
    }


    // ============================================================
    // CUSTOMER LOGIN
    // ============================================================

    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(
            @RequestBody Map<String, String> request
    ) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                createErrorResponse(
                                        "Login information is required"
                                )
                        );
            }


            String email =
                    request.get("email");


            String password =
                    request.get("password");


            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                createErrorResponse(
                                        "Email is required"
                                )
                        );
            }


            if (password == null ||
                    password.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                createErrorResponse(
                                        "Password is required"
                                )
                        );
            }


            Customer customer =
                    customerService.getCustomerByEmail(
                            email.trim()
                    );


            if (!customerService.verifyPassword(
                    customer,
                    password
            )) {

                return ResponseEntity
                        .status(
                                HttpStatus.UNAUTHORIZED
                        )
                        .body(
                                createErrorResponse(
                                        "Invalid email or password"
                                )
                        );
            }


            if (customer.getStatus() !=
                    CustomerStatus.ACTIVE) {

                return ResponseEntity
                        .status(
                                HttpStatus.FORBIDDEN
                        )
                        .body(
                                createErrorResponse(
                                        "Customer account is not active"
                                )
                        );
            }


            /*
             * Create a customer-specific token.
             *
             * This is NOT the internal User token.
             */
            String token =
                    authTokenService.createCustomerToken(
                            customer.getId()
                    );


            Map<String, Object> response =
                    createSafeCustomerResponse(
                            customer
                    );


            response.put(
                    "token",
                    token
            );


            response.put(
                    "message",
                    "Login successful"
            );


            return ResponseEntity.ok(
                    response
            );


        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(
                            createErrorResponse(
                                    "Invalid email or password"
                            )
                    );
        }
    }


    // ============================================================
    // CUSTOMER PROFILE
    // ============================================================

    @GetMapping("/profile/{customerId}")
    public ResponseEntity<?> getCustomerProfile(
            @PathVariable Long customerId
    ) {

        try {

            Customer customer =
                    customerService.getCustomerById(
                            customerId
                    );


            return ResponseEntity.ok(
                    createSafeCustomerResponse(
                            customer
                    )
            );


        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body(
                            createErrorResponse(
                                    e.getMessage()
                            )
                    );
        }
    }


    // ============================================================
    // SAFE CUSTOMER RESPONSE
    // ============================================================

    private Map<String, Object> createSafeCustomerResponse(
            Customer customer
    ) {

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "id",
                customer.getId()
        );


        response.put(
                "customerCode",
                customer.getCustomerCode()
        );


        response.put(
                "name",
                customer.getName()
        );


        response.put(
                "contact",
                customer.getContact()
        );


        response.put(
                "email",
                customer.getEmail()
        );


        response.put(
                "company",
                customer.getCompany()
        );


        response.put(
                "country",
                customer.getCountry()
        );


        response.put(
                "totalOrders",
                customer.getTotalOrders()
        );


        response.put(
                "status",
                customer.getStatus()
        );


        response.put(
                "lastOrder",
                customer.getLastOrder()
        );


        response.put(
                "totalValue",
                customer.getTotalValue()
        );


        /*
         * NEVER return customer.password.
         */
        return response;
    }


    // ============================================================
    // ERROR RESPONSE
    // ============================================================

    private Map<String, Object> createErrorResponse(
            String message
    ) {

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "message",
                message
        );


        response.put(
                "error",
                message
        );


        return response;
    }
}