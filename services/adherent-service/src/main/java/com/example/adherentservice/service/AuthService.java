package com.example.adherentservice.service;

import com.example.adherentservice.dto.AuthRequest;
import com.example.adherentservice.dto.AuthResponse;
import com.example.adherentservice.dto.RegisterRequest;
import com.example.adherentservice.model.User;
import com.example.adherentservice.repository.UserRepository;
import com.example.adherentservice.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    public AuthService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole("USER");
        
        userRepository.save(user);
        
        String token = jwtService.generateToken(user.getUsername(), user.getRole(), user.getEmail());
        AuthResponse response = new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
        return response;
    }
    
    public AuthResponse login(AuthRequest request) {
        // Accept both username and email in the username field
        User user = userRepository.findByUsername(request.getUsername())
            .orElseGet(() -> userRepository.findByEmail(request.getUsername())
                .orElse(null));
        
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getUsername(), user.getRole(), user.getEmail());
        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }
    
    public AuthResponse registerAdmin(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole("ADMIN");
        
        userRepository.save(user);
        
        String token = jwtService.generateToken(user.getUsername(), user.getRole(), user.getEmail());
        AuthResponse response = new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
        return response;
    }
}
