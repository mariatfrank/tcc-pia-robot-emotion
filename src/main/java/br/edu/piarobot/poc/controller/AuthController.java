package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.PasswordResetEmailRequest;
import br.edu.piarobot.poc.service.PasswordResetEmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.edu.piarobot.poc.openapi.StandardApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Recuperação de senha por e-mail (SMTP)")
@StandardApiResponses
public class AuthController {

    private final PasswordResetEmailService passwordResetEmailService;

    public AuthController(PasswordResetEmailService passwordResetEmailService) {
        this.passwordResetEmailService = passwordResetEmailService;
    }

    @Operation(summary = "Enviar e-mail de redefinição de senha", description = "Envia senha temporária ao e-mail informado.")
    @ApiResponse(responseCode = "202", description = "E-mail aceito para envio")
    @ApiResponse(responseCode = "502", description = "Falha no SMTP")
    @PostMapping("/password-reset-email")
    public ResponseEntity<Void> sendPasswordResetEmail(@Valid @RequestBody PasswordResetEmailRequest request) {
        passwordResetEmailService.sendTemporaryPassword(
                request.email(),
                request.name(),
                request.temporaryPassword()
        );
        return ResponseEntity.accepted().build();
    }
}
