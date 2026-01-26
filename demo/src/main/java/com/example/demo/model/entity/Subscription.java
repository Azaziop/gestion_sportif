package com.example.demo.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.example.demo.model.enums.SubscriptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.Locale;

/**
 * Entité représentant un abonnement/subscription d'un adhérent
 */
@Entity
@Table(name = "subscriptions")
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Le type d'abonnement est obligatoire")
    private SubscriptionType type;
    
    @Column(nullable = false)
    @NotNull(message = "La date de début est obligatoire")
    private LocalDate startDate;
    
    @Column(nullable = false)
    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate endDate;
    
    @Column(nullable = false)
    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double price;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "weekly_sessions_used")
    private Integer weeklySessionsUsed = 0;
    
    @Column(name = "last_session_week")
    private Integer lastSessionWeek;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        weeklySessionsUsed = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        LocalDate today = LocalDate.now();
        return !today.isBefore(startDate) && !today.isAfter(endDate);
    }
    
    /**
     * Obtient le nombre maximal de séances hebdomadaires pour ce type d'abonnement
     */
    public int getWeeklySessionLimit() {
        return type.getWeeklySessions();
    }
    
    /**
     * Vérifie si l'adhérent peut réserver une séance supplémentaire cette semaine
     */
    public boolean canBookSession() {
        if (!isActive()) {
            return false;
        }
        
        // Reset le compteur si on est dans une nouvelle semaine
        resetWeeklyCounterIfNeeded();
        
        // Premium = illimité
        if (type == SubscriptionType.PREMIUM) {
            return true;
        }
        
        // Basic = vérifier la limite
        return weeklySessionsUsed < type.getWeeklySessions();
    }
    
    /**
     * Incrémente le compteur de séances hebdomadaires
     */
    public void incrementWeeklySessionCount() {
        resetWeeklyCounterIfNeeded();
        this.weeklySessionsUsed++;
    }
    
    /**
     * Décrémente le compteur de séances hebdomadaires (en cas d'annulation)
     */
    public void decrementWeeklySessionCount() {
        if (this.weeklySessionsUsed > 0) {
            this.weeklySessionsUsed--;
        }
    }
    
    /**
     * Réinitialise le compteur si on est dans une nouvelle semaine
     */
    private void resetWeeklyCounterIfNeeded() {
        int currentWeek = getCurrentWeekNumber();
        if (lastSessionWeek == null || lastSessionWeek != currentWeek) {
            this.weeklySessionsUsed = 0;
            this.lastSessionWeek = currentWeek;
        }
    }
    
    /**
     * Obtient le numéro de la semaine actuelle dans l'année
     */
    private int getCurrentWeekNumber() {
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        return LocalDate.now().get(weekFields.weekOfWeekBasedYear());
    }
    
    /**
     * Obtient le nombre de séances restantes pour cette semaine
     */
    public int getRemainingWeeklySessions() {
        if (type == SubscriptionType.PREMIUM) {
            return Integer.MAX_VALUE;
        }
        resetWeeklyCounterIfNeeded();
        return Math.max(0, type.getWeeklySessions() - weeklySessionsUsed);
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public SubscriptionType getType() { return type; }
    public void setType(SubscriptionType type) { this.type = type; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getWeeklySessionsUsed() { return weeklySessionsUsed; }
    public void setWeeklySessionsUsed(Integer weeklySessionsUsed) { this.weeklySessionsUsed = weeklySessionsUsed; }
    
    public Integer getLastSessionWeek() { return lastSessionWeek; }
    public void setLastSessionWeek(Integer lastSessionWeek) { this.lastSessionWeek = lastSessionWeek; }
}
