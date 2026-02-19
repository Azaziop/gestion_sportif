package com.gestion.sportif.servicecours.dto;

import com.gestion.sportif.servicecours.entity.NiveauAcces;

import java.time.LocalDateTime;

/**
 * DTO pour transférer les informations d'un cours
 */
public class CoursDTO {
    private Long id;
    private String titre;
    private String description;
    private String type;
    private String coach;
    private String salle;
    private Integer capaciteMax;
    private NiveauAcces niveau;
    private LocalDateTime dateHeure;
    private Integer duree;
    private Boolean actif;
    private Integer nombreInscrits;
    private Integer placesRestantes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CoursDTO() {}

    public CoursDTO(Long id, String titre, String description, String type, String coach, 
                    String salle, Integer capaciteMax, NiveauAcces niveau, LocalDateTime dateHeure, 
                    Integer duree, Boolean actif, Integer nombreInscrits, Integer placesRestantes, 
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.type = type;
        this.coach = coach;
        this.salle = salle;
        this.capaciteMax = capaciteMax;
        this.niveau = niveau;
        this.dateHeure = dateHeure;
        this.duree = duree;
        this.actif = actif;
        this.nombreInscrits = nombreInscrits;
        this.placesRestantes = placesRestantes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

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

    public Integer getCapaciteMax() { return capaciteMax; }
    public void setCapaciteMax(Integer capaciteMax) { this.capaciteMax = capaciteMax; }

    public NiveauAcces getNiveau() { return niveau; }
    public void setNiveau(NiveauAcces niveau) { this.niveau = niveau; }

    public LocalDateTime getDateHeure() { return dateHeure; }
    public void setDateHeure(LocalDateTime dateHeure) { this.dateHeure = dateHeure; }

    public Integer getDuree() { return duree; }
    public void setDuree(Integer duree) { this.duree = duree; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }

    public Integer getNombreInscrits() { return nombreInscrits; }
    public void setNombreInscrits(Integer nombreInscrits) { this.nombreInscrits = nombreInscrits; }

    public Integer getPlacesRestantes() { return placesRestantes; }
    public void setPlacesRestantes(Integer placesRestantes) { this.placesRestantes = placesRestantes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}