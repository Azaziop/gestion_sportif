package com.example.demo.model.enums;

/**
 * Énumération des types d'abonnements disponibles pour les adhérents
 */
public enum SubscriptionType {
    /**
     * Abonnement basique: limité à 3 séances par semaine
     */
    BASIC(3),
    
    /**
     * Abonnement premium: illimité
     */
    PREMIUM(Integer.MAX_VALUE);

    private final int weeklySessions;

    SubscriptionType(int weeklySessions) {
        this.weeklySessions = weeklySessions;
    }

    public int getWeeklySessions() {
        return weeklySessions;
    }
}
