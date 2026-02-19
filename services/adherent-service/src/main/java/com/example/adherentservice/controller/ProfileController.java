package com.example.adherentservice.controller;

import com.example.adherentservice.model.Adherent;
import com.example.adherentservice.model.Subscription;
import com.example.adherentservice.security.JwtService;
import com.example.adherentservice.service.AdherentService;
import com.example.adherentservice.repository.SubscriptionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "User profile and subscription management endpoints")
public class ProfileController {

    private final AdherentService adherentService;
    private final JwtService jwtService;
    private final SubscriptionRepository subscriptionRepository;

    public ProfileController(AdherentService adherentService, JwtService jwtService, SubscriptionRepository subscriptionRepository) {
        this.adherentService = adherentService;
        this.jwtService = jwtService;
        this.subscriptionRepository = subscriptionRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get current user profile", description = "Retrieve the profile and subscription information of the logged-in user")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user does not have access")
    })
    public ResponseEntity<Map<String, Object>> getCurrentUserProfile(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        
        if (email == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            Adherent adherent = adherentService.getAdherentByEmail(email);
            Subscription subscription = subscriptionRepository.findByAdherentId(adherent.getId()).orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("adherent", adherent);
            response.put("subscription", subscription);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).build();
        }
    }
}
