package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.ConnectionTestResponse;
import br.edu.piarobot.poc.openapi.StandardApiResponses;
import br.edu.piarobot.poc.service.ConnectionTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/connection-test")
@Tag(name = "Teste de conexão", description = "Validação integrada entre painel web, API e dispositivos cadastrados")
@StandardApiResponses
public class ConnectionTestController {

    private static final String USER_EMAIL_HEADER = "X-Pia-User-Email";

    private final ConnectionTestService connectionTestService;

    public ConnectionTestController(ConnectionTestService connectionTestService) {
        this.connectionTestService = connectionTestService;
    }

    @Operation(
            summary = "Testar conexão entre dispositivos",
            description = "Verifica disponibilidade da API e presença de celular (olhos) e tablet ativos para o usuário."
    )
    @ApiResponse(responseCode = "200", description = "Resultado do teste",
            content = @Content(schema = @Schema(implementation = ConnectionTestResponse.class)))
    @PostMapping
    public ConnectionTestResponse test(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return connectionTestService.test(ownerEmail);
    }
}
