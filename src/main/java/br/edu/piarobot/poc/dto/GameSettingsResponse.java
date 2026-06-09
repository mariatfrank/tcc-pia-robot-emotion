package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Difficulty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Configurações de jogo do usuário")
public record GameSettingsResponse(
        @Schema(description = "Dificuldade ativa") Difficulty difficulty,
        @Schema(description = "Tempo da partida em segundos", example = "60") int durationSec,
        @Schema(description = "Feedback sonoro no tablet") boolean soundEnabled
) {
}
