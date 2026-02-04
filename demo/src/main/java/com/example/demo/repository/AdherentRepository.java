package com.example.demo.repository;

import com.example.demo.model.entity.Adherent;
import com.example.demo.model.entity.Subscription;
import com.example.demo.model.enums.AdherentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

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
     * Récupère tous les adhérents sauf ceux liés à un utilisateur ADMIN
     */
    @Query("SELECT a FROM Adherent a WHERE a.id NOT IN " +
           "(SELECT u.adherent.id FROM User u WHERE u.role = 'ADMIN' AND u.adherent IS NOT NULL)")
    Page<Adherent> findAllExcludingAdmins(Pageable pageable);
    
    /**
     * Compte les adhérents par abonnement
     */
    @Query("SELECT COUNT(a) FROM Adherent a WHERE a.currentSubscription = :subscription")
    long countByCurrentSubscription(@Param("subscription") Subscription subscription);
    
    /**
     * Trouve les adhérents avec pagination par statut
     */
    Page<Adherent> findByStatus(AdherentStatus status, Pageable pageable);
}
