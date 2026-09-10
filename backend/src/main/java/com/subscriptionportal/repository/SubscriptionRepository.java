package com.subscriptionportal.repository;

import com.subscriptionportal.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository
        extends JpaRepository<Subscription, Long> {

    List<Subscription>
    findByNameContainingIgnoreCaseOrProviderContainingIgnoreCase(
            String name,
            String provider
    );
}