package com.example.demo.config;

import com.example.demo.model.entity.Adherent;
import com.example.demo.model.entity.User;
import com.example.demo.model.enums.AdherentStatus;
import com.example.demo.repository.AdherentRepository;
import com.example.demo.repository.UserRepository;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository,
                                                AdherentRepository adherentRepository,
                                                PasswordEncoder passwordEncoder) {
        return args -> createAdminIfMissing(userRepository, adherentRepository, passwordEncoder);
    }

    @Transactional
    void createAdminIfMissing(UserRepository userRepository,
                              AdherentRepository adherentRepository,
                              PasswordEncoder passwordEncoder) {
        if (userRepository.existsByUsername("admin")) {
            return;
        }

        Adherent adherent = new Adherent();
        adherent.setFirstName("Admin");
        adherent.setLastName("System");
        adherent.setEmail("admin@local");
        adherent.setPhoneNumber("+33123456789");
        adherent.setDateOfBirth(LocalDate.of(1990, 1, 1));
        adherent.setAddress("N/A");
        adherent.setCity("N/A");
        adherent.setPostalCode("00000");
        adherent.setCountry("N/A");
        adherent.setMedicalCertificate(new byte[]{1});
        adherent.setMedicalCertificateExpiryDate(LocalDate.now().plusYears(1));
        adherent.setStatus(AdherentStatus.ACTIVE);
        Adherent savedAdherent = adherentRepository.save(adherent);

        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("Admin123!"));
        admin.setRole("ADMIN");
        admin.setAdherent(savedAdherent);
        userRepository.save(admin);
    }
}