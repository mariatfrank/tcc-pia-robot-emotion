package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Difficulty;
import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.domain.RobotSession;
import br.edu.piarobot.poc.domain.SessionStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Estado de uma sessão/partida do robô")
public record SessionResponse(
        @Schema(description = "ID da sessão") UUID id,
        @Schema(description = "Código do jogo", example = "TARGET_HIT") String gameCode,
        @Schema(description = "E-mail do dono", nullable = true) String ownerEmail,
        @Schema(description = "Dificuldade configurada") Difficulty difficulty,
        @Schema(description = "Status da sessão") SessionStatus status,
        @Schema(description = "Partida já iniciada no tablet") boolean playStarted,
        @Schema(description = "Emoção atual dos olhos") EmotionType currentEmotion,
        @Schema(description = "Pontuação acumulada") int score,
        @Schema(description = "Quantidade de acertos") int hits,
        @Schema(description = "Quantidade de erros") int misses,
        @Schema(description = "Início da sessão") Instant startedAt,
        @Schema(description = "Fim da sessão", nullable = true) Instant finishedAt
) {

    public static SessionResponse from(RobotSession session) {
        return new SessionResponse(
                session.getId(),
                session.getGameCode(),
                session.getOwnerEmail(),
                session.getDifficulty(),
                session.getStatus(),
                session.isPlayStarted(),
                session.getCurrentEmotion(),
                session.getScore(),
                session.getHits(),
                session.getMisses(),
                session.getStartedAt(),
                session.getFinishedAt()
        );
    }
}
