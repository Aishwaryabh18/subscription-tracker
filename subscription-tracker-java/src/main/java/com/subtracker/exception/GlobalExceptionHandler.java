package com.subtracker.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> Map.of("field", err.getField(), "message", err.getDefaultMessage()))
                .toList();
        return Map.of("success", false, "message", "Validation failed", "errors", errors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleBadRequest(IllegalArgumentException ex) {
        return Map.of("success", false, "message", ex.getMessage());
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, Object> handleForbidden(SecurityException ex) {
        return Map.of("success", false, "message", ex.getMessage());
    }

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> handleNotFound(NoSuchElementException ex) {
        return Map.of("success", false, "message", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> handleGeneric(Exception ex) {
        return Map.of("success", false, "message", "Internal server error", "error", ex.getMessage());
    }
}
