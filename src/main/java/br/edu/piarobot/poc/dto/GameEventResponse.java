package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.GameEventRecord;
import br.edu.piarobot.poc.domain.GameEventType;

import java.time.Instant;
import java.util.UUID;

public record GameEventResponse(
        UUID id,
        UUID sessionId,
        GameEventType type,
        int points,
        Instant createdAt
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
