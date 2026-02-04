package com.example.demo.service;

import com.example.demo.model.entity.Adherent;
import com.example.demo.model.entity.Subscription;
import com.example.demo.model.enums.AdherentStatus;
import com.example.demo.repository.AdherentRepository;
import com.example.demo.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service pour générer des rapports et statistiques
 */
@Service
public class ReportService {
    
    private final AdherentRepository adherentRepository;
    private final SubscriptionRepository subscriptionRepository;
    
    public ReportService(AdherentRepository adherentRepository, SubscriptionRepository subscriptionRepository) {
        this.adherentRepository = adherentRepository;
        this.subscriptionRepository = subscriptionRepository;
    }
    
    // ===== RAPPORTS STATISTIQUES =====
    
    public Map<String, Object> getGeneralStatistics() {
        Map<String, Object> stats = new LinkedHashMap<>();
        
        // Statistiques des adhérents
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
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        
        long totalRevenue = 0;
        Map<String, Object> subscriptionDetails = new LinkedHashMap<>();
        
        for (Subscription sub : subscriptions) {
            Map<String, Object> subDetail = new LinkedHashMap<>();
            long count = adherentRepository.countByCurrentSubscription(sub);
            double revenue = sub.getPrice() * count;
            totalRevenue += (long) revenue;
            
            subDetail.put("type", sub.getType().toString());
            subDetail.put("price", sub.getPrice());
            subDetail.put("subscriberCount", count);
            subDetail.put("revenue", revenue);
            
            subscriptionDetails.put(sub.getType().toString(), subDetail);
        }
        
        stats.put("totalRevenue", totalRevenue);
        stats.put("subscriptionDetails", subscriptionDetails);
        
        return stats;
    }
    
    public Map<String, Object> getMonthlyReport(int month, int year) {
        Map<String, Object> report = new LinkedHashMap<>();
        LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endOfMonth = LocalDateTime.of(year, month, 1, 0, 0).plusMonths(1).minusSeconds(1);
        
        // Adhérents créés ce mois
        long newAdherents = adherentRepository.findAll().stream()
            .filter(a -> a.getCreatedAt().isAfter(startOfMonth) && a.getCreatedAt().isBefore(endOfMonth))
            .count();
        
        // Statistiques par statut
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
