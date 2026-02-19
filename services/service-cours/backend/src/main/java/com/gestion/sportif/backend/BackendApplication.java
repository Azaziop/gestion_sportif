package com.gestion.sportif.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication(scanBasePackages = "com.gestion.sportif")
@EnableJpaRepositories(basePackages = "com.gestion.sportif.servicecours.repository")
@EntityScan(basePackages = "com.gestion.sportif.servicecours.entity")
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}




