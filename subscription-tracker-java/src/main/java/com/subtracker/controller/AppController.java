package com.subtracker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class AppController {
    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of("message", "Subscription Tracker API", "version", "1.0.0", "status", "running");
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "OK", "timestamp", Instant.now().toString());
    }
}
