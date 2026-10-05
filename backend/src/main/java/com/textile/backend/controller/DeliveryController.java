package com.textile.backend.controller;

import com.textile.backend.dto.DeliveryRequest;
import com.textile.backend.entity.Delivery;
import com.textile.backend.entity.DeliveryStatus;
import com.textile.backend.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = {"http://localhost:8443", "http://localhost:5173"})
public class DeliveryController {

    private final DeliveryService service;

    public DeliveryController(DeliveryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Delivery>> getAllDeliveries() {
        return ResponseEntity.ok(service.getAllDeliveries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Delivery> getDeliveryById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDeliveryById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Delivery>> getDeliveriesByStatus(@PathVariable DeliveryStatus status) {
        return ResponseEntity.ok(service.getDeliveriesByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Delivery>> searchDeliveries(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(service.searchDeliveries(query));
    }

    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@Valid @RequestBody DeliveryRequest request) {
        Delivery created = service.createDelivery(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Delivery> updateDelivery(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryRequest request) {
        Delivery updated = service.updateDelivery(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(
            @PathVariable Long id,
            @RequestParam DeliveryStatus status,
            @RequestParam(required = false) String receivedBy,
            @RequestParam(required = false) String notes) {
        Delivery updated = service.updateStatus(id, status, receivedBy, notes);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Long id) {
        service.deleteDelivery(id);
        return ResponseEntity.noContent().build();
    }
}
