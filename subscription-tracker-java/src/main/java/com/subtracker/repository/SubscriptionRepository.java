package com.subtracker.repository;

import com.subtracker.model.Subscription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
    List<Subscription> findByUserId(String userId);
    List<Subscription> findByUserIdAndStatus(String userId, String status);
    List<Subscription> findByUserIdAndStatusAndNextBillingDateBetween(String userId, String status, LocalDate from, LocalDate to);
    List<Subscription> findByStatusAndReminderEnabled(String status, Boolean reminderEnabled);
}
