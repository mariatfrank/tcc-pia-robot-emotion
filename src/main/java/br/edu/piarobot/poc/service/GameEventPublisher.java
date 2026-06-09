package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.config.RabbitMqProperties;
import br.edu.piarobot.poc.messaging.GameEventMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class GameEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMqProperties properties;

    public GameEventPublisher(RabbitTemplate rabbitTemplate, RabbitMqProperties properties) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
    }

    public void publish(GameEventMessage message) {
        rabbitTemplate.convertAndSend(
                properties.gameEventsExchange(),
                properties.gameEventsRoutingKey(),
                message
        );
    }
}
