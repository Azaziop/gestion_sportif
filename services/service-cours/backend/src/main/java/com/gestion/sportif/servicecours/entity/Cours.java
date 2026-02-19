package com.gestion.sportif.servicecours.entity;  

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entité représentant un cours/séance dans le club sportif
 */
@Entity
@Table(name = "cours")
public class Cours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 100, message = "Le titre doit contenir entre 3 et 100 caractères")
    @Column(nullable = false, length = 100)
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    @Column(nullable = false, length = 500)
    private String description;

    @NotBlank(message = "Le type de cours est obligatoire")
    @Column(nullable = false, length = 50)
    private String type; // yoga, foot, musculation, natation, etc.

    @NotBlank(message = "Le nom du coach est obligatoire")
    @Column(nullable = false, length = 100)
    private String coach;

    @NotBlank(message = "La salle est obligatoire")
    @Column(nullable = false, length = 50)
    private String salle;

    @NotNull(message = "La capacité maximale est obligatoire")
    @Min(value = 1, message = "La capacité doit être d'au moins 1 personne")
    @Max(value = 100, message = "La capacité ne peut pas dépasser 100 personnes")
    @Column(nullable = false)
    private Integer capaciteMax;  // ✅ CORRIGÉ : était capaciteMaximale

    @NotNull(message = "Le niveau d'accès est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauAcces niveau;  // ✅ CORRIGÉ : était niveauAcces

    @NotNull(message = "La date et l'heure du cours sont obligatoires")
    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @NotNull(message = "La durée est obligatoire")
    @Min(value = 15, message = "La durée minimale est de 15 minutes")
    @Max(value = 300, message = "La durée maximale est de 300 minutes (5 heures)")
    @Column(nullable = false)
    private Integer duree; // durée en minutes

    @Column(nullable = false)
    private Boolean actif = true; // Pour désactiver un cours sans le supprimer

    @Column(nullable = false)
    private Integer nombreInscrits = 0; // Nombre actuel d'inscrits

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Vérifie si le cours a encore de la place disponible
     */
    @Transient
    public boolean hasPlaceDisponible() {
        return nombreInscrits < capaciteMax;  // ✅ CORRIGÉ
    }

    /**
     * Vérifie si un adhérent peut s'inscrire selon son type d'abonnement
     */
    @Transient
    public boolean isEligiblePour(String typeAbonnement) {
        if (niveau == NiveauAcces.BASIC) {  // ✅ CORRIGÉ
            return true; // Accessible à tous
        }
        return "PREMIUM".equalsIgnoreCase(typeAbonnement);
    }

    /**
     * Calcule le nombre de places restantes
     */
    @Transient
    public int getPlacesRestantes() {
        return capaciteMax - nombreInscrits;  // ✅ CORRIGÉ
    }

    // Constructeur par défaut
    public Cours() {}

    // Constructeur avec tous les paramètres
    public Cours(Long id, String titre, String description, String type, String coach, String salle,
                 Integer capaciteMax, NiveauAcces niveau, LocalDateTime dateHeure,  // ✅ CORRIGÉ
                 Integer duree, Boolean actif, Integer nombreInscrits,
                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.type = type;
        this.coach = coach;
        this.salle = salle;
        this.capaciteMax = capaciteMax;  // ✅ CORRIGÉ
        this.niveau = niveau;  // ✅ CORRIGÉ
        this.dateHeure = dateHeure;
        this.duree = duree;
        this.actif = actif != null ? actif : true;
        this.nombreInscrits = nombreInscrits != null ? nombreInscrits : 0;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters & Setters (explicites)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCoach() { return coach; }
    public void setCoach(String coach) { this.coach = coach; }

    public String getSalle() { return salle; }
    public void setSalle(String salle) { this.salle = salle; }

    public Integer getCapaciteMax() { return capaciteMax; }  // ✅ CORRIGÉ
    public void setCapaciteMax(Integer capaciteMax) { this.capaciteMax = capaciteMax; }  // ✅ CORRIGÉ

    public NiveauAcces getNiveau() { return niveau; }  // ✅ CORRIGÉ
    public void setNiveau(NiveauAcces niveau) { this.niveau = niveau; }  // ✅ CORRIGÉ

    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }

    public Integer getDuree() { return duree; }
    public void setDuree(Integer duree) { this.duree = duree; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }

    public Integer getNombreInscrits() { return nombreInscrits; }
    public void setNombreInscrits(Integer nombreInscrits) { this.nombreInscrits = nombreInscrits; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}