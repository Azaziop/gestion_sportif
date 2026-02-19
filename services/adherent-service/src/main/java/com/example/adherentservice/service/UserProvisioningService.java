package com.example.adherentservice.service;

import com.example.adherentservice.model.Adherent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;

@Service
public class UserProvisioningService {

    private static final Logger logger = LoggerFactory.getLogger(UserProvisioningService.class);
    private final WebClient webClient;

    public UserProvisioningService(WebClient.Builder builder) {
        String gatewayUrl = System.getenv().getOrDefault("API_GATEWAY_URL", "http://api-gateway:8080");
        this.webClient = builder.baseUrl(gatewayUrl).build(); // via API Gateway
    }

    public void createUserForAdherent(Adherent adherent) {
        String defaultPassword = "user123";
        
        try {
            // 1. Créer le compte utilisateur dans auth-service
            webClient.post()
                .uri("/api/auth/register")
                .bodyValue(new RegisterRequest(adherent.getEmail(), defaultPassword, adherent.getEmail()))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
            
            logger.info("Compte utilisateur créé dans auth-service pour: {}", adherent.getEmail());

            // 2. Synchroniser l'adhérent dans user-service
            webClient.post()
                .uri("/api/internal/adherents/sync")
                .bodyValue(new AdherentSyncRequest(
                    adherent.getFirstName(),
                    adherent.getLastName(),
                    adherent.getEmail(),
                    adherent.getPhoneNumber(),
                    adherent.getDateOfBirth(),
                    adherent.getAddress(),
                    adherent.getCity(),
                    adherent.getPostalCode(),
                    adherent.getCountry(),
                    adherent.getMedicalCertificate(),
                    adherent.getPhoto()
                ))
                .retrieve()
                .bodyToMono(Void.class)
                .block();
            
            logger.info("Adhérent synchronisé dans user-service pour: {}", adherent.getEmail());
            
        } catch (Exception e) {
            logger.error("Erreur lors de la création/synchronisation pour {}: {}", adherent.getEmail(), e.getMessage());
            // On ne bloque pas la création de l'adhérent si la sync échoue
        }
    }

    public record RegisterRequest(String username, String password, String email) {}
    
    public record AdherentSyncRequest(
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        LocalDate dateOfBirth,
        String address,
        String city,
        String postalCode,
        String country,
        byte[] medicalCertificate,
        byte[] photo
    ) {}
}
