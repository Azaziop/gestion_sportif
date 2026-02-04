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
    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double price;
    
    @Column(name = "weekly_sessions_limit")
    private Integer weeklySessions;

    @Column(name = "duration_months")
    @Min(value = 1, message = "La durée doit être >= 1 mois")
    private Integer durationMonths;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
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
        // Initialiser les dates de début et fin si non définies
        if (startDate == null) {
            startDate = LocalDate.now();
        }
        if (endDate == null) {
            int months = durationMonths != null ? durationMonths : 12;
            endDate = startDate.plusMonths(months);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        LocalDate now = LocalDate.now();
        if (startDate != null && now.isBefore(startDate)) {
            return false;
        }
        if (endDate != null && now.isAfter(endDate)) {
            return false;
        }
        return true;
    }
    
    /**
     * Obtient le nombre maximal de séances hebdomadaires pour ce type d'abonnement
     */
    public int getWeeklySessionLimit() {
        if (weeklySessions != null) {
            return weeklySessions;
        }
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
        if (SubscriptionType.PREMIUM == type) {
            return true;
        }
        
        // Basic = vérifier la limite
        return weeklySessionsUsed < getWeeklySessionLimit();
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
        if (SubscriptionType.PREMIUM == type) {
            return Integer.MAX_VALUE;
        }
        resetWeeklyCounterIfNeeded();
        return Math.max(0, getWeeklySessionLimit() - weeklySessionsUsed);
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public SubscriptionType getType() { return type; }
    public void setType(SubscriptionType type) { this.type = type; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    
    public Integer getWeeklySessions() { return weeklySessions; }
    public void setWeeklySessions(Integer weeklySessions) { this.weeklySessions = weeklySessions; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getWeeklySessionsUsed() { return weeklySessionsUsed; }
    public void setWeeklySessionsUsed(Integer weeklySessionsUsed) { this.weeklySessionsUsed = weeklySessionsUsed; }
    
    public Integer getLastSessionWeek() { return lastSessionWeek; }
    public void setLastSessionWeek(Integer lastSessionWeek) { this.lastSessionWeek = lastSessionWeek; }
}
