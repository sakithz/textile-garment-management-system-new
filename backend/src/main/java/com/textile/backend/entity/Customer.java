package com.textile.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "customers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "customer_code"),
                @UniqueConstraint(columnNames = "email")
        }
)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // CUSTOMER CODE
    // =========================

    @Column(
            name = "customer_code",
            nullable = false,
            unique = true
    )
    private String customerCode;

    // =========================
    // CUSTOMER INFORMATION
    // =========================

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String contact;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String company;

    private String country;

    // =========================
    // CUSTOMER PASSWORD
    // =========================

    @JsonIgnore
    @Column(name = "password")
    private String password;

    // =========================
    // CUSTOMER STATISTICS
    // =========================

    private Integer totalOrders = 0;

    @Enumerated(EnumType.STRING)
    private CustomerStatus status = CustomerStatus.ACTIVE;

    private LocalDate lastOrder;

    private Double totalValue = 0.0;

    // =========================
    // CONSTRUCTOR
    // =========================

    public Customer() {
    }

    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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