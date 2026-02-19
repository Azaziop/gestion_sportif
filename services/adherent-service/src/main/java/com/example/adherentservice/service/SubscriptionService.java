package com.example.adherentservice.service;

import com.example.adherentservice.model.Subscription;
import com.example.adherentservice.model.SubscriptionType;
import com.example.adherentservice.repository.SubscriptionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service métier pour la gestion des abonnements
 */
@Service
@Transactional
public class SubscriptionService {

    private static final Logger log = Logger.getLogger(SubscriptionService.class.getName());

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    // ===== CRÉATION =====

    public Subscription createSubscription(Subscription subscription) {
        log.info("Création abonnement: " + subscription.getType());

        if (subscriptionRepository.existsByType(subscription.getType())) {
            throw new IllegalArgumentException("Type d'abonnement existe déjà");
        }

        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());
        subscription.setWeeklySessionsUsed(0);

        if (subscription.getWeeklySessions() == null) {
            subscription.setWeeklySessions(subscription.getType().getWeeklySessions());
        }

        applyDurationAndDates(subscription, true);

        return subscriptionRepository.save(subscription);
    }

    // ===== LECTURE =====

    public Subscription getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Abonnement non trouvé"));
    }

    public Page<Subscription> getAllSubscriptions(int page, int size) {
        return subscriptionRepository.findAll(PageRequest.of(page, size));
    }

    public Subscription getSubscriptionByType(SubscriptionType type) {
        return subscriptionRepository.findByType(type)
            .orElseThrow(() -> new RuntimeException("Type d'abonnement non trouvé: " + type));
    }

    public List<Subscription> getAllSubscriptionTypes() {
        return subscriptionRepository.findAll();
    }

    // ===== MODIFICATION =====

    public Subscription updateSubscription(Long id, Subscription subscriptionUpdate) {
        Subscription subscription = getSubscriptionById(id);
        boolean shouldRecalculateDates = false;

        if (subscriptionUpdate.getType() != null) {
            if (!subscription.getType().equals(subscriptionUpdate.getType()) &&
                subscriptionRepository.existsByType(subscriptionUpdate.getType())) {
                throw new IllegalArgumentException("Type d'abonnement existe déjà");
            }
            subscription.setType(subscriptionUpdate.getType());
            subscription.setWeeklySessions(subscriptionUpdate.getType().getWeeklySessions());
        }

        if (subscriptionUpdate.getPrice() != null) {
            subscription.setPrice(subscriptionUpdate.getPrice());
        }

        if (subscriptionUpdate.getWeeklySessions() != null) {
            subscription.setWeeklySessions(subscriptionUpdate.getWeeklySessions());
        }

        if (subscriptionUpdate.getStartDate() != null) {
            subscription.setStartDate(subscriptionUpdate.getStartDate());
            shouldRecalculateDates = true;
        }

        if (subscriptionUpdate.getDurationMonths() != null) {
            subscription.setDurationMonths(subscriptionUpdate.getDurationMonths());
            shouldRecalculateDates = true;
        }

        if (shouldRecalculateDates) {
            applyDurationAndDates(subscription, false);
        }

        subscription.setUpdatedAt(LocalDateTime.now());
        return subscriptionRepository.save(subscription);
    }

    private void applyDurationAndDates(Subscription subscription, boolean ensureStartDate) {
        if (ensureStartDate && subscription.getStartDate() == null) {
            subscription.setStartDate(LocalDate.now());
        }

        int duration = resolveDurationMonths(subscription.getDurationMonths());
        subscription.setDurationMonths(duration);

        if (subscription.getStartDate() == null) {
            subscription.setStartDate(LocalDate.now());
        }

        subscription.setEndDate(subscription.getStartDate().plusMonths(duration));
    }

    private int resolveDurationMonths(Integer durationMonths) {
        if (durationMonths == null) {
            return 12;
        }
        if (durationMonths == 1 || durationMonths == 3 || durationMonths == 12) {
            return durationMonths;
        }
        throw new IllegalArgumentException("Durée invalide. Valeurs autorisées: 1, 3 ou 12 mois");
    }

    public Subscription updatePrice(Long id, Double price) {
        Subscription subscription = getSubscriptionById(id);
        subscription.setPrice(price);
        subscription.setUpdatedAt(LocalDateTime.now());
        return subscriptionRepository.save(subscription);
    }

    // ===== SUPPRESSION =====

    public void deleteSubscription(Long id) {
        if (!subscriptionRepository.existsById(id)) {
            throw new RuntimeException("Abonnement non trouvé");
        }
        subscriptionRepository.deleteById(id);
    }
}
