package com.gestion.sportif.servicecours.service;

import com.gestion.sportif.servicecours.dto.CoursDTO;
import com.gestion.sportif.servicecours.dto.CreateCoursRequest;
import com.gestion.sportif.servicecours.dto.UpdateCoursRequest;
import com.gestion.sportif.servicecours.entity.Cours;
import com.gestion.sportif.servicecours.entity.NiveauAcces;
import com.gestion.sportif.servicecours.exception.CoursNotFoundException;
import com.gestion.sportif.servicecours.repository.CoursRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de gestion des cours
 */
@Service
@Transactional
public class CoursServiceImpl implements CoursService {

    private final CoursRepository coursRepository;
    private final Logger log = LoggerFactory.getLogger(CoursServiceImpl.class);

    // Constructeur explicite (remplace Lombok @RequiredArgsConstructor)
    public CoursServiceImpl(CoursRepository coursRepository) {
        this.coursRepository = coursRepository;
    }

    @Override
    public CoursDTO createCours(CreateCoursRequest request) {
        log.info("Création d'un nouveau cours: {}", request.getTitre());

        LocalDateTime dateFin = request.getDateHeure().plusMinutes(request.getDuree());
        if (!isSalleDisponible(request.getSalle(), request.getDateHeure(), dateFin)) {
            throw new IllegalArgumentException("La salle " + request.getSalle() +
                " n'est pas disponible à cette heure");
        }

        // ✅ CORRIGÉ: Utilise capaciteMax et niveau au lieu de capaciteMaximale et niveauAcces
        Cours cours = new Cours(
                null,
                request.getTitre(),
                request.getDescription(),
                request.getType(),
                request.getCoach(),
                request.getSalle(),
                request.getCapaciteMax(),  // ✅ CORRIGÉ
                request.getNiveau(),  // ✅ CORRIGÉ
                request.getDateHeure(),
                request.getDuree(),
                true,   // actif
                0,      // nombreInscrits
                null,   // createdAt (géré par @CreationTimestamp)
                null    // updatedAt (géré par @UpdateTimestamp)
        );

        Cours savedCours = coursRepository.save(cours);
        log.info("Cours créé avec succès avec l'ID: {}", savedCours.getId());

        return convertToDTO(savedCours);
    }

    @Override
    @Transactional(readOnly = true)
    public CoursDTO getCoursById(Long id) {
        log.info("Récupération du cours avec l'ID: {}", id);
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new CoursNotFoundException(id));
        return convertToDTO(cours);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getAllCours() {
        log.info("Récupération de tous les cours actifs");
        return coursRepository.findByActifTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CoursDTO updateCours(Long id, UpdateCoursRequest request) {
        log.info("Mise à jour du cours avec l'ID: {}", id);

        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new CoursNotFoundException(id));

        if (request.getTitre() != null) {
            cours.setTitre(request.getTitre());
        }
        if (request.getDescription() != null) {
            cours.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            cours.setType(request.getType());
        }
        if (request.getCoach() != null) {
            cours.setCoach(request.getCoach());
        }
        if (request.getSalle() != null) {
            if (!request.getSalle().equals(cours.getSalle()) && request.getDateHeure() != null) {
                LocalDateTime dateFin = request.getDateHeure().plusMinutes(
                    request.getDuree() != null ? request.getDuree() : cours.getDuree()
                );
                if (!isSalleDisponible(request.getSalle(), request.getDateHeure(), dateFin)) {
                    throw new IllegalArgumentException("La salle " + request.getSalle() +
                        " n'est pas disponible à cette heure");
                }
            }
            cours.setSalle(request.getSalle());
        }
        // ✅ CORRIGÉ: capaciteMax au lieu de capaciteMaximale
        if (request.getCapaciteMax() != null) {
            if (request.getCapaciteMax() < cours.getNombreInscrits()) {
                throw new IllegalArgumentException(
                    "La capacité ne peut pas être inférieure au nombre d'inscrits actuels (" +
                    cours.getNombreInscrits() + ")"
                );
            }
            cours.setCapaciteMax(request.getCapaciteMax());  // ✅ CORRIGÉ
        }
        // ✅ CORRIGÉ: niveau au lieu de niveauAcces
        if (request.getNiveau() != null) {
            cours.setNiveau(request.getNiveau());  // ✅ CORRIGÉ
        }
        if (request.getDateHeure() != null) {
            cours.setDateHeure(request.getDateHeure());
        }
        if (request.getDuree() != null) {
            cours.setDuree(request.getDuree());
        }
        if (request.getActif() != null) {
            cours.setActif(request.getActif());
        }

        Cours updatedCours = coursRepository.save(cours);
        log.info("Cours mis à jour avec succès");

        return convertToDTO(updatedCours);
    }

    @Override
    public void deleteCours(Long id) {
        log.info("Désactivation du cours avec l'ID: {}", id);

        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new CoursNotFoundException(id));

        cours.setActif(false);
        coursRepository.save(cours);

        log.info("Cours désactivé avec succès");
    }

    @Override
    public void hardDeleteCours(Long id) {
        log.info("Suppression définitive du cours avec l'ID: {}", id);

        if (!coursRepository.existsById(id)) {
            throw new CoursNotFoundException(id);
        }

        coursRepository.deleteById(id);
        log.info("Cours supprimé définitivement");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursByType(String type) {
        log.info("Récupération des cours de type: {}", type);
        return coursRepository.findByTypeAndActifTrue(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursByCoach(String coach) {
        log.info("Récupération des cours du coach: {}", coach);
        return coursRepository.findByCoachAndActifTrue(coach).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursByNiveauAcces(NiveauAcces niveau) {  // ✅ CORRIGÉ le paramètre
        log.info("Récupération des cours de niveau: {}", niveau);
        return coursRepository.findByNiveauAndActifTrue(niveau).stream()  // ✅ CORRIGÉ
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursDisponibles() {
        log.info("Récupération des cours disponibles");
        return coursRepository.findCoursDisponibles().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursByPeriode(LocalDateTime dateDebut, LocalDateTime dateFin) {
        log.info("Récupération des cours entre {} et {}", dateDebut, dateFin);
        return coursRepository.findCoursByPeriode(dateDebut, dateFin).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CoursDTO> getCoursFuturs() {
        log.info("Récupération des cours futurs");
        return coursRepository.findCoursFuturs(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canAdherentInscribe(Long coursId, String typeAbonnement) {
        log.info("Vérification de l'éligibilité pour le cours: {}", coursId);

        Cours cours = coursRepository.findById(coursId)
                .orElseThrow(() -> new CoursNotFoundException(coursId));

        if (!cours.getActif()) {
            log.warn("Le cours n'est pas actif");
            return false;
        }

        if (!cours.hasPlaceDisponible()) {
            log.warn("Le cours est complet");
            return false;
        }

        if (!cours.isEligiblePour(typeAbonnement)) {
            log.warn("L'adhérent n'est pas éligible pour ce cours");
            return false;
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSalleDisponible(String salle, LocalDateTime dateDebut, LocalDateTime dateFin) {
        log.info("Vérification de la disponibilité de la salle: {} entre {} et {}",
                 salle, dateDebut, dateFin);

        boolean exists = coursRepository.existsCoursInSalleAtTime(salle, dateDebut, dateFin);
        return !exists;
    }

    @Override
    public void incrementNombreInscrits(Long coursId) {
        log.info("Incrémentation du nombre d'inscrits pour le cours: {}", coursId);

        Cours cours = coursRepository.findById(coursId)
                .orElseThrow(() -> new CoursNotFoundException(coursId));

        // ✅ CORRIGÉ: capaciteMax au lieu de capaciteMaximale
        if (cours.getNombreInscrits() >= cours.getCapaciteMax()) {
            throw new IllegalStateException("Le cours est déjà complet");
        }

        cours.setNombreInscrits(cours.getNombreInscrits() + 1);
        coursRepository.save(cours);

        // ✅ CORRIGÉ: capaciteMax au lieu de capaciteMaximale
        log.info("Nombre d'inscrits incrémenté: {}/{}",
                 cours.getNombreInscrits(), cours.getCapaciteMax());
    }

    @Override
    public void decrementNombreInscrits(Long coursId) {
        log.info("Décrémentation du nombre d'inscrits pour le cours: {}", coursId);

        Cours cours = coursRepository.findById(coursId)
                .orElseThrow(() -> new CoursNotFoundException(coursId));

        if (cours.getNombreInscrits() <= 0) {
            throw new IllegalStateException("Le nombre d'inscrits ne peut pas être négatif");
        }

        cours.setNombreInscrits(cours.getNombreInscrits() - 1);
        coursRepository.save(cours);

        // ✅ CORRIGÉ: capaciteMax au lieu de capaciteMaximale
        log.info("Nombre d'inscrits décrémenté: {}/{}",
                 cours.getNombreInscrits(), cours.getCapaciteMax());
    }

    private CoursDTO convertToDTO(Cours cours) {
        CoursDTO dto = new CoursDTO();
        dto.setId(cours.getId());
        dto.setTitre(cours.getTitre());
        dto.setDescription(cours.getDescription());
        dto.setType(cours.getType());
        dto.setCoach(cours.getCoach());
        dto.setSalle(cours.getSalle());
        dto.setCapaciteMax(cours.getCapaciteMax());
        dto.setNiveau(cours.getNiveau());
        dto.setDateHeure(cours.getDateHeure());
        dto.setDuree(cours.getDuree());
        dto.setActif(cours.getActif());
        dto.setNombreInscrits(cours.getNombreInscrits());
        dto.setPlacesRestantes(cours.getPlacesRestantes());
        dto.setCreatedAt(cours.getCreatedAt());
        dto.setUpdatedAt(cours.getUpdatedAt());
        return dto;
    }
}