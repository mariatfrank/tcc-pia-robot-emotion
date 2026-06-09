package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.CreateSessionRequest;
import br.edu.piarobot.poc.dto.GameEventRequest;
import br.edu.piarobot.poc.dto.GameEventResponse;
import br.edu.piarobot.poc.dto.ManualEmotionRequest;
import br.edu.piarobot.poc.dto.SessionLiveResponse;
import br.edu.piarobot.poc.dto.SessionResponse;
import br.edu.piarobot.poc.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/sessions")
@Tag(name = "Sessões e jogo", description = "Partidas, eventos, pontuação e emoção por sessão")
@StandardApiResponses
public class SessionController {

    private static final String USER_EMAIL_HEADER = "X-Pia-User-Email";

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Operation(summary = "Criar sessão de jogo")
    @ApiResponse(responseCode = "201", description = "Sessão criada",
            content = @Content(schema = @Schema(implementation = SessionResponse.class)))
    @ApiResponse(responseCode = "409", description = "Estado inválido da sessão")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse create(
            @Valid @RequestBody CreateSessionRequest request,
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return SessionResponse.from(sessionService.create(request, ownerEmail));
    }

    @Operation(summary = "Listar sessões ativas")
    @GetMapping
    public List<SessionResponse> listActive(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return sessionService.listActive(ownerEmail).stream()
                .map(SessionResponse::from)
                .toList();
    }

    @Operation(summary = "Histórico de partidas finalizadas")
    @GetMapping("/history")
    public List<SessionResponse> listHistory(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return sessionService.listFinished(ownerEmail).stream()
                .map(SessionResponse::from)
                .toList();
    }

    @Operation(summary = "Vincular sessões sem dono ao usuário logado")
    @PostMapping("/claim-unowned")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void claimUnowned(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        sessionService.claimUnownedSessions(ownerEmail);
    }

    @Operation(summary = "Obter sessão por ID")
    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(SessionResponse.from(sessionService.get(id)));
    }

    @Operation(summary = "Estado ao vivo da sessão", description = "Payload reduzido para sincronização rápida dos olhos durante a partida.")
    @GetMapping("/{id}/live")
    public ResponseEntity<SessionLiveResponse> live(@PathVariable UUID id) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(SessionLiveResponse.from(sessionService.get(id)));
    }

    @Operation(
            summary = "Partida em andamento do usuário",
            description = "Retorna emoção e placar da sessão ACTIVE com jogo iniciado (para os olhos no celular)."
    )
    @ApiResponse(responseCode = "200", description = "Partida encontrada",
            content = @Content(schema = @Schema(implementation = SessionLiveResponse.class)))
    @ApiResponse(responseCode = "204", description = "Nenhuma partida em andamento")
    @GetMapping("/current-live")
    public ResponseEntity<SessionLiveResponse> currentLive(
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return sessionService.findCurrentLiveForOwner(ownerEmail)
                .map(session -> ResponseEntity.ok()
                        .cacheControl(CacheControl.noStore())
                        .body(SessionLiveResponse.from(session)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @Operation(summary = "Listar eventos da partida")
    @GetMapping("/{id}/events")
    public List<GameEventResponse> listEvents(@PathVariable UUID id) {
        return sessionService.listEvents(id).stream()
                .map(GameEventResponse::from)
                .toList();
    }

    @Operation(summary = "Registrar evento de jogo", description = "Acerto, erro, início/fim de partida etc.")
    @PostMapping("/{id}/events")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public GameEventResponse receiveEvent(
            @PathVariable UUID id,
            @Valid @RequestBody GameEventRequest request,
            @RequestHeader(value = USER_EMAIL_HEADER, required = false) String ownerEmail
    ) {
        return GameEventResponse.from(sessionService.receiveGameEvent(id, request, ownerEmail));
    }

    @Operation(summary = "Definir emoção manual na sessão ativa")
    @PostMapping("/{id}/emotion")
    public SessionResponse setManualEmotion(
            @PathVariable UUID id,
            @Valid @RequestBody ManualEmotionRequest request
    ) {
        return SessionResponse.from(sessionService.setManualEmotion(id, request.emotion()));
    }
}
