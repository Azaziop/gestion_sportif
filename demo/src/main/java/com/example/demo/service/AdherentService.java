package com.example.demo.service;

import com.example.demo.model.entity.Adherent;
import com.example.demo.model.entity.Subscription;
import com.example.demo.model.entity.User;
import com.example.demo.model.enums.AdherentStatus;
import com.example.demo.repository.AdherentRepository;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

/**
 * Service métier pour la gestion des adhérents
 */
@Service
@Transactional
public class AdherentService {
    
    private static final Logger log = Logger.getLogger(AdherentService.class.getName());
    
    private final AdherentRepository adherentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public AdherentService(AdherentRepository adherentRepository, 
                          SubscriptionRepository subscriptionRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.adherentRepository = adherentRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    // ===== CRÉATION =====
    
    public Adherent createAdherent(Adherent adherent) {
        log.info("Création adhérent: " + adherent.getEmail());
        
        if (adherentRepository.existsByEmail(adherent.getEmail())) {
            throw new IllegalArgumentException("Email existe déjà");
        }
        
        adherent.setStatus(AdherentStatus.ACTIVE);
        Adherent savedAdherent = adherentRepository.save(adherent);
        
        // Create User account for the adherent with default password
        if (!userRepository.existsByUsername(adherent.getEmail())) {
            User user = new User();
            user.setUsername(adherent.getEmail());
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole("USER");
            user.setAdherent(savedAdherent);
            userRepository.save(user);
            log.info("Compte utilisateur créé pour: " + adherent.getEmail());
        }
        
        return savedAdherent;
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
        // Utiliser la requête qui exclut automatiquement les adhérents admin
        return adherentRepository.findAllExcludingAdmins(PageRequest.of(page, size));
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
        
        // Informations personnelles
        if (updates.getFirstName() != null) adherent.setFirstName(updates.getFirstName());
        if (updates.getLastName() != null) adherent.setLastName(updates.getLastName());
        if (updates.getPhoneNumber() != null) adherent.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getDateOfBirth() != null) adherent.setDateOfBirth(updates.getDateOfBirth());
        
        // Adresse
        if (updates.getAddress() != null) adherent.setAddress(updates.getAddress());
        if (updates.getCity() != null) adherent.setCity(updates.getCity());
        if (updates.getPostalCode() != null) adherent.setPostalCode(updates.getPostalCode());
        if (updates.getCountry() != null) adherent.setCountry(updates.getCountry());
        
        // Photo
        if (updates.getPhoto() != null) adherent.setPhoto(updates.getPhoto());
        
        // Certificat médical (si fourni)
        if (updates.getMedicalCertificate() != null) {
            adherent.setMedicalCertificate(updates.getMedicalCertificate());
        }
        
        return adherentRepository.save(adherent);
    }
    
    public Adherent assignSubscription(Long adherentId, Subscription subscription) {
        Adherent adherent = getAdherentById(adherentId);
        Subscription saved = subscriptionRepository.save(subscription);
        adherent.setCurrentSubscription(saved);
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
        return adherent.getCurrentSubscription().getWeeklySessionLimit();
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
    
    public Adherent assignSubscriptionById(Long adherentId, Long subscriptionId) {
        Adherent adherent = getAdherentById(adherentId);
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new IllegalArgumentException("Abonnement non trouvé avec l'ID: " + subscriptionId));
        adherent.setCurrentSubscription(subscription);
        return adherentRepository.save(adherent);
    }

    public Adherent removeSubscription(Long adherentId) {
        Adherent adherent = getAdherentById(adherentId);
        adherent.setCurrentSubscription(null);
        return adherentRepository.save(adherent);
    }

    // ===== BATCH =====

    @Transactional
    public void processExpiredSubscriptions() {
        // Plus de gestion d'expiration basée sur des dates
    }
}
