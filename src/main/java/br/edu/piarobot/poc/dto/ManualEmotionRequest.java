package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.EmotionType;
import jakarta.validation.constraints.NotNull;

public record ManualEmotionRequest(
        @NotNull EmotionType emotion
) {
}
