package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Difficulty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Criação de sessão de jogo")
public record CreateSessionRequest(
        @Schema(description = "Código do jogo", example = "TARGET_HIT")
        @NotBlank String gameCode,
        @Schema(description = "Dificuldade da partida (tamanho do alvo)")
        @NotNull Difficulty difficulty
) {
}
