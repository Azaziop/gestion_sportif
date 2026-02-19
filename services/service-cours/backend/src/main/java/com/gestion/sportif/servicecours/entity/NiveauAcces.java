package com.gestion.sportif.servicecours.entity;

/**
 * Ãƒâ€°numÃƒÂ©ration reprÃƒÂ©sentant les niveaux d'accÃƒÂ¨s pour les cours
 * BASIC: Accessible aux adhÃƒÂ©rents avec abonnement basic (max 3 sÃƒÂ©ances/semaine)
 * PREMIUM: RÃƒÂ©servÃƒÂ© aux adhÃƒÂ©rents avec abonnement premium (illimitÃƒÂ©)
 */
public enum NiveauAcces {
    BASIC("Accessible ÃƒÂ  tous les adhÃƒÂ©rents"),
    PREMIUM("RÃƒÂ©servÃƒÂ© aux membres premium uniquement");

    private final String description;

    NiveauAcces(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}




