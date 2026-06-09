package br.edu.piarobot.poc.dto;

import br.edu.piarobot.poc.domain.AppUser;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Perfil público do usuário (sem dados sensíveis)")
public record UserProfileResponse(
        @Schema(description = "Identificador interno do usuário") UUID id,
        @Schema(description = "E-mail de login", example = "maria@ufpr.br") String email,
        @Schema(description = "Nome exibido no painel", example = "Maria Tereza") String name,
        @Schema(description = "Data de criação da conta") Instant createdAt,
        @Schema(description = "Última atualização do perfil") Instant updatedAt
) {

    public static UserProfileResponse from(AppUser user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
