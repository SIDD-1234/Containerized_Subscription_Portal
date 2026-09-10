package com.subscriptionportal.controller;

import com.subscriptionportal.model.Subscription;
import com.subscriptionportal.repository.SubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriptionController {

    private final SubscriptionRepository repository;

    public SubscriptionController(SubscriptionRepository repository) {
        this.repository = repository;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<?> createSubscription(
            @RequestBody Subscription subscription) {

        if (subscription.getCost() < 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Subscription cost cannot be negative.");
        }

        if (subscription.getStartDate() != null
                && subscription.getRenewalDate() != null
                && subscription.getRenewalDate()
                .isBefore(subscription.getStartDate())) {

            return ResponseEntity
                    .badRequest()
                    .body("Renewal date cannot be before start date.");
        }

        Subscription saved = repository.save(subscription);
        return ResponseEntity.ok(saved);
    }

    // VIEW ALL
    @GetMapping
    public ResponseEntity<List<Subscription>> getSubscriptions(
            @RequestParam(required = false) String q) {

        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity.ok(
                    repository.findByNameContainingIgnoreCaseOrProviderContainingIgnoreCase(
                            q, q
                    )
            );
        }

        return ResponseEntity.ok(repository.findAll());
    }

    // VIEW ONE
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubscription(@PathVariable Long id) {

        Optional<Subscription> subscription = repository.findById(id);

        if (subscription.isEmpty()) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(subscription.get());
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubscription(
            @PathVariable Long id,
            @RequestBody Subscription updatedSubscription) {

        Optional<Subscription> existing =
                repository.findById(id);

        if (existing.isEmpty()) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        if (updatedSubscription.getCost() < 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Subscription cost cannot be negative.");
        }

        if (updatedSubscription.getStartDate() != null
                && updatedSubscription.getRenewalDate() != null
                && updatedSubscription.getRenewalDate()
                .isBefore(updatedSubscription.getStartDate())) {

            return ResponseEntity
                    .badRequest()
                    .body("Renewal date cannot be before start date.");
        }

        Subscription subscription = existing.get();

        subscription.setName(updatedSubscription.getName());
        subscription.setProvider(updatedSubscription.getProvider());
        subscription.setCategory(updatedSubscription.getCategory());
        subscription.setCost(updatedSubscription.getCost());
        subscription.setCurrency(updatedSubscription.getCurrency());
        subscription.setBillingCycle(updatedSubscription.getBillingCycle());
        subscription.setStartDate(updatedSubscription.getStartDate());
        subscription.setRenewalDate(updatedSubscription.getRenewalDate());

        // Status will be handled separately
        // through the status workflow endpoint.

        Subscription saved = repository.save(subscription);

        return ResponseEntity.ok(saved);
    }
    // ROLE-BASED STATUS UPDATE
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestHeader(value = "X-User-Role", defaultValue = "USER") String role) {

        // Only ADMIN and MANAGER can change subscription status
        if (!role.equalsIgnoreCase("ADMIN")
                && !role.equalsIgnoreCase("MANAGER")) {

            return ResponseEntity
                    .status(403)
                    .body("Only ADMIN or MANAGER can change subscription status.");
        }

        Optional<Subscription> existing = repository.findById(id);

        if (existing.isEmpty()) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        String newStatus = status.toUpperCase();

        // Validate allowed statuses
        if (!newStatus.equals("DRAFT")
                && !newStatus.equals("ACTIVE")
                && !newStatus.equals("PAUSED")
                && !newStatus.equals("CANCELLED")) {

            return ResponseEntity
                    .badRequest()
                    .body("Invalid status. Allowed values: DRAFT, ACTIVE, PAUSED, CANCELLED.");
        }

        Subscription subscription = existing.get();

        subscription.setStatus(newStatus);

        Subscription saved = repository.save(subscription);

        return ResponseEntity.ok(saved);
    }
}