package br.edu.piarobot.poc.messaging;

import br.edu.piarobot.poc.service.SessionService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class GameEventListener {

    private final SessionService sessionService;

    public GameEventListener(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @RabbitListener(queues = "${pia.rabbit.game-events-queue}")
    public void onGameEvent(GameEventMessage message) {
        sessionService.processGameEvent(message);
    }
}
