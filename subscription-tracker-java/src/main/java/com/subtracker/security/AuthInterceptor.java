package com.subtracker.security;

import com.subtracker.model.User;
import com.subtracker.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    public static final String USER_ATTR = "authenticatedUser";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthInterceptor(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Not authorized");
            return false;
        }
        String token = authHeader.substring(7);
        try {
            String userId = jwtService.extractUserId(token);
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User no longer exists");
                return false;
            }
            request.setAttribute(USER_ATTR, user);
            return true;
        } catch (Exception ex) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return false;
        }
    }
}
