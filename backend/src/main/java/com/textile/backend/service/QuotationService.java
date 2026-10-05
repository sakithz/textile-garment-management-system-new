package com.textile.backend.service;

import com.textile.backend.dto.QuotationRequest;
import com.textile.backend.entity.Campaign;
import com.textile.backend.entity.CampaignStatus;
import com.textile.backend.entity.Customer;
import com.textile.backend.entity.Priority;
import com.textile.backend.entity.Quotation;
import com.textile.backend.entity.QuotationStatus;
import com.textile.backend.repository.CampaignRepository;
import com.textile.backend.repository.CustomerRepository;
import com.textile.backend.repository.QuotationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class QuotationService {

    private final QuotationRepository quotationRepository;

    private final CustomerRepository customerRepository;

    private final CampaignRepository campaignRepository;

    public QuotationService(
            QuotationRepository quotationRepository,
            CustomerRepository customerRepository,
            CampaignRepository campaignRepository
    ) {

        this.quotationRepository =
                quotationRepository;

        this.customerRepository =
                customerRepository;

        this.campaignRepository =
                campaignRepository;
    }

    // =========================================================
    // GET ALL QUOTATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Quotation> getAllQuotations() {

        return quotationRepository
                .findAllByOrderByCreatedAtDesc();
    }

    // =========================================================
    // GET QUOTATION BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Quotation getQuotationById(
            Long id
    ) {

        return quotationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Quotation not found with ID: "
                                        + id
                        )
                );
    }

    // =========================================================
    // GET QUOTATION BY NUMBER
    // =========================================================

    @Transactional(readOnly = true)
    public Quotation getQuotationByNumber(
            String quotationNumber
    ) {

        return quotationRepository
                .findByQuotationNumber(
                        quotationNumber
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Quotation not found with number: "
                                        + quotationNumber
                        )
                );
    }

    // =========================================================
    // GET CUSTOMER QUOTATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Quotation> getCustomerQuotations(
            Long customerId
    ) {

        if (!customerRepository.existsById(customerId)) {

            throw new RuntimeException(
                    "Customer not found with ID: "
                            + customerId
            );
        }

        return quotationRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customerId
                );
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Quotation> getQuotationsByStatus(
            QuotationStatus status
    ) {

        return quotationRepository
                .findByStatusOrderByCreatedAtDesc(
                        status
                );
    }

    // =========================================================
    // SEARCH
    // =========================================================

    @Transactional(readOnly = true)
    public List<Quotation> searchQuotations(
            String query
    ) {

        if (
                query == null ||
                        query.trim().isEmpty()
        ) {

            return getAllQuotations();
        }

        return quotationRepository
                .searchQuotations(
                        query.trim()
                );
    }

    // =========================================================
    // CREATE QUOTATION
    // =========================================================

    public Quotation createQuotation(
            QuotationRequest request
    ) {

        if (request == null) {

            throw new RuntimeException(
                    "Quotation request cannot be null"
            );
        }

        if (request.getCustomerId() == null) {

            throw new RuntimeException(
                    "Customer is required"
            );
        }

        if (
                request.getGarmentType() == null ||
                        request.getGarmentType()
                                .trim()
                                .isEmpty()
        ) {

            throw new RuntimeException(
                    "Garment type is required"
            );
        }

        if (
                request.getQuantity() == null ||
                        request.getQuantity() <= 0
        ) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        // ---------------------------------------------------------
        // CUSTOMER
        // ---------------------------------------------------------

        Customer customer =
                customerRepository
                        .findById(
                                request.getCustomerId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found with ID: "
                                                + request.getCustomerId()
                                )
                        );

        // ---------------------------------------------------------
        // CREATE QUOTATION
        // ---------------------------------------------------------

        Quotation quotation =
                new Quotation();

        quotation.setQuotationNumber(
                generateQuotationNumber()
        );

        quotation.setCustomer(
                customer
        );

        quotation.setGarmentType(
                request.getGarmentType()
                        .trim()
        );

        quotation.setQuantity(
                request.getQuantity()
        );

        quotation.setFabric(
                request.getFabric()
        );

        quotation.setColor(
                request.getColor()
        );

        quotation.setSize(
                request.getSize()
        );

        quotation.setRequestedDeliveryDate(
                request.getRequestedDeliveryDate()
        );

        quotation.setCustomerMessage(
                request.getCustomerMessage()
        );

        // ---------------------------------------------------------
        // DEFAULT SALES VALUES
        // ---------------------------------------------------------

        quotation.setBaseUnitPrice(null);

        quotation.setUnitPrice(null);

        quotation.setTotalPrice(null);

        quotation.setConfirmedDeliveryDate(null);

        quotation.setPriority(null);

        quotation.setReviewedAt(null);

        quotation.setRejectionReason(null);

        quotation.setOrder(null);

        // ---------------------------------------------------------
        // CAMPAIGN
        // ---------------------------------------------------------

        if (request.getCampaignId() != null) {

            Campaign campaign =
                    campaignRepository
                            .findById(
                                    request.getCampaignId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Selected campaign not found"
                                    )
                            );

            validateCampaignForQuotation(
                    campaign,
                    quotation.getGarmentType()
            );

            quotation.setCampaignId(
                    campaign.getId()
            );

            quotation.setCampaignName(
                    campaign.getName()
            );

            quotation.setDiscountPercent(
                    campaign.getDiscount()
            );

        } else {

            quotation.setCampaignId(
                    null
            );

            quotation.setCampaignName(
                    null
            );

            quotation.setDiscountPercent(
                    0.0
            );
        }

        quotation.setStatus(
                QuotationStatus.PENDING
        );

        quotation.setCreatedAt(
                LocalDate.now()
        );

        return quotationRepository.save(
                quotation
        );
    }

    // =========================================================
    // START REVIEW
    // =========================================================

    public Quotation startReview(
            Long id
    ) {

        Quotation quotation =
                getQuotationById(id);

        if (
                quotation.getStatus() !=
                        QuotationStatus.PENDING
        ) {

            throw new RuntimeException(
                    "Only pending quotations can be moved to review"
            );
        }

        quotation.setStatus(
                QuotationStatus.UNDER_REVIEW
        );

        return quotationRepository.save(
                quotation
        );
    }

    // =========================================================
    // APPROVE QUOTATION
    // =========================================================
    /*
     * IMPORTANT:
     *
     * unitPrice received here is the BASE PRICE
     * entered by the Sales Executive.
     *
     * If a campaign exists:
     *
     * finalPrice =
     * basePrice - (basePrice * discount / 100)
     *
     * Then:
     *
     * total =
     * finalPrice * quantity
     */

    public Quotation approveQuotation(
            Long id,
            Double baseUnitPrice,
            LocalDate confirmedDeliveryDate,
            Priority priority
    ) {

        Quotation quotation =
                getQuotationById(id);

        if (
                quotation.getStatus() !=
                        QuotationStatus.UNDER_REVIEW
        ) {

            throw new RuntimeException(
                    "Only quotations under review can be approved"
            );
        }

        if (
                baseUnitPrice == null ||
                        baseUnitPrice < 0
        ) {

            throw new RuntimeException(
                    "A valid base unit price is required"
            );
        }

        if (
                confirmedDeliveryDate == null
        ) {

            throw new RuntimeException(
                    "Confirmed delivery date is required"
            );
        }

        if (priority == null) {

            throw new RuntimeException(
                    "Priority is required"
            );
        }

        // ---------------------------------------------------------
        // BASE PRICE
        // ---------------------------------------------------------

        quotation.setBaseUnitPrice(
                baseUnitPrice
        );

        // ---------------------------------------------------------
        // DISCOUNT
        // ---------------------------------------------------------

        double discountPercent =
                quotation.getDiscountPercent() != null
                        ? quotation.getDiscountPercent()
                        : 0.0;

        if (
                discountPercent < 0 ||
                        discountPercent > 100
        ) {

            throw new RuntimeException(
                    "Invalid campaign discount percentage"
            );
        }

        // ---------------------------------------------------------
        // CALCULATE DISCOUNT
        // ---------------------------------------------------------

        double discountAmount =
                baseUnitPrice *
                        discountPercent /
                        100.0;

        // ---------------------------------------------------------
        // FINAL UNIT PRICE
        // ---------------------------------------------------------

        double finalUnitPrice =
                baseUnitPrice -
                        discountAmount;

        // ---------------------------------------------------------
        // FINAL TOTAL
        // ---------------------------------------------------------

        double totalPrice =
                finalUnitPrice *
                        quotation.getQuantity();

        // ---------------------------------------------------------
        // SAVE FINAL PRICE
        // ---------------------------------------------------------

        quotation.setUnitPrice(
                roundMoney(
                        finalUnitPrice
                )
        );

        quotation.setTotalPrice(
                roundMoney(
                        totalPrice
                )
        );

        quotation.setConfirmedDeliveryDate(
                confirmedDeliveryDate
        );

        quotation.setPriority(
                priority
        );

        quotation.setReviewedAt(
                LocalDate.now()
        );

        quotation.setRejectionReason(
                null
        );

        quotation.setStatus(
                QuotationStatus.APPROVED
        );

        return quotationRepository.save(
                quotation
        );
    }

    // =========================================================
    // REJECT QUOTATION
    // =========================================================

    public Quotation rejectQuotation(
            Long id,
            String reason
    ) {

        Quotation quotation =
                getQuotationById(id);

        if (
                quotation.getStatus() !=
                        QuotationStatus.PENDING &&
                        quotation.getStatus() !=
                                QuotationStatus.UNDER_REVIEW
        ) {

            throw new RuntimeException(
                    "Only pending or under-review quotations can be rejected"
            );
        }

        if (
                reason == null ||
                        reason.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Rejection reason is required"
            );
        }

        quotation.setStatus(
                QuotationStatus.REJECTED
        );

        quotation.setReviewedAt(
                LocalDate.now()
        );

        quotation.setRejectionReason(
                reason.trim()
        );

        return quotationRepository.save(
                quotation
        );
    }

    // =========================================================
    // CAMPAIGN VALIDATION
    // =========================================================

    private void validateCampaignForQuotation(
            Campaign campaign,
            String garmentType
    ) {

        // ---------------------------------------------------------
        // CAMPAIGN STATUS
        // ---------------------------------------------------------

        if (
                campaign.getStatus() !=
                        CampaignStatus.ACTIVE
        ) {

            throw new RuntimeException(
                    "This campaign is not currently active"
            );
        }

        // ---------------------------------------------------------
        // CAMPAIGN DATE
        // ---------------------------------------------------------

        LocalDate today =
                LocalDate.now();

        if (
                campaign.getStartDate() != null &&
                        today.isBefore(
                                campaign.getStartDate()
                        )
        ) {

            throw new RuntimeException(
                    "This campaign has not started yet"
            );
        }

        if (
                campaign.getEndDate() != null &&
                        today.isAfter(
                                campaign.getEndDate()
                        )
        ) {

            throw new RuntimeException(
                    "This campaign has expired"
            );
        }

        // ---------------------------------------------------------
        // DISCOUNT VALIDATION
        // ---------------------------------------------------------

        if (
                campaign.getDiscount() == null ||
                        campaign.getDiscount() < 0 ||
                        campaign.getDiscount() > 100
        ) {

            throw new RuntimeException(
                    "Invalid campaign discount"
            );
        }

        // ---------------------------------------------------------
        // ELIGIBLE PRODUCTS
        // ---------------------------------------------------------

        String eligibleProducts =
                campaign.getEligibleProducts();

        if (
                eligibleProducts == null ||
                        eligibleProducts.trim().isEmpty()
        ) {

            return;
        }

        String requestedGarment =
                garmentType
                        .trim()
                        .toLowerCase();

        String[] products =
                eligibleProducts
                        .split(",");

        boolean matched =
                false;

        for (
                String product :
                products
        ) {

            String normalized =
                    product
                            .trim()
                            .toLowerCase();

            // -----------------------------------------------------
            // ALL APPAREL / ALL GARMENTS
            // -----------------------------------------------------
            //
            // Examples:
            //
            // "All"
            // "All Apparel"
            // "All Garments"
            //
            // These mean the campaign applies to every garment type.
            // -----------------------------------------------------

            if (
                    normalized.equals("all") ||
                            normalized.equals("all apparel") ||
                            normalized.equals("all garments")
            ) {

                matched = true;

                break;
            }

            // -----------------------------------------------------
            // EXACT MATCH
            // -----------------------------------------------------

            if (
                    normalized.equals(
                            requestedGarment
                    )
            ) {

                matched = true;

                break;
            }

            /*
             * Allows values such as:
             *
             * "T-Shirt"
             * "T-Shirt, Polo Shirt"
             *
             * and also allows a partial match
             * such as "Shirt" -> "Formal Shirt".
             */

            if (
                    !normalized.isEmpty() &&
                            (
                                    requestedGarment.contains(
                                            normalized
                                    ) ||
                                            normalized.contains(
                                                    requestedGarment
                                            )
                            )
            ) {

                matched = true;

                break;
            }
        }

        if (!matched) {

            throw new RuntimeException(
                    "This offer is not eligible for the selected garment type"
            );
        }
    }

    // =========================================================
    // ROUND MONEY
    // =========================================================

    private double roundMoney(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }

    // =========================================================
    // GENERATE QUOTATION NUMBER
    // =========================================================

    private String generateQuotationNumber() {

        String quotationNumber;

        do {

            int number =
                    1000 +
                            (int)
                                    (
                                            Math.random()
                                                    * 9000
                                    );

            quotationNumber =
                    "QT-" + number;

        } while (
                quotationRepository
                        .existsByQuotationNumber(
                                quotationNumber
                        )
        );

        return quotationNumber;
    }
}