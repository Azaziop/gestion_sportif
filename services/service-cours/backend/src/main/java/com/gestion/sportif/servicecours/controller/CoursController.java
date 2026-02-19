package com.gestion.sportif.servicecours.controller;

import com.gestion.sportif.servicecours.dto.CoursDTO;
import com.gestion.sportif.servicecours.dto.CreateCoursRequest;
import com.gestion.sportif.servicecours.dto.UpdateCoursRequest;
import com.gestion.sportif.servicecours.entity.NiveauAcces;
import com.gestion.sportif.servicecours.service.CoursService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ContrÃƒÂ´leur REST pour la gestion des cours
 */
@RestController
@RequestMapping("/api/cours")
public class CoursController {

    private static final Logger log = LoggerFactory.getLogger(CoursController.class);

    private final CoursService coursService;

    public CoursController(CoursService coursService) {
        this.coursService = coursService;
    }

    /**
     * CrÃƒÂ©e un nouveau cours
     * POST /api/cours
     */
    @PostMapping
    public ResponseEntity<CoursDTO> createCours(@Valid @RequestBody CreateCoursRequest request) {
        log.info("RequÃƒÂªte de crÃƒÂ©ation de cours reÃƒÂ§ue: {}", request.getTitre());
        CoursDTO cours = coursService.createCours(request);
        return new ResponseEntity<>(cours, HttpStatus.CREATED);
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re un cours par son ID
     * GET /api/cours/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CoursDTO> getCoursById(@PathVariable Long id) {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration du cours ID: {}", id);
        CoursDTO cours = coursService.getCoursById(id);
        return ResponseEntity.ok(cours);
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re tous les cours actifs
     * GET /api/cours
     */
    @GetMapping
    public ResponseEntity<List<CoursDTO>> getAllCours() {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration de tous les cours");
        List<CoursDTO> cours = coursService.getAllCours();
        return ResponseEntity.ok(cours);
    }

    /**
     * Met ÃƒÂ  jour un cours existant
     * PUT /api/cours/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<CoursDTO> updateCours(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCoursRequest request) {
        log.info("RequÃƒÂªte de mise ÃƒÂ  jour du cours ID: {}", id);
        CoursDTO cours = coursService.updateCours(id, request);
        return ResponseEntity.ok(cours);
    }

    /**
     * DÃƒÂ©sactive un cours (soft delete)
     * DELETE /api/cours/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCours(@PathVariable Long id) {
        log.info("RequÃƒÂªte de dÃƒÂ©sactivation du cours ID: {}", id);
        coursService.deleteCours(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Supprime dÃƒÂ©finitivement un cours
     * DELETE /api/cours/{id}/hard
     */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteCours(@PathVariable Long id) {
        log.info("RequÃƒÂªte de suppression dÃƒÂ©finitive du cours ID: {}", id);
        coursService.hardDeleteCours(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours par type
     * GET /api/cours/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<CoursDTO>> getCoursByType(@PathVariable String type) {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration des cours de type: {}", type);
        List<CoursDTO> cours = coursService.getCoursByType(type);
        return ResponseEntity.ok(cours);
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours par coach
     * GET /api/cours/coach/{coach}
     */
    @GetMapping("/coach/{coach}")
    public ResponseEntity<List<CoursDTO>> getCoursByCoach(@PathVariable String coach) {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration des cours du coach: {}", coach);
        List<CoursDTO> cours = coursService.getCoursByCoach(coach);
        return ResponseEntity.ok(cours);
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours par niveau d'accÃƒÂ¨s
     * GET /api/cours/niveau/{niveau}
     */
    @GetMapping("/niveau/{niveau}")
    public ResponseEntity<List<CoursDTO>> getCoursByNiveauAcces(@PathVariable NiveauAcces niveau) {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration des cours de niveau: {}", niveau);
        List<CoursDTO> cours = coursService.getCoursByNiveauAcces(niveau);
        return ResponseEntity.ok(cours);
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours disponibles (avec places restantes)
     * GET /api/cours/disponibles
     */
    @GetMapping("/disponibles")
    public ResponseEntity<List<CoursDTO>> getCoursDisponibles() {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration des cours disponibles");
        List<CoursDTO> cours = coursService.getCoursDisponibles();
        return ResponseEntity.ok(cours);
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours futurs
     * GET /api/cours/futurs
     */
    @GetMapping("/futurs")
    public ResponseEntity<List<CoursDTO>> getCoursFuturs() {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration des cours futurs");
        List<CoursDTO> cours = coursService.getCoursFuturs();
        return ResponseEntity.ok(cours);
    }

    /**
     * RÃƒÂ©cupÃƒÂ¨re les cours dans une pÃƒÂ©riode donnÃƒÂ©e
     * GET /api/cours/periode?debut=...&fin=...
     */
    @GetMapping("/periode")
    public ResponseEntity<List<CoursDTO>> getCoursByPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        log.info("RequÃƒÂªte de rÃƒÂ©cupÃƒÂ©ration des cours entre {} et {}", debut, fin);
        List<CoursDTO> cours = coursService.getCoursByPeriode(debut, fin);
        return ResponseEntity.ok(cours);
    }

    /**
     * VÃƒÂ©rifie si un adhÃƒÂ©rent peut s'inscrire ÃƒÂ  un cours
     * GET /api/cours/{id}/eligibilite?typeAbonnement=...
     */
    @GetMapping("/{id}/eligibilite")
    public ResponseEntity<Boolean> checkEligibilite(
            @PathVariable Long id,
            @RequestParam String typeAbonnement) {
        log.info("VÃƒÂ©rification de l'ÃƒÂ©ligibilitÃƒÂ© pour le cours ID: {} avec abonnement: {}", 
                 id, typeAbonnement);
        boolean eligible = coursService.canAdherentInscribe(id, typeAbonnement);
        return ResponseEntity.ok(eligible);
    }

    /**
     * VÃƒÂ©rifie la disponibilitÃƒÂ© d'une salle
     * GET /api/cours/salle/disponibilite?salle=...&debut=...&fin=...
     */
    @GetMapping("/salle/disponibilite")
    public ResponseEntity<Boolean> checkSalleDisponibilite(
            @RequestParam String salle,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        log.info("VÃƒÂ©rification de la disponibilitÃƒÂ© de la salle: {} entre {} et {}", 
                 salle, debut, fin);
        boolean disponible = coursService.isSalleDisponible(salle, debut, fin);
        return ResponseEntity.ok(disponible);
    }

    /**
     * IncrÃƒÂ©mente le nombre d'inscrits (utilisÃƒÂ© par le service RÃƒÂ©servation)
     * POST /api/cours/{id}/increment-inscrits
     */
    @PostMapping("/{id}/increment-inscrits")
    public ResponseEntity<Void> incrementInscrits(@PathVariable Long id) {
        log.info("IncrÃƒÂ©mentation des inscrits pour le cours ID: {}", id);
        coursService.incrementNombreInscrits(id);
        return ResponseEntity.ok().build();
    }

    /**
     * DÃƒÂ©crÃƒÂ©mente le nombre d'inscrits (utilisÃƒÂ© par le service RÃƒÂ©servation)
     * POST /api/cours/{id}/decrement-inscrits
     */
    @PostMapping("/{id}/decrement-inscrits")
    public ResponseEntity<Void> decrementInscrits(@PathVariable Long id) {
        log.info("DÃƒÂ©crÃƒÂ©mentation des inscrits pour le cours ID: {}", id);
        coursService.decrementNombreInscrits(id);
        return ResponseEntity.ok().build();
    }
}
