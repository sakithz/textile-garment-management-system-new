package com.textile.backend.dto;

import com.textile.backend.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public class PaymentRequest {

    @NotNull(
            message = "Payment amount is required"
    )
    @Positive(
            message = "Payment amount must be greater than zero"
    )
    private Double amountPaid;

    private LocalDate paymentDate;

    @NotNull(
            message = "Payment method is required"
    )
    private PaymentMethod paymentMethod;

    private String referenceNo;

    public PaymentRequest() {
    }

    public Double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(
            Double amountPaid
    ) {
        this.amountPaid =
                amountPaid;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(
            LocalDate paymentDate
    ) {
        this.paymentDate =
                paymentDate;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(
            PaymentMethod paymentMethod
    ) {
        this.paymentMethod =
                paymentMethod;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setReferenceNo(
            String referenceNo
    ) {
        this.referenceNo =
                referenceNo;
    }
}