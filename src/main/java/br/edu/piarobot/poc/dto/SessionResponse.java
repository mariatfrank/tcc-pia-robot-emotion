package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Difficulty;
import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.domain.RobotSession;
import br.edu.piarobot.poc.domain.SessionStatus;

import java.time.Instant;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        String gameCode,
        Difficulty difficulty,
        SessionStatus status,
        EmotionType currentEmotion,
        int score,
        int hits,
        int misses,
        Instant startedAt,
        Instant finishedAt
) {

    public static SessionResponse from(RobotSession session) {
        return new SessionResponse(
                session.getId(),
                session.getGameCode(),
                session.getDifficulty(),
                session.getStatus(),
                session.getCurrentEmotion(),
                session.getScore(),
                session.getHits(),
                session.getMisses(),
                session.getStartedAt(),
                session.getFinishedAt()
        );
    }
}
