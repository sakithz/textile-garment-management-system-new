package com.textile.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "quotations",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = "quotation_number"
                )
        }
)
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // QUOTATION NUMBER
    // =========================================================

    @Column(
            name = "quotation_number",
            nullable = false,
            unique = true
    )
    private String quotationNumber;

    // =========================================================
    // CUSTOMER
    // =========================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    // =========================================================
    // CAMPAIGN / OFFER
    // =========================================================
    /*
     * We store the campaign ID and snapshot information.
     *
     * campaignId:
     * Identifies the marketing campaign selected by
     * the customer.
     *
     * campaignName:
     * Stores the campaign name at quotation time.
     *
     * discountPercent:
     * Stores the discount percentage actually applied
     * to this quotation.
     *
     * Keeping the discount percentage here is important
     * because the campaign may later be edited or expired.
     * The quotation should keep the discount that was
     * actually applied to it.
     */

    @Column(name = "campaign_id")
    private Long campaignId;

    @Column(name = "campaign_name")
    private String campaignName;

    @Column(name = "discount_percent")
    private Double discountPercent;

    // =========================================================
    // QUOTATION DETAILS
    // =========================================================

    @Column(nullable = false)
    private String garmentType;

    @Column(nullable = false)
    private Integer quantity;

    private String fabric;

    private String color;

    private String size;

    private LocalDate requestedDeliveryDate;

    @Column(length = 2000)
    private String customerMessage;

    // =========================================================
    // SALES / PRICING DETAILS
    // =========================================================

    /*
     * Base price entered by the Sales Executive
     * before applying the campaign discount.
     */
    private Double baseUnitPrice;

    /*
     * Final unit price after campaign discount.
     *
     * Example:
     * Base = 800
     * Discount = 15%
     * Final = 680
     */
    private Double unitPrice;

    /*
     * Final quotation total.
     *
     * unitPrice × quantity
     */
    private Double totalPrice;

    private LocalDate confirmedDeliveryDate;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private QuotationStatus status;

    private LocalDate createdAt;

    private LocalDate reviewedAt;

    @Column(length = 1000)
    private String rejectionReason;

    // =========================================================
    // ORDER RELATIONSHIP
    // =========================================================

    @JsonIgnore
    @OneToOne(
            mappedBy = "quotation",
            fetch = FetchType.LAZY
    )
    private Order order;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Quotation() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuotationNumber() {
        return quotationNumber;
    }

    public void setQuotationNumber(
            String quotationNumber
    ) {
        this.quotationNumber = quotationNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(
            Customer customer
    ) {
        this.customer = customer;
    }

    public Long getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(
            Long campaignId
    ) {
        this.campaignId = campaignId;
    }

    public String getCampaignName() {
        return campaignName;
    }

    public void setCampaignName(
            String campaignName
    ) {
        this.campaignName = campaignName;
    }

    public Double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(
            Double discountPercent
    ) {
        this.discountPercent = discountPercent;
    }

    public String getGarmentType() {
        return garmentType;
    }

    public void setGarmentType(
            String garmentType
    ) {
        this.garmentType = garmentType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(
            Integer quantity
    ) {
        this.quantity = quantity;
    }

    public String getFabric() {
        return fabric;
    }

    public void setFabric(
            String fabric
    ) {
        this.fabric = fabric;
    }

    public String getColor() {
        return color;
    }

    public void setColor(
            String color
    ) {
        this.color = color;
    }

    public String getSize() {
        return size;
    }

    public void setSize(
            String size
    ) {
        this.size = size;
    }

    public LocalDate getRequestedDeliveryDate() {
        return requestedDeliveryDate;
    }

    public void setRequestedDeliveryDate(
            LocalDate requestedDeliveryDate
    ) {
        this.requestedDeliveryDate =
                requestedDeliveryDate;
    }

    public String getCustomerMessage() {
        return customerMessage;
    }

    public void setCustomerMessage(
            String customerMessage
    ) {
        this.customerMessage =
                customerMessage;
    }

    public Double getBaseUnitPrice() {
        return baseUnitPrice;
    }

    public void setBaseUnitPrice(
            Double baseUnitPrice
    ) {
        this.baseUnitPrice =
                baseUnitPrice;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(
            Double unitPrice
    ) {
        this.unitPrice = unitPrice;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(
            Double totalPrice
    ) {
        this.totalPrice = totalPrice;
    }

    public LocalDate getConfirmedDeliveryDate() {
        return confirmedDeliveryDate;
    }

    public void setConfirmedDeliveryDate(
            LocalDate confirmedDeliveryDate
    ) {
        this.confirmedDeliveryDate =
                confirmedDeliveryDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(
            Priority priority
    ) {
        this.priority = priority;
    }

    public QuotationStatus getStatus() {
        return status;
    }

    public void setStatus(
            QuotationStatus status
    ) {
        this.status = status;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDate createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDate getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(
            LocalDate reviewedAt
    ) {
        this.reviewedAt = reviewedAt;
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

    public Order getOrder() {
        return order;
    }

    public void setOrder(
            Order order
    ) {
        this.order = order;
    }
}