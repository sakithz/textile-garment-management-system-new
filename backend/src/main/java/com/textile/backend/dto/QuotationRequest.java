package com.textile.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class QuotationRequest {

    // =========================================================
    // CUSTOMER
    // =========================================================

    @NotNull(
            message = "Customer is required"
    )
    private Long customerId;

    // =========================================================
    // CAMPAIGN / OFFER
    // =========================================================

    /*
     * Optional.
     *
     * If the customer submits a quotation
     * from an offer, this contains the campaign ID.
     *
     * If the customer submits a normal quotation,
     * this remains null.
     */
    private Long campaignId;

    // =========================================================
    // QUOTATION DETAILS
    // =========================================================

    @NotBlank(
            message = "Garment type is required"
    )
    private String garmentType;

    @NotNull(
            message = "Quantity is required"
    )
    @Min(
            value = 1,
            message = "Quantity must be at least 1"
    )
    private Integer quantity;

    private String fabric;

    private String color;

    private String size;

    private LocalDate requestedDeliveryDate;

    private String customerMessage;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public QuotationRequest() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(
            Long customerId
    ) {
        this.customerId = customerId;
    }

    public Long getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(
            Long campaignId
    ) {
        this.campaignId = campaignId;
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
}