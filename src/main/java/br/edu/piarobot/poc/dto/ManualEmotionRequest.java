package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.EmotionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Alteração manual da emoção dos olhos")
public record ManualEmotionRequest(
        @Schema(description = "Emoção desejada: HAPPY, SAD, NEUTRAL, IDLE") @NotNull EmotionType emotion
) {
}
