package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Atualização do nome no perfil")
public record UpdateUserProfileRequest(
        @Schema(description = "Novo nome exibido", example = "Maria T. Frank")
        @NotBlank @Size(max = 120) String name
) {
}
