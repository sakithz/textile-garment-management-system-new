package com.textile.backend.dto;

import com.textile.backend.entity.CampaignStatus;
import com.textile.backend.entity.CampaignType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public class CampaignRequest {

    private String campaignCode;

    @NotBlank(message = "Campaign name is required")
    private String name;

    private CampaignType type;

    @NotNull(message = "Discount percentage is required")
    @PositiveOrZero(message = "Discount cannot be negative")
    private Double discount;

    private LocalDate startDate;

    private LocalDate endDate;

    private CampaignStatus status;

    private Integer ordersUsed;

    private Double revenue;

    private String tag;

    private String description;

    private String eligibleProducts;

    public CampaignRequest() {
    }

    public String getCampaignCode() {
        return campaignCode;
    }

    public void setCampaignCode(String campaignCode) {
        this.campaignCode = campaignCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CampaignType getType() {
        return type;
    }

    public void setType(CampaignType type) {
        this.type = type;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public CampaignStatus getStatus() {
        return status;
    }

    public void setStatus(CampaignStatus status) {
        this.status = status;
    }

    public Integer getOrdersUsed() {
        return ordersUsed;
    }

    public void setOrdersUsed(Integer ordersUsed) {
        this.ordersUsed = ordersUsed;
    }

    public Double getRevenue() {
        return revenue;
    }

    public void setRevenue(Double revenue) {
        this.revenue = revenue;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEligibleProducts() {
        return eligibleProducts;
    }

    public void setEligibleProducts(String eligibleProducts) {
        this.eligibleProducts = eligibleProducts;
    }
}
