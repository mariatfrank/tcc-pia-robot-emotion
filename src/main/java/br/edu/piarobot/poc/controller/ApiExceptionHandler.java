package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.ApiErrorResponse;
import br.edu.piarobot.poc.service.DuplicateEmailException;
import br.edu.piarobot.poc.service.EmailDeliveryException;
import br.edu.piarobot.poc.service.InvalidCredentialsException;
import br.edu.piarobot.poc.service.InvalidSessionStateException;
import br.edu.piarobot.poc.service.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidSessionStateException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidState(InvalidSessionStateException exception, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, exception.getMessage(), request);
    }

    @ExceptionHandler(EmailDeliveryException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailDelivery(EmailDeliveryException exception, HttpServletRequest request) {
        return build(HttpStatus.BAD_GATEWAY, exception.getMessage(), request);
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateEmail(DuplicateEmailException exception, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException exception, HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, exception.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException exception, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception exception, HttpServletRequest request) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor.", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, message, request);
    }

    private ResponseEntity<ApiErrorResponse> build(HttpStatus status, String message, HttpServletRequest request) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        ));
    }
}
