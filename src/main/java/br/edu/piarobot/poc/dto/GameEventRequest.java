package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.GameEventType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GameEventRequest(
        @NotNull GameEventType type,
        @Min(0) int points
) {
}
