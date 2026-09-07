package com.subscriptionportal.controller;

import com.subscriptionportal.model.Subscription;
import com.subscriptionportal.repository.SubscriptionRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriptionController {

    private final SubscriptionRepository repository;

    public SubscriptionController(SubscriptionRepository repository) {
        this.repository = repository;
    }

    // Create subscription
    @PostMapping
    public ResponseEntity<Subscription> createSubscription(
            @RequestBody Subscription subscription) {

        if (subscription.getCost() < 0) {
            return ResponseEntity.badRequest().build();
        }

        Subscription saved = repository.save(subscription);

        return ResponseEntity.ok(saved);
    }

    // View all subscriptions
    @GetMapping
    public ResponseEntity<List<Subscription>> getSubscriptions() {

        return ResponseEntity.ok(repository.findAll());
    }
}