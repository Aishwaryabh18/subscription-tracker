package com.subtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 50) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6) String password,
            @NotBlank String confirmPassword
    ) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record UpdateProfileRequest(String name, @Email String email, Preferences preferences) {}

    public record Preferences(String currency, Integer reminderDays, Boolean emailNotifications) {}

    public record ChangePasswordRequest(@NotBlank String currentPassword, @NotBlank @Size(min = 6) String newPassword) {}
}
