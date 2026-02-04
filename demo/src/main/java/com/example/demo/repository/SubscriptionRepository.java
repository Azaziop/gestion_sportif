package com.example.demo.repository;

import com.example.demo.model.entity.Subscription;
import com.example.demo.model.enums.SubscriptionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByType(SubscriptionType type);
    boolean existsByType(SubscriptionType type);
}
