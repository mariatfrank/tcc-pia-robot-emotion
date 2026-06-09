package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.domain.RobotSession;
import br.edu.piarobot.poc.domain.SessionStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Estado em tempo real da sessão (leve, para polling dos olhos)")
public record SessionLiveResponse(
        @Schema(description = "ID da sessão") UUID id,
        @Schema(description = "Status da sessão") SessionStatus status,
        @Schema(description = "Partida em andamento no tablet") boolean playStarted,
        @Schema(description = "Emoção atual dos olhos") EmotionType currentEmotion,
        @Schema(description = "Pontuação acumulada") int score,
        @Schema(description = "Acertos") int hits,
        @Schema(description = "Erros") int misses
) {
    public static SessionLiveResponse from(RobotSession session) {
        return new SessionLiveResponse(
                session.getId(),
                session.getStatus(),
                session.isPlayStarted(),
                session.getCurrentEmotion(),
                session.getScore(),
                session.getHits(),
                session.getMisses()
        );
    }
}
