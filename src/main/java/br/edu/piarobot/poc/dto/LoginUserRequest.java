package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciais de login")
public record LoginUserRequest(
        @Schema(description = "E-mail cadastrado", example = "maria@ufpr.br")
        @NotBlank @Email String email,
        @Schema(description = "Senha do usuário")
        @NotBlank String password
) {
}
