package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.DeviceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterDeviceRequest(
        @NotBlank String name,
        @NotNull DeviceType type
) {
}
