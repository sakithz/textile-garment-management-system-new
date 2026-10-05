package com.textile.backend.service;

import com.textile.backend.dto.InventoryRequest;
import com.textile.backend.entity.Inventory;
import com.textile.backend.entity.InventoryStatus;
import com.textile.backend.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public Inventory createInventory(InventoryRequest request) {
        Inventory item = new Inventory();
        item.setMaterialCode(generateMaterialCode());
        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setCurrentStock(request.getCurrentStock());
        item.setUnit(request.getUnit());
        item.setMinStock(request.getMinStock());
        item.setSupplier(request.getSupplier());
        item.setUnitCost(request.getUnitCost());
        item.setLastUpdated(LocalDate.now());

        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        } else {
            item.setStatus(computeStatus(request.getCurrentStock(), request.getMinStock()));
        }

        return inventoryRepository.save(item);
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Inventory getInventoryById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with ID: " + id));
    }

    public Inventory getInventoryByCode(String materialCode) {
        return inventoryRepository.findByMaterialCode(materialCode)
                .orElseThrow(() -> new RuntimeException("Material not found with code: " + materialCode));
    }

    public Inventory updateInventory(Long id, InventoryRequest request) {
        Inventory item = getInventoryById(id);
        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setCurrentStock(request.getCurrentStock());
        item.setUnit(request.getUnit());
        item.setMinStock(request.getMinStock());
        item.setSupplier(request.getSupplier());
        item.setUnitCost(request.getUnitCost());
        item.setLastUpdated(LocalDate.now());

        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        } else {
            item.setStatus(computeStatus(request.getCurrentStock(), request.getMinStock()));
        }

        return inventoryRepository.save(item);
    }

    public Inventory adjustStock(Long id, Double delta) {
        Inventory item = getInventoryById(id);
        double newStock = Math.max(0, item.getCurrentStock() + delta);
        item.setCurrentStock(newStock);
        item.setStatus(computeStatus(newStock, item.getMinStock()));
        item.setLastUpdated(LocalDate.now());
        return inventoryRepository.save(item);
    }

    public void deleteInventory(Long id) {
        Inventory item = getInventoryById(id);
        inventoryRepository.delete(item);
    }

    public List<Inventory> getByCategory(String category) {
        return inventoryRepository.findByCategory(category);
    }

    public List<Inventory> getByStatus(InventoryStatus status) {
        return inventoryRepository.findByStatus(status);
    }

    public List<Inventory> search(String query) {
        return inventoryRepository.findByNameContainingIgnoreCaseOrSupplierContainingIgnoreCase(query, query);
    }

    private InventoryStatus computeStatus(Double currentStock, Double minStock) {
        if (currentStock == null || currentStock <= 0) {
            return InventoryStatus.OUT_OF_STOCK;
        } else if (minStock != null && currentStock <= minStock) {
            return InventoryStatus.LOW_STOCK;
        } else {
            return InventoryStatus.IN_STOCK;
        }
    }

    private String generateMaterialCode() {
        long count = inventoryRepository.count() + 1;
        String code = String.format("MAT-%04d", 1000 + count);
        while (inventoryRepository.existsByMaterialCode(code)) {
            count++;
            code = String.format("MAT-%04d", 1000 + count);
        }
        return code;
    }
}
