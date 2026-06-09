package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastro de usuário no painel web")
public record RegisterUserRequest(
        @Schema(description = "Nome completo do usuário", example = "Maria Tereza")
        @NotBlank @Size(max = 120) String name,
        @Schema(description = "E-mail único de login", example = "maria@ufpr.br")
        @NotBlank @Email @Size(max = 320) String email,
        @Schema(description = "Senha (mín. 8 caracteres, maiúscula e número)", example = "Senha123")
        @NotBlank @Size(min = 8, max = 128) String password
) {
}
