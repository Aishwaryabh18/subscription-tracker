package com.subtracker.service;

import com.subtracker.dto.SubscriptionRequest;
import com.subtracker.model.Subscription;
import com.subtracker.model.User;
import com.subtracker.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public Map<String, Object> getAll(User user, String status, String category, String sort) {
        List<Subscription> subscriptions = subscriptionRepository.findByUserId(user.getId());
        subscriptions = subscriptions.stream()
                .filter(s -> status == null || status.equals(s.getStatus()))
                .filter(s -> category == null || category.equals(s.getCategory()))
                .toList();

        Comparator<Subscription> comparator = Comparator.comparing(Subscription::getNextBillingDate);
        if ("cost-high".equals(sort)) comparator = Comparator.comparing(Subscription::getCost).reversed();
        else if ("cost-low".equals(sort)) comparator = Comparator.comparing(Subscription::getCost);
        else if ("date-newest".equals(sort)) comparator = Comparator.comparing(Subscription::getCreatedAt).reversed();
        else if ("date-oldest".equals(sort)) comparator = Comparator.comparing(Subscription::getCreatedAt);

        List<Subscription> sorted = subscriptions.stream().sorted(comparator).toList();
        double totalMonthly = sorted.stream().filter(s -> "active".equals(s.getStatus())).mapToDouble(Subscription::getMonthlyCost).sum();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("count", sorted.size());
        response.put("totalMonthly", String.format(Locale.US, "%.2f", totalMonthly));
        response.put("totalYearly", String.format(Locale.US, "%.2f", totalMonthly * 12));
        response.put("subscriptions", sorted);
        return response;
    }

    public Map<String, Object> getById(User user, String id) {
        Subscription sub = findOwned(user, id);
        return Map.of("success", true, "subscription", sub);
    }

    public Map<String, Object> create(User user, SubscriptionRequest request) {
        Subscription sub = new Subscription();
        mapRequest(sub, request);
        sub.setUserId(user.getId());
        sub.setCurrency("INR");
        sub.setCreatedAt(Instant.now());
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);

        return Map.of("success", true, "message", "Subscription created successfully", "subscription", sub);
    }

    public Map<String, Object> update(User user, String id, SubscriptionRequest request) {
        Subscription sub = findOwned(user, id);
        mapRequest(sub, request);
        sub.setCurrency("INR");
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);
        return Map.of("success", true, "message", "Subscription updated successfully", "subscription", sub);
    }

    public Map<String, Object> delete(User user, String id) {
        Subscription sub = findOwned(user, id);
        subscriptionRepository.delete(sub);
        return Map.of("success", true, "message", "Subscription deleted successfully", "id", id);
    }

    public Map<String, Object> stats(User user) {
        List<Subscription> active = subscriptionRepository.findByUserIdAndStatus(user.getId(), "active");
        double totalMonthly = active.stream().mapToDouble(Subscription::getMonthlyCost).sum();

        Map<String, Map<String, Object>> byCategory = new LinkedHashMap<>();
        for (Subscription sub : active) {
            byCategory.putIfAbsent(sub.getCategory(), new LinkedHashMap<>(Map.of("count", 0, "totalMonthly", 0.0)));
            Map<String, Object> c = byCategory.get(sub.getCategory());
            c.put("count", ((Integer) c.get("count")) + 1);
            c.put("totalMonthly", ((Double) c.get("totalMonthly")) + sub.getMonthlyCost());
        }

        List<Subscription> renewals = subscriptionRepository.findByUserIdAndStatusAndNextBillingDateBetween(
                user.getId(), "active", LocalDate.now(), LocalDate.now().plusDays(30));

        List<Map<String, Object>> upcoming = renewals.stream().sorted(Comparator.comparing(Subscription::getNextBillingDate)).map(sub -> {
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("id", sub.getId());
            r.put("name", sub.getName());
            r.put("cost", sub.getCost());
            r.put("nextBillingDate", sub.getNextBillingDate());
            r.put("daysUntil", ChronoUnit.DAYS.between(LocalDate.now(), sub.getNextBillingDate()));
            return r;
        }).toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalSubscriptions", active.size());
        stats.put("totalMonthly", String.format(Locale.US, "%.2f", totalMonthly));
        stats.put("totalYearly", String.format(Locale.US, "%.2f", totalMonthly * 12));
        stats.put("byCategory", byCategory);
        stats.put("upcomingRenewals", upcoming);

        return Map.of("success", true, "stats", stats);
    }

    private Subscription findOwned(User user, String id) {
        Subscription sub = subscriptionRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Subscription not found"));
        if (!Objects.equals(sub.getUserId(), user.getId())) {
            throw new SecurityException("Not authorized to access this subscription");
        }
        return sub;
    }

    private void mapRequest(Subscription sub, SubscriptionRequest req) {
        sub.setName(req.name());
        sub.setDescription(req.description());
        sub.setCost(req.cost());
        sub.setBillingCycle(req.billingCycle());
        sub.setStartDate(req.startDate() == null ? LocalDate.now() : req.startDate());
        sub.setNextBillingDate(req.nextBillingDate());
        sub.setCategory(req.category());
        if (req.paymentMethod() != null) sub.setPaymentMethod(req.paymentMethod());
        if (req.website() != null && !req.website().isBlank()) sub.setWebsite(req.website());
        if (req.logo() != null) sub.setLogo(req.logo());
        if (req.notes() != null) sub.setNotes(req.notes());
        if (req.reminderEnabled() != null) sub.setReminderEnabled(req.reminderEnabled());
        if (req.reminderDaysBefore() != null) sub.setReminderDaysBefore(req.reminderDaysBefore());
        if (req.status() != null) sub.setStatus(req.status());
    }
}
