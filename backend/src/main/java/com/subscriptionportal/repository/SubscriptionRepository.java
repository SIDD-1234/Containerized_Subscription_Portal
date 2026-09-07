package com.subscriptionportal.repository;

import com.subscriptionportal.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
}