package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Difficulty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Parâmetros de jogo configurados no painel web")
public record GameSettingsRequest(
        @Schema(description = "Nível de dificuldade (tamanho do alvo)") @NotNull Difficulty difficulty,
        @Schema(description = "Duração da partida em segundos", example = "60") @NotNull Integer durationSec,
        @Schema(description = "Sons habilitados no tablet", example = "true") @NotNull Boolean soundEnabled
) {
}
