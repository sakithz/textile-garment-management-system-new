package com.textile.backend.dto;

import com.textile.backend.entity.CustomerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

public class CustomerRequest {

    // =========================
    // CUSTOMER CODE
    // =========================

    private String customerCode;

    // =========================
    // CUSTOMER INFORMATION
    // =========================

    @NotBlank(message = "Customer contact name is required")
    private String name;

    @NotBlank(message = "Contact phone is required")
    private String contact;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Company name is required")
    private String company;

    private String country;

    // =========================
    // CUSTOMER PASSWORD
    // =========================

    private String password;

    // =========================
    // CUSTOMER STATISTICS
    // =========================

    @PositiveOrZero(
            message = "Total orders cannot be negative"
    )
    private Integer totalOrders;

    private CustomerStatus status;

    private LocalDate lastOrder;

    @PositiveOrZero(
            message = "Total value cannot be negative"
    )
    private Double totalValue;

    // =========================
    // CONSTRUCTOR
    // =========================

    public CustomerRequest() {
    }

    // =========================
    // GETTERS AND SETTERS
    // =========================

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public CustomerStatus getStatus() {
        return status;
    }

    public void setStatus(CustomerStatus status) {
        this.status = status;
    }

    public LocalDate getLastOrder() {
        return lastOrder;
    }

    public void setLastOrder(LocalDate lastOrder) {
        this.lastOrder = lastOrder;
    }

    public Double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(Double totalValue) {
        this.totalValue = totalValue;
    }
}