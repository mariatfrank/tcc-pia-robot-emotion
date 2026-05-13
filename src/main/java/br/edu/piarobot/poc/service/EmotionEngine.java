package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.domain.GameEventType;
import br.edu.piarobot.poc.domain.RobotSession;
import org.springframework.stereotype.Component;

@Component
public class EmotionEngine {

    public EmotionType decide(RobotSession session, GameEventType eventType) {
        return switch (eventType) {
            case GAME_STARTED -> EmotionType.FOCUSED;
            case HIT -> decidePositiveEmotion(session);
            case MISS -> EmotionType.SAD;
            case GAME_FINISHED -> decideFinalEmotion(session);
        };
    }

    private EmotionType decidePositiveEmotion(RobotSession session) {
        if (session.getHits() >= 5 && session.getHits() >= session.getMisses() * 2) {
            return EmotionType.CELEBRATING;
        }
        return EmotionType.HAPPY;
    }

    private EmotionType decideFinalEmotion(RobotSession session) {
        if (session.getHits() > session.getMisses()) {
            return EmotionType.CELEBRATING;
        }
        if (session.getMisses() > session.getHits()) {
            return EmotionType.SAD;
        }
        return EmotionType.IDLE;
    }
}
