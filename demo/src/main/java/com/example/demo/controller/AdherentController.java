package com.example.demo.controller;

import com.example.demo.model.entity.Adherent;
import com.example.demo.model.entity.Subscription;
import com.example.demo.model.enums.AdherentStatus;
import com.example.demo.service.AdherentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/adherents")
@Validated
public class AdherentController {
    
    private static final Logger log = Logger.getLogger(AdherentController.class.getName());
    
    private final AdherentService adherentService;
    
    public AdherentController(AdherentService adherentService) {
        this.adherentService = adherentService;
    }
    
    // ===== CRÉATION =====
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> createAdherent(@Valid @RequestBody Adherent adherent) {
        Adherent saved = adherentService.createAdherent(adherent);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    // ===== LECTURE =====
    @GetMapping("/{id}")
    public ResponseEntity<Adherent> getAdherentById(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.getAdherentById(id));
    }

    @GetMapping
    public ResponseEntity<Page<Adherent>> getAdherents(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Adherent> result = adherentService.getAllAdherents(pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Adherent> getAdherentByEmail(@PathVariable String email) {
        return ResponseEntity.ok(adherentService.getAdherentByEmail(email));
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Adherent>> getAllActiveAdherents() {
        return ResponseEntity.ok(adherentService.getAllActiveAdherents());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Adherent>> searchAdherentsByName(@RequestParam String name) {
        return ResponseEntity.ok(adherentService.searchAdherentsByName(name));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Adherent>> getAdherentsByStatus(@PathVariable AdherentStatus status) {
        return ResponseEntity.ok(adherentService.getAdherentsByStatus(status));
    }
    
    // ===== MODIFICATION =====
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> updateAdherent(@PathVariable Long id, @Valid @RequestBody Adherent updates) {
        return ResponseEntity.ok(adherentService.updateAdherent(id, updates));
    }
    
    @PostMapping("/{id}/subscription")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Adherent> assignSubscription(@PathVariable Long id, @Valid @RequestBody Subscription sub) {
        return ResponseEntity.ok(adherentService.assignSubscription(id, sub));
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
    public ResponseEntity<Boolean> hasActiveSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.hasActiveSubscription(id));
    }
    
    @GetMapping("/{id}/eligible-for-session")
    public ResponseEntity<Boolean> isEligibleForSession(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.isEligibleForSession(id));
    }
    
    @GetMapping("/{id}/weekly-session-limit")
    public ResponseEntity<Integer> getWeeklySessionLimit(@PathVariable Long id) {
        return ResponseEntity.ok(adherentService.getWeeklySessionLimit(id));
    }
}