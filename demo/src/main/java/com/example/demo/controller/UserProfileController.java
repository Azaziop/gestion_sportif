package com.example.demo.controller;

import com.example.demo.model.entity.Adherent;
import com.example.demo.model.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.AdherentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserRepository userRepository;
    private final AdherentRepository adherentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileController(UserRepository userRepository, 
                                 AdherentRepository adherentRepository,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adherentRepository = adherentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<Adherent> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.getAdherent() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(user.getAdherent());
    }

    @PutMapping
    public ResponseEntity<Adherent> updateProfile(@RequestBody Adherent updatedAdherent) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Adherent adherent = user.getAdherent();
        if (adherent == null) {
            return ResponseEntity.notFound().build();
        }

        // Mise à jour des champs modifiables par l'utilisateur
        if (updatedAdherent.getEmail() != null) adherent.setEmail(updatedAdherent.getEmail());
        if (updatedAdherent.getPhoneNumber() != null) adherent.setPhoneNumber(updatedAdherent.getPhoneNumber());
        if (updatedAdherent.getAddress() != null) adherent.setAddress(updatedAdherent.getAddress());
        if (updatedAdherent.getCity() != null) adherent.setCity(updatedAdherent.getCity());
        if (updatedAdherent.getPostalCode() != null) adherent.setPostalCode(updatedAdherent.getPostalCode());
        if (updatedAdherent.getCountry() != null) adherent.setCountry(updatedAdherent.getCountry());
        if (updatedAdherent.getPhoto() != null) adherent.setPhoto(updatedAdherent.getPhoto());
        if (updatedAdherent.getMedicalCertificate() != null) adherent.setMedicalCertificate(updatedAdherent.getMedicalCertificate());

        Adherent saved = adherentRepository.save(adherent);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> passwordData) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Ancien et nouveau mot de passe requis"));
        }

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Ancien mot de passe incorrect"));
        }

        // Valider le nouveau mot de passe
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Le nouveau mot de passe doit contenir au moins 8 caractères"));
        }

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}
