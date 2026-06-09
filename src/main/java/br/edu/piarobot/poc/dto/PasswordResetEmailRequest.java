package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Envio de senha temporária por e-mail (SMTP)")
public record PasswordResetEmailRequest(
        @Schema(description = "Destinatário", example = "maria@ufpr.br")
        @NotBlank @Email String email,
        @Schema(description = "Nome para personalizar o e-mail") @NotBlank String name,
        @Schema(description = "Senha temporária gerada") @NotBlank String temporaryPassword
) {
}
