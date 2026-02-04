package com.example.demo.config;

import com.example.demo.model.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository,
                                                PasswordEncoder passwordEncoder) {
        return args -> createAdminIfMissing(userRepository, passwordEncoder);
    }

    @Transactional
    void createAdminIfMissing(UserRepository userRepository,
                              PasswordEncoder passwordEncoder) {
        if (userRepository.existsByUsername("admin")) {
            return;
        }

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("Admin123!"));
        admin.setRole("ADMIN");
        admin.setAdherent(null);
        userRepository.save(admin);
    }
}