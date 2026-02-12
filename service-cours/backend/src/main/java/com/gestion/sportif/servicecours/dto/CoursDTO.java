package com.gestion.sportif.servicecours.dto;

import com.gestion.sportif.servicecours.entity.NiveauAcces;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO pour transférer les informations d'un cours
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursDTO {
    private Long id;
    private String titre;
    private String description;
    private String type;
    private String coach;
    private String salle;
    private Integer capaciteMax;  // ✅ CORRIGÉ : était capaciteMaximale
    private NiveauAcces niveau;  // ✅ CORRIGÉ : était niveauAcces
    private LocalDateTime dateHeure;
    private Integer duree;
    private Boolean actif;
    private Integer nombreInscrits;
    private Integer placesRestantes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}