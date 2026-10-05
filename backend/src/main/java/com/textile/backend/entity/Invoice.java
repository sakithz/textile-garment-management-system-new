package com.textile.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "invoice_number",
            unique = true,
            nullable = false
    )
    private String invoiceNumber;

    @Column(
            name = "order_id",
            nullable = false
    )
    private String orderId;

    @Column(nullable = false)
    private String customer;

    /*
     * Final invoice amount after discount.
     */
    @Column(nullable = false)
    private Double amount;

    /*
     * Amount before campaign discount.
     */
    @Column(name = "base_amount")
    private Double baseAmount;

    /*
     * Campaign / offer discount percentage.
     */
    @Column(name = "discount_percent")
    private Double discountPercent;

    /*
     * Actual monetary discount.
     */
    @Column(name = "discount_amount")
    private Double discountAmount;

    /*
     * Snapshot of the campaign name.
     */
    @Column(name = "campaign_name")
    private String campaignName;

    /*
     * Amount already verified as paid.
     */
    @Column(name = "amount_paid")
    private Double amountPaid = 0.0;

    @Column(nullable = false)
    private LocalDate date;

    @Column(
            name = "due_date",
            nullable = false
    )
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status =
            InvoiceStatus.PENDING;

    public Invoice() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(
            String invoiceNumber
    ) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(
            String orderId
    ) {
        this.orderId = orderId;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(
            String customer
    ) {
        this.customer = customer;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(
            Double amount
    ) {
        this.amount = amount;
    }

    public Double getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(
            Double baseAmount
    ) {
        this.baseAmount = baseAmount;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(
            Double discountPercent
    ) {
        this.discountPercent =
                discountPercent;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(
            Double discountAmount
    ) {
        this.discountAmount =
                discountAmount;
    }

    public String getCampaignName() {
        return campaignName;
    }

    public void setCampaignName(
            String campaignName
    ) {
        this.campaignName =
                campaignName;
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

    @Transient
    public Double getBalanceDue() {

        double total =
                amount != null
                        ? amount
                        : 0.0;

        double paid =
                amountPaid != null
                        ? amountPaid
                        : 0.0;

        return Math.max(
                total - paid,
                0.0
        );
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

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(
            InvoiceStatus status
    ) {
        this.status = status;
    }
}