package br.edu.piarobot.poc.messaging;

import br.edu.piarobot.poc.domain.GameEventType;

import java.time.Instant;
import java.util.UUID;

public record GameEventMessage(
        UUID eventId,
        UUID sessionId,
        GameEventType type,
        int points,
        Instant occurredAt
) {
}
