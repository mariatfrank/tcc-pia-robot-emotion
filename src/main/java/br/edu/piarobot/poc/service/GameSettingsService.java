package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.Difficulty;
import br.edu.piarobot.poc.dto.GameSettingsRequest;
import br.edu.piarobot.poc.dto.GameSettingsResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSettingsService {

    private static final GameSettingsResponse DEFAULTS =
            new GameSettingsResponse(Difficulty.EASY, 10, true);

    private final Map<String, GameSettingsResponse> byOwner = new ConcurrentHashMap<>();

    public GameSettingsResponse get(String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner == null) {
            return DEFAULTS;
        }
        return byOwner.getOrDefault(owner, DEFAULTS);
    }

    public GameSettingsResponse update(String ownerEmail, GameSettingsRequest request) {
        String owner = normalizeOwner(ownerEmail);
        GameSettingsResponse next = new GameSettingsResponse(
                request.difficulty(),
                normalizeDuration(request.durationSec()),
                request.soundEnabled()
        );
        if (owner != null) {
            byOwner.put(owner, next);
        }
        return next;
    }

    private int normalizeDuration(Integer durationSec) {
        if (durationSec == null) {
            return DEFAULTS.durationSec();
        }
        return switch (durationSec) {
            case 10, 30, 60 -> durationSec;
            default -> DEFAULTS.durationSec();
        };
    }

    private String normalizeOwner(String ownerEmail) {
        if (!StringUtils.hasText(ownerEmail)) {
            return null;
        }
        return ownerEmail.trim().toLowerCase();
    }
}
