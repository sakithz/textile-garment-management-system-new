package com.textile.backend.controller;

import com.textile.backend.dto.QuotationRequest;
import com.textile.backend.entity.Priority;
import com.textile.backend.entity.Quotation;
import com.textile.backend.entity.QuotationStatus;
import com.textile.backend.service.QuotationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotations")
@CrossOrigin(origins = "*")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(
            QuotationService quotationService
    ) {

        this.quotationService =
                quotationService;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Quotation>>
    getAllQuotations() {

        return ResponseEntity.ok(
                quotationService
                        .getAllQuotations()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Quotation>
    getQuotationById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                quotationService
                        .getQuotationById(id)
        );
    }

    // =========================================================
    // GET BY NUMBER
    // =========================================================

    @GetMapping("/number/{quotationNumber}")
    public ResponseEntity<Quotation>
    getQuotationByNumber(
            @PathVariable String quotationNumber
    ) {

        return ResponseEntity.ok(
                quotationService
                        .getQuotationByNumber(
                                quotationNumber
                        )
        );
    }

    // =========================================================
    // GET CUSTOMER QUOTATIONS
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Quotation>>
    getCustomerQuotations(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                quotationService
                        .getCustomerQuotations(
                                customerId
                        )
        );
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Quotation>>
    getQuotationsByStatus(
            @PathVariable QuotationStatus status
    ) {

        return ResponseEntity.ok(
                quotationService
                        .getQuotationsByStatus(
                                status
                        )
        );
    }

    // =========================================================
    // SEARCH
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<List<Quotation>>
    searchQuotations(
            @RequestParam String query
    ) {

        return ResponseEntity.ok(
                quotationService
                        .searchQuotations(
                                query
                        )
        );
    }

    // =========================================================
    // CREATE QUOTATION
    // =========================================================

    @PostMapping
    public ResponseEntity<Quotation>
    createQuotation(
            @Valid
            @RequestBody
            QuotationRequest request
    ) {

        return ResponseEntity.ok(
                quotationService
                        .createQuotation(
                                request
                        )
        );
    }

    // =========================================================
    // START REVIEW
    // =========================================================

    @PostMapping("/{id}/review")
    public ResponseEntity<?> startReview(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    quotationService
                            .startReview(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // APPROVE QUOTATION
    // =========================================================

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveQuotation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Approval information is required"
                        );
            }

            // -------------------------------------------------
            // BASE UNIT PRICE
            // -------------------------------------------------

            Object priceValue =
                    request.get("unitPrice");

            if (priceValue == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Base unit price is required"
                        );
            }

            Double baseUnitPrice;

            try {

                baseUnitPrice =
                        Double.parseDouble(
                                priceValue.toString()
                        );

            } catch (
                    NumberFormatException e
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Invalid unit price"
                        );
            }

            // -------------------------------------------------
            // DELIVERY DATE
            // -------------------------------------------------

            Object deliveryDateValue =
                    request.get(
                            "confirmedDeliveryDate"
                    );

            if (
                    deliveryDateValue == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Confirmed delivery date is required"
                        );
            }

            LocalDate confirmedDeliveryDate;

            try {

                confirmedDeliveryDate =
                        LocalDate.parse(
                                deliveryDateValue
                                        .toString()
                        );

            } catch (Exception e) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Invalid confirmed delivery date. " +
                                        "Use yyyy-MM-dd format"
                        );
            }

            // -------------------------------------------------
            // PRIORITY
            // -------------------------------------------------

            Object priorityValue =
                    request.get("priority");

            if (
                    priorityValue == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Priority is required"
                        );
            }

            Priority priority;

            try {

                priority =
                        Priority.valueOf(
                                priorityValue
                                        .toString()
                                        .toUpperCase()
                        );

            } catch (
                    IllegalArgumentException e
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Invalid priority. " +
                                        "Use LOW, MEDIUM or HIGH"
                        );
            }

            // -------------------------------------------------
            // APPROVE
            // -------------------------------------------------

            Quotation quotation =
                    quotationService
                            .approveQuotation(
                                    id,
                                    baseUnitPrice,
                                    confirmedDeliveryDate,
                                    priority
                            );

            return ResponseEntity.ok(
                    quotation
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // REJECT
    // =========================================================

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectQuotation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {

        try {

            if (
                    request == null ||
                            request.get("reason") == null
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Rejection reason is required"
                        );
            }

            String reason =
                    request
                            .get("reason")
                            .toString();

            return ResponseEntity.ok(
                    quotationService
                            .rejectQuotation(
                                    id,
                                    reason
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }
}