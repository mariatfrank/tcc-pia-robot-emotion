package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.domain.Difficulty;
import br.edu.piarobot.poc.domain.EmotionType;
import br.edu.piarobot.poc.domain.GameEventType;
import br.edu.piarobot.poc.domain.RobotSession;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmotionEngineTest {

    private final EmotionEngine emotionEngine = new EmotionEngine();

    @Test
    void shouldReturnHappyForFirstHit() {
        RobotSession session = new RobotSession("TARGET_HIT", Difficulty.NORMAL);

        EmotionType emotion = emotionEngine.decide(session, GameEventType.HIT);

        assertThat(emotion).isEqualTo(EmotionType.HAPPY);
    }

    @Test
    void shouldReturnSadForMiss() {
        RobotSession session = new RobotSession("TARGET_HIT", Difficulty.NORMAL);

        EmotionType emotion = emotionEngine.decide(session, GameEventType.MISS);

        assertThat(emotion).isEqualTo(EmotionType.SAD);
    }

    @Test
    void shouldCelebrateWhenHitsAreDominant() {
        RobotSession session = new RobotSession("TARGET_HIT", Difficulty.NORMAL);
        for (int i = 0; i < 5; i++) {
            session.registerHit(1, EmotionType.HAPPY);
        }

        EmotionType emotion = emotionEngine.decide(session, GameEventType.HIT);

        assertThat(emotion).isEqualTo(EmotionType.CELEBRATING);
    }
}
