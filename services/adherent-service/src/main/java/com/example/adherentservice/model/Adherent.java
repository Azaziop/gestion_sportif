package com.example.adherentservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Entité représentant un adhérent du club sportif
 */
@Entity
@Table(name = "adherents", indexes = {
    @Index(name = "idx_email", columnList = "email", unique = true),
    @Index(name = "idx_status", columnList = "status")
})
public class Adherent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    private String firstName;

    @Column(nullable = false)
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    private String lastName;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;

    @Column(nullable = false)
    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Le numéro de téléphone doit être valide")
    private String phoneNumber;

    @Column(nullable = false)
    @NotNull(message = "La date de naissance est obligatoire")
    @Past(message = "La date de naissance doit être dans le passé")
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    @NotBlank(message = "L'adresse est obligatoire")
    private String address;

    @Column
    private String city;

    @Column
    private String postalCode;

    @Column
    private String country;

    @Column(columnDefinition = "BYTEA")
    @JsonIgnore
    private byte[] medicalCertificate;

    @Column(columnDefinition = "BYTEA")
    @JsonIgnore
    private byte[] photo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdherentStatus status;

    // Colonnes d'abonnement
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_type")
    private SubscriptionType subscriptionType;

    @Column(name = "subscription_price")
    private Double subscriptionPrice;

    @Column(name = "subscription_start_date")
    private LocalDate subscriptionStartDate;

    @Column(name = "subscription_duration_months")
    private Integer subscriptionDurationMonths;

    @Column(name = "subscription_end_date")
    private LocalDate subscriptionEndDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "suspended_reason")
    private String suspendedReason;

    @Column(name = "suspended_date")
    private LocalDateTime suspendedDate;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = AdherentStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Vérifie si l'adhérent a un abonnement valide et actif
     */
    public boolean hasActiveSubscription() {
        if (subscriptionType == null || subscriptionStartDate == null) {
            return false;
        }
        
        LocalDate now = LocalDate.now();
        if (now.isBefore(subscriptionStartDate)) {
            return false;
        }
        
        if (subscriptionEndDate != null && now.isAfter(subscriptionEndDate)) {
            return false;
        }
        
        return status == AdherentStatus.ACTIVE;
    }

    /**
     * Vérifie si l'adhérent peut s'inscrire à une séance
     * (validation du statut et de l'abonnement)
     */
    public boolean isEligibleForSession() {
        return hasActiveSubscription() &&
               status != AdherentStatus.SUSPENDED &&
               medicalCertificate != null;
    }

    /**
     * Obtient le nom complet de l'adhérent
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public byte[] getMedicalCertificate() { return medicalCertificate; }
    public void setMedicalCertificate(byte[] medicalCertificate) { this.medicalCertificate = medicalCertificate; }

    @JsonProperty("medicalCertificate")
    public String getMedicalCertificateBase64() {
        return medicalCertificate != null ? Base64.getEncoder().encodeToString(medicalCertificate) : null;
    }

    @JsonProperty("medicalCertificate")
    public void setMedicalCertificateBase64(String base64) {
        if (base64 != null && !base64.isEmpty()) {
            this.medicalCertificate = Base64.getDecoder().decode(base64);
        }
    }

    public byte[] getPhoto() { return photo; }
    public void setPhoto(byte[] photo) { this.photo = photo; }

    @JsonProperty("photo")
    public String getPhotoBase64() {
        return photo != null && photo.length > 0 ? Base64.getEncoder().encodeToString(photo) : null;
    }

    @JsonProperty("photo")
    public void setPhotoBase64(String base64) {
        if (base64 != null && !base64.isEmpty()) {
            this.photo = Base64.getDecoder().decode(base64);
        }
    }

    public AdherentStatus getStatus() { return status; }
    public void setStatus(AdherentStatus status) { this.status = status; }

    public SubscriptionType getSubscriptionType() { return subscriptionType; }
    public void setSubscriptionType(SubscriptionType subscriptionType) { this.subscriptionType = subscriptionType; }

    public Double getSubscriptionPrice() { return subscriptionPrice; }
    public void setSubscriptionPrice(Double subscriptionPrice) { this.subscriptionPrice = subscriptionPrice; }

    public LocalDate getSubscriptionStartDate() { return subscriptionStartDate; }
    public void setSubscriptionStartDate(LocalDate subscriptionStartDate) { 
        this.subscriptionStartDate = subscriptionStartDate;
        // Calculer automatiquement la date de fin si la durée est définie
        if (subscriptionStartDate != null && subscriptionDurationMonths != null) {
            this.subscriptionEndDate = subscriptionStartDate.plusMonths(subscriptionDurationMonths);
        }
    }

    public Integer getSubscriptionDurationMonths() { return subscriptionDurationMonths; }
    public void setSubscriptionDurationMonths(Integer subscriptionDurationMonths) { 
        this.subscriptionDurationMonths = subscriptionDurationMonths;
        // Calculer automatiquement la date de fin si la date de début est définie
        if (subscriptionStartDate != null && subscriptionDurationMonths != null) {
            this.subscriptionEndDate = subscriptionStartDate.plusMonths(subscriptionDurationMonths);
        }
    }

    public LocalDate getSubscriptionEndDate() { return subscriptionEndDate; }
    public void setSubscriptionEndDate(LocalDate subscriptionEndDate) { this.subscriptionEndDate = subscriptionEndDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getSuspendedReason() { return suspendedReason; }
    public void setSuspendedReason(String suspendedReason) { this.suspendedReason = suspendedReason; }

    public LocalDateTime getSuspendedDate() { return suspendedDate; }
    public void setSuspendedDate(LocalDateTime suspendedDate) { this.suspendedDate = suspendedDate; }
}
