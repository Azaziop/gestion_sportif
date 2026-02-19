package com.example.adherentservice.controller;

import com.example.adherentservice.model.Adherent;
import com.example.adherentservice.model.SubscriptionType;
import com.example.adherentservice.service.AdherentService;
import com.example.adherentservice.service.UserProvisioningService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/adherents")
@Validated
public class AdherentController {

    private final AdherentService adherentService;
    private final UserProvisioningService userProvisioningService;

    public AdherentController(AdherentService adherentService, UserProvisioningService userProvisioningService) {
        this.adherentService = adherentService;
        this.userProvisioningService = userProvisioningService;
    }

    // DTO pour les données d'abonnement
    public static class SubscriptionRequest {
        private SubscriptionType type;
        private Double price;
        private LocalDate startDate;
        private Integer durationMonths;

        public SubscriptionType getType() { return type; }
        public void setType(SubscriptionType type) { this.type = type; }
        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public Integer getDurationMonths() { return durationMonths; }
        public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    }

    // ===== CRÉATION =====

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> createAdherent(@RequestBody Adherent adherent) {
        Adherent saved = adherentService.createAdherent(adherent);
        
        // Créer automatiquement un compte utilisateur et synchroniser avec user-service
        userProvisioningService.createUserForAdherent(saved);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    // ===== LECTURE =====
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Adherent> getAdherentById(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.getAdherentById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Adherent>> getAdherents(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Adherent> result = adherentService.getAllAdherents(pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> getAdherentByEmail(@PathVariable String email) {
        return ResponseEntity.ok(adherentService.getAdherentByEmail(email));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Adherent>> getAllActiveAdherents() {
        return ResponseEntity.ok(adherentService.getAllActiveAdherents());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Adherent>> searchAdherentsByName(@RequestParam String name) {
        return ResponseEntity.ok(adherentService.searchAdherentsByName(name));
    }

    // ===== MODIFICATION =====

    @PutMapping("/{id}")
    public ResponseEntity<Adherent> updateAdherent(@PathVariable Long id, @RequestBody Adherent updates) {
        return ResponseEntity.ok(adherentService.updateAdherent(id, updates));
    }

    @PostMapping("/{id}/subscription")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> assignSubscription(@PathVariable Long id, @RequestBody SubscriptionRequest request) {
        Adherent updated = adherentService.assignSubscription(
            id, 
            request.getType(), 
            request.getPrice(), 
            request.getStartDate(), 
            request.getDurationMonths()
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/subscription")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> removeSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.removeSubscription(id));
    }

    // ===== STATUT =====

    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> suspendAdherent(@PathVariable Long id, @RequestParam(defaultValue = "") String reason) {
        return ResponseEntity.ok(adherentService.suspendAdherent(id, reason));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> reactivateAdherent(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.reactivateAdherent(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateAdherent(@PathVariable Long id) {
        adherentService.deactivateAdherent(id);
        return ResponseEntity.noContent().build();
    }

    // ===== VÉRIFICATIONS =====

    @GetMapping("/{id}/has-active-subscription")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Boolean> hasActiveSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.hasActiveSubscription(id));
    }

    @GetMapping("/{id}/eligible-for-session")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Boolean> isEligibleForSession(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.isEligibleForSession(id));
    }

    @GetMapping("/{id}/weekly-session-limit")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Integer> getWeeklySessionLimit(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.getWeeklySessionLimit(id));
    }

    // ===== CERTIFICATS MÉDICAUX =====
    @PutMapping("/{id}/medical-certificate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> updateMedicalCertificate(@PathVariable Long id, @RequestBody byte[] certificate) {
        Adherent updated = adherentService.updateMedicalCertificate(id, certificate);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/medical-certificate-valid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> isMedicalCertificateValid(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.isMedicalCertificateValid(id));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Adherent>> getAdherentsByStatus(@PathVariable String status,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Adherent> result = adherentService.getAdherentsByStatus(status, pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(result);
    }
    
    // ===== PROFIL UTILISATEUR =====
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Adherent> getCurrentUserProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        
        String email = authentication.getName();
        Adherent adherent = adherentService.getAdherentByEmail(email);
        
        if (adherent == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(adherent);
    }
}
