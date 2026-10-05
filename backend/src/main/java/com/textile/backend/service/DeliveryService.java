package com.textile.backend.service;

import com.textile.backend.dto.DeliveryRequest;
import com.textile.backend.entity.Delivery;
import com.textile.backend.entity.DeliveryStatus;
import com.textile.backend.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
@Transactional
public class DeliveryService {

    private final DeliveryRepository repository;

    public DeliveryService(DeliveryRepository repository) {
        this.repository = repository;
    }

    public List<Delivery> getAllDeliveries() {
        return repository.findAll();
    }

    public Delivery getDeliveryById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delivery not found with id: " + id));
    }

    public List<Delivery> getDeliveriesByStatus(DeliveryStatus status) {
        return repository.findByStatus(status);
    }

    public List<Delivery> searchDeliveries(String query) {
        if (query == null || query.isBlank()) {
            return repository.findAll();
        }
        return repository.searchDeliveries(query.trim());
    }

    public Delivery createDelivery(DeliveryRequest request) {
        Delivery delivery = new Delivery();

        String code = request.getDeliveryCode();
        if (code == null || code.isBlank()) {
            code = generateDeliveryCode();
        }
        delivery.setDeliveryCode(code);
        delivery.setOrderId(request.getOrderId());
        delivery.setCustomer(request.getCustomer());
        delivery.setDeliveryAddress(request.getDeliveryAddress());
        delivery.setScheduledDate(request.getScheduledDate());
        delivery.setDeliveredDate(request.getDeliveredDate());
        delivery.setOfficer(request.getOfficer());
        delivery.setMethod(request.getMethod());
        delivery.setPriority(request.getPriority());
        delivery.setStatus(request.getStatus() != null ? request.getStatus() : DeliveryStatus.SCHEDULED);
        delivery.setSpecialInstructions(request.getSpecialInstructions());
        delivery.setGarmentType(request.getGarmentType());
        delivery.setQuantity(request.getQuantity());
        delivery.setReceivedBy(request.getReceivedBy());
        delivery.setDeliveryNotes(request.getDeliveryNotes());

        return repository.save(delivery);
    }

    public Delivery updateDelivery(Long id, DeliveryRequest request) {
        Delivery delivery = getDeliveryById(id);

        delivery.setOrderId(request.getOrderId());
        delivery.setCustomer(request.getCustomer());
        delivery.setDeliveryAddress(request.getDeliveryAddress());
        delivery.setScheduledDate(request.getScheduledDate());
        if (request.getDeliveredDate() != null) {
            delivery.setDeliveredDate(request.getDeliveredDate());
        }
        delivery.setOfficer(request.getOfficer());
        delivery.setMethod(request.getMethod());
        delivery.setPriority(request.getPriority());
        if (request.getStatus() != null) {
            delivery.setStatus(request.getStatus());
        }
        delivery.setSpecialInstructions(request.getSpecialInstructions());
        delivery.setGarmentType(request.getGarmentType());
        delivery.setQuantity(request.getQuantity());
        if (request.getReceivedBy() != null) {
            delivery.setReceivedBy(request.getReceivedBy());
        }
        if (request.getDeliveryNotes() != null) {
            delivery.setDeliveryNotes(request.getDeliveryNotes());
        }

        return repository.save(delivery);
    }

    public Delivery updateStatus(Long id, DeliveryStatus status, String receivedBy, String notes) {
        Delivery delivery = getDeliveryById(id);
        delivery.setStatus(status);
        if (status == DeliveryStatus.DELIVERED) {
            delivery.setDeliveredDate(LocalDate.now());
            if (receivedBy != null && !receivedBy.isBlank()) {
                delivery.setReceivedBy(receivedBy);
            }
        }
        if (notes != null && !notes.isBlank()) {
            delivery.setDeliveryNotes(notes);
        }
        return repository.save(delivery);
    }

    public void deleteDelivery(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Delivery not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private String generateDeliveryCode() {
        Random random = new Random();
        for (int i = 0; i < 100; i++) {
            String code = "DEL-" + String.format("%04d", 1000 + random.nextInt(9000));
            if (!repository.existsByDeliveryCode(code)) {
                return code;
            }
        }
        return "DEL-" + System.currentTimeMillis();
    }
}
