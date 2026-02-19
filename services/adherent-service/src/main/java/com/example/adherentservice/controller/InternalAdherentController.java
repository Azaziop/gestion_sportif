package com.example.adherentservice.controller;

import com.example.adherentservice.model.Adherent;
import com.example.adherentservice.service.AdherentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/adherents")
public class InternalAdherentController {

    private final AdherentService adherentService;

    public InternalAdherentController(AdherentService adherentService) {
        this.adherentService = adherentService;
    }

    public record AdherentInfoDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        String status,
        String subscriptionType
    ) {}

    @GetMapping("/{id}")
    public ResponseEntity<AdherentInfoDTO> getAdherent(@PathVariable Long id) {
        Adherent adherent = adherentService.getAdherentById(id);
        AdherentInfoDTO dto = new AdherentInfoDTO(
            adherent.getId(),
            adherent.getFirstName(),
            adherent.getLastName(),
            adherent.getEmail(),
            adherent.getStatus() != null ? adherent.getStatus().name() : null,
            adherent.getSubscriptionType() != null ? adherent.getSubscriptionType().name() : null
        );
        return ResponseEntity.ok(dto);
    }

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