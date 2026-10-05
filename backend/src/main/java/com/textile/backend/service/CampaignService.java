package com.textile.backend.service;

import com.textile.backend.dto.CampaignRequest;
import com.textile.backend.entity.Campaign;
import com.textile.backend.entity.CampaignStatus;
import com.textile.backend.entity.CampaignType;
import com.textile.backend.repository.CampaignRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@Transactional
public class CampaignService {

    private final CampaignRepository repository;

    public CampaignService(CampaignRepository repository) {
        this.repository = repository;
    }

    public List<Campaign> getAllCampaigns() {
        return repository.findAll();
    }

    public List<Campaign> getActiveCampaigns() {
        return repository.findByStatus(CampaignStatus.ACTIVE);
    }

    public Campaign getCampaignById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found with id: " + id));
    }

    public List<Campaign> searchCampaigns(String query) {
        if (query == null || query.isBlank()) {
            return repository.findAll();
        }
        return repository.searchCampaigns(query.trim());
    }

    public Campaign createCampaign(CampaignRequest request) {
        Campaign campaign = new Campaign();

        String code = request.getCampaignCode();
        if (code == null || code.isBlank()) {
            code = generateCampaignCode();
        }
        campaign.setCampaignCode(code);
        campaign.setName(request.getName());
        campaign.setType(request.getType() != null ? request.getType() : CampaignType.DISCOUNT);
        campaign.setDiscount(request.getDiscount());
        campaign.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        campaign.setEndDate(request.getEndDate() != null ? request.getEndDate() : LocalDate.now().plusMonths(1));
        campaign.setStatus(request.getStatus() != null ? request.getStatus() : CampaignStatus.ACTIVE);
        campaign.setOrdersUsed(request.getOrdersUsed() != null ? request.getOrdersUsed() : 0);
        campaign.setRevenue(request.getRevenue() != null ? request.getRevenue() : 0.0);
        campaign.setTag(request.getTag());
        campaign.setDescription(request.getDescription());
        campaign.setEligibleProducts(request.getEligibleProducts());

        return repository.save(campaign);
    }

    public Campaign updateCampaign(Long id, CampaignRequest request) {
        Campaign campaign = getCampaignById(id);

        campaign.setName(request.getName());
        if (request.getType() != null) {
            campaign.setType(request.getType());
        }
        campaign.setDiscount(request.getDiscount());
        if (request.getStartDate() != null) {
            campaign.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            campaign.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            campaign.setStatus(request.getStatus());
        }
        if (request.getOrdersUsed() != null) {
            campaign.setOrdersUsed(request.getOrdersUsed());
        }
        if (request.getRevenue() != null) {
            campaign.setRevenue(request.getRevenue());
        }
        if (request.getTag() != null) {
            campaign.setTag(request.getTag());
        }
        if (request.getDescription() != null) {
            campaign.setDescription(request.getDescription());
        }
        if (request.getEligibleProducts() != null) {
            campaign.setEligibleProducts(request.getEligibleProducts());
        }

        return repository.save(campaign);
    }

    public Campaign updateStatus(Long id, CampaignStatus status) {
        Campaign campaign = getCampaignById(id);
        campaign.setStatus(status);
        return repository.save(campaign);
    }

    public void deleteCampaign(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Campaign not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public Map<String, Object> getMarketingSummary() {
        List<Campaign> all = repository.findAll();

        long activeCount = 0;
        long scheduledCount = 0;
        int ordersUsed = 0;
        double promoRevenue = 0.0;

        for (Campaign c : all) {
            if (c.getStatus() == CampaignStatus.ACTIVE) activeCount++;
            else if (c.getStatus() == CampaignStatus.SCHEDULED) scheduledCount++;

            ordersUsed += (c.getOrdersUsed() != null ? c.getOrdersUsed() : 0);
            promoRevenue += (c.getRevenue() != null ? c.getRevenue() : 0.0);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("activeCampaigns", activeCount);
        map.put("scheduledCampaigns", scheduledCount);
        map.put("ordersUsed", ordersUsed);
        map.put("promoRevenue", promoRevenue);
        map.put("totalCampaigns", all.size());

        return map;
    }

    private String generateCampaignCode() {
        Random random = new Random();
        for (int i = 0; i < 100; i++) {
            String code = "CAM" + String.format("%03d", 1 + random.nextInt(999));
            if (!repository.existsByCampaignCode(code)) {
                return code;
            }
        }
        return "CAM" + System.currentTimeMillis();
    }
}
