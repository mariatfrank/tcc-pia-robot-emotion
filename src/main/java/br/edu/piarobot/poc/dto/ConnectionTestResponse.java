package br.edu.piarobot.poc.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resultado do teste de conexão entre painel web, backend e dispositivos")
public record ConnectionTestResponse(
        @Schema(description = "Backend respondeu corretamente", example = "true") boolean backendOk,
        @Schema(description = "Mensagem sobre o backend", example = "API disponível.")
        String backendMessage,
        @Schema(description = "Celular dos olhos ativo para o usuário", example = "true")
        boolean eyesPhoneConnected,
        @Schema(description = "Detalhe do celular")
        String eyesPhoneMessage,
        @Schema(description = "Tablet de jogo ativo para o usuário", example = "true")
        boolean gameTabletConnected,
        @Schema(description = "Detalhe do tablet")
        String gameTabletMessage,
        @Schema(description = "Resumo geral da conectividade")
        String summary
) {
}
