package com.example.adherentservice.model;

/**
 * Énumération des statuts d'adhésion
 */
public enum AdherentStatus {
    /**
     * Adhésion active et valide
     */
    ACTIVE,

    /**
     * Adhésion expirée
     */
    EXPIRED,

    /**
     * Adhésion suspendue temporairement
     */
    SUSPENDED,

    /**
     * Compte désactivé/supprimé
     */
    DEACTIVATED
}
