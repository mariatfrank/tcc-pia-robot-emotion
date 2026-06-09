package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Device;
import br.edu.piarobot.poc.domain.DeviceStatus;
import br.edu.piarobot.poc.domain.DeviceType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Dispositivo conectado ao sistema")
public record DeviceResponse(
        @Schema(description = "Identificador do dispositivo") UUID id,
        @Schema(description = "Nome exibido no painel") String name,
        @Schema(description = "E-mail do usuário dono", nullable = true) String ownerEmail,
        @Schema(description = "Sessão de jogo associada", nullable = true) UUID sessionId,
        @Schema(description = "Celular dos olhos ou tablet de jogo") DeviceType type,
        @Schema(description = "ACTIVE ou INACTIVE") DeviceStatus status,
        @Schema(description = "Data de cadastro") Instant createdAt,
        @Schema(description = "Última atualização") Instant updatedAt
) {

    public static DeviceResponse from(Device device) {
        return new DeviceResponse(
                device.getId(),
                device.getName(),
                device.getOwnerEmail(),
                device.getSessionId(),
                device.getType(),
                device.getStatus(),
                device.getCreatedAt(),
                device.getUpdatedAt()
        );
    }
}
