package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Resposta padronizada de erro da API REST")
public record ApiErrorResponse(
        @Schema(description = "Momento do erro", example = "2026-05-20T12:00:00Z")
        Instant timestamp,
        @Schema(description = "Código HTTP", example = "404")
        int status,
        @Schema(description = "Nome do status HTTP", example = "Not Found")
        String error,
        @Schema(description = "Mensagem legível para o cliente")
        String message,
        @Schema(description = "Caminho da requisição", example = "/api/sessions/...")
        String path
) {
}
