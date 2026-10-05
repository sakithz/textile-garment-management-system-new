package com.textile.backend.repository;

import com.textile.backend.entity.Inventory;
import com.textile.backend.entity.InventoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByMaterialCode(String materialCode);

    List<Inventory> findByCategory(String category);

    List<Inventory> findByStatus(InventoryStatus status);

    List<Inventory> findByNameContainingIgnoreCaseOrSupplierContainingIgnoreCase(String name, String supplier);

    boolean existsByMaterialCode(String materialCode);
}
