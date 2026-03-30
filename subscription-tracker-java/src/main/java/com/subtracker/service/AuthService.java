package com.subtracker.service;

import com.subtracker.dto.AuthDtos;
import com.subtracker.model.User;
import com.subtracker.repository.UserRepository;
import com.subtracker.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public Map<String, Object> register(AuthDtos.RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw new IllegalArgumentException("User already exists with this email");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);

        return authResponse("User registered successfully", user);
    }

    public Map<String, Object> login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return authResponse("Login successful", user);
    }

    public Map<String, Object> updateProfile(User user, AuthDtos.UpdateProfileRequest request) {
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name());
        }
        if (request.email() != null && !request.email().isBlank()) {
            userRepository.findByEmail(request.email().toLowerCase())
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> { throw new IllegalArgumentException("Email already in use"); });
            user.setEmail(request.email());
        }
        if (request.preferences() != null) {
            User.Preferences prefs = user.getPreferences() == null ? new User.Preferences() : user.getPreferences();
            if (request.preferences().currency() != null) prefs.setCurrency(request.preferences().currency());
            if (request.preferences().reminderDays() != null) prefs.setReminderDays(request.preferences().reminderDays());
            if (request.preferences().emailNotifications() != null) prefs.setEmailNotifications(request.preferences().emailNotifications());
            user.setPreferences(prefs);
        }
        user = userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        response.put("user", safeUser(user));
        return response;
    }

    public Map<String, Object> changePassword(User user, AuthDtos.ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user = userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Password changed successfully");
        response.put("token", jwtService.generateToken(user.getId()));
        return response;
    }

    private Map<String, Object> authResponse(String message, User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("token", jwtService.generateToken(user.getId()));
        response.put("user", safeUser(user));
        return response;
    }

    public Map<String, Object> safeUser(User user) {
        Map<String, Object> safe = new LinkedHashMap<>();
        safe.put("id", user.getId());
        safe.put("name", user.getName());
        safe.put("email", user.getEmail());
        safe.put("preferences", user.getPreferences());
        safe.put("createdAt", user.getCreatedAt());
        return safe;
    }
}
