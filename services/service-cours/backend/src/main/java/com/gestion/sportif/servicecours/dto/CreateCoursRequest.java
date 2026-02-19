package com.gestion.sportif.servicecours.dto;

import com.gestion.sportif.servicecours.entity.NiveauAcces;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

/**
 * DTO pour la création d'un nouveau cours
 */
public class CreateCoursRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 100, message = "Le titre doit contenir entre 3 et 100 caractères")
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    @NotBlank(message = "Le type de cours est obligatoire")
    private String type;

    @NotBlank(message = "Le nom du coach est obligatoire")
    private String coach;

    @NotBlank(message = "La salle est obligatoire")
    private String salle;

    @NotNull(message = "La capacité maximale est obligatoire")
    @Min(value = 1, message = "La capacité doit être d'au moins 1 personne")
    @Max(value = 100, message = "La capacité ne peut pas dépasser 100 personnes")
    private Integer capaciteMax;

    @NotNull(message = "Le niveau d'accès est obligatoire")
    private NiveauAcces niveau;

    @NotNull(message = "La date et l'heure du cours sont obligatoires")
    @Future(message = "La date du cours doit être dans le futur")
    private LocalDateTime dateHeure;

    @NotNull(message = "La durée est obligatoire")
    @Min(value = 15, message = "La durée minimale est de 15 minutes")
    @Max(value = 300, message = "La durée maximale est de 300 minutes")
    private Integer duree;

    public CreateCoursRequest() {}

    public CreateCoursRequest(String titre, String description, String type, String coach, 
                             String salle, Integer capaciteMax, NiveauAcces niveau, 
                             LocalDateTime dateHeure, Integer duree) {
        this.titre = titre;
        this.description = description;
        this.type = type;
        this.coach = coach;
        this.salle = salle;
        this.capaciteMax = capaciteMax;
        this.niveau = niveau;
        this.dateHeure = dateHeure;
        this.duree = duree;
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
}