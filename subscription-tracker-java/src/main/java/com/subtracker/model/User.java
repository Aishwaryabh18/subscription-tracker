package com.subtracker.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "users")
public class User {
    @Id
    private String id;

    @NotBlank
    @Size(max = 50)
    private String name;

    @Indexed(unique = true)
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private Preferences preferences = new Preferences();
    private Instant createdAt = Instant.now();

    public static class Preferences {
        private String currency = "INR";
        private Integer reminderDays = 3;
        private Boolean emailNotifications = true;

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public Integer getReminderDays() { return reminderDays; }
        public void setReminderDays(Integer reminderDays) { this.reminderDays = reminderDays; }
        public Boolean getEmailNotifications() { return emailNotifications; }
        public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email == null ? null : email.toLowerCase(); }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Preferences getPreferences() { return preferences; }
    public void setPreferences(Preferences preferences) { this.preferences = preferences; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
