package com.gestion.sportif.servicecours.dto;

import com.gestion.sportif.servicecours.entity.NiveauAcces;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO pour la création d'un nouveau cours
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private Integer capaciteMax;  // ✅ CORRIGÉ : était capaciteMaximale

    @NotNull(message = "Le niveau d'accès est obligatoire")
    private NiveauAcces niveau;  // ✅ CORRIGÉ : était niveauAcces

    @NotNull(message = "La date et l'heure du cours sont obligatoires")
    @Future(message = "La date du cours doit être dans le futur")
    private LocalDateTime dateHeure;

    @NotNull(message = "La durée est obligatoire")
    @Min(value = 15, message = "La durée minimale est de 15 minutes")
    @Max(value = 300, message = "La durée maximale est de 300 minutes")
    private Integer duree;
}