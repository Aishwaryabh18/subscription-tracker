package com.subtracker.controller;

import com.subtracker.dto.SubscriptionRequest;
import com.subtracker.model.User;
import com.subtracker.security.AuthInterceptor;
import com.subtracker.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public Map<String, Object> all(HttpServletRequest req,
                                   @RequestParam(required = false) String status,
                                   @RequestParam(required = false) String category,
                                   @RequestParam(required = false) String sort) {
        User user = (User) req.getAttribute(AuthInterceptor.USER_ATTR);
        return subscriptionService.getAll(user, status, category, sort);
    }

    @GetMapping("/stats/summary")
    public Map<String, Object> stats(HttpServletRequest req) {
        User user = (User) req.getAttribute(AuthInterceptor.USER_ATTR);
        return subscriptionService.stats(user);
    }

    @GetMapping("/{id}")
    public Map<String, Object> byId(HttpServletRequest req, @PathVariable String id) {
        User user = (User) req.getAttribute(AuthInterceptor.USER_ATTR);
        return subscriptionService.getById(user, id);
    }

    @PostMapping
    public Map<String, Object> create(HttpServletRequest req, @Valid @RequestBody SubscriptionRequest request) {
        User user = (User) req.getAttribute(AuthInterceptor.USER_ATTR);
        return subscriptionService.create(user, request);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(HttpServletRequest req, @PathVariable String id,
                                      @Valid @RequestBody SubscriptionRequest request) {
        User user = (User) req.getAttribute(AuthInterceptor.USER_ATTR);
        return subscriptionService.update(user, id, request);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(HttpServletRequest req, @PathVariable String id) {
        User user = (User) req.getAttribute(AuthInterceptor.USER_ATTR);
        return subscriptionService.delete(user, id);
    }
}
