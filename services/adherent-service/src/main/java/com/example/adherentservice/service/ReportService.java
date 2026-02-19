package com.example.adherentservice.service;

import com.example.adherentservice.model.Adherent;
import com.example.adherentservice.model.AdherentStatus;
import com.example.adherentservice.model.SubscriptionType;
import com.example.adherentservice.repository.AdherentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Service pour générer des rapports et statistiques
 */
@Service
public class ReportService {

    private final AdherentRepository adherentRepository;

    public ReportService(AdherentRepository adherentRepository) {
        this.adherentRepository = adherentRepository;
    }

    // ===== RAPPORTS STATISTIQUES =====

    public Map<String, Object> getGeneralStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();

        long totalAdherents = adherentRepository.count();
        long activeAdherents = adherentRepository.countByStatus(AdherentStatus.ACTIVE);
        long suspendedAdherents = adherentRepository.countByStatus(AdherentStatus.SUSPENDED);
        long expiredAdherents = adherentRepository.countByStatus(AdherentStatus.EXPIRED);

        stats.put("totalAdherents", totalAdherents);
        stats.put("activeAdherents", activeAdherents);
        stats.put("suspendedAdherents", suspendedAdherents);
        stats.put("expiredAdherents", expiredAdherents);

        return stats;
    }

    public Map<String, Object> getSubscriptionStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        List<Adherent> allAdherents = adherentRepository.findAll();

        double totalRevenue = 0;
        Map<String, Object> subscriptionDetails = new LinkedHashMap<>();

        // Statistiques pour BASIC
        long basicCount = adherentRepository.countBySubscriptionType(SubscriptionType.BASIC);
        double basicRevenue = allAdherents.stream()
            .filter(a -> a.getSubscriptionType() == SubscriptionType.BASIC && a.getSubscriptionPrice() != null)
            .mapToDouble(Adherent::getSubscriptionPrice)
            .sum();
        
        Map<String, Object> basicDetail = new LinkedHashMap<>();
        basicDetail.put("type", "BASIC");
        basicDetail.put("subscriberCount", basicCount);
        basicDetail.put("revenue", basicRevenue);
        subscriptionDetails.put("BASIC", basicDetail);
        totalRevenue += basicRevenue;

        // Statistiques pour PREMIUM
        long premiumCount = adherentRepository.countBySubscriptionType(SubscriptionType.PREMIUM);
        double premiumRevenue = allAdherents.stream()
            .filter(a -> a.getSubscriptionType() == SubscriptionType.PREMIUM && a.getSubscriptionPrice() != null)
            .mapToDouble(Adherent::getSubscriptionPrice)
            .sum();
        
        Map<String, Object> premiumDetail = new LinkedHashMap<>();
        premiumDetail.put("type", "PREMIUM");
        premiumDetail.put("subscriberCount", premiumCount);
        premiumDetail.put("revenue", premiumRevenue);
        subscriptionDetails.put("PREMIUM", premiumDetail);
        totalRevenue += premiumRevenue;

        stats.put("totalRevenue", totalRevenue);
        stats.put("subscriptionDetails", subscriptionDetails);

        return stats;
    }

    public Map<String, Object> getMonthlyReport(int month, int year) {
        Map<String, Object> report = new LinkedHashMap<>();
        LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endOfMonth = LocalDateTime.of(year, month, 1, 0, 0).plusMonths(1).minusSeconds(1);

        long newAdherents = adherentRepository.findAll().stream()
            .filter(a -> a.getCreatedAt().isAfter(startOfMonth) && a.getCreatedAt().isBefore(endOfMonth))
            .count();

        List<Adherent> allAdherents = adherentRepository.findAll();
        long activeThisMonth = allAdherents.stream()
            .filter(a -> a.getStatus() == AdherentStatus.ACTIVE)
            .count();

        report.put("month", month);
        report.put("year", year);
        report.put("newAdherents", newAdherents);
        report.put("activeMembers", activeThisMonth);
        report.put("reportDate", LocalDate.now());

        return report;
    }

    public Map<String, Object> getAdherentsByStatusReport() {
        Map<String, Object> report = new LinkedHashMap<>();

        for (AdherentStatus status : AdherentStatus.values()) {
            long count = adherentRepository.countByStatus(status);
            report.put(status.toString(), count);
        }

        report.put("generatedAt", LocalDateTime.now());
        return report;
    }
}
