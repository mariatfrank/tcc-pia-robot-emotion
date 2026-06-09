package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.dto.ManualEmotionResponse;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ManualEmotionService {

    private static final ManualEmotionResponse DEFAULTS = new ManualEmotionResponse(EmotionType.IDLE);

    private final Map<String, ManualEmotionResponse> byOwner = new ConcurrentHashMap<>();

    public ManualEmotionResponse get(String ownerEmail) {
        String owner = normalizeOwner(ownerEmail);
        if (owner == null) {
            return DEFAULTS;
        }
        return byOwner.getOrDefault(owner, DEFAULTS);
    }

    public ManualEmotionResponse update(String ownerEmail, EmotionType emotion) {
        ManualEmotionResponse next = new ManualEmotionResponse(emotion);
        String owner = normalizeOwner(ownerEmail);
        if (owner != null) {
            byOwner.put(owner, next);
        }
        return next;
    }

    private String normalizeOwner(String ownerEmail) {
        if (!StringUtils.hasText(ownerEmail)) {
            return null;
        }
        return ownerEmail.trim().toLowerCase();
    }
}
