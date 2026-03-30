package com.subtracker.service;

import com.subtracker.model.Subscription;
import com.subtracker.repository.SubscriptionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class ReminderScheduler {
    private final SubscriptionRepository subscriptionRepository;
    private final EmailService emailService;

    public ReminderScheduler(SubscriptionRepository subscriptionRepository, EmailService emailService) {
        this.subscriptionRepository = subscriptionRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 9 * * *")
    public void runDailyReminders() {
        List<Subscription> subscriptions = subscriptionRepository.findByStatusAndReminderEnabled("active", true);
        for (Subscription sub : subscriptions) {
            if (sub.shouldSendReminder()) {
                emailService.sendReminderEmail(sub);
                sub.setLastReminderSent(Instant.now());
                subscriptionRepository.save(sub);
            }
        }
    }
}
