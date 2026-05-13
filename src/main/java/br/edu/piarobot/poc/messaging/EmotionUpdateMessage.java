package br.edu.piarobot.poc.messaging;

import br.edu.piarobot.poc.domain.EmotionType;

import java.time.Instant;
import java.util.UUID;

public record EmotionUpdateMessage(
        UUID sessionId,
        EmotionType emotion,
        int score,
        int hits,
        int misses,
        Instant updatedAt,
        String reason
) {
}
