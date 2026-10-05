package com.textile.backend.service;

import com.textile.backend.dto.CustomerRequest;
import com.textile.backend.entity.Customer;
import com.textile.backend.entity.CustomerStatus;
import com.textile.backend.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder) {

        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // GET ALL CUSTOMERS
    // =========================

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {

        return customerRepository.findAll();
    }

    // =========================
    // GET CUSTOMER BY ID
    // =========================

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {

        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: " + id
                        ));
    }

    // =========================
    // GET CUSTOMER BY EMAIL
    // =========================

    @Transactional(readOnly = true)
    public Customer getCustomerByEmail(String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer email is required"
            );
        }

        return customerRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        ));
    }

    // =========================
    // GET CUSTOMER BY CODE
    // =========================

    @Transactional(readOnly = true)
    public Customer getCustomerByCode(
            String customerCode) {

        return customerRepository
                .findByCustomerCode(customerCode)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with code: "
                                        + customerCode
                        ));
    }

    // =========================
    // GET CUSTOMERS BY STATUS
    // =========================

    @Transactional(readOnly = true)
    public List<Customer> getCustomersByStatus(
            CustomerStatus status) {

        return customerRepository.findByStatus(status);
    }

    // =========================
    // SEARCH CUSTOMERS
    // =========================

    @Transactional(readOnly = true)
    public List<Customer> searchCustomers(
            String query) {

        if (query == null ||
                query.trim().isEmpty()) {

            return getAllCustomers();
        }

        return customerRepository
                .searchCustomers(query.trim());
    }

    // =========================
    // CREATE CUSTOMER
    // =========================

    public Customer createCustomer(
            CustomerRequest request) {

        validateCustomerRequest(request);

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        if (customerRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "A customer with this email already exists"
            );
        }

        Customer customer = new Customer();

        // -------------------------
        // Customer Code
        // -------------------------

        if (request.getCustomerCode() != null &&
                !request.getCustomerCode()
                        .trim()
                        .isEmpty()) {

            String code =
                    request.getCustomerCode()
                            .trim();

            if (customerRepository
                    .existsByCustomerCode(code)) {

                throw new RuntimeException(
                        "Customer code already exists"
                );
            }

            customer.setCustomerCode(code);

        } else {

            customer.setCustomerCode(
                    generateCustomerCode()
            );
        }

        // -------------------------
        // Basic Information
        // -------------------------

        customer.setName(
                request.getName().trim()
        );

        customer.setContact(
                request.getContact().trim()
        );

        customer.setEmail(email);

        customer.setCompany(
                request.getCompany().trim()
        );

        customer.setCountry(
                request.getCountry()
        );

        // -------------------------
        // Password
        // -------------------------

        if (request.getPassword() != null &&
                !request.getPassword().isEmpty()) {

            customer.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        // -------------------------
        // Statistics
        // -------------------------

        customer.setTotalOrders(
                request.getTotalOrders() != null
                        ? request.getTotalOrders()
                        : 0
        );

        customer.setTotalValue(
                request.getTotalValue() != null
                        ? request.getTotalValue()
                        : 0.0
        );

        customer.setLastOrder(
                request.getLastOrder()
        );

        customer.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : CustomerStatus.ACTIVE
        );

        return customerRepository.save(customer);
    }

    // =========================
    // CUSTOMER REGISTRATION
    // =========================

    public Customer registerCustomer(
            CustomerRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Registration information is required"
            );
        }

        if (request.getName() == null ||
                request.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Name is required"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (request.getCompany() == null ||
                request.getCompany().trim().isEmpty()) {

            throw new RuntimeException(
                    "Company name is required"
            );
        }

        if (request.getContact() == null ||
                request.getContact().trim().isEmpty()) {

            throw new RuntimeException(
                    "Contact number is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().isEmpty()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        if (request.getPassword().length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters"
            );
        }

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        if (customerRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "A customer with this email already exists"
            );
        }

        Customer customer = new Customer();

        customer.setCustomerCode(
                generateCustomerCode()
        );

        customer.setName(
                request.getName().trim()
        );

        customer.setContact(
                request.getContact().trim()
        );

        customer.setEmail(email);

        customer.setCompany(
                request.getCompany().trim()
        );

        customer.setCountry(
                request.getCountry()
        );

        // IMPORTANT:
        // Customer password is stored only as
        // a BCrypt hash.
        customer.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        customer.setTotalOrders(0);

        customer.setTotalValue(0.0);

        customer.setLastOrder(null);

        customer.setStatus(
                CustomerStatus.ACTIVE
        );

        return customerRepository.save(customer);
    }

    // =========================
    // VERIFY CUSTOMER PASSWORD
    // =========================

    @Transactional(readOnly = true)
    public boolean verifyPassword(
            Customer customer,
            String rawPassword) {

        if (customer == null ||
                rawPassword == null ||
                customer.getPassword() == null) {

            return false;
        }

        return passwordEncoder.matches(
                rawPassword,
                customer.getPassword()
        );
    }

    // =========================
    // UPDATE CUSTOMER
    // =========================

    public Customer updateCustomer(
            Long id,
            CustomerRequest request) {

        Customer customer =
                getCustomerById(id);

        if (request == null) {

            throw new RuntimeException(
                    "Customer information is required"
            );
        }

        // -------------------------
        // Email
        // -------------------------

        if (request.getEmail() != null &&
                !request.getEmail()
                        .trim()
                        .isEmpty()) {

            String newEmail =
                    request.getEmail()
                            .trim()
                            .toLowerCase();

            if (!newEmail.equals(
                    customer.getEmail()
            ) &&
                    customerRepository.existsByEmail(
                            newEmail
                    )) {

                throw new RuntimeException(
                        "A customer with this email already exists"
                );
            }

            customer.setEmail(newEmail);
        }

        // -------------------------
        // Basic Information
        // -------------------------

        if (request.getName() != null &&
                !request.getName()
                        .trim()
                        .isEmpty()) {

            customer.setName(
                    request.getName().trim()
            );
        }

        if (request.getContact() != null &&
                !request.getContact()
                        .trim()
                        .isEmpty()) {

            customer.setContact(
                    request.getContact().trim()
            );
        }

        if (request.getCompany() != null &&
                !request.getCompany()
                        .trim()
                        .isEmpty()) {

            customer.setCompany(
                    request.getCompany().trim()
            );
        }

        if (request.getCountry() != null) {

            customer.setCountry(
                    request.getCountry()
            );
        }

        // -------------------------
        // Password
        // -------------------------

        if (request.getPassword() != null &&
                !request.getPassword().isEmpty()) {

            if (request.getPassword().length() < 6) {

                throw new RuntimeException(
                        "Password must contain at least 6 characters"
                );
            }

            customer.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        // -------------------------
        // Other Information
        // -------------------------

        if (request.getTotalOrders() != null) {

            customer.setTotalOrders(
                    request.getTotalOrders()
            );
        }

        if (request.getStatus() != null) {

            customer.setStatus(
                    request.getStatus()
            );
        }

        if (request.getLastOrder() != null) {

            customer.setLastOrder(
                    request.getLastOrder()
            );
        }

        if (request.getTotalValue() != null) {

            customer.setTotalValue(
                    request.getTotalValue()
            );
        }

        return customerRepository.save(customer);
    }

    // =========================
    // DELETE CUSTOMER
    // =========================

    public void deleteCustomer(Long id) {

        Customer customer =
                getCustomerById(id);

        customerRepository.delete(customer);
    }

    // =========================
    // VALIDATE CREATE REQUEST
    // =========================

    private void validateCustomerRequest(
            CustomerRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Customer information is required"
            );
        }

        if (request.getName() == null ||
                request.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer name is required"
            );
        }

        if (request.getContact() == null ||
                request.getContact().trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer contact is required"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer email is required"
            );
        }

        if (request.getCompany() == null ||
                request.getCompany().trim().isEmpty()) {

            throw new RuntimeException(
                    "Company name is required"
            );
        }
    }

    // =========================
    // GENERATE CUSTOMER CODE
    // =========================

    private String generateCustomerCode() {

        String customerCode;

        do {

            int number =
                    100 + (int) (Math.random() * 900);

            customerCode =
                    "C" + number;

        } while (
                customerRepository
                        .existsByCustomerCode(
                                customerCode
                        )
        );

        return customerCode;
    }
}