package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.Device;
import br.edu.piarobot.poc.domain.DeviceStatus;
import br.edu.piarobot.poc.domain.DeviceType;

import java.time.Instant;
import java.util.UUID;

public record DeviceResponse(
        UUID id,
        String name,
        DeviceType type,
        DeviceStatus status,
        Instant createdAt,
        Instant updatedAt
) {

    public static DeviceResponse from(Device device) {
        return new DeviceResponse(
                device.getId(),
                device.getName(),
                device.getType(),
                device.getStatus(),
                device.getCreatedAt(),
                device.getUpdatedAt()
        );
    }
}
