package com.gestion.sportif.servicecours.service;

import com.gestion.sportif.servicecours.dto.CoursDTO;
import com.gestion.sportif.servicecours.dto.CreateCoursRequest;
import com.gestion.sportif.servicecours.dto.UpdateCoursRequest;
import com.gestion.sportif.servicecours.entity.NiveauAcces;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface dÃƒÂ©finissant les services de gestion des cours
 */
public interface CoursService {

    /**
     * CrÃƒÂ©e un nouveau cours
     */
    CoursDTO createCours(CreateCoursRequest request);

    /**
     * RÃƒÂ©cupÃƒÂ¨re un cours par son ID
     */
    CoursDTO getCoursById(Long id);

    /**
     * RÃƒÂ©cupÃƒÂ¨re tous les cours actifs
     */
    List<CoursDTO> getAllCours();

    /**
     * Met ÃƒÂ  jour un cours existant
     */
    CoursDTO updateCours(Long id, UpdateCoursRequest request);

    /**
     * Supprime un cours (soft delete - dÃƒÂ©sactivation)
     */
    void deleteCours(Long id);

    /**
     * Supprime dÃƒÂ©finitivement un cours de la base de donnÃƒÂ©es
     */
    void hardDeleteCours(Long id);

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours par type
     */
    List<CoursDTO> getCoursByType(String type);

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours par coach
     */
    List<CoursDTO> getCoursByCoach(String coach);

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours par niveau d'accÃƒÂ¨s
     */
    List<CoursDTO> getCoursByNiveauAcces(NiveauAcces niveauAcces);

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours disponibles (avec places restantes)
     */
    List<CoursDTO> getCoursDisponibles();

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours dans une pÃƒÂ©riode donnÃƒÂ©e
     */
    List<CoursDTO> getCoursByPeriode(LocalDateTime dateDebut, LocalDateTime dateFin);

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours futurs
     */
    List<CoursDTO> getCoursFuturs();

    /**
     * VÃƒÂ©rifie si un adhÃƒÂ©rent peut s'inscrire ÃƒÂ  un cours
     */
    boolean canAdherentInscribe(Long coursId, String typeAbonnement);

    /**
     * VÃƒÂ©rifie la disponibilitÃƒÂ© d'une salle ÃƒÂ  une heure donnÃƒÂ©e
     */
    boolean isSalleDisponible(String salle, LocalDateTime dateDebut, LocalDateTime dateFin);

    /**
     * IncrÃƒÂ©mente le nombre d'inscrits ÃƒÂ  un cours
     */
    void incrementNombreInscrits(Long coursId);

    /**
     * DÃƒÂ©crÃƒÂ©mente le nombre d'inscrits ÃƒÂ  un cours
     */
    void decrementNombreInscrits(Long coursId);
}




