package com.example.demo.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.example.demo.model.enums.AdherentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
    
    @Column(columnDefinition = "BYTEA", nullable = false)
    @NotNull(message = "Le certificat médical est obligatoire")
    private byte[] medicalCertificate;
    
    @Column(columnDefinition = "BYTEA")
    private byte[] photo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdherentStatus status;
    
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "subscription_id")
    private Subscription currentSubscription;
    
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
        return status == AdherentStatus.ACTIVE && 
               currentSubscription != null && 
               currentSubscription.isActive();
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
    
    public byte[] getPhoto() { return photo; }
    public void setPhoto(byte[] photo) { this.photo = photo; }
    
    public AdherentStatus getStatus() { return status; }
    public void setStatus(AdherentStatus status) { this.status = status; }
    
    public Subscription getCurrentSubscription() { return currentSubscription; }
    public void setCurrentSubscription(Subscription currentSubscription) { this.currentSubscription = currentSubscription; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getSuspendedReason() { return suspendedReason; }
    public void setSuspendedReason(String suspendedReason) { this.suspendedReason = suspendedReason; }
    
    public LocalDateTime getSuspendedDate() { return suspendedDate; }
    public void setSuspendedDate(LocalDateTime suspendedDate) { this.suspendedDate = suspendedDate; }
}
