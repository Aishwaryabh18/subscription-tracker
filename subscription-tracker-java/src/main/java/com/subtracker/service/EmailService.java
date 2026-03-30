package com.subtracker.service;

import com.subtracker.model.Subscription;
import com.subtracker.model.User;
import com.subtracker.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    public EmailService(JavaMailSender mailSender, UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    public void sendReminderEmail(Subscription subscription) {
        User user = userRepository.findById(subscription.getUserId()).orElse(null);
        if (user == null || user.getEmail() == null) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Subscription Reminder: " + subscription.getName());
        message.setText("Your subscription \"" + subscription.getName() + "\" is due on " + subscription.getNextBillingDate());
        mailSender.send(message);
    }
}
