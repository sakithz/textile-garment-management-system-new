package com.textile.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "invoice_id",
            nullable = false
    )
    @JsonIgnore
    private Invoice invoice;

    @Column(
            name = "amount_paid",
            nullable = false
    )
    private Double amountPaid;

    @Column(
            name = "payment_date",
            nullable = false
    )
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "payment_method",
            nullable = false
    )
    private PaymentMethod paymentMethod;

    @Column(
            name = "reference_no"
    )
    private String referenceNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status =
            PaymentStatus.PENDING;

    @Column(
            name = "recorded_by_user_id"
    )
    private Long recordedByUserId;

    @Column(
            name = "rejection_reason",
            length = 1000
    )
    private String rejectionReason;

    public Payment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(
            Invoice invoice
    ) {
        this.invoice = invoice;
    }

    @Transient
    public Long getInvoiceId() {

        return invoice != null
                ? invoice.getId()
                : null;
    }

    @Transient
    public String getInvoiceNumber() {

        return invoice != null
                ? invoice.getInvoiceNumber()
                : null;
    }

    @Transient
    public String getOrderId() {

        return invoice != null
                ? invoice.getOrderId()
                : null;
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

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(
            PaymentStatus status
    ) {
        this.status = status;
    }

    public Long getRecordedByUserId() {
        return recordedByUserId;
    }

    public void setRecordedByUserId(
            Long recordedByUserId
    ) {
        this.recordedByUserId =
                recordedByUserId;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(
            String rejectionReason
    ) {
        this.rejectionReason =
                rejectionReason;
    }
}