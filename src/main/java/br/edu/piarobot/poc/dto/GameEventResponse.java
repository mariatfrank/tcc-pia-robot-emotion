package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.GameEventRecord;
import br.edu.piarobot.poc.domain.GameEventType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Evento de jogo persistido")
public record GameEventResponse(
        @Schema(description = "ID do evento") UUID id,
        @Schema(description = "Sessão relacionada") UUID sessionId,
        @Schema(description = "Tipo do evento") GameEventType type,
        @Schema(description = "Pontos registrados") int points,
        @Schema(description = "Momento do registro") Instant createdAt
) {

    public static GameEventResponse from(GameEventRecord event) {
        return new GameEventResponse(
                event.getId(),
                event.getSessionId(),
                event.getType(),
                event.getPoints(),
                event.getCreatedAt()
        );
    }
}
