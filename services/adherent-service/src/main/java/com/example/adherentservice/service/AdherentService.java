package com.example.adherentservice.service;

import com.example.adherentservice.model.Adherent;
import com.example.adherentservice.model.AdherentStatus;
import com.example.adherentservice.model.SubscriptionType;
import com.example.adherentservice.repository.AdherentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service métier pour la gestion des adhérents
 */
@Service
@Transactional
public class AdherentService {

    private static final Logger log = Logger.getLogger(AdherentService.class.getName());

    private final AdherentRepository adherentRepository;

    public AdherentService(AdherentRepository adherentRepository) {
        this.adherentRepository = adherentRepository;
    }

    // ===== CRÉATION =====

    public Adherent createAdherent(Adherent adherent) {
        log.info("Création adhérent: " + adherent.getEmail());

        if (adherentRepository.existsByEmail(adherent.getEmail())) {
            throw new IllegalArgumentException("Email existe déjà");
        }

        adherent.setStatus(AdherentStatus.ACTIVE);
        return adherentRepository.save(adherent);
    }

    // ===== LECTURE =====

    @Transactional(readOnly = true)
    public Adherent getAdherentById(Long id) {
        return adherentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Adhérent non trouvé"));
    }

    @Transactional(readOnly = true)
    public Adherent getAdherentByEmail(String email) {
        return adherentRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Adhérent non trouvé"));
    }

    @Transactional(readOnly = true)
    public List<Adherent> getAllActiveAdherents() {
        return adherentRepository.findAllActive();
    }

    @Transactional(readOnly = true)
    public Page<Adherent> getAllAdherents(int page, int size) {
        return adherentRepository.findAll(PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public List<Adherent> searchAdherentsByName(String search) {
        return adherentRepository.searchByName(search);
    }

    @Transactional(readOnly = true)
    public List<Adherent> getAdherentsByStatus(AdherentStatus status) {
        return adherentRepository.findByStatus(status);
    }

    // ===== MODIFICATION =====

    public Adherent updateAdherent(Long id, Adherent updates) {
        Adherent adherent = getAdherentById(id);

        if (updates.getFirstName() != null) adherent.setFirstName(updates.getFirstName());
        if (updates.getLastName() != null) adherent.setLastName(updates.getLastName());
        if (updates.getPhoneNumber() != null) adherent.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getDateOfBirth() != null) adherent.setDateOfBirth(updates.getDateOfBirth());

        if (updates.getAddress() != null) adherent.setAddress(updates.getAddress());
        if (updates.getCity() != null) adherent.setCity(updates.getCity());
        if (updates.getPostalCode() != null) adherent.setPostalCode(updates.getPostalCode());
        if (updates.getCountry() != null) adherent.setCountry(updates.getCountry());

        if (updates.getPhoto() != null) adherent.setPhoto(updates.getPhoto());

        if (updates.getMedicalCertificate() != null) {
            adherent.setMedicalCertificate(updates.getMedicalCertificate());
        }

        // Mise à jour des informations d'abonnement
        if (updates.getSubscriptionType() != null) {
            adherent.setSubscriptionType(updates.getSubscriptionType());
        }
        if (updates.getSubscriptionPrice() != null) {
            adherent.setSubscriptionPrice(updates.getSubscriptionPrice());
        }
        if (updates.getSubscriptionStartDate() != null) {
            adherent.setSubscriptionStartDate(updates.getSubscriptionStartDate());
        }
        if (updates.getSubscriptionDurationMonths() != null) {
            adherent.setSubscriptionDurationMonths(updates.getSubscriptionDurationMonths());
        }

        return adherentRepository.save(adherent);
    }

    public Adherent assignSubscription(Long adherentId, SubscriptionType type, Double price, 
                                       LocalDate startDate, Integer durationMonths) {
        Adherent adherent = getAdherentById(adherentId);
        adherent.setSubscriptionType(type);
        adherent.setSubscriptionPrice(price);
        adherent.setSubscriptionStartDate(startDate);
        adherent.setSubscriptionDurationMonths(durationMonths);
        return adherentRepository.save(adherent);
    }

    // ===== STATUT =====

    public Adherent suspendAdherent(Long id, String reason) {
        Adherent adherent = getAdherentById(id);
        adherent.setStatus(AdherentStatus.SUSPENDED);
        adherent.setSuspendedReason(reason);
        adherent.setSuspendedDate(LocalDateTime.now());
        return adherentRepository.save(adherent);
    }

    public Adherent reactivateAdherent(Long id) {
        Adherent adherent = getAdherentById(id);

        if (adherent.getStatus() != AdherentStatus.SUSPENDED) {
            throw new IllegalStateException("Seul un adhérent suspendu peut être réactivé");
        }

        adherent.setStatus(AdherentStatus.ACTIVE);
        adherent.setSuspendedReason(null);
        adherent.setSuspendedDate(null);
        return adherentRepository.save(adherent);
    }

    public void deactivateAdherent(Long id) {
        Adherent adherent = getAdherentById(id);
        adherent.setStatus(AdherentStatus.DEACTIVATED);
        adherentRepository.save(adherent);
    }

    // ===== ABONNEMENT =====

    @Transactional(readOnly = true)
    public boolean hasActiveSubscription(Long adherentId) {
        return getAdherentById(adherentId).hasActiveSubscription();
    }

    @Transactional(readOnly = true)
    public boolean isEligibleForSession(Long adherentId) {
        return getAdherentById(adherentId).isEligibleForSession();
    }

    @Transactional(readOnly = true)
    public int getWeeklySessionLimit(Long adherentId) {
        Adherent adherent = getAdherentById(adherentId);
        if (!adherent.hasActiveSubscription()) return 0;
        if (adherent.getSubscriptionType() == SubscriptionType.PREMIUM) {
            return Integer.MAX_VALUE; // Illimité
        }
        return 3; // BASIC: 3 séances par semaine
    }

    // ===== CERTIFICATS MÉDICAUX =====

    public Adherent updateMedicalCertificate(Long id, byte[] certificate) {
        Adherent adherent = adherentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Adhérent non trouvé"));
        adherent.setMedicalCertificate(certificate);
        adherent.setUpdatedAt(LocalDateTime.now());
        return adherentRepository.save(adherent);
    }

    public boolean isMedicalCertificateValid(Long id) {
        Adherent adherent = adherentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Adhérent non trouvé"));
        return adherent.getMedicalCertificate() != null && adherent.getMedicalCertificate().length > 0;
    }

    public Page<Adherent> getAdherentsByStatus(String status, int page, int size) {
        try {
            AdherentStatus enumStatus = AdherentStatus.valueOf(status.toUpperCase());
            return adherentRepository.findByStatus(enumStatus, PageRequest.of(page, size));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Statut invalide: " + status);
        }
    }

    public Adherent removeSubscription(Long adherentId) {
        Adherent adherent = getAdherentById(adherentId);
        adherent.setSubscriptionType(null);
        adherent.setSubscriptionPrice(null);
        adherent.setSubscriptionStartDate(null);
        adherent.setSubscriptionDurationMonths(null);
        adherent.setSubscriptionEndDate(null);
        return adherentRepository.save(adherent);
    }

    // ===== BATCH =====

    @Transactional
    public void processExpiredSubscriptions() {
        // Plus de gestion d'expiration basée sur des dates
    }
}
