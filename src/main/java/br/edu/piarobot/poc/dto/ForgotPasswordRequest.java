package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Solicitação de recuperação de senha por e-mail")
public record ForgotPasswordRequest(
        @Schema(description = "E-mail cadastrado no sistema", example = "maria@ufpr.br")
        @NotBlank @Email String email
) {
}
