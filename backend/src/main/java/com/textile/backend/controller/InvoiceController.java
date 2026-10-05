package com.textile.backend.controller;

import com.textile.backend.dto.InvoiceRequest;
import com.textile.backend.entity.Invoice;
import com.textile.backend.entity.InvoiceStatus;
import com.textile.backend.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService service;

    public InvoiceController(
            InvoiceService service
    ) {
        this.service = service;
    }

    // =========================================================
    // INTERNAL - GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Invoice>>
    getAllInvoices() {

        return ResponseEntity.ok(
                service.getAllInvoices()
        );
    }

    // =========================================================
    // INTERNAL - SUMMARY
    // =========================================================

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>>
    getFinanceSummary() {

        return ResponseEntity.ok(
                service.getFinanceSummary()
        );
    }

    // =========================================================
    // CUSTOMER - GET INVOICE FOR ORDER
    // =========================================================
    //
    // Customer website uses:
    //
    // GET /api/invoices/customer/order/{orderNumber}
    //
    // Example:
    //
    // GET /api/invoices/customer/order/ORD-1170
    //
    // This returns the invoice created by the Finance
    // module for the selected order.
    //

    @GetMapping("/customer/order/{orderNumber}")
    public ResponseEntity<Invoice>
    getCustomerInvoice(
            @PathVariable String orderNumber
    ) {

        Invoice invoice =
                service.getInvoiceByOrderId(
                        orderNumber
                );

        /*
         * If no invoice exists for this order,
         * return 404.
         *
         * customerBillingApi.ts handles 404 by returning
         * null, so the customer website can display:
         *
         * "Invoice Not Generated Yet"
         */
        if (
                invoice == null ||
                        invoice.getOrderId() == null
        ) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }

        return ResponseEntity.ok(
                invoice
        );
    }

    // =========================================================
    // INTERNAL - GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Invoice>
    getInvoiceById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getInvoiceById(id)
        );
    }

    // =========================================================
    // INTERNAL - GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Invoice>>
    getInvoicesByStatus(
            @PathVariable InvoiceStatus status
    ) {

        return ResponseEntity.ok(
                service.getInvoicesByStatus(
                        status
                )
        );
    }

    // =========================================================
    // INTERNAL - SEARCH
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<List<Invoice>>
    searchInvoices(
            @RequestParam(
                    required = false
            )
            String query
    ) {

        return ResponseEntity.ok(
                service.searchInvoices(query)
        );
    }

    // =========================================================
    // INTERNAL - CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<Invoice>
    createInvoice(
            @Valid
            @RequestBody
            InvoiceRequest request
    ) {

        Invoice created =
                service.createInvoice(
                        request
                );

        return new ResponseEntity<>(
                created,
                HttpStatus.CREATED
        );
    }

    // =========================================================
    // INTERNAL - UPDATE DATES
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Invoice>
    updateInvoice(
            @PathVariable Long id,
            @Valid
            @RequestBody
            InvoiceRequest request
    ) {

        Invoice updated =
                service.updateInvoiceDates(
                        id,
                        request
                );

        return ResponseEntity.ok(
                updated
        );
    }

    // =========================================================
    // INTERNAL - MANUAL STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Invoice>
    updateStatus(
            @PathVariable Long id,
            @RequestBody
            Map<String, String> body
    ) {

        String statusString =
                body.get("status");

        if (
                statusString == null ||
                        statusString.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Status is required"
            );
        }

        InvoiceStatus status =
                InvoiceStatus.valueOf(
                        statusString.toUpperCase()
                );

        return ResponseEntity.ok(
                service.updateStatus(
                        id,
                        status
                )
        );
    }

    // =========================================================
    // INTERNAL - DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteInvoice(
            @PathVariable Long id
    ) {

        service.deleteInvoice(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}