package br.edu.piarobot.poc.controller;

import br.edu.piarobot.poc.dto.CreateSessionRequest;
import br.edu.piarobot.poc.dto.GameEventRequest;
import br.edu.piarobot.poc.dto.GameEventResponse;
import br.edu.piarobot.poc.dto.ManualEmotionRequest;
import br.edu.piarobot.poc.dto.SessionResponse;
import br.edu.piarobot.poc.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SessionResponse create(@Valid @RequestBody CreateSessionRequest request) {
        return SessionResponse.from(sessionService.create(request));
    }

    @GetMapping
    public List<SessionResponse> listActive() {
        return sessionService.listActive().stream()
                .map(SessionResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public SessionResponse get(@PathVariable UUID id) {
        return SessionResponse.from(sessionService.get(id));
    }

    @GetMapping("/{id}/events")
    public List<GameEventResponse> listEvents(@PathVariable UUID id) {
        return sessionService.listEvents(id).stream()
                .map(GameEventResponse::from)
                .toList();
    }

    @PostMapping("/{id}/events")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public GameEventResponse receiveEvent(
            @PathVariable UUID id,
            @Valid @RequestBody GameEventRequest request
    ) {
        return GameEventResponse.from(sessionService.receiveGameEvent(id, request));
    }

    @PostMapping("/{id}/emotion")
    public SessionResponse setManualEmotion(
            @PathVariable UUID id,
            @Valid @RequestBody ManualEmotionRequest request
    ) {
        return SessionResponse.from(sessionService.setManualEmotion(id, request.emotion()));
    }
}
