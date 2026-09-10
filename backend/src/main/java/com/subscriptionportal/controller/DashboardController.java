package com.subscriptionportal.controller;

import com.subscriptionportal.model.Subscription;
import com.subscriptionportal.repository.SubscriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final SubscriptionRepository repository;

    public DashboardController(SubscriptionRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {

        List<Subscription> subscriptions = repository.findAll();

        long total = subscriptions.size();

        long active = subscriptions.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .count();

        long paused = subscriptions.stream()
                .filter(s -> "PAUSED".equalsIgnoreCase(s.getStatus()))
                .count();

        long cancelled = subscriptions.stream()
                .filter(s -> "CANCELLED".equalsIgnoreCase(s.getStatus()))
                .count();

        long draft = subscriptions.stream()
                .filter(s -> "DRAFT".equalsIgnoreCase(s.getStatus()))
                .count();

        double monthlyCost = subscriptions.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .filter(s -> "MONTHLY".equalsIgnoreCase(s.getBillingCycle()))
                .mapToDouble(Subscription::getCost)
                .sum();

        Map<String, Object> summary = new HashMap<>();

        summary.put("total", total);
        summary.put("active", active);
        summary.put("paused", paused);
        summary.put("cancelled", cancelled);
        summary.put("draft", draft);
        summary.put("monthlyCost", monthlyCost);

        return ResponseEntity.ok(summary);
    }
}