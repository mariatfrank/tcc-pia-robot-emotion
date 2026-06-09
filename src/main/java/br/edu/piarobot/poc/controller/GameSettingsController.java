package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.GameSettingsRequest;
import br.edu.piarobot.poc.dto.GameSettingsResponse;
import br.edu.piarobot.poc.service.GameSettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.edu.piarobot.poc.openapi.StandardApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/game-settings")
@Tag(name = "Configurações de jogo", description = "Tempo e dificuldade das partidas")
@StandardApiResponses
public class GameSettingsController {

    private static final String USER_EMAIL_HEADER = "X-Pia-User-Email";

    private final GameSettingsService gameSettingsService;

    public GameSettingsController(GameSettingsService gameSettingsService) {
        this.gameSettingsService = gameSettingsService;
    }

    @Operation(summary = "Obter configurações de jogo")
    @GetMapping
    public GameSettingsResponse get(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return gameSettingsService.get(ownerEmail);
    }

    @Operation(summary = "Atualizar configurações de jogo")
    @PutMapping
    public GameSettingsResponse update(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail,
            @Valid @RequestBody GameSettingsRequest request
    ) {
        return gameSettingsService.update(ownerEmail, request);
    }
}
