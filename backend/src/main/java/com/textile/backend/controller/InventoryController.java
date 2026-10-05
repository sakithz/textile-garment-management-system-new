package com.textile.backend.controller;

import com.textile.backend.dto.InventoryRequest;
import com.textile.backend.entity.Inventory;
import com.textile.backend.entity.InventoryStatus;
import com.textile.backend.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping
    public ResponseEntity<Inventory> createInventory(@Valid @RequestBody InventoryRequest request) {
        Inventory created = inventoryService.createInventory(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Inventory> getInventoryByCode(@PathVariable String code) {
        return ResponseEntity.ok(inventoryService.getInventoryByCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, request));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Inventory> adjustStock(
            @PathVariable Long id,
            @RequestParam Double delta) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, delta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.ok("Material deleted successfully");
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Inventory>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(inventoryService.getByCategory(category));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Inventory>> getByStatus(@PathVariable InventoryStatus status) {
        return ResponseEntity.ok(inventoryService.getByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Inventory>> search(@RequestParam String query) {
        return ResponseEntity.ok(inventoryService.search(query));
    }
}
