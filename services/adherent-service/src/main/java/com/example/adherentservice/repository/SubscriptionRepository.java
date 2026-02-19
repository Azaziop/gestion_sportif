package com.example.adherentservice.repository;

import com.example.adherentservice.model.Subscription;
import com.example.adherentservice.model.SubscriptionType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByType(SubscriptionType type);
    boolean existsByType(SubscriptionType type);
    Optional<Subscription> findByAdherentId(Long adherentId);
}
