package com.gestion.sportif.servicecours.dto;

import com.gestion.sportif.servicecours.entity.NiveauAcces;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO pour la mise à jour d'un cours existant
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private Integer capaciteMax;  // ✅ CORRIGÉ : était capaciteMaximale

    private NiveauAcces niveau;  // ✅ CORRIGÉ : était niveauAcces

    @Future(message = "La date du cours doit être dans le futur")
    private LocalDateTime dateHeure;

    @Min(value = 15, message = "La durée minimale est de 15 minutes")
    @Max(value = 300, message = "La durée maximale est de 300 minutes")
    private Integer duree;

    private Boolean actif;
}