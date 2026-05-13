package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateSessionRequest(
        @NotBlank String gameCode,
        @NotNull Difficulty difficulty
) {
}
