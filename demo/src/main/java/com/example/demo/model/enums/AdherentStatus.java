package com.example.demo.model.enums;

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
