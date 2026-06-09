package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.domain.GameEventType;
import br.edu.piarobot.poc.domain.RobotSession;
import org.springframework.stereotype.Component;

@Component
public class EmotionEngine {

    public EmotionType decide(RobotSession session, GameEventType eventType) {
        return switch (eventType) {
            case GAME_STARTED -> EmotionType.IDLE;
            case HIT -> EmotionType.HAPPY;
            case MISS -> EmotionType.SAD;
            case GAME_FINISHED -> EmotionType.IDLE;
        };
    }
}
