package com.textile.backend.controller;

import com.textile.backend.dto.CampaignRequest;
import com.textile.backend.entity.Campaign;
import com.textile.backend.entity.CampaignStatus;
import com.textile.backend.service.CampaignService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = {"http://localhost:8443", "http://localhost:5173"})
public class CampaignController {

    private final CampaignService service;

    public CampaignController(CampaignService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Campaign>> getAllCampaigns() {
        return ResponseEntity.ok(service.getAllCampaigns());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Campaign>> getActiveCampaigns() {
        return ResponseEntity.ok(service.getActiveCampaigns());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getMarketingSummary() {
        return ResponseEntity.ok(service.getMarketingSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaignById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCampaignById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Campaign>> searchCampaigns(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(service.searchCampaigns(query));
    }

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(@Valid @RequestBody CampaignRequest request) {
        Campaign created = service.createCampaign(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignRequest request) {
        Campaign updated = service.updateCampaign(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Campaign> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        if (statusStr == null) {
            throw new IllegalArgumentException("Status is required");
        }
        CampaignStatus status = CampaignStatus.valueOf(statusStr.toUpperCase());
        Campaign updated = service.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        service.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
}
