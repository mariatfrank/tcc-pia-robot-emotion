package br.edu.piarobot.poc.service;

import br.edu.piarobot.poc.config.RabbitMqProperties;
import br.edu.piarobot.poc.messaging.EmotionUpdateMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class EmotionPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMqProperties properties;

    public EmotionPublisher(RabbitTemplate rabbitTemplate, RabbitMqProperties properties) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
    }

    public void publish(EmotionUpdateMessage message) {
        rabbitTemplate.convertAndSend(
                properties.emotionExchange(),
                properties.emotionRoutingKey(),
                message
        );
    }
}
