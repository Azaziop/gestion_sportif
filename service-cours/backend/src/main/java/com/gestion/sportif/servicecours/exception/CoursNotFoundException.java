package com.gestion.sportif.servicecours.exception;

/**
 * Exception levÃƒÂ©e lorsqu'un cours n'est pas trouvÃƒÂ©
 */
public class CoursNotFoundException extends RuntimeException {
    
    public CoursNotFoundException(Long id) {
        super("Cours non trouvÃƒÂ© avec l'ID: " + id);
    }

    public CoursNotFoundException(String message) {
        super(message);
    }
}
