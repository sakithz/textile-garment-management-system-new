package com.textile.backend.controller;

import com.textile.backend.dto.CustomerRequest;
import com.textile.backend.entity.Customer;
import com.textile.backend.entity.CustomerStatus;
import com.textile.backend.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // =========================
    // GET ALL CUSTOMERS
    // =========================

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                customerService.getAllCustomers()
        );
    }

    // =========================
    // GET CUSTOMER BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                customerService.getCustomerById(id)
        );
    }

    // =========================
    // GET CUSTOMER BY EMAIL
    // =========================

    @GetMapping("/email/{email}")
    public ResponseEntity<Customer> getCustomerByEmail(
            @PathVariable String email) {

        return ResponseEntity.ok(
                customerService.getCustomerByEmail(email)
        );
    }

    // =========================
    // GET CUSTOMER BY CODE
    // =========================

    @GetMapping("/code/{customerCode}")
    public ResponseEntity<Customer> getCustomerByCode(
            @PathVariable String customerCode) {

        return ResponseEntity.ok(
                customerService.getCustomerByCode(
                        customerCode
                )
        );
    }

    // =========================
    // SEARCH CUSTOMERS
    // =========================

    @GetMapping("/search")
    public ResponseEntity<List<Customer>> searchCustomers(
            @RequestParam String query) {

        return ResponseEntity.ok(
                customerService.searchCustomers(query)
        );
    }

    // =========================
    // GET CUSTOMERS BY STATUS
    // =========================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Customer>> getCustomersByStatus(
            @PathVariable CustomerStatus status) {

        return ResponseEntity.ok(
                customerService.getCustomersByStatus(status)
        );
    }

    // =========================
    // CREATE CUSTOMER
    // =========================

    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @Valid @RequestBody CustomerRequest request) {

        return ResponseEntity.ok(
                customerService.createCustomer(request)
        );
    }

    // =========================
    // UPDATE CUSTOMER
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {

        return ResponseEntity.ok(
                customerService.updateCustomer(
                        id,
                        request
                )
        );
    }

    // =========================
    // DELETE CUSTOMER
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.noContent().build();
    }
}