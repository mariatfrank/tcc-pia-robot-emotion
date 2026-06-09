package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.DeviceType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(description = "Cadastro de dispositivo (celular dos olhos ou tablet de jogo)")
public record RegisterDeviceRequest(
        @Schema(description = "Nome amigável do dispositivo", example = "Tablet sala 1")
        @NotBlank String name,
        @Schema(description = "Tipo do dispositivo no ecossistema")
        @NotNull DeviceType type,
        @Schema(description = "Sessão de jogo vinculada (opcional)", nullable = true)
        UUID sessionId,
        @Schema(description = "E-mail do dono (opcional se enviado no header)", example = "maria@ufpr.br", nullable = true)
        String ownerEmail
) {
}
