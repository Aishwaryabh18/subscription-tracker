package com.subtracker.controller;

import com.subtracker.dto.AuthDtos;
import com.subtracker.model.User;
import com.subtracker.security.AuthInterceptor;
import com.subtracker.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        User user = (User) request.getAttribute(AuthInterceptor.USER_ATTR);
        return Map.of("success", true, "user", authService.safeUser(user));
    }

    @PutMapping("/update")
    public Map<String, Object> update(HttpServletRequest request,
                                      @RequestBody AuthDtos.UpdateProfileRequest updateRequest) {
        User user = (User) request.getAttribute(AuthInterceptor.USER_ATTR);
        return authService.updateProfile(user, updateRequest);
    }

    @PutMapping("/change-password")
    public Map<String, Object> changePassword(HttpServletRequest request,
                                              @Valid @RequestBody AuthDtos.ChangePasswordRequest passwordRequest) {
        User user = (User) request.getAttribute(AuthInterceptor.USER_ATTR);
        return authService.changePassword(user, passwordRequest);
    }
}
