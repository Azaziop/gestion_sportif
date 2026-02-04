package com.example.demo.controller;

import com.example.demo.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    private final ReportService reportService;
    
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }
    
    /**
     * Rapport général avec statistiques globales
     */
    @GetMapping("/general-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getGeneralStatistics() {
        return ResponseEntity.ok(reportService.getGeneralStatistics());
    }
    
    /**
     * Rapport sur les abonnements et chiffre d'affaires
     */
    @GetMapping("/subscription-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSubscriptionStatistics() {
        return ResponseEntity.ok(reportService.getSubscriptionStatistics());
    }
    
    /**
     * Rapport mensuel
     */
    @GetMapping("/monthly/{year}/{month}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMonthlyReport(@PathVariable int year, @PathVariable int month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(month, year));
    }
    
    /**
     * Rapport des adhérents par statut
     */
    @GetMapping("/adherents-by-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdherentsByStatusReport() {
        return ResponseEntity.ok(reportService.getAdherentsByStatusReport());
    }
}
