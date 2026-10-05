package com.textile.backend.controller;

import com.textile.backend.entity.Order;
import com.textile.backend.entity.OrderStatus;
import com.textile.backend.entity.Priority;
import com.textile.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ============================================================
    // GET ALL ORDERS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ============================================================
    // GET ORDER BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // ============================================================
    // GET ORDER BY ORDER NUMBER
    // ============================================================

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(
            @PathVariable String orderNumber
    ) {
        return ResponseEntity.ok(
                orderService.getOrderByNumber(orderNumber)
        );
    }

    // ============================================================
    // GET ORDERS FOR A CUSTOMER
    // ============================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(
                orderService.getOrdersByCustomer(customerId)
        );
    }

    // ============================================================
    // GET ORDERS BY STATUS
    // ============================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(
            @PathVariable OrderStatus status
    ) {
        return ResponseEntity.ok(
                orderService.getOrdersByStatus(status)
        );
    }

    // ============================================================
    // SEARCH ORDERS
    // ============================================================

    @GetMapping("/search")
    public ResponseEntity<List<Order>> searchOrders(
            @RequestParam String query
    ) {
        return ResponseEntity.ok(
                orderService.searchOrders(query)
        );
    }

    // ============================================================
    // CREATE INTERNAL ORDER
    // ============================================================

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @Valid @RequestBody com.textile.backend.dto.OrderRequest request
    ) {
        Order createdOrder = orderService.createOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdOrder);
    }

    // ============================================================
    // CREATE ORDER FROM APPROVED QUOTATION
    // ============================================================

    @PostMapping("/from-quotation/{quotationId}")
    public ResponseEntity<Order> createOrderFromQuotation(
            @PathVariable Long quotationId,
            @RequestBody(required = false) Map<String, String> request
    ) {

        Priority priority = null;

        if (request != null && request.get("priority") != null) {
            try {
                priority = Priority.valueOf(
                        request.get("priority").toUpperCase()
                );
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().build();
            }
        }

        Order createdOrder =
                orderService.createOrderFromQuotation(
                        quotationId,
                        priority
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdOrder);
    }

    // ============================================================
    // UPDATE ORDER
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody com.textile.backend.dto.OrderRequest request
    ) {
        return ResponseEntity.ok(
                orderService.updateOrder(id, request)
        );
    }

    // ============================================================
    // DELETE ORDER
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id
    ) {
        orderService.deleteOrder(id);

        return ResponseEntity.noContent().build();
    }
}