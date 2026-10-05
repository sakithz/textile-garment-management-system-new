package com.textile.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class InvoiceRequest {

    @NotBlank(
            message = "Order ID is required"
    )
    private String orderId;

    private LocalDate date;

    private LocalDate dueDate;

    public InvoiceRequest() {
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(
            String orderId
    ) {
        this.orderId = orderId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(
            LocalDate date
    ) {
        this.date = date;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(
            LocalDate dueDate
    ) {
        this.dueDate = dueDate;
    }
}