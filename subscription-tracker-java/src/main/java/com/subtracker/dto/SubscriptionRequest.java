package com.subtracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SubscriptionRequest(
        @NotBlank String name,
        String description,
        @NotNull @Min(0) Double cost,
        @NotBlank String billingCycle,
        LocalDate startDate,
        @NotNull LocalDate nextBillingDate,
        @NotBlank String category,
        String paymentMethod,
        String website,
        String logo,
        String notes,
        Boolean reminderEnabled,
        Integer reminderDaysBefore,
        String status
) {}
