package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.ManualEmotionRequest;
import br.edu.piarobot.poc.dto.ManualEmotionResponse;
import br.edu.piarobot.poc.service.ManualEmotionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.edu.piarobot.poc.openapi.StandardApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/manual-emotion")
@Tag(name = "Emoção manual", description = "Controle da emoção dos olhos fora ou durante a partida")
@StandardApiResponses
public class ManualEmotionController {

    private static final String USER_EMAIL_HEADER = "X-Pia-User-Email";

    private final ManualEmotionService manualEmotionService;

    public ManualEmotionController(ManualEmotionService manualEmotionService) {
        this.manualEmotionService = manualEmotionService;
    }

    @Operation(summary = "Obter emoção manual atual")
    @GetMapping
    public ManualEmotionResponse get(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return manualEmotionService.get(ownerEmail);
    }

    @Operation(summary = "Atualizar emoção manual", description = "Feliz, triste ou neutro.")
    @PostMapping
    public ManualEmotionResponse update(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail,
            @Valid @RequestBody ManualEmotionRequest request
    ) {
        return manualEmotionService.update(ownerEmail, request.emotion());
    }
}
