package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.EmotionType;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Emoção manual ativa para o usuário")
public record ManualEmotionResponse(
        @Schema(description = "Emoção configurada nos olhos") EmotionType emotion
) {
}
