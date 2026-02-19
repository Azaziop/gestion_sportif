package com.gestion.sportif.servicecours.repository;

import com.gestion.sportif.servicecours.entity.Cours;
import com.gestion.sportif.servicecours.entity.NiveauAcces;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour gérer les opérations CRUD sur l'entité Cours
 */
@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {

    /**
     * Trouve tous les cours actifs
     */
    List<Cours> findByActifTrue();

    /**
     * Trouve les cours par type
     */
    List<Cours> findByTypeAndActifTrue(String type);

    /**
     * Trouve les cours par coach
     */
    List<Cours> findByCoachAndActifTrue(String coach);

    /**
     * Trouve les cours par niveau d'accès
     */
    List<Cours> findByNiveauAndActifTrue(NiveauAcces niveau);  // ✅ CORRIGÉ

    /**
     * Trouve les cours disponibles (avec des places restantes)
     */
    @Query("SELECT c FROM Cours c WHERE c.actif = true AND c.nombreInscrits < c.capaciteMax")  // ✅ CORRIGÉ
    List<Cours> findCoursDisponibles();

    /**
     * Trouve les cours dans une période donnée
     */
    @Query("SELECT c FROM Cours c WHERE c.actif = true AND c.dateHeure BETWEEN :dateDebut AND :dateFin ORDER BY c.dateHeure")
    List<Cours> findCoursByPeriode(@Param("dateDebut") LocalDateTime dateDebut,
                                     @Param("dateFin") LocalDateTime dateFin);

    /**
     * Trouve les cours futurs
     */
    @Query("SELECT c FROM Cours c WHERE c.actif = true AND c.dateHeure > :maintenant ORDER BY c.dateHeure")
    List<Cours> findCoursFuturs(@Param("maintenant") LocalDateTime maintenant);

    /**
     * Trouve les cours par salle
     */
    List<Cours> findBySalleAndActifTrue(String salle);

    /**
     * Vérifie s'il existe un cours dans une salle à une heure donnée
     */
    @Query("SELECT COUNT(c) > 0 FROM Cours c WHERE c.salle = :salle AND c.actif = true " +
           "AND c.dateHeure BETWEEN :debut AND :fin")
    boolean existsCoursInSalleAtTime(@Param("salle") String salle,
                                      @Param("debut") LocalDateTime debut,
                                      @Param("fin") LocalDateTime fin);

    /**
     * Trouve les cours avec places disponibles par type
     */
    @Query("SELECT c FROM Cours c WHERE c.actif = true AND c.type = :type " +
           "AND c.nombreInscrits < c.capaciteMax AND c.dateHeure > :maintenant " +  // ✅ CORRIGÉ
           "ORDER BY c.dateHeure")
    List<Cours> findCoursDisponiblesByType(@Param("type") String type,
                                            @Param("maintenant") LocalDateTime maintenant);
}