package com.gestion.sportif.servicecours.controller;

import com.gestion.sportif.servicecours.dto.CoursDTO;
import com.gestion.sportif.servicecours.service.CoursService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/internal/cours")
public class InternalCoursController {

    private final CoursService coursService;

    public InternalCoursController(CoursService coursService) {
        this.coursService = coursService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoursDTO> getCours(@PathVariable Long id) {
        return ResponseEntity.ok(coursService.getCoursById(id));
    }

    @GetMapping("/{id}/available")
    public ResponseEntity<Boolean> isAvailable(@PathVariable Long id) {
        CoursDTO cours = coursService.getCoursById(id);
        boolean available = Boolean.TRUE.equals(cours.getActif())
            && cours.getPlacesRestantes() != null
            && cours.getPlacesRestantes() > 0
            && cours.getDateHeure() != null
            && cours.getDateHeure().isAfter(LocalDateTime.now());
        return ResponseEntity.ok(available);
    }

    @GetMapping("/{id}/capacity")
    public ResponseEntity<Integer> getAvailableCapacity(@PathVariable Long id) {
        CoursDTO cours = coursService.getCoursById(id);
        return ResponseEntity.ok(cours.getPlacesRestantes() != null ? cours.getPlacesRestantes() : 0);
    }
}