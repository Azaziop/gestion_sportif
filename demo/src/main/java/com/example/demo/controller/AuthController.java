package com.example.demo.controller;

import com.example.demo.model.dto.AuthRequest;
import com.example.demo.model.dto.AuthResponse;
import com.example.demo.model.dto.RegisterRequest;
import com.example.demo.model.entity.User;
import com.example.demo.model.entity.Adherent;
import com.example.demo.model.enums.AdherentStatus;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.AdherentRepository;
import com.example.demo.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final AdherentRepository adherentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          AdherentRepository adherentRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.adherentRepository = adherentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().build();
        }

        // Create Adherent
        Adherent adherent = new Adherent();
        adherent.setFirstName(request.username());
        adherent.setLastName("");
        adherent.setEmail(request.username() + "@club.local");
        adherent.setPhoneNumber("");
        adherent.setDateOfBirth(LocalDate.now());
        adherent.setAddress("");
        adherent.setCity("");
        adherent.setPostalCode("");
        adherent.setCountry("");
        adherent.setStatus(AdherentStatus.ACTIVE);
        Adherent savedAdherent = adherentRepository.save(adherent);

        // Create User
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("USER");
        user.setAdherent(savedAdherent);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
            // Get user to retrieve role
            User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));
            String token = jwtService.generateToken(authentication.getName(), user.getRole());
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/admin/register")
    public ResponseEntity<AuthResponse> registerAdmin(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().build();
        }

        // Create Adherent for admin
        Adherent adherent = new Adherent();
        adherent.setFirstName(request.username());
        adherent.setLastName("Admin");
        adherent.setEmail(request.username() + "@admin.local");
        adherent.setPhoneNumber("");
        adherent.setDateOfBirth(LocalDate.now());
        adherent.setAddress("");
        adherent.setCity("");
        adherent.setPostalCode("");
        adherent.setCountry("");
        adherent.setStatus(AdherentStatus.ACTIVE);
        Adherent savedAdherent = adherentRepository.save(adherent);

        // Create Admin User
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("ADMIN");
        user.setAdherent(savedAdherent);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
