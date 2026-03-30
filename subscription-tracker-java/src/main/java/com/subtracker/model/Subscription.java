package com.subtracker.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Document(collection = "subscriptions")
@CompoundIndexes({
    @CompoundIndex(name = "user_status_idx", def = "{'userId': 1, 'status': 1}"),
    @CompoundIndex(name = "next_billing_idx", def = "{'nextBillingDate': 1}")
})
public class Subscription {
    @Id
    private String id;

    @NotBlank
    private String userId;

    @NotBlank
    private String name;
    private String description;

    @NotNull
    @Min(0)
    private Double cost;

    private String currency = "INR";

    @NotBlank
    private String billingCycle;

    private LocalDate startDate = LocalDate.now();

    @NotNull
    private LocalDate nextBillingDate;

    @NotBlank
    private String category;

    private String paymentMethod = "Credit Card";
    private String status = "active";
    private String website;
    private String logo;
    private String notes;
    private Boolean reminderEnabled = true;
    private Integer reminderDaysBefore = 3;
    private Instant lastReminderSent;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public double getMonthlyCost() {
        return switch (billingCycle) {
            case "weekly" -> cost * 4.33;
            case "quarterly" -> cost / 3;
            case "yearly" -> cost / 12;
            default -> cost;
        };
    }

    public boolean shouldSendReminder() {
        if (!"active".equals(status) || Boolean.FALSE.equals(reminderEnabled)) {
            return false;
        }
        if (lastReminderSent != null && lastReminderSent.isAfter(Instant.now().minus(24, ChronoUnit.HOURS))) {
            return false;
        }
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), nextBillingDate);
        return daysUntil > 0 && daysUntil <= (reminderDaysBefore == null ? 3 : reminderDaysBefore);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(LocalDate nextBillingDate) { this.nextBillingDate = nextBillingDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getReminderEnabled() { return reminderEnabled; }
    public void setReminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; }
    public Integer getReminderDaysBefore() { return reminderDaysBefore; }
    public void setReminderDaysBefore(Integer reminderDaysBefore) { this.reminderDaysBefore = reminderDaysBefore; }
    public Instant getLastReminderSent() { return lastReminderSent; }
    public void setLastReminderSent(Instant lastReminderSent) { this.lastReminderSent = lastReminderSent; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
