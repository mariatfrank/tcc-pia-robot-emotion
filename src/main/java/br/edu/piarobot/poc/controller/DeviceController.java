package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.DeviceResponse;
import br.edu.piarobot.poc.dto.RegisterDeviceRequest;
import br.edu.piarobot.poc.service.DeviceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import br.edu.piarobot.poc.openapi.StandardApiResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/devices")
@Tag(name = "Dispositivos", description = "Cadastro e gerenciamento de celular (olhos) e tablet (jogo)")
@StandardApiResponses
public class DeviceController {

    private static final String USER_EMAIL_HEADER = "X-Pia-User-Email";

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @Operation(summary = "Registrar dispositivo", description = "Registra celular ou tablet via QR Code / pareamento.")
    @ApiResponse(responseCode = "201", description = "Dispositivo criado",
            content = @Content(schema = @Schema(implementation = DeviceResponse.class)))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeviceResponse register(
            @Valid @RequestBody RegisterDeviceRequest request,
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return DeviceResponse.from(deviceService.register(request, ownerEmail));
    }

    @Operation(summary = "Listar dispositivos", description = "Lista dispositivos ativos do usuário.")
    @GetMapping
    public List<DeviceResponse> list(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return deviceService.listAll(ownerEmail).stream()
                .map(DeviceResponse::from)
                .toList();
    }

    @Operation(summary = "Obter dispositivo por ID")
    @GetMapping("/{id}")
    public DeviceResponse get(@PathVariable UUID id) {
        return DeviceResponse.from(deviceService.get(id));
    }

    @Operation(summary = "Desativar dispositivo", description = "Remove o vínculo do dispositivo com o usuário.")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(
            @PathVariable UUID id,
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        deviceService.deactivate(id, ownerEmail);
    }
}
