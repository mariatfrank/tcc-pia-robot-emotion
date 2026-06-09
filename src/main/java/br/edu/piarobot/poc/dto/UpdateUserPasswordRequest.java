package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Redefinição de senha autenticada")
public record UpdateUserPasswordRequest(
        @Schema(description = "Senha atual para validação")
        @NotBlank String currentPassword,
        @Schema(description = "Nova senha (mín. 8 caracteres, maiúscula e número)")
        @NotBlank @Size(min = 8, max = 128) String newPassword
) {
}
