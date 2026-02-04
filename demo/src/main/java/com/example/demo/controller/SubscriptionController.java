package com.example.demo.controller;

import com.example.demo.model.entity.Subscription;
import com.example.demo.model.enums.SubscriptionType;
import com.example.demo.service.SubscriptionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@Validated
public class SubscriptionController {
    
    private final SubscriptionService subscriptionService;
    
    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    
    // ===== CRÉATION =====
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subscription> createSubscription(@RequestBody Subscription subscription) {
        Subscription saved = subscriptionService.createSubscription(subscription);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    // ===== LECTURE =====
    // GET endpoints are public (no auth required) so users can browse subscriptions
    
    @GetMapping("/{id}")
    public ResponseEntity<Subscription> getSubscriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionById(id));
    }
    
    @GetMapping
    public ResponseEntity<Page<Subscription>> getSubscriptions(@RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Subscription> result = subscriptionService.getAllSubscriptions(pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<Subscription> getSubscriptionByType(@PathVariable SubscriptionType type) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionByType(type));
    }
    
    @GetMapping("/all-types")
    public ResponseEntity<List<Subscription>> getAllSubscriptionTypes() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptionTypes());
    }
    
    @GetMapping("/types/available")
    public ResponseEntity<SubscriptionType[]> getAvailableSubscriptionTypes() {
        return ResponseEntity.ok(SubscriptionType.values());
    }
    
    // ===== MODIFICATION =====
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subscription> updateSubscription(@PathVariable Long id,@RequestBody Subscription subscription) {
        Subscription updated = subscriptionService.updateSubscription(id, subscription);
        return ResponseEntity.ok(updated);
    }
    
    @PatchMapping("/{id}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Subscription> updatePrice(@PathVariable Long id, @RequestParam Double price) {
        Subscription updated = subscriptionService.updatePrice(id, price);
        return ResponseEntity.ok(updated);
    }
    
    // ===== SUPPRESSION =====
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }
}
