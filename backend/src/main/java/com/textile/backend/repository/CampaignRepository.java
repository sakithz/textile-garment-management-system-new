package com.textile.backend.repository;

import com.textile.backend.entity.Campaign;
import com.textile.backend.entity.CampaignStatus;
import com.textile.backend.entity.CampaignType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    Optional<Campaign> findByCampaignCode(String campaignCode);

    boolean existsByCampaignCode(String campaignCode);

    List<Campaign> findByStatus(CampaignStatus status);

    List<Campaign> findByType(CampaignType type);

    @Query("SELECT c FROM Campaign c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.campaignCode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.tag) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Campaign> searchCampaigns(@Param("query") String query);
}
