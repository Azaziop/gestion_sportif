package com.example.adherentservice.repository;

import com.example.adherentservice.model.Adherent;
import com.example.adherentservice.model.AdherentStatus;
import com.example.adherentservice.model.SubscriptionType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository pour gérer les adhérents
 */
@Repository
public interface AdherentRepository extends JpaRepository<Adherent, Long> {

    /**
     * Trouve un adhérent par son email
     */
    Optional<Adherent> findByEmail(String email);

    /**
     * Trouve les adhérents par statut
     */
    List<Adherent> findByStatus(AdherentStatus status);

    /**
     * Trouve les adhérents actifs
     */
    @Query("SELECT a FROM Adherent a WHERE a.status = 'ACTIVE'")
    List<Adherent> findAllActive();

    /**
     * Trouve les adhérents par nom (prénom ou nom de famille)
     */
    @Query("SELECT a FROM Adherent a WHERE LOWER(a.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Adherent> searchByName(@Param("search") String search);

    /**
     * Compte les adhérents actifs
     */
    long countByStatus(AdherentStatus status);

    /**
     * Vérifie si un email existe déjà
     */
    boolean existsByEmail(String email);

    /**
     * Compte les adhérents par type d'abonnement
     */
    @Query("SELECT COUNT(a) FROM Adherent a WHERE a.subscriptionType = :type")
    long countBySubscriptionType(@Param("type") SubscriptionType type);

    /**
     * Trouve les adhérents avec pagination par statut
     */
    Page<Adherent> findByStatus(AdherentStatus status, Pageable pageable);
}
