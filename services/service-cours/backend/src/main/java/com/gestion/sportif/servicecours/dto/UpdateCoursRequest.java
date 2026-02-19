package com.gestion.sportif.servicecours.dto;

import com.gestion.sportif.servicecours.entity.NiveauAcces;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * DTO pour la mise à jour d'un cours existant
 */
public class UpdateCoursRequest {

    @Size(min = 3, max = 100, message = "Le titre doit contenir entre 3 et 100 caractères")
    private String titre;

    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    private String type;

    private String coach;

    private String salle;

    @Min(value = 1, message = "La capacité doit être d'au moins 1 personne")
    @Max(value = 100, message = "La capacité ne peut pas dépasser 100 personnes")
    private Integer capaciteMax;

    private NiveauAcces niveau;

    @Future(message = "La date du cours doit être dans le futur")
    private LocalDateTime dateHeure;

    @Min(value = 15, message = "La durée minimale est de 15 minutes")
    @Max(value = 300, message = "La durée maximale est de 300 minutes")
    private Integer duree;

    private Boolean actif;

    public UpdateCoursRequest() {}

    public UpdateCoursRequest(String titre, String description, String type, String coach, 
                             String salle, Integer capaciteMax, NiveauAcces niveau, 
                             LocalDateTime dateHeure, Integer duree, Boolean actif) {
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
    }

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
}