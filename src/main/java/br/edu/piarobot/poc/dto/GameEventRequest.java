package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.GameEventType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Evento enviado pelo tablet durante a partida")
public record GameEventRequest(
        @Schema(description = "Tipo do evento (acerto, erro, início, fim...)")
        @NotNull GameEventType type,
        @Schema(description = "Pontos do evento (0 para erros)", example = "1")
        @Min(0) int points
) {
}
